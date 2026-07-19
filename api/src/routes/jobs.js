import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { supabase } from '../lib/supabase.js';
import { createFeedEvent } from '../services/feedService.js';

const router = Router();

const CreateJobSchema = z.object({
  role_type: z.string().min(1).max(50),
  specialty: z.string().max(100).optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  work_setting: z.string().max(50).optional(),
  shift: z.string().max(50).optional(),
  salary_min: z.number().int().optional(),
  salary_max: z.number().int().optional(),
  salary_period: z.enum(['hourly', 'annual']).optional(),
  location_city: z.string().max(100).optional(),
  requires_verified: z.boolean().optional(),
});

// GET /jobs — browse jobs, network-weighted
router.get('/', requireAuth, async (req, res) => {
  const { role_type, specialty, work_setting, shift, location_city, requires_verified } = req.query;

  let query = supabase
    .from('job_posts')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(50);

  if (role_type) query = query.eq('role_type', role_type);
  if (specialty) query = query.eq('specialty', specialty);
  if (work_setting) query = query.eq('work_setting', work_setting);
  if (shift) query = query.eq('shift', shift);
  if (location_city) query = query.eq('location_city', location_city);
  if (requires_verified !== undefined) query = query.eq('requires_verified', requires_verified === 'true');

  const { data: jobs, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(jobs);
});

// POST /jobs — employer posts a job
router.post('/', requireAuth, requireRole('employer', 'agency'), validate(CreateJobSchema), async (req, res) => {
  const { data: job, error } = await supabase
    .from('job_posts')
    .insert({ employer_id: req.user.id, ...req.body })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await createFeedEvent(req.user.id, 'job_post', job.id, 'job_post');

  res.status(201).json(job);
});

// GET /jobs/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { data: job, error } = await supabase
    .from('job_posts').select('*').eq('id', req.params.id).single();

  if (error || !job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

export default router;
