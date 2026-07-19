-- FilLinked v2 — Notifications + Feed Comments
-- ============================================================

create type notification_type as enum (
  'connection_request', 'connection_accepted', 'endorsement', 'recommendation',
  'license_expiring', 'message', 'job_application', 'application_status',
  'feed_like', 'feed_comment', 'billing'
);

create table notifications (
  id         uuid primary key default extensions.uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  type       notification_type not null,
  title      varchar(200) not null,
  body       text,
  deep_link  text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_created on notifications(user_id, created_at desc);
create index idx_notifications_user_unread  on notifications(user_id) where is_read = false;

alter table notifications enable row level security;

create policy "notifications: read own"   on notifications for select using (user_id = auth.uid());
create policy "notifications: update own" on notifications for update using (user_id = auth.uid());
create policy "notifications: insert own" on notifications for insert with check (user_id = auth.uid());

-- ============================================================
-- FEED COMMENTS
-- ============================================================

create table feed_comments (
  id            uuid primary key default extensions.uuid_generate_v4(),
  feed_event_id uuid not null references feed_events(id) on delete cascade,
  author_id     uuid not null references users(id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now()
);

create index idx_feed_comments_event_created on feed_comments(feed_event_id, created_at);

alter table feed_comments enable row level security;

create policy "feed_comments: read any"   on feed_comments for select using (auth.role() = 'authenticated');
create policy "feed_comments: insert own" on feed_comments for insert with check (author_id = auth.uid());
create policy "feed_comments: delete own" on feed_comments for delete using (author_id = auth.uid());

-- ============================================================
-- VERIFICATIONS STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public)
values ('verifications', 'verifications', false)
on conflict (id) do nothing;

create policy "verifications bucket: owner read"
  on storage.objects for select
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "verifications bucket: owner upload"
  on storage.objects for insert
  with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
