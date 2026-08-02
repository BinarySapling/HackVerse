import { Redis } from '@upstash/redis';
import config from './env.js';
import logger from './logger.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

let redis = null;

export const getRedis = () => {
  if (redis) return redis;

  if (!config.upstash.restUrl || !config.upstash.restToken) {
    throw new AppError(
      'Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCodes.INTERNAL_ERROR
    );
  }

  redis = new Redis({
    url: config.upstash.restUrl,
    token: config.upstash.restToken,
  });

  logger.info('Upstash Redis client initialized');
  return redis;
};

export default {
  getRedis,
};
