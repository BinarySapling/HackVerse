import { z } from 'zod';

/**
 * @desc Zod validation schema for user registration requests (Signup)
 */
export const signupSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter"
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter"
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one digit"
    })
    .refine((val) => /[^a-zA-Z0-9]/.test(val), {
      message: "Password must contain at least one special character"
    }),
  role: z
    .enum(["participant"], {
      message: "Public signup is restricted to participant accounts"
    })
    .optional()
});

/**
 * @desc Zod validation schema for user authentication requests (Login)
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty")
});

export default {
  signupSchema,
  loginSchema
};
