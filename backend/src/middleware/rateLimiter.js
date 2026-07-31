import rateLimit from 'express-rate-limit';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';

export const createLimiter = (windowMinutes, maxRequests, customMessage) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true, // Return rate limit info in standard headers
    legacyHeaders: false, // Disable X-RateLimit headers
    skip: (req) => process.env.DISABLE_LIMITER === 'true' || process.env.NODE_ENV === 'test',
    handler: (req, res, next) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip} on URL: ${req.originalUrl} [ReqID: ${req.requestId}]`);
      next(
        new AppError(
          customMessage || "Too many requests. Please try again later.",
          HttpStatus.TOO_MANY_REQUESTS,
          ErrorCodes.TOO_MANY_REQUESTS
        )
      );
    }
  });
};

// Dedicated auth limiter: 10 requests per 15 minutes
export const authRateLimiter = createLimiter(
  15,
  10,
  "Too many authentication attempts. Please try again after 15 minutes."
);

export default {
  createLimiter,
  authRateLimiter
};
