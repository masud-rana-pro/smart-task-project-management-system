import express from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { Pool } from 'pg';
import { ZodError } from 'zod';
import type { Database } from './db.js';
import { ApiError } from './errors.js';
import {
  createSessionMiddleware,
  csrfProtection,
  requireIdentity,
} from './security.js';
import type { SecurityConfig } from './security.js';
import { authRoutes } from './auth.js';
import { workRoutes } from './work.js';
import { notificationRoutes } from './notifications.js';
import { openapi } from './openapi.js';

// Separate application creation from listening so API tests do not need a fixed port.
export function createApp(
  logger: Logger,
  dependencies?: { db: Database; pool: Pool; security: SecurityConfig },
) {
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

  app.get('/api/openapi.json', (_req, res) => res.json(openapi));

  if (dependencies) {
    const { db, pool, security } = dependencies;
    app.get('/api/ready', async (_req, res) => {
      res.set('Cache-Control', 'no-store');
      try {
        await db.$queryRaw`SELECT 1`;
        res.json({ status: 'ready' });
      } catch {
        res.status(503).json({ status: 'unavailable' });
      }
    });
    if (security.trustProxyHops)
      app.set('trust proxy', security.trustProxyHops);
    const sessions = createSessionMiddleware(pool, security);
    app.locals.sessionStore = sessions.store;
    app.use('/api', (_req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    });
    app.use('/api', sessions.middleware, csrfProtection(security.origin));
    app.use('/api/auth', authRoutes(db, security));
    app.use('/api', requireIdentity(db));
    app.use('/api/notifications', notificationRoutes(db));
    app.use('/api', workRoutes(db));
  }

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
    if (error instanceof ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Check the supplied fields.',
          fields: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
      return;
    }
    if (error instanceof ApiError) {
      if (error.status === 429) res.set('Retry-After', '900');
      res
        .status(error.status)
        .json({ error: { code: error.code, message: error.message } });
      return;
    }
    const dbCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : '';
    if (['P2002', 'P2003', 'P2025'].includes(dbCode)) {
      const missing = dbCode === 'P2025';
      res.status(missing ? 404 : 409).json({
        error: {
          code: missing ? 'NOT_FOUND' : 'CONFLICT',
          message: missing
            ? 'Resource not found.'
            : dbCode === 'P2002'
              ? 'A record with these unique fields already exists.'
              : 'A related record prevents this operation.',
        },
      });
      return;
    }
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
    // Avoid serializing database errors that could contain URLs or submitted data.
    req.log.error(
      {
        errorType: error instanceof Error ? error.name : 'unknown',
        code: dbCode,
      },
      'Unhandled request error',
    );
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
