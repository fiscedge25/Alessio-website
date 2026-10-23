-- BuiltWithSabba client leads: the guided "Start a project" flow on /start
-- writes here, the private dashboard at /en/admin reads and updates it.
-- Run in the Supabase SQL editor. RLS on with no policies: only the
-- service-role key used by the API routes and the dashboard can touch it.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- The guided answers (keys, labels live in messages/*.json → hub.start)
  need text not null,
  who text,
  stage text,
  timeline text,
  budget text,
  description text not null,

  -- Contact
  name text not null,
  email text not null,
  phone text,
  company text,
  contact_pref text,
  locale text,
  -- Where they came from: ?ref= on the link (e.g. reel-03, ig-bio) or the referrer
  source text,
  consent_at timestamptz not null,

  -- Pipeline, managed from the dashboard
  status text not null default 'new'
    check (status in ('new', 'accepted', 'call', 'proposal', 'won', 'lost', 'declined')),
  call_at timestamptz,
  notes text
);

create index if not exists leads_status_created_idx on leads (status, created_at desc);

alter table leads enable row level security;
