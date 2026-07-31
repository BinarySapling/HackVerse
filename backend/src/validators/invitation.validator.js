import { z } from 'zod';

export const emailInvitationSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().email('Please provide a valid email address').toLowerCase()
});

export const invitationResponseSchema = z.object({
  token: z.string({ required_error: 'Invitation token is required' }).min(32, 'Invalid invitation token'),
  accepted: z.boolean({ required_error: 'Invitation response is required' })
});

export const invitationRegistrationSchema = z.object({
  token: z.string({ required_error: 'Invitation token is required' }).min(32, 'Invalid invitation token'),
  firstName: z.string({ required_error: 'First name is required' }).trim().min(2).max(50),
  lastName: z.string({ required_error: 'Last name is required' }).trim().min(2).max(50),
  email: z.string({ required_error: 'Email is required' }).trim().email().toLowerCase(),
  password: z.string({ required_error: 'Password is required' }).min(8)
});

export default {
  emailInvitationSchema,
  invitationResponseSchema,
  invitationRegistrationSchema
};
