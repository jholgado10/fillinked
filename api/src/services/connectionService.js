import { supabase } from '../lib/supabase.js';
import { redis } from '../lib/redis.js';

export async function getConnectionDegree(viewerUserId, targetUserId) {
  if (viewerUserId === targetUserId) return 0;

  const cacheKey = `degree:${viewerUserId}:${targetUserId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return parseInt(cached, 10);

  // Check 1st degree
  const { data: direct } = await supabase
    .from('connections')
    .select('id')
    .or(`and(requester_id.eq.${viewerUserId},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${viewerUserId})`)
    .eq('status', 'connected')
    .maybeSingle();

  if (direct) {
    await redis.setex(cacheKey, 3600, '1');
    return 1;
  }

  // TODO: 2nd degree graph query
  // For MVP, return 3 as default for non-1st-degree connections
  await redis.setex(cacheKey, 3600, '3');
  return 3;
}

export async function getConnectionIds(userId) {
  const { data } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'connected');

  return (data ?? []).map((c) =>
    c.requester_id === userId ? c.recipient_id : c.requester_id,
  );
}
