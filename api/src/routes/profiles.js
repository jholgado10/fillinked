import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /profiles/me
router.get('/me', requireAuth, async (req, res) => {
  // TODO: fetch own profile with completeness score
  res.status(501).json({ message: 'Not implemented' });
});

// GET /profiles/:id
router.get('/:id', requireAuth, async (req, res) => {
  // TODO: fetch profile by id, include badges + connection degree
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /profiles/:id
router.put('/:id', requireAuth, async (req, res) => {
  // TODO: update own profile, recompute completeness score
  res.status(501).json({ message: 'Not implemented' });
});

// GET /profiles/:id/completeness
router.get('/:id/completeness', requireAuth, async (req, res) => {
  // TODO: return completeness score breakdown
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
