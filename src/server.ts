import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const SWAGGER_PUBLIC_URL =
  process.env.SWAGGER_SERVER_URL?.replace(/\/$/, '') || 'https://d2p2g797980gqg.cloudfront.net';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, HOST, () => {
      logger.info(
        `Server running on ${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`,
      );
      logger.info(`Local:       http://localhost:${PORT}/api-docs`);
      logger.info(`Swagger UI:  ${SWAGGER_PUBLIC_URL}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
