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

async function evaluateCriteria(profileId) {
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

  return {
    avatar_url: !!profile.avatar_url,
    full_name: !!profile.full_name,
    location_city: !!profile.location_city,
    role_type: !!profile.role_type,
    headline: !!profile.headline,
    work_experiences: (experiences?.length ?? 0) >= 1,
    skills_3: (skills?.length ?? 0) >= 3,
    bio: !!profile.bio,
    license_verified: (licenses?.length ?? 0) >= 1,
    skills_endorsements_5: (skills ?? []).filter((s) => s.endorsement_count >= 1).length >= 5,
    recommendations: (recs?.length ?? 0) >= 1,
    npi_or_prc: !!(profile.npi_number || profile.prc_license_number),
    id_verified: !!profile.is_id_verified,
  };
}

function scoreFromCriteria(criteria) {
  const score = Object.keys(WEIGHTS).reduce(
    (total, key) => total + (criteria[key] ? WEIGHTS[key] : 0),
    0,
  );
  return Math.min(score, 100);
}

export async function computeScore(profileId) {
  const criteria = await evaluateCriteria(profileId);
  const score = scoreFromCriteria(criteria);

  await supabase
    .from('profiles')
    .update({ completeness_score: score })
    .eq('id', profileId);

  return score;
}

export async function getCompletenessBreakdown(profileId) {
  const criteria = await evaluateCriteria(profileId);
  const score = scoreFromCriteria(criteria);

  const items = Object.entries(WEIGHTS).map(([key, weight]) => ({
    key,
    weight,
    met: criteria[key],
    points: criteria[key] ? weight : 0,
  }));

  return { score, items };
}
