import express from 'express';
import {
  registerForHackathon,
  getMyRegistrations,
  cancelRegistration
} from '../controllers/registration.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  validateHackathonIdParam,
  validateRegistrationIdParam
} from '../validators/registration.validator.js';

const router = express.Router();

// Route: Register participant for a hackathon
router.post(
  '/hackathons/:hackathonId/register',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  registerForHackathon
);

// Route: Retrieve participant's own active registrations
router.get(
  '/registrations/me',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  getMyRegistrations
);

// Route: Cancel an active registration (owner only)
router.patch(
  '/registrations/:id/cancel',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateRegistrationIdParam,
  cancelRegistration
);

export default router;
