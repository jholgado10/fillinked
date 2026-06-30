import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /endorsements — endorse a skill
router.post('/', requireAuth, async (req, res) => {
  // TODO: insert skill_endorsement (unique constraint), increment skills.endorsement_count, notify
  res.status(501).json({ message: 'Not implemented' });
});

// DELETE /endorsements/:skillId — remove endorsement
router.delete('/:skillId', requireAuth, async (req, res) => {
  // TODO: delete endorsement, decrement count
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
