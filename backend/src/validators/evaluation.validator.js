import { z } from 'zod';
import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

/**
 * @desc Zod validation schema for submitting an evaluation
 */
export const createEvaluationSchema = z.object({
  innovationScore: z
    .number({
      required_error: "Innovation score is required",
      invalid_type_error: "Innovation score must be a number"
    })
    .min(0, "Innovation score cannot be less than 0")
    .max(10, "Innovation score cannot exceed 10"),
  technicalScore: z
    .number({
      required_error: "Technical score is required",
      invalid_type_error: "Technical score must be a number"
    })
    .min(0, "Technical score cannot be less than 0")
    .max(10, "Technical score cannot exceed 10"),
  presentationScore: z
    .number({
      required_error: "Presentation score is required",
      invalid_type_error: "Presentation score must be a number"
    })
    .min(0, "Presentation score cannot be less than 0")
    .max(10, "Presentation score cannot exceed 10"),
  remarks: z
    .string({ required_error: "Remarks are required" })
    .trim()
    .min(5, "Remarks must be at least 5 characters")
    .max(1000, "Remarks cannot exceed 1000 characters")
});

/**
 * @desc Zod validation schema for editing an evaluation
 */
export const updateEvaluationSchema = createEvaluationSchema.partial();

/**
 * @desc Express middleware validation for hackathonId path parameter
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
 * @desc Express middleware validation for judgeId path parameter
 */
export const validateJudgeIdParam = (req, res, next) => {
  const { judgeId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(judgeId)) {
    return next(
      new AppError(
        "Invalid Judge ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  next();
};

/**
 * @desc Express middleware validation for submissionId path parameter
 */
export const validateSubmissionIdParam = (req, res, next) => {
  const { submissionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    return next(
      new AppError(
        "Invalid Submission ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  next();
};

/**
 * @desc Express middleware validation for evaluationId path parameter
 */
export const validateEvaluationIdParam = (req, res, next) => {
  const { evaluationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
    return next(
      new AppError(
        "Invalid Evaluation ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  next();
};

export default {
  createEvaluationSchema,
  updateEvaluationSchema,
  validateHackathonIdParam,
  validateJudgeIdParam,
  validateSubmissionIdParam,
  validateEvaluationIdParam
};
