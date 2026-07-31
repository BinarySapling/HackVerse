import mongoose from 'mongoose';
import config from '../config/env.js';
import logger from '../config/logger.js';

// Listeners for Mongoose connection lifecycle events mapped to Winston logger
mongoose.connection.on('connecting', () => {
  logger.info('Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  logger.info(`MongoDB connected successfully to DB: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected');
});

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
  } catch (error) {
    logger.error(`MongoDB initial connection failure: ${error.message}`);
    throw error;
  }
};

export default connectDB;
