import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { scheduleReminder } from '../services/reminderService.js';

const router = Router();

const CertSchema = z.object({
  cert_name: z.string().min(1).max(150),
  issuer: z.string().max(150).optional(),
  issued_date: z.string().optional(),
  expiry_date: z.string().optional(),
  file_url: z.string().url().optional(),
});

// POST /certifications — upload cert with expiry date
router.post('/', requireAuth, validate(CertSchema), async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', req.user.id).single();

  const { data: cert, error } = await supabase
    .from('certifications')
    .insert({ profile_id: profile.id, ...req.body })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  if (cert.expiry_date) {
    await scheduleReminder(cert.id, cert.expiry_date, 'specialty', req.user.id, 'certification');
  }

  res.status(201).json(cert);
});

// GET /certifications — list own certifications
router.get('/', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', req.user.id).single();

  const { data: certs, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(certs);
});

// DELETE /certifications/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', req.user.id).single();

  const { error, count } = await supabase
    .from('certifications')
    .delete({ count: 'exact' })
    .eq('id', req.params.id)
    .eq('profile_id', profile.id);

  if (error) return res.status(400).json({ error: error.message });
  if (!count) return res.status(404).json({ error: 'Not found' });

  res.status(204).end();
});

export default router;
