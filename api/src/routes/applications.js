import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { pushNotificationQueue } from '../jobs/pushNotification.js';

const router = Router();

const ApplySchema = z.object({
  cover_note: z.string().optional(),
  referred_by_user_id: z.string().uuid().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'viewed', 'shortlisted', 'rejected', 'hired']),
});

// POST /applications/:id/apply — apply to job :id, with optional referral tag
router.post('/:id/apply', requireAuth, validate(ApplySchema), async (req, res) => {
  const { data: job } = await supabase
    .from('job_posts').select('id, employer_id, status, application_count').eq('id', req.params.id).single();

  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'open') return res.status(400).json({ error: 'Job is not accepting applications' });

  const { data: application, error } = await supabase
    .from('applications')
    .insert({ worker_id: req.user.id, job_post_id: req.params.id, ...req.body })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Already applied' });
    return res.status(400).json({ error: error.message });
  }

  await supabase
    .from('job_posts')
    .update({ application_count: job.application_count + 1 })
    .eq('id', req.params.id);

  await pushNotificationQueue.add('push', {
    userId: job.employer_id,
    type: 'job_application',
    title: 'New application',
    body: 'Someone applied to your job post',
    deepLink: `fillinked://jobs/${req.params.id}/applications`,
  });

  res.status(201).json(application);
});

// GET /applications — list own applications (worker)
router.get('/', requireAuth, async (req, res) => {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*, job_posts(title, role_type, location_city, status)')
    .eq('worker_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(applications);
});

// PUT /applications/:id — employer updates status
router.put('/:id', requireAuth, validate(UpdateStatusSchema), async (req, res) => {
  const { data: application } = await supabase
    .from('applications')
    .select('*, job_posts(employer_id)')
    .eq('id', req.params.id)
    .single();

  if (!application) return res.status(404).json({ error: 'Not found' });
  if (application.job_posts.employer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { data: updated, error } = await supabase
    .from('applications')
    .update({ status: req.body.status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await pushNotificationQueue.add('push', {
    userId: application.worker_id,
    type: 'application_status',
    title: 'Application update',
    body: `Your application status changed to ${req.body.status}`,
    deepLink: `fillinked://applications/${req.params.id}`,
  });

  res.json(updated);
});

export default router;
