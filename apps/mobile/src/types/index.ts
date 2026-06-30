export type MemberType = 'worker' | 'employer' | 'agency' | 'admin';
export type RoleType = 'caregiver' | 'cna' | 'lvn' | 'rn' | 'bsn' | 'med_tech' | 'other';
export type WorkSetting = 'hospital' | 'home_care' | 'snf' | 'clinic' | 'travel' | 'open';
export type ShiftPreference = 'days' | 'nights' | 'weekends' | 'flexible';
export type LicenseType = 'rn' | 'lvn' | 'cna' | 'np' | 'md' | 'prc' | 'compact';
export type LicenseStatus = 'pending' | 'verified' | 'expired' | 'inactive' | 'unavailable';
export type ConnectionStatus = 'pending' | 'connected' | 'declined' | 'blocked';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  headline: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location_city: string;
  location_state: string;
  role_type: RoleType;
  specialty: string | null;
  work_setting: WorkSetting | null;
  shift_preference: ShiftPreference | null;
  years_experience: number | null;
  npi_number: string | null;
  prc_license_number: string | null;
  open_to_work: boolean;
  is_id_verified: boolean;
  is_license_verified: boolean;
  completeness_score: number;
  created_at: string;
  updated_at: string;
}

export interface License {
  id: string;
  profile_id: string;
  license_type: LicenseType;
  license_number: string;
  state: string;
  status: LicenseStatus;
  expiry_date: string | null;
  has_discipline: boolean;
  verification_source: string;
  verified_at: string | null;
  created_at: string;
}

export interface FeedEvent {
  id: string;
  actor_id: string;
  event_type: string;
  target_id: string;
  target_type: string;
  metadata: Record<string, unknown>;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface JobPost {
  id: string;
  employer_id: string;
  role_type: RoleType;
  specialty: string | null;
  title: string;
  description: string;
  work_setting: WorkSetting;
  shift: ShiftPreference;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: 'hourly' | 'annual';
  location_city: string;
  requires_verified: boolean;
  status: 'open' | 'filled' | 'closed';
  application_count: number;
  created_at: string;
}
