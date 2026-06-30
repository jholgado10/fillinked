import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /notifications
router.get('/', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /notifications/read — mark all or specific as read
router.put('/read', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
