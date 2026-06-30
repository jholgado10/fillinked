import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /recommendations — write a recommendation
router.post('/', requireAuth, async (req, res) => {
  // TODO: insert recommendation, create feed event, notify recipient
  res.status(501).json({ message: 'Not implemented' });
});

// GET /recommendations/:userId — list recommendations for a user
router.get('/:userId', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /recommendations/:id — writer edits own recommendation
router.put('/:id', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
