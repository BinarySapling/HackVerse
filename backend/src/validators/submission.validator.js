import { z } from 'zod';
import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

/**
 * @desc Zod validation schema for creating a project submission
 */
export const createSubmissionSchema = z.object({
  githubRepo: z
    .string({ required_error: "GitHub repository URL is required" })
    .trim()
    .url("Please provide a valid GitHub repository URL"),
  demoUrl: z
    .string({ required_error: "Demo URL is required" })
    .trim()
    .url("Please provide a valid demo URL"),
  presentationUrl: z
    .string()
    .trim()
    .url("Please provide a valid presentation URL")
    .optional()
    .nullable(),
  videoUrl: z
    .string()
    .trim()
    .url("Please provide a valid video URL")
    .optional()
    .nullable(),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
});

/**
 * @desc Zod validation schema for updating an existing submission
 */
export const updateSubmissionSchema = createSubmissionSchema.partial();

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

export default {
  createSubmissionSchema,
  updateSubmissionSchema,
  validateHackathonIdParam,
  validateSubmissionIdParam
};
