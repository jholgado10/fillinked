import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// GET /jobs — browse jobs, network-weighted
router.get('/', requireAuth, async (req, res) => {
  // TODO: filter by role_type, specialty, work_setting, shift, location, requires_verified
  res.status(501).json({ message: 'Not implemented' });
});

// POST /jobs — employer posts a job
router.post('/', requireAuth, requireRole('employer', 'agency'), async (req, res) => {
  // TODO: insert job_post, create feed event, fan out to connections
  res.status(501).json({ message: 'Not implemented' });
});

// GET /jobs/:id
router.get('/:id', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
