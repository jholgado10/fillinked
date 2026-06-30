import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /licenses — add license + trigger verification
router.post('/', requireAuth, async (req, res) => {
  // TODO: validate, insert, call licenseVerification, fanout feed event
  res.status(501).json({ message: 'Not implemented' });
});

// GET /licenses/:id/status
router.get('/:id/status', requireAuth, async (req, res) => {
  // TODO: return real-time verification status
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /licenses/:id/refresh — force re-verify
router.put('/:id/refresh', requireAuth, async (req, res) => {
  // TODO: invalidate Redis cache and re-verify
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
