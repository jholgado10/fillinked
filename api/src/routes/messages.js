import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /messages — list threads
router.get('/', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// GET /messages/:threadId — get messages in thread
router.get('/:threadId', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// POST /messages — start thread or send to existing
router.post('/', requireAuth, async (req, res) => {
  // TODO: find or create thread, insert message, update last_message_at, push notify
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
