import { z } from 'zod';

export const teamSchema = z.object({
  name: z
    .string()
    .min(3, 'Team name must be at least 3 characters long')
    .max(50, 'Team name cannot exceed 50 characters')
    .trim(),
});

export const inviteSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});
