import { z } from 'zod';

export const submissionSchema = z.object({
  githubRepo: z
    .string()
    .min(1, 'GitHub Repository URL is required')
    .url('Please enter a valid URL (starting with http:// or https://)')
    .refine((url) => /github\.com/i.test(url), {
      message: 'GitHub URL must point to github.com',
    }),
  demoUrl: z
    .string()
    .url('Please enter a valid URL')
    .or(z.literal(''))
    .optional()
    .nullable(),
  presentationUrl: z
    .string()
    .url('Please enter a valid URL')
    .or(z.literal(''))
    .optional()
    .nullable(),
  videoUrl: z
    .string()
    .url('Please enter a valid URL')
    .or(z.literal(''))
    .optional()
    .nullable(),
  description: z
    .string()
    .min(10, 'Project description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters'),
});
