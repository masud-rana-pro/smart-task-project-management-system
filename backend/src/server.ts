import 'dotenv/config';
import { pino } from 'pino';
import { createApp } from './app.js';
import { parseEnvironment } from './config.js';

const config = parseEnvironment(process.env);
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
const server = createApp(logger).listen(config.PORT, config.HOST, () => {
  logger.info({ port: config.PORT }, 'API listening');
});
server.on('error', (error) => {
  logger.fatal({ err: error }, 'API failed to start');
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    logger.info({ signal }, 'Shutting down');
    server.close((error) => {
      process.exitCode = error ? 1 : 0;
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
