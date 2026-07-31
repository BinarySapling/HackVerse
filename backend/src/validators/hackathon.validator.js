import { z } from 'zod';
import HackathonStatus from '../constants/hackathonStatus.js';

// Validator sub-schemas for nested fields
const problemStatementValidator = z.object({
  title: z
    .string({ required_error: "Problem statement title is required" })
    .trim()
    .min(1, "Problem statement title cannot be empty"),
  description: z
    .string({ required_error: "Problem statement description is required" })
    .min(1, "Problem statement description cannot be empty")
});

const prizeValidator = z.object({
  title: z
    .string({ required_error: "Prize title is required" })
    .trim()
    .min(1, "Prize title cannot be empty"),
  value: z.string().trim().optional().nullable(),
  description: z.string().optional().nullable()
});

const judgingCriteriaValidator = z.object({
  criteriaName: z
    .string({ required_error: "Criteria name is required" })
    .trim()
    .min(1, "Criteria name cannot be empty"),
  weight: z
    .number({ required_error: "Criteria weight is required" })
    .min(0, "Weight cannot be negative")
    .max(100, "Weight cannot exceed 100"),
  description: z.string().optional().nullable()
});

const faqValidator = z.object({
  question: z
    .string({ required_error: "FAQ question is required" })
    .trim()
    .min(1, "FAQ question cannot be empty"),
  answer: z
    .string({ required_error: "FAQ answer is required" })
    .min(1, "FAQ answer cannot be empty")
});

export const createHackathonSchema = z.object({
  title: z
    .string({ required_error: "Hackathon title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  tagline: z
    .string()
    .trim()
    .max(150, "Tagline cannot exceed 150 characters")
    .optional()
    .nullable(),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, "Description cannot be empty"),
  banner: z.string().trim().optional().nullable(),
  registrationStart: z
    .string({ required_error: "Registration start date is required" })
    .datetime({ message: "Registration start must be a valid ISO datetime string" }),
  registrationEnd: z
    .string({ required_error: "Registration end date is required" })
    .datetime({ message: "Registration end must be a valid ISO datetime string" }),
  hackathonStart: z
    .string({ required_error: "Hackathon start date is required" })
    .datetime({ message: "Hackathon start must be a valid ISO datetime string" }),
  hackathonEnd: z
    .string({ required_error: "Hackathon end date is required" })
    .datetime({ message: "Hackathon end must be a valid ISO datetime string" }),
  submissionStart: z
    .string()
    .datetime({ message: "Submission start must be a valid ISO datetime string" })
    .optional()
    .nullable(),
  submissionDeadline: z
    .string()
    .datetime({ message: "Submission deadline must be a valid ISO datetime string" })
    .optional()
    .nullable(),
  maxTeamSize: z
    .number({ required_error: "Maximum team size is required" })
    .int()
    .min(1, "Maximum team size must be at least 1"),
  minTeamSize: z
    .number({ required_error: "Minimum team size is required" })
    .int()
    .min(1, "Minimum team size must be at least 1"),
  maxTeams: z
    .number()
    .int()
    .min(1, "Maximum teams must be at least 1")
    .optional()
    .nullable(),
  prizePool: z.string().trim().optional().nullable(),
  status: z.nativeEnum(HackathonStatus).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  problemStatements: z.array(problemStatementValidator).optional().default([]),
  techStack: z.array(z.string().trim().min(1)).optional().default([]),
  rules: z.string().optional().nullable(),
  prizes: z.array(prizeValidator).optional().default([]),
  judgingCriteria: z.array(judgingCriteriaValidator).optional().default([]),
  judgeEmails: z
    .array(z.string().trim().email("Please provide valid judge email addresses").toLowerCase())
    .optional()
    .default([]),
  contactEmail: z
    .string({ required_error: "Contact email is required" })
    .trim()
    .email("Please provide a valid contact email address")
    .toLowerCase(),
  faq: z.array(faqValidator).optional().default([])
});

export const updateHackathonSchema = createHackathonSchema.partial();

export default {
  createHackathonSchema,
  updateHackathonSchema
};
