import express from 'express';
import {
  createTeam,
  getMyTeam,
  addMember,
  removeMember,
  leaveTeam,
  deleteTeam
} from '../controllers/team.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  createTeamSchema,
  addMemberSchema,
  removeMemberSchema,
  validateHackathonIdParam,
  validateTeamIdParam
} from '../validators/team.validator.js';

const router = express.Router();

// Routes tied to a specific hackathon ID
router.post(
  '/hackathons/:hackathonId/teams',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  validate(createTeamSchema),
  createTeam
);

router.get(
  '/hackathons/:hackathonId/my-team',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  getMyTeam
);

// Routes tied to a specific team ID
router.patch(
  '/teams/:teamId/members',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateTeamIdParam,
  validate(addMemberSchema),
  addMember
);

router.patch(
  '/teams/:teamId/remove-member',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateTeamIdParam,
  validate(removeMemberSchema),
  removeMember
);

router.patch(
  '/teams/:teamId/leave',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateTeamIdParam,
  leaveTeam
);

router.delete(
  '/teams/:teamId',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_OR_ADMIN),
  validateTeamIdParam,
  deleteTeam
);

export default router;
