import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import asyncHandler from '../utils/asyncHandler.js';

export const validate = (schema) => {
  return asyncHandler(async (req, res, next) => {
    try {
      // Parse request body and override req.body with sanitized values returned by Zod
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        // Compile Zod error lists into a clean readable validation string
        const validationErrorDetails = issues
          .map((issue) => {
            const fieldPath = issue.path.join('.');
            return fieldPath ? `"${fieldPath}": ${issue.message}` : issue.message;
          })
          .join('; ');

        return next(
          new AppError(
            validationErrorDetails,
            HttpStatus.BAD_REQUEST,
            ErrorCodes.VALIDATION_ERROR
          )
        );
      }
      next(err);
    }
  });
};

export default validate;
