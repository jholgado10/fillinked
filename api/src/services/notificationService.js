import admin from 'firebase-admin';
import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

let firebaseReady = false;

if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseReady = true;
  } catch (err) {
    logger.warn({ err }, 'Firebase Admin init failed — push notifications disabled');
  }
} else if (admin.apps.length) {
  firebaseReady = true;
} else {
  logger.warn('FIREBASE_PRIVATE_KEY not set — push notifications disabled');
}

export async function send(userId, { type, title, body, deepLink }) {
  const { error: insertError } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, body, deep_link: deepLink });
  if (insertError) logger.warn({ err: insertError, userId }, 'Notification persist failed');

  const { data: user } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', userId)
    .single();

  if (!firebaseReady || !user?.fcm_token) return;

  try {
    await admin.messaging().send({
      token: user.fcm_token,
      notification: { title, body },
      data: deepLink ? { deepLink } : {},
    });
  } catch (err) {
    logger.warn({ err, userId }, 'FCM send failed');
  }
}
