import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /feed — paginated, cursor-based
router.get('/', requireAuth, async (req, res) => {
  // TODO: SELECT feed_items JOIN feed_events WHERE recipient = me ORDER BY created_at DESC LIMIT 20
  res.status(501).json({ message: 'Not implemented' });
});

// POST /feed/:eventId/like
router.post('/:eventId/like', requireAuth, async (req, res) => {
  // TODO: increment like_count, notify actor
  res.status(501).json({ message: 'Not implemented' });
});

// POST /feed/:eventId/comments
router.post('/:eventId/comments', requireAuth, async (req, res) => {
  // TODO: insert comment, increment comment_count, notify actor
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
