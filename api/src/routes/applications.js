import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /jobs/:id/apply — apply with optional referral tag
router.post('/jobs/:id/apply', requireAuth, async (req, res) => {
  // TODO: insert application, attach referred_by_user_id if present, notify employer
  res.status(501).json({ message: 'Not implemented' });
});

// GET /applications — list own applications (worker)
router.get('/', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /applications/:id — employer updates status
router.put('/:id', requireAuth, async (req, res) => {
  // TODO: update status, notify worker
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
