-- FilLinked v2 — Initial Schema
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

create type member_type       as enum ('worker', 'employer', 'agency', 'admin');
create type license_type      as enum ('rn', 'lvn', 'cna', 'np', 'md', 'prc', 'compact');
create type license_status    as enum ('pending', 'verified', 'expired', 'inactive', 'unavailable');
create type verification_source as enum ('CA_BRN', 'CA_DHCS', 'CMS_NPI', 'manual', 'self_reported');
create type connection_status as enum ('pending', 'connected', 'declined', 'blocked');
create type reminder_type     as enum ('90_day', '30_day', '7_day', '60_day');
create type source_type       as enum ('license', 'certification');
create type plan_type         as enum ('agency_basic', 'agency_pro', 'hospital', 'premium_family');
create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');
create type id_doc_type       as enum ('drivers_license', 'passport', 'state_id', 'green_card');
create type id_verify_status  as enum ('pending', 'verified', 'rejected');
create type salary_period     as enum ('hourly', 'annual');
create type job_status        as enum ('open', 'filled', 'closed');
create type application_status as enum ('pending', 'viewed', 'shortlisted', 'rejected', 'hired');
create type feed_event_type   as enum (
  'license_verified', 'endorsement', 'recommendation', 'milestone',
  'certification', 'open_to_work', 'connection', 'job_post', 'referral'
);

-- ============================================================
-- USERS
-- ============================================================

