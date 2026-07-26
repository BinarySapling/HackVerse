import { z } from 'zod';

export const teamSchema = z.object({
  name: z
    .string()
    .min(3, 'Team name must be at least 3 characters long')
    .max(50, 'Team name cannot exceed 50 characters')
    .trim(),
});

export const inviteSchema = z.object({
  memberId: z
    .string()
    .min(1, 'Member ID is required')
    .regex(/^[a-f\d]{24}$/i, 'Please enter a valid MongoDB user ID'),
});
