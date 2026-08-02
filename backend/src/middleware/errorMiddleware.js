import logger from '../config/logger.js';
import config from '../config/env.js';
import ApiResponse from '../utils/ApiResponse.js';
import HttpStatus from '../constants/httpStatus.js';
import { ErrorMessages } from '../constants/messages.js';
import ErrorCodes from '../errors/ErrorCodes.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || ErrorMessages.INTERNAL_SERVER_ERROR;
  let errorCode = err.errorCode || ErrorCodes.INTERNAL_ERROR;
  let isOperational = err.isOperational;

  // Translate native Mongoose/Database exceptions to standard AppErrors
  if (err.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    errorCode = ErrorCodes.VALIDATION_ERROR;
    isOperational = true;
  } else if (err.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = `Invalid values provided for ${err.path}: ${err.value}`;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    isOperational = true;
  } else if (err.code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    message = 'Resource already exists.';
    errorCode = ErrorCodes.CONFLICT;
    isOperational = true;
  }

  // Mask unexpected developer/internal errors in production
  if (config.nodeEnv === 'production' && !isOperational) {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    message = ErrorMessages.INTERNAL_SERVER_ERROR;
    errorCode = ErrorCodes.INTERNAL_ERROR;
  }

  // Winston logging payload capturing Request ID, Method, URL, and Status Code
  const logMetadata = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: statusCode
  };

  if (config.nodeEnv === 'development') {
    logger.error(
      `${err.name || 'Error'} [${req.method} ${req.originalUrl}] - Status: ${statusCode} - Msg: ${message}\nStack: ${err.stack}`,
      logMetadata
    );
  } else {
    logger.error(
      `${err.name || 'Error'} [${req.method} ${req.originalUrl}] - Status: ${statusCode} - Msg: ${message}`,
      { ...logMetadata, stack: !isOperational ? err.stack : undefined }
    );
  }

  // Attach additional error metadata payload
  const extraFields = {
    errorCode: errorCode
  };

  if (err.data) {
    extraFields.data = err.data;
  }

  if (config.nodeEnv !== 'production') {
    extraFields.stack = err.stack;
  }

  return ApiResponse.error(
    res,
    statusCode,
    message,
    err.data || null,
    null,
    extraFields,
    req.requestId
  );
};
