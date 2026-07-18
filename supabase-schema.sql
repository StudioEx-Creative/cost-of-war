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

-- ═══════════════════════════════════════════════════════════════════
-- THE ROOM — letters, age bands, and the aggregate findings
-- Run this block on an existing project; it is additive and safe to
-- re-run. It stores what people write to their governments so the
-- mass-participation artwork has something real to be made of.
-- ═══════════════════════════════════════════════════════════════════

alter table public.submissions
  add column if not exists letter          text,
  add column if not exists letter_consent  boolean not null default false,
  -- MODERATION GATE. Nothing is publishable until a human approves it.
  -- People write abuse, slurs and other people's personal details; this
  -- column is the only thing standing between that and a public page.
  add column if not exists letter_approved boolean not null default false,
  add column if not exists age_band        text;

do $$ begin
  alter table public.submissions
    add constraint letter_len check (letter is null or char_length(letter) <= 4000);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.submissions
    add constraint age_band_valid check (
      age_band is null or age_band in
      ('under-18','18-24','25-34','35-49','50-64','65-plus')
    );
exception when duplicate_object then null; end $$;

-- Moderator queue: what is waiting on you. NOT granted to anon.
create or replace function public.pending_letters()
returns table (id bigint, letter text, country text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select id, letter, country, created_at
  from submissions
  where letter is not null and letter_consent and not letter_approved
  order by created_at;
$$;

-- ── the room's contents: APPROVED letters only, and never the email ──
create or replace function public.approved_letters(p_limit int default 500)
returns table (letter text, country text, age_band text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select letter, country, age_band, created_at
  from submissions
  where letter is not null
    and letter_consent          -- they opted in
    and letter_approved         -- and a human cleared it
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 500), 2000));
$$;

-- ── age spread of participants ──
create or replace function public.age_tally()
returns table (band text, people bigint)
language sql security definer set search_path = public as $$
  select age_band as band, count(*) as people
  from submissions where age_band is not null group by 1 order by 1;
$$;

-- ── the findings: everything interesting we can say without new data ──
create or replace function public.room_stats()
returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'people',           (select count(*) from submissions),
    'countries',        (select count(distinct country) from submissions where country is not null),
    'letters',          (select count(*) from submissions
                          where letter is not null and letter_consent and letter_approved),
    -- the single most common FIRST choice, which is the real headline
    'top_first_choice', (select ranking[1] from submissions
                          where array_length(ranking,1) >= 1
                          group by ranking[1] order by count(*) desc limit 1),
    'top_first_share',  (select round(100.0 * count(*) /
                            nullif((select count(*) from submissions
                                    where array_length(ranking,1) >= 1),0))
                          from submissions
                          where array_length(ranking,1) >= 1
                          group by ranking[1] order by count(*) desc limit 1),
    'tax_to_war_total', (select coalesce(sum(tax_to_war),0) from submissions),
    'tax_people',       (select count(*) from submissions where tax_to_war is not null),
    'first_at',         (select min(created_at) from submissions)
  );
$$;

grant execute on function public.approved_letters(int) to anon;
grant execute on function public.age_tally() to anon;
grant execute on function public.room_stats() to anon;
-- deliberately NOT granted to anon: pending_letters() is the moderator view.
