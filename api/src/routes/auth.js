import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

const MagicLinkSchema = z.object({ email: z.string().email() });
const OtpSchema = z.object({ phone: z.string(), token: z.string() });

// POST /auth/magic-link
router.post('/magic-link', validate(MagicLinkSchema), async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Magic link sent' });
});

// POST /auth/verify-otp
router.post('/verify-otp', validate(OtpSchema), async (req, res) => {
  const { phone, token } = req.body;
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
