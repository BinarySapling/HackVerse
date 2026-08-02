import { z } from 'zod';

const optionalUrl = z
  .union([
    z.string().url('Please enter a valid URL'),
    z.string().startsWith('/uploads/'),
    z.literal(''),
  ])
  .optional()
  .nullable();

export const submissionSchema = z.object({
  projectName: z.string().max(100).optional().nullable().or(z.literal('')),
  githubRepo: z
    .string()
    .min(1, 'GitHub Repository URL is required')
    .url('Please enter a valid URL (starting with http:// or https://)')
    .refine((url) => /github\.com/i.test(url), {
      message: 'GitHub URL must point to github.com',
    }),
  techStack: z.string().optional().nullable().or(z.literal('')),
  demoUrl: optionalUrl,
  presentationUrl: optionalUrl,
  videoUrl: optionalUrl,
  screenshotUrl: optionalUrl,
  description: z
    .string()
    .min(10, 'Project summary must be at least 10 characters long')
    .max(2000, 'Summary cannot exceed 2000 characters'),
  problemStatement: z
    .string()
    .min(10, 'Problem statement must be at least 10 characters long')
    .max(3000, 'Problem statement cannot exceed 3000 characters'),
  solution: z
    .string()
    .min(10, 'Solution must be at least 10 characters long')
    .max(3000, 'Solution cannot exceed 3000 characters'),
});
