import ErrorCodes from './ErrorCodes.js';

class AppError extends Error {
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
