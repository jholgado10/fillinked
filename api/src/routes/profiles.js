import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { computeScore, getCompletenessBreakdown } from '../services/completenessService.js';
import { getConnectionDegree } from '../services/connectionService.js';

const router = Router();

const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  headline: z.string().max(220).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
  location_city: z.string().max(100).optional(),
  location_state: z.string().max(50).optional(),
  role_type: z.string().max(50).optional(),
  specialty: z.string().max(100).optional(),
  work_setting: z.string().max(50).optional(),
  shift_preference: z.string().max(50).optional(),
  years_experience: z.number().int().min(0).optional(),
  npi_number: z.string().max(20).optional(),
  prc_license_number: z.string().max(50).optional(),
  open_to_work: z.boolean().optional(),
});

// GET /profiles/me
router.get('/me', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error || !profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

// GET /profiles/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !profile) return res.status(404).json({ error: 'Profile not found' });

  const connection_degree = await getConnectionDegree(req.user.id, profile.user_id);

  res.json({
    ...profile,
    connection_degree,
    badges: {
      id_verified: profile.is_id_verified,
      license_verified: profile.is_license_verified,
    },
  });
});

// PUT /profiles/:id
router.put('/:id', requireAuth, validate(UpdateProfileSchema), async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', req.params.id)
    .single();

  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  if (profile.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const completeness_score = await computeScore(req.params.id);

  res.json({ ...updated, completeness_score });
});

// GET /profiles/:id/completeness
router.get('/:id/completeness', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', req.params.id)
    .single();

  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const breakdown = await getCompletenessBreakdown(req.params.id);
  res.json(breakdown);
});

export default router;
