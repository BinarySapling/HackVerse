import mongoose from 'mongoose';
import config from '../config/env.js';
import logger from '../config/logger.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';
import { SuccessMessages } from '../constants/messages.js';

/**
 * @desc Get application health and status including database state
 * @route GET /health
 * @access Public
 */
export const getHealth = asyncHandler(async (req, res) => {
  logger.info('Performing health check request');

  const uptime = process.uptime();
  
  // Format uptime into human-readable duration
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  // Translate mongoose connection state
  const dbState = mongoose.connection.readyState;
  let databaseStatus = 'disconnected';
  if (dbState === 1) {
    databaseStatus = 'connected';
  } else if (dbState === 2) {
    databaseStatus = 'connecting';
  }

  // Response structure supporting both the requested "data" schema and legacy keys
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    SuccessMessages.SERVER_HEALTHY,
    {
      uptime: uptimeString,
      environment: config.nodeEnv,
      database: databaseStatus,
      version: '1.0.0'
    },
    null,
    {
      uptime: uptimeString,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString()
    }
  );
});
