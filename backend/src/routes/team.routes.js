import express from 'express';
import {
  createTeam,
  getMyTeam,
  getHackathonTeams,
  addMember,
  removeMember,
  leaveTeam,
  deleteTeam,
  updateTeam,
  transferLeadership,
} from '../controllers/team.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
  removeMemberSchema,
  transferLeadershipSchema,
  validateHackathonIdParam,
  validateTeamIdParam,
} from '../validators/team.validator.js';

const router = express.Router();

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

router.get(
  '/hackathons/:hackathonId/teams',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  getHackathonTeams
);

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
  '/teams/:teamId',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateTeamIdParam,
  validate(updateTeamSchema),
  updateTeam
);

router.patch(
  '/teams/:teamId/transfer-leadership',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateTeamIdParam,
  validate(transferLeadershipSchema),
  transferLeadership
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
