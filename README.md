# CrazyStudio — Premium Company Website

**Develop • Design • Deploy**

A production-grade, multi-page website for the CrazyStudio software agency. Pure **HTML + CSS + Vanilla JavaScript** — no frameworks, no build step, no Tailwind. Backend is **Supabase** (Auth, Postgres, Realtime, Storage, Presence) with a graceful **offline mock layer** so the entire UI works even before you plug in real keys.

Design language mirrors the CrazyStudio chrome monogram: near-black canvas, silver/white type, soft-blue glow, glass panels, particle field, cursor glow, scroll reveals, seasonal modes (winter / christmas / halloween), maintenance mode, and a full admin console.

---

## 📁 Structure

```
.
├── index.html  about.html  services.html  pricing.html
├── portfolio.html  team.html  community.html  contact.html
├── login.html  register.html  forgot-password.html
├── client-login.html  dev-login.html  admin-login.html
├── dashboard.html  profile.html  admin-dashboard.html  404.html
├── css/
│   └── style.css              # full design system
├── js/
│   ├── config.js              # runtime config (NO secrets)
│   ├── supabase.js            # client + offline mock layer
│   ├── theme.js               # accents + seasonal FX
│   ├── main.js                # chrome, loader, cursor, particles,
│   │                          # header/footer injection, search,
│   │                          # notifications, modal, toast, reveal
│   ├── auth.js                # login / register / forgot / tabs
│   ├── dashboard.js           # client & developer dashboard
│   ├── admin.js               # admin console
│   ├── profile.js             # public /user/:username profile
│   ├── chat.js                # realtime 1:1 chat
│   ├── search.js              # global search helpers
│   ├── notifications.js       # sounds + realtime presence
│   └── settings.js            # import/export/reset
├── schema.sql                 # Supabase / Postgres schema
├── .env.example               # env template
├── robots.txt  sitemap.xml
└── README.md
```

## 🚀 Run locally

```bash
# Any static server works — no build step.
npx serve .
# or
python -m http.server 8000
```

Open `http://localhost:8000`. The site boots in **demo mode** with seeded mock users, chat, notifications, and admin actions.

## 🔐 Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `schema.sql` in the SQL editor.
3. Copy your **Project URL** and **anon public key**.
4. Inject them at runtime — never commit them. Two options:

   **a) `.env` + server injection** (recommended in production): your host exposes them as `window.__CS_ENV__` before `config.js` loads:
   ```html
   <script>window.__CS_ENV__ = { SUPABASE_URL: "...", SUPABASE_ANON_KEY: "..." };</script>
   ```

   **b) Quick local test**: edit the placeholder strings in `js/config.js` (do **not** commit).

When real keys are detected, `js/supabase.js` loads `@supabase/supabase-js` from CDN and swaps the mock for the live client automatically.

## 👤 Default admin

* Email: `team@crazystudio.fun`
* Password: created by you in Supabase Auth (never hardcoded). In **demo mode** any password works for the seeded admin email.
* Entry point: the shield icon in the bottom-right of every page → `admin-login.html`.

## ✨ Features

* 18 hand-crafted pages, shared injected chrome
* Animated loader with live percentage
* Custom cursor + cursor glow + particle network background
* Mega-menu header, sticky glass on scroll, mobile drawer
* Global search (⌘K) across users / services / projects / posts
* Realtime notifications panel with sound + toasts
* Full auth: client / developer / admin tabs, register, forgot, remember-me, session persistence
* Client & developer dashboard: overview, projects, orders, messages, followers, saved, achievements, security, settings
* Public profiles at `profile.html?u=username` (or `/user/username`), follow / message, role badges, activity timeline
* Realtime 1:1 chat with typing/seen/online indicators and emoji
* Admin console: analytics, user management (ban / suspend / role / badge / reset / delete / notify), roles & permissions, projects, orders, portfolio, services, messages, reports, announcements, website customizer (logo, banner, SEO, modes), media library, security, database backups
* Seasonal modes: winter (snow), christmas (snow + red glow), halloween (bats), maintenance banner
* Accent cycling (blue / silver / ice)
* SEO: per-page meta, Open Graph, Twitter cards, JSON-LD, canonical, robots, sitemap
* Accessibility: focus rings, semantic landmarks, reduced reliance on color alone
* Responsive, mobile-first

## 🎨 Branding

The chrome **C + S** monogram with circuit traces is recreated as inline SVG (`CS.MARK()` in `main.js`) with a metallic gradient, so the site is fully self-contained and recolors with the accent. Swap in your own asset by replacing the `MARK` template or pointing the admin "Logo URL" field at your file.

## 🛡 Security notes

* No credentials in source. Keys live in `window.__CS_ENV__` or your host's env.
* Role checks on admin routes (`admin.js` → `requireAdmin`).
* HTML-escaped chat input (`escapeHtml`).
* Supabase Row-Level Security policies in `schema.sql`.
* Rate-limit login at the edge / Supabase Auth settings.

## 📄 License

© CrazyStudio. All rights reserved.
