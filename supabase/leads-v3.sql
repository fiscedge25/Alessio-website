-- BuiltWithSabba leads v3: email log with delivery status (Resend webhook)
-- and intro-call scheduling. Run once in the Supabase SQL editor after
-- leads-v2.sql. RLS on with no policies: service-role only.

-- Every email the site sends to a lead, with its latest delivery status.
create table if not exists lead_emails (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  quote_id uuid references quotes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- confirmation | accept | call_invite | call_update | call_cancel | call_reminder | quote
  kind text not null,
  to_email text not null,
  subject text not null,
  resend_id text unique,
  -- sent → delivered → opened → clicked, or delayed / bounced / complained / failed
  status text not null default 'sent',
  detail text
);
create index if not exists lead_emails_lead_idx on lead_emails (lead_id, created_at desc);
alter table lead_emails enable row level security;

-- Intro call details (call_at already exists).
alter table leads add column if not exists call_minutes integer;
alter table leads add column if not exists call_link text;
alter table leads add column if not exists call_reminded_at timestamptz;

-- Small key/value settings edited from the dashboard (e.g. the default meeting link).
create table if not exists admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table admin_settings enable row level security;
