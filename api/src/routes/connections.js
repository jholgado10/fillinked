import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /connections/suggestions
router.get('/suggestions', requireAuth, async (req, res) => {
  // TODO: suggest by role type, specialty, location, mutual connections
  res.status(501).json({ message: 'Not implemented' });
});

// GET /connections — list own connections
router.get('/', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// POST /connections — send request
router.post('/', requireAuth, async (req, res) => {
  // TODO: insert pending connection, notify recipient
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /connections/:id — accept or decline
router.put('/:id', requireAuth, async (req, res) => {
  // TODO: update status, fanout feed event on accept
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
