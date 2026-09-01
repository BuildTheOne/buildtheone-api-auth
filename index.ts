import { app } from '@/app';
import { Env } from '@/shared/env';
import { logger } from '@/shared/lib/logger';

const PORT = Env.AUTH_PORT;

let server;

server = app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: any) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
