import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { RolePolicies } from '../constants/permissions.js';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get(
  '/notifications/me',
  authenticate,
  authorize(RolePolicies.ANY_AUTHENTICATED),
  getMyNotifications
);

router.patch(
  '/notifications/read-all',
  authenticate,
  authorize(RolePolicies.ANY_AUTHENTICATED),
  markAllNotificationsRead
);

router.patch(
  '/notifications/:id/read',
  authenticate,
  authorize(RolePolicies.ANY_AUTHENTICATED),
  markNotificationRead
);

export default router;
