import { pino } from 'pino';
import { createApp } from './app.js';
import { parseApplicationEnvironment } from './config.js';
import { createDatabase } from './db.js';

export function createRuntime(environment: NodeJS.ProcessEnv) {
  const config = parseApplicationEnvironment(environment);
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
  // Internal lifecycle hook for local adapters; never exposed as an HTTP route.
  app.locals.closeDatabase = database.close;
  return { config, logger, database, app };
}
