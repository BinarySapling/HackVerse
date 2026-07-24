import express from 'express';
import {
  getLeaderboard,
  getOrganizerResults,
  getMyResult
} from '../controllers/leaderboard.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { RolePolicies } from '../constants/permissions.js';
import { validateHackathonIdParam } from '../validators/evaluation.validator.js';

const router = express.Router();

// Retrieve the public leaderboard for a hackathon
router.get(
  '/hackathons/:hackathonId/leaderboard',
  authenticate,
  authorize(RolePolicies.ANY_AUTHENTICATED),
  validateHackathonIdParam,
  getLeaderboard
);

// Retrieve detailed organizer results
router.get(
  '/hackathons/:hackathonId/results',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  getOrganizerResults
);

// Retrieve specific team result for the leader
router.get(
  '/hackathons/:hackathonId/my-result',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  getMyResult
);

export default router;
