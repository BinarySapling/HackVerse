import { z } from 'zod';
import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

export const createTeamSchema = z.object({
  name: z
    .string({ required_error: "Team name is required" })
    .trim()
    .min(3, "Team name must be at least 3 characters")
    .max(50, "Team name cannot exceed 50 characters")
});

export const addMemberSchema = z.object({
  memberId: z
    .string({ required_error: "Member ID is required" })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid member ID format"
    })
});

export const removeMemberSchema = z.object({
  memberId: z
    .string({ required_error: "Member ID is required" })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid member ID format"
    })
});

export const updateTeamSchema = z.object({
  name: z
    .string({ required_error: 'Team name is required' })
    .trim()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name cannot exceed 50 characters'),
});

export const transferLeadershipSchema = z.object({
  newLeaderId: z
    .string({ required_error: 'New leader ID is required' })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid new leader ID format',
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

export const validateTeamIdParam = (req, res, next) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return next(
      new AppError(
        "Invalid Team ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  next();
};

export default {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
  removeMemberSchema,
  transferLeadershipSchema,
  validateHackathonIdParam,
  validateTeamIdParam
};
