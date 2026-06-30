import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /certifications — upload cert with expiry date
router.post('/', requireAuth, async (req, res) => {
  // TODO: insert certification, schedule expiration reminder
  res.status(501).json({ message: 'Not implemented' });
});

// GET /certifications — list own certifications
router.get('/', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// DELETE /certifications/:id
router.delete('/:id', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
