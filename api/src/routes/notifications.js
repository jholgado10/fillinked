import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

const MarkReadSchema = z.object({ ids: z.array(z.string().uuid()).optional() });

// GET /notifications
router.get('/', requireAuth, async (req, res) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (req.query.cursor) query = query.lt('created_at', req.query.cursor);

  const { data: notifications, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(notifications);
});

// PUT /notifications/read — mark all or specific as read
router.put('/read', requireAuth, validate(MarkReadSchema), async (req, res) => {
  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.user.id);

  if (req.body.ids?.length) query = query.in('id', req.body.ids);

  const { error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'ok' });
});

export default router;
