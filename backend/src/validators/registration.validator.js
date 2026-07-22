import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

/**
 * @desc Express middleware to validate hackathonId in path parameters
 */
export const validateHackathonIdParam = (req, res, next) => {
  const { hackathonId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
    return next(
      new AppError(
        "Invalid Hackathon ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  next();
};

/**
 * @desc Express middleware to validate registration id in path parameters
 */
export const validateRegistrationIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(
      new AppError(
        "Invalid Registration ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  next();
};

export default {
  validateHackathonIdParam,
  validateRegistrationIdParam
};
