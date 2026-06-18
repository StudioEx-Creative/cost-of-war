# Backend setup (coalition counter + submissions)

The site works with no backend — counts then live only in each visitor's
own browser (demo mode). To make the coalition counter, the global/country
priority graphs, and submissions **shared and real across everyone**, connect
a free Supabase project. It's about 10 minutes, no server to run, and it
keeps working on GitHub Pages (everything is client-side).

## One-time setup

1. **Create a project** — go to [supabase.com](https://supabase.com), sign in,
   click **New project** (the free tier is plenty). Pick a name and a strong
   database password.

2. **Create the table + functions** — in the project, open **SQL Editor → New
   query**, paste the entire contents of [`supabase-schema.sql`](supabase-schema.sql),
   and click **Run**. This creates the `submissions` table, locks it down so the
   public key can only *add* a row (never read emails or raw responses), and
   creates the three aggregate functions the site reads.

3. **Get your keys** — go to **Project Settings → API**. Copy:
   - the **Project URL** (e.g. `https://abcdxyz.supabase.co`)
   - the **anon / public** key (a long string).

4. **Paste them in** — open [`js/config.js`](js/config.js) and fill in:
   ```js
   window.COW_CONFIG = {
     SUPABASE_URL: "https://abcdxyz.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi...your-anon-key...",
     SEED_COUNT: 2847,
   };
   ```

5. **Deploy** — commit and push. Within a minute the live site reads and writes
   real numbers. Done.

## Notes

- **The anon key is safe to publish.** Row-level security means it can only
  insert a submission; it cannot read emails or individual responses. Reads
  happen only through the aggregate functions (counts and tallies). Never put
  the `service_role` key in `config.js`.
- **`SEED_COUNT`** is a base number added to the real submission count, so the
  counter doesn't read "0" on day one. Set it to `0` if you'd rather show only
  real participants.
- **Emails** are stored in the `submissions.email` column for the waitlist, and
  (separately) still notified to greg@studioex.co via formsubmit.co. To read the
  waitlist, query the table from the Supabase dashboard (you, as project owner,
  can read it; the public key cannot).
- **Country / global priority graphs** call `priority_tally` and
  `priority_tally_by_country`. Until there's real data they show a seeded
  placeholder distribution; once submissions arrive, real numbers blend in.

## How the code is wired

- `js/config.js` — your keys (the only file you edit).
- `js/backend.js` — creates the Supabase client, hydrates live aggregates, and
  exposes `__cowSubmit` / `__cowLive` / `__cowCountryTally`. Dormant if unconfigured.
- `js/main.js` — `getTally()` reads live data when available, else localStorage;
  `submitCoalition()` writes through `__cowSubmit`.
