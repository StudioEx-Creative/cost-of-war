// ═══════════════════════════════════════════════════════════════════
// THE COST OF WAR — submit edge function
// Validates a coalition submission, verifies a Cloudflare Turnstile token,
// and inserts the row with the service role. This lets us lock the table
// so the public anon key can NO LONGER insert directly (stops bot spam).
//
// Deploy:  supabase functions deploy submit --no-verify-jwt
// Secret:  supabase secrets set TURNSTILE_SECRET=xxxxx
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
// ═══════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://studioex-creative.github.io",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

function corsHeaders(origin: string) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "content-type": "application/json",
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const headers = corsHeaders(origin);
  const fail = (status: number, error: string) =>
    new Response(JSON.stringify({ error }), { status, headers });

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return fail(405, "method-not-allowed");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid-json");
  }

  const {
    ranking, country, email, income, tax_to_war,
    age_band, letter, letter_consent, turnstileToken,
  } = body as Record<string, unknown>;

  // ── validate ──
  if (!Array.isArray(ranking) || ranking.length < 1 || ranking.length > 5)
    return fail(400, "ranking-length");
  if (
    !ranking.every((n) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 13)
  )
    return fail(400, "ranking-range");
  if (new Set(ranking).size !== ranking.length) return fail(400, "ranking-dupes");
  if (country != null && (typeof country !== "string" || country.length > 60))
    return fail(400, "country");
  if (
    email != null &&
    email !== "" &&
    (typeof email !== "string" || email.length > 200 || !email.includes("@"))
  )
    return fail(400, "email");
  const inc = income == null || income === "" ? null : Number(income);
  if (inc != null && (!isFinite(inc) || inc < 0 || inc > 100_000_000))
    return fail(400, "income");
  const t2w = tax_to_war == null || tax_to_war === "" ? null : Number(tax_to_war);
  if (t2w != null && (!isFinite(t2w) || t2w < 0 || t2w > 100_000_000))
    return fail(400, "tax");
  const BANDS = ["under-18", "18-24", "25-34", "35-49", "50-64", "65-plus"];
  const band =
    age_band == null || age_band === "" ? null : String(age_band);
  if (band != null && !BANDS.includes(band)) return fail(400, "age-band");
  // The letter is only accepted alongside an explicit opt-in, and is stored
  // unapproved: letter_approved defaults to false and is never settable here,
  // so nothing a visitor types can publish itself.
  const optIn = letter_consent === true;
  let text: string | null = null;
  if (optIn && typeof letter === "string") {
    text = letter.trim().slice(0, 4000);
    if (text.length < 20) text = null; // ignore empty/stub letters
  }

  // ── verify Turnstile (skipped only if no secret is configured) ──
  const secret = Deno.env.get("TURNSTILE_SECRET");
  if (secret) {
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", typeof turnstileToken === "string" ? turnstileToken : "");
    const ip = req.headers.get("CF-Connecting-IP");
    if (ip) form.append("remoteip", ip);
    try {
      const vr = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { method: "POST", body: form },
      );
      const vj = await vr.json();
      if (!vj.success) return fail(403, "captcha-failed");
    } catch {
      return fail(502, "captcha-unreachable");
    }
  }

  // ── insert with the service role ──
  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error } = await supa.from("submissions").insert({
    ranking,
    country: (country as string) || null,
    email: (email as string) || null,
    income: inc,
    tax_to_war: t2w,
    age_band: band,
    letter: text,
    letter_consent: optIn,
    letter_approved: false, // moderator-only; never set from a request
  });
  if (error) return fail(500, "db-error");

  return new Response(JSON.stringify({ ok: true }), { headers });
});
