/* ═══════════════════════════════════════════════════════════════════
   THE COST OF WAR — BACKEND CLIENT (Supabase)
   ───────────────────────────────────────────────────────────────────
   Thin layer over Supabase for the coalition counter, submissions and
   priority tallies. If no credentials are configured (js/config.js), the
   whole thing stays dormant and main.js falls back to localStorage, so
   the site works either way.

   Exposes, when configured:
     window.__cowConfigured  – true
     window.__cowLive        – { ready, count, tally:{issueIndex:votes} }
     window.__cowSubmit(d)   – async insert one submission
     window.__cowCountryTally(country) – async {issueIndex:votes}
     window.onCowHydrated    – set by main.js; called after first load
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  const cfg = window.COW_CONFIG || {};
  const live = { ready: false, count: 0, tally: {} };
  window.__cowLive = live;

  const ready =
    cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase;
  window.__cowConfigured = !!ready;
  if (!ready) return; // demo mode — main.js uses localStorage

  const sb = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY,
  );
  window.__cowClient = sb;

  async function hydrate() {
    try {
      const [{ data: count }, { data: tally }, { data: byCountry }] =
        await Promise.all([
          sb.rpc("coalition_count"),
          sb.rpc("priority_tally"),
          sb.rpc("signups_by_country"),
        ]);
      live.count = count ?? 0;
      live.tally = {};
      (tally || []).forEach((r) => {
        live.tally[r.issue] = r.votes;
      });
      // per-country counts drive the 3D globe (getCountrySignups reads this)
      window.__cowCountrySignups = {};
      (byCountry || []).forEach((r) => {
        window.__cowCountrySignups[r.country] = r.signups;
      });
      live.ready = true;
      if (typeof window.onCowHydrated === "function") window.onCowHydrated();
    } catch (e) {
      console.warn("[cow] coalition hydrate failed:", e.message);
    }
  }

  // expose so the form can show a Turnstile widget when required
  window.__cowTurnstileKey = cfg.TURNSTILE_SITE_KEY || "";

  window.__cowSubmit = async function (d, turnstileToken) {
    try {
      if (cfg.SUBMIT_URL) {
        // Phase 1: validated + captcha-gated edge function
        const res = await fetch(cfg.SUBMIT_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            apikey: cfg.SUPABASE_ANON_KEY,
            Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            ranking: d.ranking,
            country: d.country,
            email: d.email || null,
            income: d.income ?? null,
            tax_to_war: d.tax_to_war ?? null,
            age_band: d.age_band ?? null,
            letter: d.letter ?? null,
            letter_consent: !!d.letter_consent,
            turnstileToken: turnstileToken || null,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          console.warn("[cow] submit rejected:", j.error || res.status);
          return false;
        }
      } else {
        // Phase 0: direct insert with the anon key
        await sb.from("submissions").insert({
          ranking: d.ranking,
          country: d.country,
          email: d.email || null,
          income: d.income ?? null,
          tax_to_war: d.tax_to_war ?? null,
          age_band: d.age_band ?? null,
          letter: d.letter ?? null,
          letter_consent: !!d.letter_consent,
          // letter_approved intentionally omitted — it defaults to false and
          // only a moderator may set it. Nothing self-publishes.
        });
      }
      live.count += 1;
      (d.ranking || []).forEach((i) => {
        live.tally[i] = (live.tally[i] || 0) + 1;
      });
      return true;
    } catch (e) {
      console.warn("[cow] submit failed:", e.message);
      return false;
    }
  };

  // ── THE ROOM ── approved letters + the aggregate findings.
  // approved_letters() returns ONLY letters that were opted in AND cleared by
  // a moderator; there is no path here to an unapproved one.
  window.__cowRoom = async function (limit) {
    try {
      const [{ data: letters }, { data: stats }, { data: ages }] =
        await Promise.all([
          sb.rpc("approved_letters", { p_limit: limit || 500 }),
          sb.rpc("room_stats"),
          sb.rpc("age_tally"),
        ]);
      return { letters: letters || [], stats: stats || null, ages: ages || [] };
    } catch (e) {
      console.warn("[cow] room load failed:", e.message);
      return { letters: [], stats: null, ages: [] };
    }
  };

  window.__cowCountryTally = async function (country) {
    try {
      const { data } = await sb.rpc("priority_tally_by_country", {
        p_country: country,
      });
      const o = {};
      (data || []).forEach((r) => {
        o[r.issue] = r.votes;
      });
      return o;
    } catch (e) {
      return {};
    }
  };

  window.__cowHydrate = hydrate;
  hydrate();
})();
