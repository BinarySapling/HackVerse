import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { RolePolicies } from '../constants/permissions.js';
import { getDashboardStats } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get(
  '/dashboard/stats',
  authenticate,
  authorize(RolePolicies.ANY_AUTHENTICATED),
  getDashboardStats
);

export default router;
