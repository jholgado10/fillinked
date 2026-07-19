import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { createFeedEvent } from '../services/feedService.js';
import { pushNotificationQueue } from '../jobs/pushNotification.js';

const router = Router();

const CreateSchema = z.object({
  to_user_id: z.string().uuid(),
  body: z.string().min(1),
  relationship: z.string().max(150).optional(),
});

const UpdateSchema = z.object({
  body: z.string().min(1).optional(),
  relationship: z.string().max(150).optional(),
  is_visible: z.boolean().optional(),
});

// POST /recommendations — write a recommendation
router.post('/', requireAuth, validate(CreateSchema), async (req, res) => {
  if (req.body.to_user_id === req.user.id) {
    return res.status(400).json({ error: 'Cannot recommend yourself' });
  }

  const { data: rec, error } = await supabase
    .from('recommendations')
    .insert({ from_user_id: req.user.id, ...req.body })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await createFeedEvent(req.user.id, 'recommendation', rec.id, 'recommendation');

  await pushNotificationQueue.add('push', {
    userId: req.body.to_user_id,
    type: 'recommendation',
    title: 'New recommendation',
    body: 'Someone wrote you a recommendation',
    deepLink: `fillinked://profile/me/recommendations`,
  });

  res.status(201).json(rec);
});

// GET /recommendations/:userId — list recommendations for a user
router.get('/:userId', requireAuth, async (req, res) => {
  const { data: recs, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('to_user_id', req.params.userId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(recs);
});

// PUT /recommendations/:id — writer edits own recommendation
router.put('/:id', requireAuth, validate(UpdateSchema), async (req, res) => {
  const { data: rec } = await supabase
    .from('recommendations').select('from_user_id').eq('id', req.params.id).single();

  if (!rec) return res.status(404).json({ error: 'Not found' });
  if (rec.from_user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { data: updated, error } = await supabase
    .from('recommendations')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(updated);
});

export default router;