create table users (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              varchar(255) not null unique,
  phone              varchar(20),
  member_type        member_type not null default 'worker',
  stripe_customer_id varchar(100),
  is_active          boolean not null default true,
  fcm_token          text,
  last_seen_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references users(id) on delete cascade,
  full_name           varchar(100),
  headline            varchar(220),
  bio                 text,
  avatar_url          text,
  cover_url           text,
  location_city       varchar(100),
  location_state      varchar(50) default 'CA',
  role_type           varchar(50),
  specialty           varchar(100),
  work_setting        varchar(50),
  shift_preference    varchar(50),
  years_experience    integer,
  npi_number          varchar(20),
  prc_license_number  varchar(50),
  open_to_work        boolean not null default false,
  is_id_verified      boolean not null default false,
  is_license_verified boolean not null default false,
  completeness_score  integer not null default 0,
  search_vector       tsvector generated always as (
    to_tsvector('english',
      coalesce(full_name, '') || ' ' ||
      coalesce(headline, '') || ' ' ||
      coalesce(specialty, '') || ' ' ||
      coalesce(bio, '')
    )
  ) stored,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- LICENSES
-- ============================================================

create table licenses (
  id                  uuid primary key default uuid_generate_v4(),
  profile_id          uuid not null references profiles(id) on delete cascade,
  license_type        license_type not null,
  license_number      varchar(50) not null,
  last_name           varchar(100) not null,
  state               varchar(10) not null default 'CA',
  status              license_status not null default 'pending',
  expiry_date         date,
  has_discipline      boolean not null default false,
  verification_source verification_source,
  verified_at         timestamptz,
  last_synced_at      timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- CERTIFICATIONS
-- ============================================================

create table certifications (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  cert_name    varchar(150) not null,
  issuer       varchar(150),
  issued_date  date,
  expiry_date  date,
  file_url     text,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- LICENSE REMINDERS
-- ============================================================

create table license_reminders (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references users(id) on delete cascade,
  license_id    uuid not null,
  source_type   source_type not null,
  reminder_type reminder_type not null,
  scheduled_at  timestamptz not null,
  sent_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

create table subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references users(id) on delete cascade,
  plan_type              plan_type not null,
  stripe_subscription_id varchar(100) not null,
  stripe_customer_id     varchar(100) not null,
  status                 subscription_status not null default 'trialing',
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ============================================================
-- WORK EXPERIENCES
-- ============================================================

create table work_experiences (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null references profiles(id) on delete cascade,
  employer_name varchar(150),
  is_anonymous  boolean not null default false,
  role          varchar(100),
  department    varchar(100),
  start_date    date,
  end_date      date,
  is_current    boolean not null default false,
  description   text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- SKILLS + SKILL ENDORSEMENTS
-- ============================================================

create table skills (
  id                uuid primary key default uuid_generate_v4(),
  profile_id        uuid not null references profiles(id) on delete cascade,
  skill_name        varchar(80) not null,
  endorsement_count integer not null default 0,
  display_order     integer not null default 0,
  created_at        timestamptz not null default now()
);

create table skill_endorsements (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references users(id) on delete cascade,
  to_user_id   uuid not null references users(id) on delete cascade,
  skill_id     uuid not null references skills(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (from_user_id, skill_id)
);

-- ============================================================
-- CONNECTIONS
-- ============================================================

create table connections (
  id           uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references users(id) on delete cascade,
  recipient_id uuid not null references users(id) on delete cascade,
  status       connection_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (requester_id, recipient_id)
);

-- ============================================================
-- FEED EVENTS + FEED ITEMS
-- ============================================================

create table feed_events (
  id            uuid primary key default uuid_generate_v4(),
  actor_id      uuid not null references users(id) on delete cascade,
  event_type    feed_event_type not null,
  target_id     uuid,
  target_type   varchar(50),
  metadata      jsonb not null default '{}',
  like_count    integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now()
);

create table feed_items (
  id                uuid primary key default uuid_generate_v4(),
  recipient_user_id uuid not null references users(id) on delete cascade,
  feed_event_id     uuid not null references feed_events(id) on delete cascade,
  seen              boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================

create table recommendations (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references users(id) on delete cascade,
  to_user_id   uuid not null references users(id) on delete cascade,
  body         text not null,
  relationship varchar(150),
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- JOB POSTS + APPLICATIONS
-- ============================================================

create table job_posts (
  id                uuid primary key default uuid_generate_v4(),
  employer_id       uuid not null references users(id) on delete cascade,
  role_type         varchar(50) not null,
  specialty         varchar(100),
  title             varchar(200) not null,
  description       text,
  work_setting      varchar(50),
  shift             varchar(50),
  salary_min        integer,
  salary_max        integer,
  salary_period     salary_period,
  location_city     varchar(100),
  requires_verified boolean not null default false,
  status            job_status not null default 'open',
  application_count integer not null default 0,
  created_at        timestamptz not null default now()
);

create table applications (
  id                  uuid primary key default uuid_generate_v4(),
  worker_id           uuid not null references users(id) on delete cascade,
  job_post_id         uuid not null references job_posts(id) on delete cascade,
  referred_by_user_id uuid references users(id) on delete set null,
  cover_note          text,
  status              application_status not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (worker_id, job_post_id)
);

-- ============================================================
-- MESSAGES + MESSAGE THREADS
-- ============================================================

create table message_threads (
  id              uuid primary key default uuid_generate_v4(),
  participant_a   uuid not null references users(id) on delete cascade,
  participant_b   uuid not null references users(id) on delete cascade,
  is_request      boolean not null default true,
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

create table messages (
  id         uuid primary key default uuid_generate_v4(),
  thread_id  uuid not null references message_threads(id) on delete cascade,
  sender_id  uuid not null references users(id) on delete cascade,
  body       text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- VERIFICATIONS (ID uploads)
-- ============================================================

create table verifications (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  id_type          id_doc_type not null,
  front_url        text not null,
  selfie_url       text,
  status           id_verify_status not null default 'pending',
  rejection_reason text,
  reviewed_by      uuid references users(id) on delete set null,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_profiles_user_id            on profiles(user_id);
create index idx_profiles_role_type          on profiles(role_type);
create index idx_profiles_specialty          on profiles(specialty);
create index idx_profiles_location_city      on profiles(location_city);
create index idx_profiles_open_to_work       on profiles(open_to_work);
create index idx_profiles_license_verified   on profiles(is_license_verified);
create index idx_profiles_search_vector      on profiles using gin(search_vector);

create index idx_licenses_profile_id         on licenses(profile_id);
create index idx_licenses_status             on licenses(status);
create index idx_licenses_expiry_date        on licenses(expiry_date);
create index idx_licenses_last_synced        on licenses(last_synced_at);

create index idx_connections_recipient_status on connections(recipient_id, status);
create index idx_connections_requester_id     on connections(requester_id);

create index idx_feed_items_recipient_created on feed_items(recipient_user_id, created_at desc);

create index idx_endorsements_to_skill        on skill_endorsements(to_user_id, skill_id);

create index idx_jobs_employer_status         on job_posts(employer_id, status);
create index idx_jobs_role_specialty          on job_posts(role_type, specialty);
create index idx_jobs_location                on job_posts(location_city);
create index idx_jobs_requires_verified       on job_posts(requires_verified);

create index idx_reminders_scheduled_unsent
  on license_reminders(scheduled_at) where sent_at is null;

create index idx_messages_thread_created      on messages(thread_id, created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at           before update on users           for each row execute function set_updated_at();
create trigger trg_profiles_updated_at        before update on profiles        for each row execute function set_updated_at();
create trigger trg_licenses_updated_at        before update on licenses        for each row execute function set_updated_at();
create trigger trg_connections_updated_at     before update on connections     for each row execute function set_updated_at();
create trigger trg_subscriptions_updated_at   before update on subscriptions   for each row execute function set_updated_at();
create trigger trg_recommendations_updated_at before update on recommendations for each row execute function set_updated_at();
create trigger trg_applications_updated_at    before update on applications    for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table users              enable row level security;
alter table profiles           enable row level security;
alter table licenses           enable row level security;
alter table certifications     enable row level security;
alter table license_reminders  enable row level security;
alter table subscriptions      enable row level security;
alter table work_experiences   enable row level security;
alter table skills             enable row level security;
alter table skill_endorsements enable row level security;
alter table connections        enable row level security;
alter table feed_events        enable row level security;
alter table feed_items         enable row level security;
alter table recommendations    enable row level security;
alter table job_posts          enable row level security;
alter table applications       enable row level security;
alter table message_threads    enable row level security;
alter table messages           enable row level security;
alter table verifications      enable row level security;

-- users
create policy "users: read own"   on users for select using (auth.uid() = id);
create policy "users: update own" on users for update using (auth.uid() = id);

-- profiles
create policy "profiles: read any"    on profiles for select  using (auth.role() = 'authenticated');
create policy "profiles: insert own"  on profiles for insert  with check (user_id = auth.uid());
create policy "profiles: update own"  on profiles for update  using (user_id = auth.uid());
create policy "profiles: delete own"  on profiles for delete  using (user_id = auth.uid());

-- licenses
create policy "licenses: read any"    on licenses for select  using (auth.role() = 'authenticated');
create policy "licenses: insert own"  on licenses for insert  with check (
  profile_id in (select id from profiles where user_id = auth.uid())
);
create policy "licenses: update own"  on licenses for update  using (
  profile_id in (select id from profiles where user_id = auth.uid())
);
create policy "licenses: delete own"  on licenses for delete  using (
  profile_id in (select id from profiles where user_id = auth.uid())
);

-- certifications
create policy "certs: read any"   on certifications for select  using (auth.role() = 'authenticated');
create policy "certs: insert own" on certifications for insert  with check (
  profile_id in (select id from profiles where user_id = auth.uid())
);
create policy "certs: update own" on certifications for update  using (
  profile_id in (select id from profiles where user_id = auth.uid())
);
create policy "certs: delete own" on certifications for delete  using (
  profile_id in (select id from profiles where user_id = auth.uid())
);

-- verifications
create policy "verifications: read own"   on verifications for select using (user_id = auth.uid());
create policy "verifications: insert own" on verifications for insert with check (user_id = auth.uid());

-- connections
create policy "connections: read participants"  on connections for select using (auth.uid() = requester_id or auth.uid() = recipient_id);
create policy "connections: insert as requester" on connections for insert with check (requester_id = auth.uid());
create policy "connections: update as recipient" on connections for update using (recipient_id = auth.uid());

-- feed_items (users cannot read each other's feeds)
create policy "feed_items: read own" on feed_items for select using (recipient_user_id = auth.uid());

-- feed_events
create policy "feed_events: read any" on feed_events for select using (auth.role() = 'authenticated');

-- message threads + messages
create policy "threads: read participants"  on message_threads for select using (participant_a = auth.uid() or participant_b = auth.uid());
create policy "messages: read participants" on messages for select using (
  thread_id in (select id from message_threads where participant_a = auth.uid() or participant_b = auth.uid())
);
create policy "messages: insert participants" on messages for insert with check (
  sender_id = auth.uid() and
  thread_id in (select id from message_threads where participant_a = auth.uid() or participant_b = auth.uid())
);

-- subscriptions
create policy "subscriptions: read own"   on subscriptions for select using (user_id = auth.uid());
create policy "subscriptions: update own" on subscriptions for update using (user_id = auth.uid());

-- license_reminders
create policy "reminders: read own"   on license_reminders for select using (user_id = auth.uid());
create policy "reminders: insert own" on license_reminders for insert with check (user_id = auth.uid());

-- recommendations
create policy "recs: read visible"  on recommendations for select using (auth.role() = 'authenticated' and is_visible = true);
create policy "recs: insert own"    on recommendations for insert with check (from_user_id = auth.uid());
create policy "recs: update own"    on recommendations for update using (from_user_id = auth.uid());

-- job_posts
create policy "jobs: read any"    on job_posts for select using (auth.role() = 'authenticated');
create policy "jobs: insert own"  on job_posts for insert with check (employer_id = auth.uid());
create policy "jobs: update own"  on job_posts for update using (employer_id = auth.uid());

-- applications
create policy "apps: read own"    on applications for select using (
  worker_id = auth.uid() or
  job_post_id in (select id from job_posts where employer_id = auth.uid())
);
create policy "apps: insert worker" on applications for insert with check (worker_id = auth.uid());
create policy "apps: update employer" on applications for update using (
  job_post_id in (select id from job_posts where employer_id = auth.uid())
);

-- work_experiences, skills, skill_endorsements
create policy "exp: read any"     on work_experiences for select using (auth.role() = 'authenticated');
create policy "exp: insert own"   on work_experiences for insert with check (
  profile_id in (select id from profiles where user_id = auth.uid())
);
create policy "exp: update own"   on work_experiences for update using (
  profile_id in (select id from profiles where user_id = auth.uid())
);
create policy "exp: delete own"   on work_experiences for delete using (
  profile_id in (select id from profiles where user_id = auth.uid())
);

create policy "skills: read any"  on skills for select using (auth.role() = 'authenticated');
create policy "skills: insert own" on skills for insert with check (
  profile_id in (select id from profiles where user_id = auth.uid())
);
create policy "skills: update own" on skills for update using (
  profile_id in (select id from profiles where user_id = auth.uid())
);

create policy "endorsements: read any"    on skill_endorsements for select using (auth.role() = 'authenticated');
create policy "endorsements: insert own"  on skill_endorsements for insert with check (from_user_id = auth.uid());
create policy "endorsements: delete own"  on skill_endorsements for delete using (from_user_id = auth.uid());
