import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const feedFanoutQueue = new Queue('feed-fanout', { connection: redis });

new Worker('feed-fanout', async (job) => {
  const { feed_event_id, actor_id } = job.data;

  const { data: connections } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .or(`requester_id.eq.${actor_id},recipient_id.eq.${actor_id}`)
    .eq('status', 'connected');

  if (!connections?.length) return;

  const recipientIds = connections.map((c) =>
    c.requester_id === actor_id ? c.recipient_id : c.requester_id,
  );

  const rows = recipientIds.map((userId) => ({
    recipient_user_id: userId,
    feed_event_id,
    seen: false,
  }));

  const { error } = await supabase.from('feed_items').insert(rows);
  if (error) logger.error({ error, feed_event_id }, 'Feed fanout insert failed');

}, { connection: redis });
