import Roles from './roles.js';

/**
 * @desc Centralized role allowlists for API route-level RBAC.
 */
export const RolePolicies = Object.freeze({
  ANY_AUTHENTICATED: Object.freeze([
    Roles.ADMIN,
    Roles.ORGANIZER,
    Roles.JUDGE,
    Roles.PARTICIPANT
  ]),
  ADMIN_ONLY: Object.freeze([Roles.ADMIN]),
  ORGANIZER_ONLY: Object.freeze([Roles.ORGANIZER]),
  ORGANIZER_OR_ADMIN: Object.freeze([Roles.ORGANIZER, Roles.ADMIN]),
  JUDGE_ONLY: Object.freeze([Roles.JUDGE]),
  PARTICIPANT_ONLY: Object.freeze([Roles.PARTICIPANT]),
  PARTICIPANT_OR_ADMIN: Object.freeze([Roles.PARTICIPANT, Roles.ADMIN])
});

/**
 * @desc Stable permission labels for documentation and audit output.
 */
const Permissions = Object.freeze({
  AUTH_PROFILE_READ: 'auth:profile:read',
  HACKATHON_CREATE: 'hackathon:create',
  HACKATHON_UPDATE: 'hackathon:update',
  HACKATHON_DELETE: 'hackathon:delete',
  REGISTRATION_SELF_MANAGE: 'registration:self:manage',
  TEAM_SELF_MANAGE: 'team:self:manage',
  TEAM_DELETE: 'team:delete',
  SUBMISSION_SELF_MANAGE: 'submission:self:manage',
  SUBMISSION_DELETE: 'submission:delete',
  SUBMISSION_ORGANIZER_READ: 'submission:organizer:read',
  JUDGE_ASSIGN: 'judge:assign',
  EVALUATION_SCORE: 'evaluation:score',
  EVALUATION_ORGANIZER_READ: 'evaluation:organizer:read',
  LEADERBOARD_READ: 'leaderboard:read',
  RESULT_ORGANIZER_READ: 'result:organizer:read',
  RESULT_SELF_READ: 'result:self:read'
});

export default Permissions;
