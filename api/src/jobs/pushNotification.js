import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { send } from '../services/notificationService.js';
import { logger } from '../lib/logger.js';

export const pushNotificationQueue = new Queue('push-notification', { connection: redis });

new Worker('push-notification', async (job) => {
  const { userId, type, title, body, deepLink } = job.data;
  try {
    await send(userId, { type, title, body, deepLink });
  } catch (err) {
    logger.warn({ err, userId }, 'Push notification job failed');
  }
}, { connection: redis });
