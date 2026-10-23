-- BuiltWithSabba leads v2: login sessions + brute-force lockout, the 48h
-- reminder flag and quotes with a Stripe deposit. Run once in the Supabase
-- SQL editor after leads.sql. RLS on with no policies: only the service-role
-- key used by the server can touch these tables.

-- ─── Dashboard login ────────────────────────────────────────────────────────
-- One row per logged-in device. The cookie holds a random token; only its
-- sha256 lives here. pw_fp ties the session to the current ADMIN_PASSWORD, so
-- changing the password on Vercel still logs every device out.
create table if not exists admin_sessions (
  id text primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent text,
  ip text,
  pw_fp text not null
);
alter table admin_sessions enable row level security;

-- Failed password attempts, for the lockout (5 per IP / 15 min).
create table if not exists admin_login_attempts (
  id bigserial primary key,
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_login_attempts_ip_idx on admin_login_attempts (ip, created_at desc);
alter table admin_login_attempts enable row level security;

-- ─── Leads ──────────────────────────────────────────────────────────────────
-- Set when the daily cron has nudged Alessio about a lead left "new" for 48h+.
alter table leads add column if not exists reminded_at timestamptz;

-- ─── Quotes ─────────────────────────────────────────────────────────────────
-- Built from the dashboard, read by the client at /<locale>/quote/<token>.
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  -- Unguessable public id used in the client's link
  token text not null unique,
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  title text not null,
  -- [{ "label": "...", "detail": "...", "amount_cents": 120000 }]
  items jsonb not null default '[]'::jsonb,
  total_cents integer not null check (total_cents >= 0),
  deposit_pct integer not null default 30 check (deposit_pct between 0 and 100),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  delivery text,
  notes text,
  valid_until date,
  locale text,

  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'paid', 'void')),
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  paid_at timestamptz,
  stripe_session_id text,
  amount_paid integer
);
create index if not exists quotes_lead_idx on quotes (lead_id, created_at desc);
alter table quotes enable row level security;
