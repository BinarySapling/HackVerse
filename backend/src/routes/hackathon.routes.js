import express from 'express';
import {
  createHackathon,
  getHackathons,
  getHackathonBySlug,
  updateHackathon,
  deleteHackathon,
  publishHackathon,
  openRegistration,
  closeRegistration,
} from '../controllers/hackathon.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { uploadBanner } from '../middleware/upload.js';
import parseHackathonMultipart from '../middleware/parseHackathonMultipart.js';
import { RolePolicies } from '../constants/permissions.js';
import { createHackathonSchema, updateHackathonSchema } from '../validators/hackathon.validator.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

const router = express.Router();

const handleBannerUpload = (req, res, next) => {
  uploadBanner(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new AppError(
          'Banner image must be 5MB or smaller',
          HttpStatus.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR
        )
      );
    }
    return next(err);
  });
};

// Public Retrieval Routes
router.get('/', getHackathons);
router.get('/:slug', getHackathonBySlug);

// Protected Configuration Routes (Authorized Organizer & Admin scopes only)
router.post(
  '/',
  authenticate,
  authorize(RolePolicies.ORGANIZER_ONLY),
  handleBannerUpload,
  parseHackathonMultipart,
  validate(createHackathonSchema),
  createHackathon
);
router.patch(
  '/:id',
  authenticate,
  authorize(RolePolicies.ORGANIZER_ONLY),
  handleBannerUpload,
  parseHackathonMultipart,
  validate(updateHackathonSchema),
  updateHackathon
);
router.post('/:id/publish', authenticate, authorize(RolePolicies.ORGANIZER_OR_ADMIN), publishHackathon);
router.post(
  '/:id/open-registration',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  openRegistration
);
router.post(
  '/:id/close-registration',
  authenticate,
  authorize(RolePolicies.ORGANIZER_OR_ADMIN),
  closeRegistration
);
router.delete('/:id', authenticate, authorize(RolePolicies.ORGANIZER_OR_ADMIN), deleteHackathon);

export default router;
