import { z } from 'zod';
import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

export const createEvaluationSchema = z.object({
  innovationScore: z
    .number({
      required_error: "Innovation score is required",
      invalid_type_error: "Innovation score must be a number"
    })
    .min(0, "Innovation score cannot be less than 0")
    .max(10, "Innovation score cannot exceed 10"),
  uiuxScore: z
    .number({
      required_error: "UI/UX score is required",
      invalid_type_error: "UI/UX score must be a number"
    })
    .min(0, "UI/UX score cannot be less than 0")
    .max(10, "UI/UX score cannot exceed 10"),
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
  codeQualityScore: z
    .number({
      required_error: "Code quality score is required",
      invalid_type_error: "Code quality score must be a number"
    })
    .min(0, "Code quality score cannot be less than 0")
    .max(10, "Code quality score cannot exceed 10"),
  problemSolvingScore: z
    .number({
      required_error: "Problem solving score is required",
      invalid_type_error: "Problem solving score must be a number"
    })
    .min(0, "Problem solving score cannot be less than 0")
    .max(10, "Problem solving score cannot exceed 10"),
  remarks: z
    .string({ required_error: "Remarks are required" })
    .trim()
    .min(5, "Remarks must be at least 5 characters")
    .max(1000, "Remarks cannot exceed 1000 characters")
});

export const updateEvaluationSchema = createEvaluationSchema.partial();

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
