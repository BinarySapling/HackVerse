import express from 'express';
import { signup, login, refresh, logout, getMe } from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Authentication Endpoints (Rate Limited & Validated)
router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', authRateLimiter, refresh);
router.post('/logout', logout);

// Protected Profile Endpoints
router.get('/me', authenticate, authorize(RolePolicies.ANY_AUTHENTICATED), getMe);

export default router;
