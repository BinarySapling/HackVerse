import logger from '../config/logger.js';
import ApiResponse from '../utils/ApiResponse.js';
import HttpStatus from '../constants/httpStatus.js';
import { ErrorMessages } from '../constants/messages.js';

/**
 * @desc 404 Not Found handler middleware
 */
export const notFound = (req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  
  return ApiResponse.error(
    res,
    HttpStatus.NOT_FOUND,
    ErrorMessages.ROUTE_NOT_FOUND
  );
};
