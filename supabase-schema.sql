-- ═══════════════════════════════════════════════════════════════════
-- THE COST OF WAR — Supabase schema
-- Run this once in your Supabase project's SQL editor.
-- It creates the submissions table, locks it down with row-level
-- security (anonymous visitors may INSERT but never read raw rows),
-- and exposes three safe aggregate functions the site calls.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.submissions (
  id          bigint generated always as identity primary key,
  ranking     int[]       not null,            -- issueData indexes, in priority order
  country     text,
  email       text,                            -- optional; collected for the waitlist
  created_at  timestamptz not null default now()
);

alter table public.submissions enable row level security;

-- Anonymous visitors may add their own submission, nothing else.
drop policy if exists "anon can insert" on public.submissions;
create policy "anon can insert"
  on public.submissions for insert
  to anon
  with check (true);

-- (No SELECT policy → the anon key can never read raw rows, so emails
--  and individual responses stay private. Reads happen only through the
--  aggregate functions below, which run with definer rights.)

-- ── total people who have taken part ──
create or replace function public.coalition_count()
returns bigint
language sql security definer set search_path = public as $$
  select count(*) from submissions;
$$;

-- ── global priority tally: how many times each issue was ranked ──
create or replace function public.priority_tally()
returns table (issue int, votes bigint)
language sql security definer set search_path = public as $$
  select unnest(ranking) as issue, count(*) as votes
  from submissions group by 1 order by 2 desc;
$$;

-- ── per-country priority tally ──
create or replace function public.priority_tally_by_country(p_country text)
returns table (issue int, votes bigint)
language sql security definer set search_path = public as $$
  select unnest(ranking) as issue, count(*) as votes
  from submissions where country = p_country group by 1 order by 2 desc;
$$;

grant execute on function public.coalition_count() to anon;
grant execute on function public.priority_tally() to anon;
grant execute on function public.priority_tally_by_country(text) to anon;
