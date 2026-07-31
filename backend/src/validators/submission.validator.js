import { z } from 'zod';
import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

export const createSubmissionSchema = z.object({
  githubRepo: z
    .string({ required_error: "GitHub repository URL is required" })
    .trim()
    .url("Please provide a valid GitHub repository URL")
    .refine((url) => /github\.com/i.test(url), {
      message: "GitHub URL must point to github.com"
    }),
  demoUrl: z
    .string()
    .trim()
    .url("Please provide a valid demo URL")
    .optional()
    .nullable()
    .or(z.literal('')),
  presentationUrl: z
    .string()
    .trim()
    .url("Please provide a valid presentation URL")
    .optional()
    .nullable()
    .or(z.literal('')),
  videoUrl: z
    .string()
    .trim()
    .url("Please provide a valid video URL")
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
});

export const updateSubmissionSchema = createSubmissionSchema.partial();

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
