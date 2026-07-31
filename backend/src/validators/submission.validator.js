import { z } from 'zod';
import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .or(z.literal(''))
  .refine(
    (val) => !val || /^https?:\/\//i.test(val) || val.startsWith('/uploads/'),
    { message: 'Please provide a valid URL' }
  );

export const createSubmissionSchema = z.object({
  githubRepo: z
    .string({ required_error: "GitHub repository URL is required" })
    .trim()
    .url("Please provide a valid GitHub repository URL")
    .refine((url) => /github\.com/i.test(url), {
      message: "GitHub URL must point to github.com"
    }),
  projectName: z.string().trim().max(100).optional().nullable().or(z.literal('')),
  techStack: z.array(z.string().trim().min(1)).optional().default([]),
  demoUrl: optionalUrl,
  presentationUrl: optionalUrl,
  videoUrl: optionalUrl,
  screenshotUrl: optionalUrl,
  description: z
    .string({ required_error: "Project summary is required" })
    .trim()
    .min(10, "Summary must be at least 10 characters")
    .max(2000, "Summary cannot exceed 2000 characters"),
  problemStatement: z
    .string({ required_error: "Problem statement is required" })
    .trim()
    .min(10, "Problem statement must be at least 10 characters")
    .max(3000, "Problem statement cannot exceed 3000 characters"),
  solution: z
    .string({ required_error: "Solution is required" })
    .trim()
    .min(10, "Solution must be at least 10 characters")
    .max(3000, "Solution cannot exceed 3000 characters")
});

export const updateSubmissionSchema = createSubmissionSchema.partial();

export const reviewSubmissionSchema = z.object({
  status: z.enum(['under_review', 'approved', 'rejected'], {
    required_error: 'Status is required',
  }),
});

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
  reviewSubmissionSchema,
  validateHackathonIdParam,
  validateSubmissionIdParam
};
