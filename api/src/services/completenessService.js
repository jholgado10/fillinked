import { supabase } from '../lib/supabase.js';

const WEIGHTS = {
  avatar_url: 10,
  full_name: 5,
  location_city: 5,
  role_type: 5,
  headline: 5,
  work_experiences: 15,
  skills_3: 5,
  bio: 5,
  license_verified: 15,
  skills_endorsements_5: 5,
  recommendations: 10,
  npi_or_prc: 5,
  id_verified: 10,
};

export async function computeScore(profileId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  const { data: experiences } = await supabase
    .from('work_experiences')
    .select('id')
    .eq('profile_id', profileId);

  const { data: skills } = await supabase
    .from('skills')
    .select('endorsement_count')
    .eq('profile_id', profileId);

  const { data: licenses } = await supabase
    .from('licenses')
    .select('id')
    .eq('profile_id', profileId)
    .eq('status', 'verified');

  const { data: recs } = await supabase
    .from('recommendations')
    .select('id')
    .eq('to_user_id', profile.user_id)
    .eq('is_visible', true);

  let score = 0;
  if (profile.avatar_url) score += WEIGHTS.avatar_url;
  if (profile.full_name) score += WEIGHTS.full_name;
  if (profile.location_city) score += WEIGHTS.location_city;
  if (profile.role_type) score += WEIGHTS.role_type;
  if (profile.headline) score += WEIGHTS.headline;
  if ((experiences?.length ?? 0) >= 1) score += WEIGHTS.work_experiences;
  if ((skills?.length ?? 0) >= 3) score += WEIGHTS.skills_3;
  if (profile.bio) score += WEIGHTS.bio;
  if ((licenses?.length ?? 0) >= 1) score += WEIGHTS.license_verified;
  if ((skills ?? []).filter((s) => s.endorsement_count >= 1).length >= 5) score += WEIGHTS.skills_endorsements_5;
  if ((recs?.length ?? 0) >= 1) score += WEIGHTS.recommendations;
  if (profile.npi_number || profile.prc_license_number) score += WEIGHTS.npi_or_prc;
  if (profile.is_id_verified) score += WEIGHTS.id_verified;

  await supabase
    .from('profiles')
    .update({ completeness_score: Math.min(score, 100) })
    .eq('id', profileId);

  return Math.min(score, 100);
}
