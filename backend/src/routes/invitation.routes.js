import express from 'express';
import {
  inviteJudgeByEmail,
  registerJudgeFromInvitation,
  respondToJudgeInvitation,
  inviteTeamMember,
  respondToTeamInvitation
} from '../controllers/invitation.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import { validateHackathonIdParam } from '../validators/evaluation.validator.js';
import { validateTeamIdParam } from '../validators/team.validator.js';
import {
  emailInvitationSchema,
  invitationRegistrationSchema,
  invitationResponseSchema
} from '../validators/invitation.validator.js';

const router = express.Router();

router.post(
  '/hackathons/:hackathonId/judges/invite',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  validate(emailInvitationSchema),
  inviteJudgeByEmail
);

router.post(
  '/judge-invitations/register',
  validate(invitationRegistrationSchema),
  registerJudgeFromInvitation
);

router.post(
  '/judge-invitations/respond',
  authenticate,
  authorize(RolePolicies.JUDGE_ONLY),
  validate(invitationResponseSchema),
  respondToJudgeInvitation
);

router.post(
  '/teams/:teamId/invitations',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateTeamIdParam,
  validate(emailInvitationSchema),
  inviteTeamMember
);

router.post(
  '/team-invitations/respond',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validate(invitationResponseSchema),
  respondToTeamInvitation
);

export default router;
