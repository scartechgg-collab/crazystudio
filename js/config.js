/* ============================================================
   CrazyStudio — Runtime configuration
   Only PUBLIC values live here. Nothing here is secret:
     - Supabase URL + anon/publishable keys are public by design
       (row-level security in schema.sql is what protects data).
     - Cloudflare Turnstile SITE key is public.
   The Turnstile SECRET must live on your server / edge function
   only (see SETUP.txt). Never commit anything secret here.
   ============================================================ */
window.CS_CONFIG = {
  // Supabase (public)
  SUPABASE_URL:    "https://xvjtxvrjqtazsnthuqed.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2anR4dnJqcXRhenNudGh1cWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MjUyNjAsImV4cCI6MjEwMTIwMTI2MH0.YFLm94f1yJE_RMc4LqqJm-s8-T_mJLM7VjntzL9RH2U",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Cx-d9k5Pzp0BvGLwkh1FxA_b7T-s7Qh",

  // Cloudflare Turnstile (site key is PUBLIC; secret stays server-side)
  TURNSTILE_SITE_KEY: "0x4AAAAAAEEGPLwUV4UdMshH",
  // Point this at your verify endpoint (Edge Function) — see SETUP.txt
  TURNSTILE_VERIFY_URL: "", // e.g. "https://xvjtxvrjqtazsnthuqed.supabase.co/functions/v1/turnstile-verify"

  // Brand / social
  APP_NAME:        "CrazyStudio",
  TAGLINE:         "Develop • Design • Deploy",
  ADMIN_EMAIL:     "team@crazystudio.fun",
  DISCORD_INVITE:  "https://dc.gg/crazystudio",
  WHATSAPP:        "https://wa.me/0000000000",
  GITHUB:          "https://github.com/crazystudio",
  EMAIL:           "team@crazystudio.fun",
  SITE_URL:        location.origin,
  OAUTH_REDIRECT:  location.origin + "/login.html",

  // Feature flags
  ENABLE_MOCK: true, // graceful offline mode if Supabase is unreachable

  // SEO
  META: {
    description: "CrazyStudio — premium software studio. We build websites, Minecraft networks, Discord bots, apps, automation and cloud systems.",
    keywords: "CrazyStudio, software studio, web development, minecraft plugins, discord bots, automation, cloud",
    themeColor: "#050608"
  }
};
