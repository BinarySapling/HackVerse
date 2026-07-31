import express from 'express';
import {
  createSubmission,
  getMySubmission,
  updateSubmission,
  deleteSubmission,
  getOrganizerSubmissions,
  reviewSubmission,
  getJudgeSubmissions
} from '../controllers/submission.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import parseSubmissionBody from '../middleware/parseSubmissionBody.js';
import { uploadSubmissionFiles } from '../middleware/upload.js';
import { RolePolicies } from '../constants/permissions.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import {
  createSubmissionSchema,
  updateSubmissionSchema,
  reviewSubmissionSchema,
  validateHackathonIdParam,
  validateSubmissionIdParam
} from '../validators/submission.validator.js';

const router = express.Router();

const handleSubmissionUpload = (req, res, next) => {
  uploadSubmissionFiles(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new AppError(
          'Each file must be 10MB or smaller',
          HttpStatus.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR
        )
      );
    }
    return next(err);
  });
};

// Routes tied to a specific hackathon ID
router.post(
  '/hackathons/:hackathonId/submissions',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_ONLY),
  validateHackathonIdParam,
  handleSubmissionUpload,
  parseSubmissionBody,
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
  handleSubmissionUpload,
  parseSubmissionBody,
  validate(updateSubmissionSchema),
  updateSubmission
);

router.patch(
  '/submissions/:submissionId/review',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  validateSubmissionIdParam,
  validate(reviewSubmissionSchema),
  reviewSubmission
);

router.delete(
  '/submissions/:submissionId',
  authenticate,
  authorize(RolePolicies.PARTICIPANT_OR_ADMIN),
  validateSubmissionIdParam,
  deleteSubmission
);

export default router;
