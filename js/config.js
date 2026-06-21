/* ═══════════════════════════════════════════════════════════════════
   THE COST OF WAR — RUNTIME CONFIG
   ───────────────────────────────────────────────────────────────────
   To make the coalition counter, submissions and priority graphs LIVE
   (shared across all visitors), create a free Supabase project and paste
   its URL + anon (public) key below. Until then the site runs in local
   demo mode (counts live only in the visitor's own browser).

   Steps — see BACKEND.md for the full walkthrough:
     1. supabase.com → New project (free tier).
     2. SQL editor → paste & run supabase-schema.sql.
     3. Project Settings → API → copy the Project URL and the anon key.
     4. Paste them below and deploy.

   The anon key is SAFE to publish (it only allows the locked-down inserts
   and aggregate reads defined by the row-level-security policies in the
   schema). Never paste the service_role key here.
   ═══════════════════════════════════════════════════════════════════ */
window.COW_CONFIG = {
  SUPABASE_URL: "", // e.g. "https://abcdxyz.supabase.co"
  SUPABASE_ANON_KEY: "", // the public anon key
  SEED_COUNT: 2847, // base number shown before/under real submissions

  // ── Phase 1 (optional, recommended before public promotion) ──
  // When both are set, submissions go through the validated, captcha-gated
  // `submit` edge function instead of inserting directly, and a Cloudflare
  // Turnstile widget appears on the form. Leave blank to skip (Phase 0).
  SUBMIT_URL: "", // e.g. "https://abcdxyz.supabase.co/functions/v1/submit"
  TURNSTILE_SITE_KEY: "", // Cloudflare Turnstile site key (public)
};
