import { z } from 'zod';

const optionalName = (label) =>
  z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z
      .string()
      .trim()
      .min(2, `${label} must be at least 2 characters`)
      .max(50, `${label} cannot exceed 50 characters`)
      .optional()
  );

export const updateProfileSchema = z.object({
  firstName: optionalName('First name'),
  lastName: optionalName('Last name'),
});

const roleValues = ['participant', 'organizer', 'judge', 'admin'];

export const updateUserSchema = z
  .object({
    firstName: optionalName('First name'),
    lastName: optionalName('Last name'),
    role: z.enum(roleValues, { message: 'Invalid role' }).optional(),
  })
  .refine((data) => data.firstName || data.lastName || data.role, {
    message: 'Provide at least one field to update',
  });

export default { updateProfileSchema, updateUserSchema };
