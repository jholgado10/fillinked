import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { createFeedEvent } from '../services/feedService.js';
import { pushNotificationQueue } from '../jobs/pushNotification.js';

const router = Router();

const SendRequestSchema = z.object({ recipient_id: z.string().uuid() });
const RespondSchema = z.object({ status: z.enum(['connected', 'declined']) });

// GET /connections/suggestions
router.get('/suggestions', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', req.user.id).single();

  const { data: existing } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .or(`requester_id.eq.${req.user.id},recipient_id.eq.${req.user.id}`);

  const excludeIds = new Set([req.user.id]);
  for (const c of existing ?? []) {
    excludeIds.add(c.requester_id === req.user.id ? c.recipient_id : c.requester_id);
  }

  let query = supabase
    .from('profiles')
    .select('id, user_id, full_name, headline, avatar_url, role_type, specialty, location_city')
    .neq('user_id', req.user.id)
    .limit(20);

  if (profile.role_type) query = query.eq('role_type', profile.role_type);
  if (profile.location_city) query = query.eq('location_city', profile.location_city);

  const { data: suggestions, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  res.json((suggestions ?? []).filter((p) => !excludeIds.has(p.user_id)));
});

// GET /connections — list own connections
router.get('/', requireAuth, async (req, res) => {
  const { data: connections, error } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${req.user.id},recipient_id.eq.${req.user.id}`)
    .eq('status', 'connected')
    .order('updated_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  const otherIds = connections.map((c) =>
    c.requester_id === req.user.id ? c.recipient_id : c.requester_id,
  );

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name, headline, avatar_url, role_type')
    .in('user_id', otherIds.length ? otherIds : ['00000000-0000-0000-0000-000000000000']);

  const profileByUserId = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));

  res.json(connections.map((c) => ({
    ...c,
    profile: profileByUserId[c.requester_id === req.user.id ? c.recipient_id : c.requester_id] ?? null,
  })));
});

// POST /connections — send request
router.post('/', requireAuth, validate(SendRequestSchema), async (req, res) => {
  const { recipient_id } = req.body;
  if (recipient_id === req.user.id) return res.status(400).json({ error: 'Cannot connect to yourself' });

  const { data: connection, error } = await supabase
    .from('connections')
    .insert({ requester_id: req.user.id, recipient_id, status: 'pending' })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Request already exists' });
    return res.status(400).json({ error: error.message });
  }

  await pushNotificationQueue.add('push', {
    userId: recipient_id,
    type: 'connection_request',
    title: 'New connection request',
    body: 'Someone wants to connect with you',
    deepLink: `fillinked://connections/${connection.id}`,
  });

  res.status(201).json(connection);
});

// PUT /connections/:id — accept or decline
router.put('/:id', requireAuth, validate(RespondSchema), async (req, res) => {
  const { data: connection } = await supabase
    .from('connections').select('*').eq('id', req.params.id).single();

  if (!connection) return res.status(404).json({ error: 'Not found' });
  if (connection.recipient_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { data: updated, error } = await supabase
    .from('connections')
    .update({ status: req.body.status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  if (req.body.status === 'connected') {
    await createFeedEvent(req.user.id, 'connection', connection.requester_id, 'user');
    await pushNotificationQueue.add('push', {
      userId: connection.requester_id,
      type: 'connection_accepted',
      title: 'Connection accepted',
      body: 'Your connection request was accepted',
      deepLink: `fillinked://profile/${req.user.id}`,
    });
  }

  res.json(updated);
});

export default router;
