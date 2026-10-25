import 'dotenv/config';
import { pino } from 'pino';
import { createApp } from './app.js';
import { parseApplicationEnvironment } from './config.js';
import { createDatabase } from './db.js';

const config = parseApplicationEnvironment(process.env);
const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'sessionSecret',
    ],
    censor: '[REDACTED]',
  },
});
const database = createDatabase(config.DATABASE_URL);
const app = createApp(logger, {
  ...database,
  security: {
    sessionSecret: config.SESSION_SECRET,
    origin: config.APP_ORIGIN,
    secure: config.NODE_ENV === 'production',
    trustProxyHops: config.TRUST_PROXY_HOPS,
  },
});
const server = app.listen(config.PORT, config.HOST, () => {
  logger.info({ port: config.PORT }, 'API listening');
});
server.on('error', (error) => {
  logger.fatal({ errorType: error.name }, 'API failed to start');
  void database
    .close()
    .catch(() => logger.error('Database cleanup failed during startup'))
    .finally(() => {
      process.exitCode = 1;
    });
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    logger.info({ signal }, 'Shutting down');
    const timeout = setTimeout(() => process.exit(1), 10_000).unref();
    void (async () => {
      try {
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
        await database.close();
        clearTimeout(timeout);
      } catch {
        process.exitCode = 1;
      }
    })();
  });
}
