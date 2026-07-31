import express from 'express';
import {
  createHackathon,
  getHackathons,
  getHackathonBySlug,
  updateHackathon,
  deleteHackathon,
  publishHackathon
} from '../controllers/hackathon.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { RolePolicies } from '../constants/permissions.js';
import { createHackathonSchema, updateHackathonSchema } from '../validators/hackathon.validator.js';

const router = express.Router();

// Public Retrieval Routes
router.get('/', getHackathons);
router.get('/:slug', getHackathonBySlug);

// Protected Configuration Routes (Authorized Organizer & Admin scopes only)
router.post('/', authenticate, authorize(RolePolicies.ORGANIZER_ONLY), validate(createHackathonSchema), createHackathon);
router.patch('/:id', authenticate, authorize(RolePolicies.ORGANIZER_ONLY), validate(updateHackathonSchema), updateHackathon);
router.post('/:id/publish', authenticate, authorize(RolePolicies.ORGANIZER_OR_ADMIN), publishHackathon);
router.delete('/:id', authenticate, authorize(RolePolicies.ORGANIZER_OR_ADMIN), deleteHackathon);

export default router;
