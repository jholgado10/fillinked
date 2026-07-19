import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

const SubmitSchema = z.object({
  id_type: z.enum(['drivers_license', 'passport', 'state_id', 'green_card']),
  front_url: z.string().url(),
  selfie_url: z.string().url().optional(),
});

// GET /verifications/upload-url — get signed URL for ID upload
router.get('/upload-url', requireAuth, async (req, res) => {
  const path = `${req.user.id}/${randomUUID()}`;

  const { data, error } = await supabase
    .storage
    .from('verifications')
    .createSignedUploadUrl(path);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ path: data.path, token: data.token, signedUrl: data.signedUrl });
});

// POST /verifications — submit ID for manual review
router.post('/', requireAuth, validate(SubmitSchema), async (req, res) => {
  const { data: verification, error } = await supabase
    .from('verifications')
    .insert({ user_id: req.user.id, status: 'pending', ...req.body })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(verification);
});

// GET /verifications/status — check own verification status
router.get('/status', requireAuth, async (req, res) => {
  const { data: verification, error } = await supabase
    .from('verifications')
    .select('status, rejection_reason, created_at, reviewed_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  res.json(verification ?? { status: 'not_submitted' });
});

export default router;
