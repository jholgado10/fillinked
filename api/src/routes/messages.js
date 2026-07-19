import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { pushNotificationQueue } from '../jobs/pushNotification.js';

const router = Router();

const SendSchema = z.object({
  recipient_id: z.string().uuid().optional(),
  thread_id: z.string().uuid().optional(),
  body: z.string().min(1),
}).refine((v) => v.recipient_id || v.thread_id, {
  message: 'recipient_id or thread_id is required',
});

// GET /messages — list threads
router.get('/', requireAuth, async (req, res) => {
  const { data: threads, error } = await supabase
    .from('message_threads')
    .select('*')
    .or(`participant_a.eq.${req.user.id},participant_b.eq.${req.user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(threads);
});

// GET /messages/:threadId — get messages in thread
router.get('/:threadId', requireAuth, async (req, res) => {
  const { data: thread } = await supabase
    .from('message_threads').select('*').eq('id', req.params.threadId).single();

  if (!thread) return res.status(404).json({ error: 'Not found' });
  if (thread.participant_a !== req.user.id && thread.participant_b !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', req.params.threadId)
    .order('created_at', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(messages);
});

// POST /messages — start thread or send to existing
router.post('/', requireAuth, validate(SendSchema), async (req, res) => {
  let threadId = req.body.thread_id;
  let recipientId = req.body.recipient_id;

  if (threadId) {
    const { data: thread } = await supabase
      .from('message_threads').select('*').eq('id', threadId).single();

    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (thread.participant_a !== req.user.id && thread.participant_b !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    recipientId = thread.participant_a === req.user.id ? thread.participant_b : thread.participant_a;
  } else {
    if (recipientId === req.user.id) return res.status(400).json({ error: 'Cannot message yourself' });

    const { data: existing } = await supabase
      .from('message_threads')
      .select('*')
      .or(`and(participant_a.eq.${req.user.id},participant_b.eq.${recipientId}),and(participant_a.eq.${recipientId},participant_b.eq.${req.user.id})`)
      .maybeSingle();

    if (existing) {
      threadId = existing.id;
    } else {
      const { data: thread, error } = await supabase
        .from('message_threads')
        .insert({ participant_a: req.user.id, participant_b: recipientId })
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      threadId = thread.id;
    }
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ thread_id: threadId, sender_id: req.user.id, body: req.body.body })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await supabase
    .from('message_threads')
    .update({ last_message_at: message.created_at })
    .eq('id', threadId);

  await pushNotificationQueue.add('push', {
    userId: recipientId,
    type: 'message',
    title: 'New message',
    body: req.body.body.slice(0, 100),
    deepLink: `fillinked://messages/${threadId}`,
  });

  res.status(201).json(message);
});

export default router;
