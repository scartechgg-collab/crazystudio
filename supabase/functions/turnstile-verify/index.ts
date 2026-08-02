// ============================================================
// CrazyStudio — Cloudflare Turnstile verification (Edge Function)
// The SECRET key lives ONLY here (set via: supabase secrets set).
// Browser sends the widget token → we verify with Cloudflare →
// return { success: true }. Deploy: supabase functions deploy
// turnstile-verify
// ============================================================

const SECRET = Deno.env.get("TURNSTILE_SECRET") || "";

Deno.serve(async (req) => {
  // CORS (lock this to your domain in production)
  const headers = {
    "Access-Control-Allow-Origin": "*", // change to https://crazystudio.fun
    "Access-Control-Allow-Headers": "content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ success: false, error: "method" }), { status: 405, headers });
  if (!SECRET)
    return new Response(JSON.stringify({ success: false, error: "server-misconfigured" }), { status: 500, headers });

  try {
    const { token } = await req.json();
    if (!token)
      return new Response(JSON.stringify({ success: false, error: "no-token" }), { status: 400, headers });

    const form = new FormData();
    form.append("secret", SECRET);
    form.append("response", token);

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const outcome = await result.json();

    return new Response(JSON.stringify({ success: !!outcome.success, data: outcome }), {
      status: outcome.success ? 200 : 403,
      headers,
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers });
  }
});
