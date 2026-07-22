import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { redis } from '../lib/redis.js';
import { verify } from '../services/licenseVerification.js';
import { createFeedEvent } from '../services/feedService.js';
import { logger } from '../lib/logger.js';

const router = Router();

const AddLicenseSchema = z.object({
  license_type: z.enum(['rn', 'lvn', 'cna', 'np', 'md', 'prc', 'compact']),
  license_number: z.string().min(1).max(50),
  last_name: z.string().min(1).max(100),
  state: z.string().max(10).optional(),
});

// Maps a licenseVerification result onto the license_status enum (pending/verified/expired/inactive/unavailable)
function mapVerificationStatus(result) {
  if (result.error) return 'unavailable';
  if (result.verified) return 'verified';
  const raw = (result.status ?? '').toLowerCase();
  return raw === 'expired' || raw === 'inactive' ? raw : 'unavailable';
}

async function runVerification(license) {
  try {
    return await verify(license.license_type, license.license_number, license.last_name);
  } catch (err) {
    logger.error({ err, licenseId: license.id }, 'License verification failed');
    return { verified: false, error: 'verification_unavailable', source: 'none' };
  }
}

function buildStatusUpdate(result) {
  const update = {
    status: mapVerificationStatus(result),
    has_discipline: !!result.hasDiscipline,
    last_synced_at: new Date().toISOString(),
  };
  if (result.expiryDate) update.expiry_date = result.expiryDate;
  if (result.verified) {
    update.verification_source = result.source;
    update.verified_at = result.verifiedAt;
  }
  return update;
}

// POST /licenses — add license + trigger verification
router.post('/', requireAuth, validate(AddLicenseSchema), async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', req.user.id).single();

  const { data: license, error } = await supabase
    .from('licenses')
    .insert({ profile_id: profile.id, ...req.body })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const result = await runVerification(license);

  const { data: updated, error: updateError } = await supabase
    .from('licenses')
    .update(buildStatusUpdate(result))
    .eq('id', license.id)
    .select()
    .single();

  if (updateError) return res.status(400).json({ error: updateError.message });

  if (updated.status === 'verified') {
    await createFeedEvent(req.user.id, 'license_verified', updated.id, 'license');
  }

  res.status(201).json(updated);
});

// GET /licenses/:id/status
router.get('/:id/status', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', req.user.id).single();

  const { data: license, error } = await supabase
    .from('licenses')
    .select('id, status, verification_source, verified_at, last_synced_at, expiry_date, has_discipline')
    .eq('id', req.params.id)
    .eq('profile_id', profile.id)
    .single();

  if (error || !license) return res.status(404).json({ error: 'Not found' });

  res.json(license);
});

// PUT /licenses/:id/refresh — force re-verify
router.put('/:id/refresh', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', req.user.id).single();

  const { data: license, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('id', req.params.id)
    .eq('profile_id', profile.id)
    .single();

  if (error || !license) return res.status(404).json({ error: 'Not found' });

  await redis.del(`brn:${license.license_type}:${license.license_number}`);

  const result = await runVerification(license);

  const { data: updated, error: updateError } = await supabase
    .from('licenses')
    .update(buildStatusUpdate(result))
    .eq('id', license.id)
    .select()
    .single();

  if (updateError) return res.status(400).json({ error: updateError.message });

  res.json(updated);
});

export default router;
