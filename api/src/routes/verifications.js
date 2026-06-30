import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /verifications/upload-url — get signed URL for ID upload
router.get('/upload-url', requireAuth, async (req, res) => {
  // TODO: generate signed Supabase Storage URL (5 min TTL) for verifications bucket
  res.status(501).json({ message: 'Not implemented' });
});

// POST /verifications — submit ID for manual review
router.post('/', requireAuth, async (req, res) => {
  // TODO: insert verifications row (status: pending)
  res.status(501).json({ message: 'Not implemented' });
});

// GET /verifications/status — check own verification status
router.get('/status', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
