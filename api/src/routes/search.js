import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

// GET /search?q=&role_type=&specialty=&work_setting=&location_city=&open_to_work=&is_license_verified=
router.get('/', requireAuth, async (req, res) => {
  const { q, role_type, specialty, work_setting, location_city, open_to_work, is_license_verified } = req.query;

  let query = supabase
    .from('profiles')
    .select('id, user_id, full_name, headline, avatar_url, role_type, specialty, location_city, open_to_work, is_license_verified')
    .limit(50);

  if (q) query = query.textSearch('search_vector', q, { type: 'websearch' });
  if (role_type) query = query.eq('role_type', role_type);
  if (specialty) query = query.eq('specialty', specialty);
  if (work_setting) query = query.eq('work_setting', work_setting);
  if (location_city) query = query.eq('location_city', location_city);
  if (open_to_work !== undefined) query = query.eq('open_to_work', open_to_work === 'true');
  if (is_license_verified !== undefined) query = query.eq('is_license_verified', is_license_verified === 'true');

  const { data: results, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  res.json(results);
});

export default router;
