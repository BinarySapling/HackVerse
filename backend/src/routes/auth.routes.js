import express from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', authRateLimiter, validate(resendOtpSchema), resendOtp);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/refresh', authRateLimiter, refresh);
router.post('/logout', logout);

router.get('/me', authenticate, authorize(RolePolicies.ANY_AUTHENTICATED), getMe);
router.patch(
  '/change-password',
  authenticate,
  authorize(RolePolicies.ANY_AUTHENTICATED),
  authRateLimiter,
  validate(changePasswordSchema),
  changePassword
);

export default router;
