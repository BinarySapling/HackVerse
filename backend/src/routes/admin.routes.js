import express from 'express';
import { listTeams, listSubmissions } from '../controllers/admin.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { RolePolicies } from '../constants/permissions.js';

const router = express.Router();

router.get('/teams', authenticate, authorize(RolePolicies.ADMIN_ONLY), listTeams);
router.get('/submissions', authenticate, authorize(RolePolicies.ADMIN_ONLY), listSubmissions);

export default router;
