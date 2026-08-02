import express from 'express';
import {
  getLeaderboard,
  getOrganizerResults,
  getMyResult,
  closeEvaluation,
  announceWinners
} from '../controllers/leaderboard.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { RolePolicies } from '../constants/permissions.js';
import { validateHackathonIdParam } from '../validators/evaluation.validator.js';

const router = express.Router();

// Public leaderboard (no login required)
router.get(
  '/hackathons/:hackathonId/leaderboard',
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

router.post(
  '/hackathons/:hackathonId/close-evaluation',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  closeEvaluation
);

router.post(
  '/hackathons/:hackathonId/announce-winners',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  announceWinners
);

export default router;
