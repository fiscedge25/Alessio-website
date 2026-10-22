-- BuiltWithSabba paid gift animations: one row per dedication.
-- Run once in the Supabase SQL editor. A row is created as 'pending' when the
-- buyer submits the form, and flipped to 'paid' by the Stripe success page or
-- webhook (whichever arrives first). Only paid rows are served at /g/<id>.
--
-- `fields` holds what the buyer typed, keyed by the animation's own query
-- params — e.g. {"to":"Emma","msg":"…","style":"paper"} or {"her":"…","me":"…"}.

create table if not exists gifts (
  id text primary key,
  animation text not null,
  fields jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  stripe_session_id text unique,
  email text,
  amount_total integer,
  currency text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists gifts_status_created_idx on gifts (status, created_at desc);

-- Same lockdown as the other tables: RLS on, no policies. Only the
-- service-role key used by the API routes can read or write.
alter table gifts enable row level security;
