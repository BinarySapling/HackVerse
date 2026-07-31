import express from 'express';
import {
  createSubmission,
  getMySubmission,
  updateSubmission,
  deleteSubmission,
  getOrganizerSubmissions,
  getJudgeSubmissions
} from '../controllers/submission.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  createSubmissionSchema,
  updateSubmissionSchema,
  validateHackathonIdParam,
  validateSubmissionIdParam
} from '../validators/submission.validator.js';

const router = express.Router();

// Routes tied to a specific hackathon ID
router.post(
  '/hackathons/:hackathonId/submissions',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  validate(createSubmissionSchema),
  createSubmission
);

router.get(
  '/hackathons/:hackathonId/my-submission',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  getMySubmission
);

router.get(
  '/hackathons/:hackathonId/submissions',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateHackathonIdParam,
  getOrganizerSubmissions
);

router.get(
  '/hackathons/:hackathonId/judge-submissions',
  authenticate,
  authorize(RolePolicies.JUDGE_ONLY),
  validateHackathonIdParam,
  getJudgeSubmissions
);

// Routes tied to a specific submission ID
router.patch(
  '/submissions/:submissionId',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateSubmissionIdParam,
  validate(updateSubmissionSchema),
  updateSubmission
);

router.delete(
  '/submissions/:submissionId',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_OR_ADMIN),
  validateSubmissionIdParam,
  deleteSubmission
);

export default router;
