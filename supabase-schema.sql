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
  income      bigint,                          -- optional; from the tax slider
  tax_to_war  bigint,                          -- optional; their tax toward military
  created_at  timestamptz not null default now(),
  -- integrity guards (belt-and-braces with the edge function's validation)
  constraint ranking_len   check (array_length(ranking, 1) between 1 and 5),
  constraint ranking_range check (ranking <@ '{0,1,2,3,4,5,6,7,8,9,10,11,12,13}'::int[]),
  constraint country_len   check (country is null or char_length(country) <= 60),
  constraint email_len     check (email is null or char_length(email) <= 200),
  constraint income_sane   check (income is null or (income >= 0 and income <= 100000000)),
  constraint tax_sane       check (tax_to_war is null or (tax_to_war >= 0 and tax_to_war <= 100000000))
);

alter table public.submissions enable row level security;

-- Anonymous visitors may add their own submission, nothing else.
-- PHASE 0 (no edge function yet): allow direct anon insert so the site works.
drop policy if exists "anon can insert" on public.submissions;
create policy "anon can insert"
  on public.submissions for insert
  to anon
  with check (true);

-- PHASE 1 (after deploying the `submit` edge function + Turnstile):
-- run the line below to REVOKE direct anon insert, so all writes must go
-- through the validated, captcha-gated function (the function uses the
-- service role and bypasses RLS). This is what stops bot spam.
--
--   drop policy if exists "anon can insert" on public.submissions;
--
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

-- ── sign-ups per country (drives the 3D globe bars) ──
create or replace function public.signups_by_country()
returns table (country text, signups bigint)
language sql security definer set search_path = public as $$
  select country, count(*) as signups
  from submissions where country is not null group by 1;
$$;

grant execute on function public.coalition_count() to anon;
grant execute on function public.priority_tally() to anon;
grant execute on function public.priority_tally_by_country(text) to anon;
grant execute on function public.signups_by_country() to anon;
