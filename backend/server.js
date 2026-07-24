import mongoose from 'mongoose';
import config from './src/config/env.js';
import app from './src/app.js';
import logger from './src/config/logger.js';
import { connectDB } from './src/database/connection.js';

const port = config.port;
let server;

// Function to handle graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  const shutdownDependencies = async () => {
    try {
      // Close Mongoose connection
      await mongoose.connection.close();
      logger.info('MongoDB connection closed successfully.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error closing MongoDB connection: ${err.message}`);
      process.exit(1);
    }
  };

  if (server) {
    // Close HTTP server and allow current requests to finish
    server.close(() => {
      logger.info('HTTP server closed.');
      shutdownDependencies();
    });
  } else {
    shutdownDependencies();
  }

  // Set a safety timeout to force termination if requests are hanging
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle SIGTERM (e.g. Docker container stop)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT (e.g. Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err);
  process.exit(1);
});

// Startup sequence
const startServer = async () => {
  try {
    // 1. Connect to Database (fail-fast)
    await connectDB();
    
    // 2. Start HTTP Server
    server = app.listen(port, () => {
      logger.info(`HackVerse API Server successfully started on port ${port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error(`Server startup failed during database initialization: ${error.message}`);
    process.exit(1);
  }
};

startServer();
