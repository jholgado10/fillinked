import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /search?q=&role_type=&specialty=&work_setting=&location_city=&open_to_work=&is_license_verified=
router.get('/', requireAuth, async (req, res) => {
  // TODO: PostgreSQL full-text search on profiles.search_vector with healthcare filters
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
