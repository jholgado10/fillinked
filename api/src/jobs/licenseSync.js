import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { supabase } from '../lib/supabase.js';
import { verify } from '../services/licenseVerification.js';
import { send } from '../services/notificationService.js';
import { logger } from '../lib/logger.js';

export const licenseSyncQueue = new Queue('license-sync', {
  connection: redis,
  defaultJobOptions: {
    repeat: { pattern: '0 2 * * *', tz: 'America/Los_Angeles' },
  },
});

new Worker('license-sync', async () => {
  const { data: licenses, error } = await supabase
    .from('licenses')
    .select('*, profiles!inner(user_id)')
    .in('status', ['verified', 'expired']);

  if (error) {
    logger.error({ error }, 'licenseSync fetch failed');
    return;
  }

  for (const license of licenses ?? []) {
    await redis.del(`brn:${license.license_type}:${license.license_number}`);

    const result = await verify(license.license_type, license.license_number, license.last_name);

    if (result.status !== license.status) {
      await supabase
        .from('licenses')
        .update({ status: result.status, last_synced_at: new Date().toISOString() })
        .eq('id', license.id);

      await send(license.profiles.user_id, {
        title: 'License status updated',
        body: `Your ${license.license_type.toUpperCase()} license is now ${result.status}`,
        deepLink: 'fillinked://profile/me/credentials',
      });
    } else {
      await supabase
        .from('licenses')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', license.id);
    }
  }

  logger.info({ count: licenses?.length ?? 0 }, 'License sync complete');
}, { connection: redis });
