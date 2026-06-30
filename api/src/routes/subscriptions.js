import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// POST /subscriptions — create agency Stripe subscription
router.post('/', requireAuth, requireRole('agency', 'employer'), async (req, res) => {
  // TODO: create/fetch Stripe customer, create checkout session, return URL
  res.status(501).json({ message: 'Not implemented' });
});

// GET /subscriptions/status — check own subscription
router.get('/status', requireAuth, async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
