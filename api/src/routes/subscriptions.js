import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { supabase } from '../lib/supabase.js';
import { createCheckoutSession } from '../services/stripeService.js';

const router = Router();

const CreateSchema = z.object({
  plan_type: z.enum(['agency_basic', 'agency_pro', 'hospital', 'premium_family']),
});

// POST /subscriptions — create agency Stripe subscription
router.post('/', requireAuth, requireRole('agency', 'employer'), validate(CreateSchema), async (req, res) => {
  try {
    const url = await createCheckoutSession(req.user.id, req.user.email, req.body.plan_type);
    res.json({ url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /subscriptions/status — check own subscription
router.get('/status', requireAuth, async (req, res) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_start, current_period_end')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  res.json(subscription ?? { status: 'none' });
});

export default router;
