import mongoose from 'mongoose';
import config from './src/config/env.js';
import app from './src/app.js';
import logger from './src/config/logger.js';
import { connectDB } from './src/database/connection.js';

const port = config.port;
let server;

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down...`);

  const closeDb = async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error closing MongoDB: ${err.message}`);
      process.exit(1);
    }
  };

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
      closeDb();
    });
  } else {
    closeDb();
  }

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(port, () => {
      logger.info(`HackVerse API running on port ${port} (${config.nodeEnv})`);
    });
  } catch (error) {
    logger.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
