-- Records which lead magnet a subscriber came in through, e.g.
-- 'prompt:github-profile' for the Instagram "Github" keyword.
-- Run this in the Supabase SQL editor after subscribers.sql.
--
-- Safe to run before or after deploying: /api/subscribe retries without the
-- column if it does not exist yet, so nothing breaks in between.

alter table public.subscribers
    add column if not exists source text;

create index if not exists subscribers_source_idx
    on public.subscribers (source);
