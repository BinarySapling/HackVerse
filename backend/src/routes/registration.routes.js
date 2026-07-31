import express from 'express';
import {
  registerForHackathon,
  getMyRegistrations,
  getHackathonRegistrations,
  reviewRegistration,
  cancelRegistration,
} from '../controllers/registration.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  validateHackathonIdParam,
  validateRegistrationIdParam,
  reviewRegistrationSchema,
} from '../validators/registration.validator.js';

const router = express.Router();

router.post(
  '/hackathons/:hackathonId/register',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  registerForHackathon
);

router.get(
  '/registrations/me',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  getMyRegistrations
);

router.get(
  '/hackathons/:hackathonId/registrations',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  getHackathonRegistrations
);

router.patch(
  '/registrations/:id/review',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateRegistrationIdParam,
  validate(reviewRegistrationSchema),
  reviewRegistration
);

router.patch(
  '/registrations/:id/cancel',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateRegistrationIdParam,
  cancelRegistration
);

export default router;
