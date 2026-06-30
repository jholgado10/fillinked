import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { supabase } from '../lib/supabase.js';
import { send } from '../services/notificationService.js';
import { logger } from '../lib/logger.js';

export const expirationReminderQueue = new Queue('expiration-reminder', {
  connection: redis,
  defaultJobOptions: {
    repeat: { pattern: '0 8 * * *', tz: 'America/Los_Angeles' },
  },
});

new Worker('expiration-reminder', async () => {
  const now = new Date().toISOString();

  const { data: reminders, error } = await supabase
    .from('license_reminders')
    .select('*')
    .lte('scheduled_at', now)
    .is('sent_at', null);

  if (error) {
    logger.error({ error }, 'Expiration reminder fetch failed');
    return;
  }

  for (const reminder of reminders ?? []) {
    const days = reminder.reminder_type.replace('_day', '');
    await send(reminder.user_id, {
      title: `Credential expiring in ${days} days`,
      body: 'Renew your credential to keep your Verified badge active.',
      deepLink: 'fillinked://profile/me/credentials',
    });

    await supabase
      .from('license_reminders')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', reminder.id);
  }

  logger.info({ count: reminders?.length ?? 0 }, 'Expiration reminders sent');
}, { connection: redis });
