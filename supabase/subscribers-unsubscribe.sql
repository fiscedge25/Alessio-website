-- Adds unsubscribe support to the subscribers table.
-- Run this in the Supabase SQL editor after subscribers.sql.

alter table public.subscribers
    add column if not exists unsubscribed_at timestamptz;

-- Handy index for "active subscribers" queries.
create index if not exists subscribers_active_idx
    on public.subscribers (created_at)
    where unsubscribed_at is null;
