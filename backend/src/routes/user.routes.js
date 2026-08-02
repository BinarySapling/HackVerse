import express from 'express';
import {
  listUsers,
  updateMe,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
} from '../controllers/user.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import uploadAvatar from '../middleware/upload.js';
import { RolePolicies } from '../constants/permissions.js';
import { updateProfileSchema, updateUserSchema } from '../validators/user.validator.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

const router = express.Router();

const handleAvatarUpload = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new AppError(
          'Avatar must be 2MB or smaller',
          HttpStatus.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR
        )
      );
    }
    return next(err);
  });
};

router.get('/', authenticate, authorize(RolePolicies.ADMIN_ONLY), listUsers);
router.patch(
  '/me',
  authenticate,
  authorize(RolePolicies.ANY_AUTHENTICATED),
  handleAvatarUpload,
  validate(updateProfileSchema),
  updateMe
);
router.patch(
  '/:id',
  authenticate,
  authorize(RolePolicies.ADMIN_ONLY),
  validate(updateUserSchema),
  updateUser
);
router.patch('/:id/block', authenticate, authorize(RolePolicies.ADMIN_ONLY), blockUser);
router.patch('/:id/unblock', authenticate, authorize(RolePolicies.ADMIN_ONLY), unblockUser);
router.delete('/:id', authenticate, authorize(RolePolicies.ADMIN_ONLY), deleteUser);

export default router;
