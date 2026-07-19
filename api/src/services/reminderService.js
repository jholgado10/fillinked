import { supabase } from '../lib/supabase.js';

const REMINDER_DAYS = {
  rn: [90, 30, 7],
  lvn: [90, 30, 7],
  cna: [90, 30, 7],
  bls: [60, 30, 7],
  specialty: [90, 30],
};

export async function scheduleReminder(licenseId, expiryDate, licenseType, userId, sourceType = 'license') {
  if (!expiryDate) return;

  const expiry = new Date(expiryDate);
  const days = REMINDER_DAYS[licenseType] ?? [90, 30, 7];

  const rows = days.map((d) => {
    const scheduledAt = new Date(expiry);
    scheduledAt.setDate(scheduledAt.getDate() - d);
    return {
      user_id: userId,
      license_id: licenseId,
      source_type: sourceType,
      reminder_type: `${d}_day`,
      scheduled_at: scheduledAt.toISOString(),
    };
  });

  await supabase.from('license_reminders').insert(rows);
}
