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
