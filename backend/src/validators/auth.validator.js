import { z } from 'zod';

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
    .enum(["participant", "organizer"], {
      message: "Public signup is restricted to participant and organizer accounts"
    })
    .optional()
});

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

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
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
  confirmPassword: z
    .string({ required_error: "Please confirm your new password" })
    .min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export const resendOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required" }).min(1),
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
});

export default {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
