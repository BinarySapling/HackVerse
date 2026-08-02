import ErrorCodes from './ErrorCodes.js';

class AppError extends Error {
  constructor(
    message,
    statusCode,
    errorCode = ErrorCodes.INTERNAL_ERROR,
    isOperational = true,
    data = null
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = typeof isOperational === 'boolean' ? isOperational : true;
    this.data = data && typeof data === 'object' ? data : null;

    // Support legacy call shape: (message, status, code, dataObject)
    if (typeof isOperational === 'object' && isOperational !== null) {
      this.isOperational = true;
      this.data = isOperational;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
