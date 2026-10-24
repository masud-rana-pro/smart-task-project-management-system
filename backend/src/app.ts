import express from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';

// Separate application creation from listening so API tests do not need a fixed port.
export function createApp(logger: Logger) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    pinoHttp({
      logger,
      genReqId: () => randomUUID(),
      serializers: {
        req: (req: { id: string; method: string }) => ({
          id: req.id,
          method: req.method,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(express.json({ limit: '32kb' }));

  // Liveness only: this deliberately does not claim the database is reachable.
  app.get('/api/health', (_req, res) => {
    res.set('Cache-Control', 'no-store').json({ status: 'ok' });
  });

  app.use((_req, res) => {
    res
      .status(404)
      .json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
  });

  const errorHandler: express.ErrorRequestHandler = (
    error: unknown,
    req,
    res,
    _next,
  ) => {
    const badRequest =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 400;
    const tooLarge =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 413;
    if (badRequest || tooLarge) {
      res.status(tooLarge ? 413 : 400).json({
        error: {
          code: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON',
          message: tooLarge
            ? 'Request body exceeds the allowed size.'
            : 'Request body must be valid JSON.',
        },
      });
      return;
    }
    req.log.error({ err: error }, 'Unhandled request error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    });
  };
  app.use(errorHandler);
  return app;
}
