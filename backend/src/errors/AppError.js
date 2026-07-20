import ErrorCodes from './ErrorCodes.js';

/**
 * @desc Base custom application error class extending the native Error class
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message description
   * @param {number} statusCode - Associated HTTP status code
   * @param {string} [errorCode=ErrorCodes.INTERNAL_ERROR] - Standard application-wide error identifier
   * @param {boolean} [isOperational=true] - Indicates if the error is an expected/operational error
   */
  constructor(message, statusCode, errorCode = ErrorCodes.INTERNAL_ERROR, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    // Capture the stack trace clean of this class constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
