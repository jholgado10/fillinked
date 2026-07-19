import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { pushNotificationQueue } from '../jobs/pushNotification.js';

const router = Router();

const EndorseSchema = z.object({ skill_id: z.string().uuid() });

// POST /endorsements — endorse a skill
router.post('/', requireAuth, validate(EndorseSchema), async (req, res) => {
  const { skill_id } = req.body;

  const { data: skill } = await supabase
    .from('skills')
    .select('id, endorsement_count, profile_id, profiles(user_id)')
    .eq('id', skill_id)
    .single();

  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  const skillOwnerId = skill.profiles.user_id;
  if (skillOwnerId === req.user.id) return res.status(400).json({ error: 'Cannot endorse your own skill' });

  const { error } = await supabase
    .from('skill_endorsements')
    .insert({ from_user_id: req.user.id, to_user_id: skillOwnerId, skill_id });

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Already endorsed' });
    return res.status(400).json({ error: error.message });
  }

  const { data: updated } = await supabase
    .from('skills')
    .update({ endorsement_count: skill.endorsement_count + 1 })
    .eq('id', skill_id)
    .select()
    .single();

  await pushNotificationQueue.add('push', {
    userId: skillOwnerId,
    type: 'endorsement',
    title: 'New skill endorsement',
    body: 'Someone endorsed one of your skills',
    deepLink: `fillinked://profile/me`,
  });

  res.status(201).json(updated);
});

// DELETE /endorsements/:skillId — remove endorsement
router.delete('/:skillId', requireAuth, async (req, res) => {
  const { skillId } = req.params;

  const { error, count } = await supabase
    .from('skill_endorsements')
    .delete({ count: 'exact' })
    .eq('skill_id', skillId)
    .eq('from_user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  if (!count) return res.status(404).json({ error: 'Endorsement not found' });

  const { data: skill } = await supabase
    .from('skills').select('endorsement_count').eq('id', skillId).single();

  if (skill) {
    await supabase
      .from('skills')
      .update({ endorsement_count: Math.max(skill.endorsement_count - 1, 0) })
      .eq('id', skillId);
  }

  res.status(204).end();
});

export default router;
