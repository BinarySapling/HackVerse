import express from 'express';
import {
  assignJudge,
  evaluateSubmission,
  updateEvaluation,
  getMyEvaluations,
  getOrganizerEvaluations
} from '../controllers/evaluation.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  createEvaluationSchema,
  updateEvaluationSchema,
  validateHackathonIdParam,
  validateJudgeIdParam,
  validateSubmissionIdParam,
  validateEvaluationIdParam
} from '../validators/evaluation.validator.js';

const router = express.Router();

// Assign a judge to a hackathon
router.patch(
  '/hackathons/:hackathonId/judges/:judgeId',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  validateJudgeIdParam,
  assignJudge
);

// Evaluate a submission
router.post(
  '/submissions/:submissionId/evaluate',
  authenticate,
  authorize(RolePolicies.JUDGE_ONLY),
  validateSubmissionIdParam,
  validate(createEvaluationSchema),
  evaluateSubmission
);

// Update an evaluation
router.patch(
  '/evaluations/:evaluationId',
  authenticate,
  authorize(RolePolicies.JUDGE_ONLY),
  validateEvaluationIdParam,
  validate(updateEvaluationSchema),
  updateEvaluation
);

// Retrieve evaluations scored by the authenticated judge user
router.get(
  '/evaluations/me',
  authenticate,
  authorize(RolePolicies.JUDGE_ONLY),
  getMyEvaluations
);

// Retrieve submissions scoring list under a hackathon
router.get(
  '/hackathons/:hackathonId/evaluations',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  getOrganizerEvaluations
);

export default router;
