import 'dotenv/config';
import { createRuntime } from './runtime.js';

const { config, logger, database, app } = createRuntime(process.env);
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
