-- Newsletter subscribers table for alessiosabatino.it
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

create table if not exists public.subscribers (
    id          uuid primary key default gen_random_uuid(),
    email       text not null unique,
    lang        text not null default 'en',
    created_at  timestamptz not null default now()
);

-- Lock the table down: only the service-role key (used server-side in the
-- /api/subscribe route) can read/write. RLS with no public policies means
-- the anon/public keys cannot touch this table.
alter table public.subscribers enable row level security;

-- (No policies are created on purpose — the service role bypasses RLS.)
