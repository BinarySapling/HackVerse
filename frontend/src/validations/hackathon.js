import { z } from 'zod';

export const hackathonSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  tagline: z
    .string()
    .max(150, 'Tagline cannot exceed 150 characters')
    .optional()
    .nullable(),
  description: z
    .string()
    .min(1, 'Description is required'),
  registrationStart: z
    .string()
    .min(1, 'Registration start date is required'),
  registrationEnd: z
    .string()
    .min(1, 'Registration end date is required'),
  hackathonStart: z
    .string()
    .min(1, 'Hackathon start date is required'),
  hackathonEnd: z
    .string()
    .min(1, 'Hackathon end date is required'),
  submissionStart: z.string().optional().nullable(),
  submissionDeadline: z.string().optional().nullable(),
  minTeamSize: z
    .number({ invalid_type_error: 'Min team size must be a number' })
    .int()
    .min(1, 'Minimum team size must be at least 1'),
  maxTeamSize: z
    .number({ invalid_type_error: 'Max team size must be a number' })
    .int()
    .min(1, 'Maximum team size must be at least 1'),
  maxTeams: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || Number.isNaN(val) ? undefined : val),
    z.number({ invalid_type_error: 'Max teams must be a number' }).int().min(1).optional()
  ),
  prizePool: z.string().optional().nullable(),
  contactEmail: z
    .string()
    .min(1, 'Contact email is required')
    .email('Please enter a valid email address'),
  rules: z.string().optional().nullable(),
  judgeEmails: z.string().optional().nullable(),
}).refine((data) => new Date(data.registrationStart) < new Date(data.registrationEnd), {
  message: 'Registration end must be after registration start',
  path: ['registrationEnd'],
}).refine((data) => new Date(data.registrationEnd) <= new Date(data.hackathonStart), {
  message: 'Hackathon start must be after or on registration end',
  path: ['hackathonStart'],
}).refine((data) => new Date(data.hackathonStart) < new Date(data.hackathonEnd), {
  message: 'Hackathon end must be after hackathon start',
  path: ['hackathonEnd'],
});
