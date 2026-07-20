import dotenv from 'dotenv';
dotenv.config();

import os from 'os';
import app from './app';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const getLanIp = (): string | null => {
  const nets = os.networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const net of entries ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, HOST, () => {
      const lanIp = getLanIp();
      logger.info(
        `Server running on ${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`,
      );
      logger.info(`Local:    http://localhost:${PORT}/api-docs`);
      if (lanIp) {
        logger.info(`Network:  http://${lanIp}:${PORT}/api-docs`);
      }
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
