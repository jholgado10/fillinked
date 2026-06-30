import { supabase } from '../lib/supabase.js';

export function requireRole(...roles) {
  return async (req, res, next) => {
    const { data, error } = await supabase
      .from('users')
      .select('member_type')
      .eq('id', req.user.id)
      .single();

    if (error || !data) return res.status(403).json({ error: 'Forbidden' });
    if (!roles.includes(data.member_type)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
    }

    req.memberType = data.member_type;
    next();
  };
}
