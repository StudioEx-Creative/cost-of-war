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

## Phase 1 — hardening (recommended before public promotion)

The code for this is already written and dormant. It activates only when you
fill in the extra keys in `js/config.js` and deploy the function.

**What it adds:** all submissions go through a validated, captcha-gated
Supabase **Edge Function** (`supabase/functions/submit/`), and a Cloudflare
**Turnstile** widget appears on the form. You then revoke direct anon insert so
bots can't write junk with the public key.

Steps:

1. **Turnstile** — at [Cloudflare → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile),
   create a widget for your domain. Copy the **site key** (public) and the
   **secret key**.
2. **Deploy the function** (needs the [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase secrets set TURNSTILE_SECRET=<your-turnstile-secret>
   supabase functions deploy submit --no-verify-jwt
   ```
   (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)
3. **Point the site at it** — in `js/config.js` set:
   ```js
   SUBMIT_URL: "https://<project-ref>.supabase.co/functions/v1/submit",
   TURNSTILE_SITE_KEY: "0x4AAAA...your-site-key",
   ```
4. **Lock the table** — in the SQL editor, run the revoke line noted in
   `supabase-schema.sql` (drops the "anon can insert" policy) so all writes
   must go through the function.
5. **Privacy** — fill in the placeholders in `privacy.html` (legal entity,
   contact, storage region, retention) and have it reviewed.

Until these keys are set, the site stays on the Phase 0 path (direct insert,
no captcha). Leaving `SUBMIT_URL`/`TURNSTILE_SITE_KEY` blank is safe.

## How the code is wired

- `js/config.js` — your keys (the only file you edit).
- `js/backend.js` — creates the Supabase client, hydrates live aggregates, and
  exposes `__cowSubmit` / `__cowLive` / `__cowCountryTally`. Dormant if unconfigured.
- `js/main.js` — `getTally()` reads live data when available, else localStorage;
  `submitCoalition()` writes through `__cowSubmit`.
