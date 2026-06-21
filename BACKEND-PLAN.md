# The Cost of War — Backend Build Plan

A phased plan to take the coalition/data backend from the current scaffolding
to a production-ready, abuse-resistant, privacy-compliant system.

**Current state:** the site is a static page on GitHub Pages. The Supabase
integration is fully *coded* (`js/backend.js`, `supabase-schema.sql`,
`js/config.js`) but dormant — with no keys set it runs in localStorage "demo"
mode. Data the front end already captures per submission: ranked priorities,
country, optional email, optional income + tax-to-war figure.

**Two roles in this plan:**
- **Daniel** = anything needing an account, a secret/key, a deploy via CLI, a
  spending/tool decision, or legal/privacy content.
- **Claude Code** = all the code (functions, SQL, UI wiring, scripts, tests).
  Can be done in normal editing sessions; most is ready to write on request.

---

## Phase 0 — Go live (minimum viable backend) · ~30 min

Goal: real, shared coalition counter + stored submissions.

| # | Task | Owner |
|---|------|-------|
| 0.1 | Create a free Supabase project | **Daniel** |
| 0.2 | Run `supabase-schema.sql` in the SQL editor | **Daniel** |
| 0.3 | Copy Project URL + anon key | **Daniel** |
| 0.4 | Paste keys into `js/config.js`, set `SEED_COUNT`, deploy | Claude Code or Daniel |
| 0.5 | Verify: submit from two devices, counter increments globally; rows land in the `submissions` table | Claude Code |

Full step-by-step is already in **[BACKEND.md](BACKEND.md)**.

> ⚠️ At this phase the public anon key can insert rows directly. Fine for a
> **soft launch** to a trusted audience, but add Phase 1 before any wide / public
> promotion, or bots can script junk submissions.

---

## Phase 1 — Harden: anti-abuse, validation, privacy · before promoting

> **Status: the code is written and dormant** (edge function, DB constraints,
> Turnstile wiring, consent UI, privacy page). It activates when Daniel adds
> the Turnstile keys + `SUBMIT_URL` and deploys the function — see
> [BACKEND.md](BACKEND.md) "Phase 1". The remaining tasks below are Daniel's
> provisioning steps + the privacy-policy wording.

### 1a. Stop bot/spam writes
Move inserts behind a **Supabase Edge Function** + a **Cloudflare Turnstile**
check (free, privacy-friendly captcha), then revoke direct anon insert.

| Task | Owner |
|------|-------|
| Write Edge Function `submit` (validates payload, verifies Turnstile, inserts with service role) | Claude Code |
| Add the Turnstile widget to the submit step in `main.js` + send token | Claude Code |
| Tighten `supabase-schema.sql`: revoke anon `insert`, keep aggregate RPCs | Claude Code |
| Create a Cloudflare Turnstile site (get site key + secret key) | **Daniel** |
| Set function secrets (`SERVICE_ROLE_KEY`, `TURNSTILE_SECRET`) and deploy via Supabase CLI | **Daniel** |

### 1b. Data integrity
| Task | Owner |
|------|-------|
| DB constraints: ranking length 1–5, indexes within 0–13, sane income range | Claude Code |
| Optional: 1 submission per browser/day (soft dedupe) | Claude Code |

### 1c. Privacy / GDPR (email is personal data)
| Task | Owner |
|------|-------|
| Privacy policy text: what's collected (priorities, country, optional email + income *band*), where stored, retention, deletion contact | **Daniel / Greg** |
| Add a consent checkbox + privacy-policy link beside the email field | Claude Code |
| Add a privacy link in the footer; simple `/privacy` page | Claude Code |
| Decide email retention + deletion process | **Daniel** |

---

## Phase 2 — Email & growth

| Task | Owner |
|------|-------|
| Choose a mailing tool (Mailchimp / Buttondown / Brevo) for the Six Degrees + Blueprint waitlist | **Daniel** |
| Provide its API key as a function secret | **Daniel** |
| In the `submit` function, push consented emails to the list (tagged source) | Claude Code |
| (Interim) Manual CSV export of emails from Supabase until volume grows | Daniel |
| Live-updating counter via Supabase Realtime (optional polish) | Claude Code |

> Currently emails also notify greg@studioex.co via formsubmit.co. Decide whether
> to keep that as a fallback or rely solely on Supabase + the mailing tool.

---

## Phase 3 — Analytics & ops (optional)

| Task | Owner |
|------|-------|
| Privacy-friendly analytics (Plausible / Umami / Cloudflare Web Analytics) account | **Daniel** |
| Add the analytics snippet + a few funnel events (selected, ranked, submitted) | Claude Code |
| Confirm Supabase backups; optional scheduled CSV export of submissions | Daniel / Claude Code |

---

## Phase 4 — Custom domain (related, independent of the above)

| Task | Owner |
|------|-------|
| Decide domain (e.g. `costofwar.studioex.co`) | **Daniel / Greg** |
| Add DNS CNAME → `studioex-creative.github.io` | **Daniel** |
| Add `CNAME` file to repo, enable in Pages settings, confirm HTTPS | Claude Code |
| Update canonical/OG URLs | Claude Code |

---

## Suggested order

1. **Phase 0** now → counter is real for a soft launch.
2. **Phase 1** before any public push (this is the important one — abuse + privacy).
3. **Phase 4** whenever the domain is decided (quick, independent).
4. **Phase 2 / 3** as the project grows.

## What Daniel needs to bring to a working session
- A Supabase account (+ project created, or we create it together).
- A Cloudflare account (for Turnstile) when doing Phase 1.
- A decision on the mailing tool for Phase 2.
- Privacy-policy wording (or approval of a draft Claude Code prepares).

Everything else — functions, SQL, UI, tests — Claude Code can implement on
request. Most of Phase 1's code can be written in advance and left dormant
until Daniel provisions the accounts, exactly as the current Supabase client
already is.
