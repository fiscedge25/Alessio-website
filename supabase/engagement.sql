-- BuiltWithSabba engagement tables: idea votes + suggestions + project inquiries.
-- Run in Supabase SQL editor. Service-role key bypasses RLS; no public policies
-- are created on purpose — all writes go through the Next.js API routes.

create table if not exists idea_votes (
  id bigint generated always as identity primary key,
  idea_id text not null,
  voter text not null default 'anonymous',
  created_at timestamptz not null default now(),
  unique (idea_id, voter)
);

create table if not exists idea_suggestions (
  id bigint generated always as identity primary key,
  name text,
  email text,
  idea text not null,
  created_at timestamptz not null default now()
);

create table if not exists project_inquiries (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  company text,
  message text not null,
  project_type text,
  stage text,
  budget text,
  created_at timestamptz not null default now()
);

-- Lock the tables down, the same way subscribers.sql does: RLS on with no
-- policies means the anon/public key cannot read or write them at all, while
-- the service-role key used by the API routes bypasses RLS. Without this the
-- tables are readable by anyone holding the project's publishable key.
alter table idea_votes enable row level security;
alter table idea_suggestions enable row level security;
alter table project_inquiries enable row level security;
