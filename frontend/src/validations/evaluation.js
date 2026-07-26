import { z } from 'zod';

export const evaluationSchema = z.object({
  innovationScore: z
    .number({ invalid_type_error: 'Innovation score must be a number' })
    .min(0, 'Innovation score cannot be less than 0')
    .max(10, 'Innovation score cannot exceed 10'),
  technicalScore: z
    .number({ invalid_type_error: 'Technical score must be a number' })
    .min(0, 'Technical score cannot be less than 0')
    .max(10, 'Technical score cannot exceed 10'),
  presentationScore: z
    .number({ invalid_type_error: 'Presentation score must be a number' })
    .min(0, 'Presentation score cannot be less than 0')
    .max(10, 'Presentation score cannot exceed 10'),
  remarks: z
    .string()
    .min(5, 'Remarks must be at least 5 characters long')
    .max(1000, 'Remarks cannot exceed 1000 characters')
    .trim(),
});
