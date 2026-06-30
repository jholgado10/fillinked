import { supabase } from '../lib/supabase.js';
import { feedFanoutQueue } from '../jobs/feedFanout.js';

export async function createFeedEvent(actorId, eventType, targetId, targetType, metadata = {}) {
  const { data: event, error } = await supabase
    .from('feed_events')
    .insert({ actor_id: actorId, event_type: eventType, target_id: targetId, target_type: targetType, metadata })
    .select()
    .single();

  if (error) throw error;

  await feedFanoutQueue.add('fanout', { feed_event_id: event.id, actor_id: actorId });

  return event;
}
