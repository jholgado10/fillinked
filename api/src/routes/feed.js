import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { pushNotificationQueue } from '../jobs/pushNotification.js';

const router = Router();

const CommentSchema = z.object({ body: z.string().min(1) });

// GET /feed — paginated, cursor-based
router.get('/', requireAuth, async (req, res) => {
  const limit = 20;
  let query = supabase
    .from('feed_items')
    .select('id, seen, created_at, feed_events(*)')
    .eq('recipient_user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (req.query.cursor) query = query.lt('created_at', req.query.cursor);

  const { data: items, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  const nextCursor = items.length === limit ? items[items.length - 1].created_at : null;
  res.json({ items, nextCursor });
});

// POST /feed/:eventId/like
router.post('/:eventId/like', requireAuth, async (req, res) => {
  const { data: event } = await supabase
    .from('feed_events').select('id, actor_id, like_count').eq('id', req.params.eventId).single();

  if (!event) return res.status(404).json({ error: 'Not found' });

  const { data: updated, error } = await supabase
    .from('feed_events')
    .update({ like_count: event.like_count + 1 })
    .eq('id', req.params.eventId)
    .select('like_count')
    .single();

  if (error) return res.status(400).json({ error: error.message });

  if (event.actor_id !== req.user.id) {
    await pushNotificationQueue.add('push', {
      userId: event.actor_id,
      type: 'feed_like',
      title: 'New like',
      body: 'Someone liked your post',
      deepLink: `fillinked://feed/${req.params.eventId}`,
    });
  }

  res.json(updated);
});

// POST /feed/:eventId/comments
router.post('/:eventId/comments', requireAuth, validate(CommentSchema), async (req, res) => {
  const { data: event } = await supabase
    .from('feed_events').select('id, actor_id, comment_count').eq('id', req.params.eventId).single();

  if (!event) return res.status(404).json({ error: 'Not found' });

  const { data: comment, error } = await supabase
    .from('feed_comments')
    .insert({ feed_event_id: req.params.eventId, author_id: req.user.id, body: req.body.body })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await supabase
    .from('feed_events')
    .update({ comment_count: event.comment_count + 1 })
    .eq('id', req.params.eventId);

  if (event.actor_id !== req.user.id) {
    await pushNotificationQueue.add('push', {
      userId: event.actor_id,
      type: 'feed_comment',
      title: 'New comment',
      body: 'Someone commented on your post',
      deepLink: `fillinked://feed/${req.params.eventId}`,
    });
  }

  res.status(201).json(comment);
});

export default router;
