import admin from 'firebase-admin';
import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export async function send(userId, { title, body, deepLink }) {
  const { data: user } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', userId)
    .single();

  if (!user?.fcm_token) return;

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
