/* ============================================================
   CrazyStudio — Main runtime: chrome injection, animations,
   brand SVG, UI utilities (toast / modal / search / notifs)
   ============================================================ */
(function () {
  window.CS = window.CS || {};
  const CFG = window.CS_CONFIG || {};

  /* ---------------- Brand SVG (recreated from logo) ---------------- */
  const MARK = (id = "cs") => `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${id}-chrome" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".35" stop-color="#d9dde3"/>
        <stop offset=".55" stop-color="#7f858d"/>
        <stop offset=".72" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#aeb4bd"/>
      </linearGradient>
      <linearGradient id="${id}-bevel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a2d33"/>
        <stop offset="1" stop-color="#05060a"/>
      </linearGradient>
      <filter id="${id}-glow"><feGaussianBlur stdDeviation="2.2"/></filter>
    </defs>
    <g class="chrome">
      <!-- circuit traces -->
      <g stroke="#ffffff" stroke-width="1" fill="none" opacity=".55">
        <path d="M150 60 L172 38"/><path d="M156 72 L182 52"/>
        <path d="M60 120 L38 142"/><path d="M70 132 L44 156"/><path d="M150 110 L168 110"/>
      </g>
      <g fill="#fff">
        <circle cx="172" cy="38" r="2.4"/><circle cx="182" cy="52" r="1.8"/>
        <circle cx="38" cy="142" r="2.2"/><circle cx="44" cy="156" r="1.6"/>
        <circle cx="168" cy="110" r="2"/>
      </g>
      <!-- C shape (left) -->
      <path fill="url(#${id}-chrome)" d="M112 34 L66 60 L66 102 L96 120 L96 100 L84 93 L84 70 L112 54 Z"/>
      <path fill="url(#${id}-bevel)" opacity=".55" d="M96 120 L96 100 L102 104 L102 124 Z"/>
      <!-- S shape (right) -->
      <path fill="url(#${id}-chrome)" d="M96 72 L126 88 L126 96 L102 110 L102 118 L138 98 L138 80 L118 68 Z"/>
      <path fill="url(#${id}-chrome)" d="M102 110 L128 124 L128 132 L92 152 L92 162 L140 134 L140 116 L120 104 Z"/>
      <path fill="url(#${id}-bevel)" opacity=".6" d="M92 152 L92 162 L98 158 L98 148 Z"/>
    </g>
  </svg>`;

  const WORD = () => `<span class="wm">CRAZY<b>STUDIO</b></span>`;

  /* ---------------- Icons (inline) ---------------- */
  const I = {
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    discord:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4.5A18 18 0 0 0 15.5 3l-.3.5a14 14 0 0 1 4 2 13 13 0 0 0-14.4 0 14 14 0 0 1 4-2L8.5 3A18 18 0 0 0 4 4.5C1.5 8.3.8 12 1 15.7A18 18 0 0 0 6.5 18l.7-1.2c-.8-.3-1.6-.7-2.3-1.2l.5-.4a13 13 0 0 0 11.2 0l.5.4c-.7.5-1.5.9-2.3 1.2L15.5 18a18 18 0 0 0 5.5-2.3c.3-4.3-.6-8-3-11.2ZM8.5 13.5c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Zm7 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Z"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3Z"/></svg>',
    github:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.300000000000004-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/></svg>',
    code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></svg>',
    cube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/></svg>',
    bot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M8 14h.01M16 14h.01"/></svg>',
    phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
    cloud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a4 4 0 0 0 0-8 6 6 0 0 0-11.3 2A4 4 0 0 0 6 18Z"/></svg>',
    palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="10" r="1"/></svg>',
    bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 5 5 9-11"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>',
    grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    cog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>',
    chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20c0-2.6-1.8-4.8-4.5-5.6"/></svg>'
  };
  window.CS.icon = (n) => I[n] || "";
  window.CS.MARK = MARK;
  window.CS.WORD = WORD;

  /* ---------------- Background stage ---------------- */
  function buildBG() {
    if (document.getElementById("bg-stage")) return;
    const s = document.createElement("div"); s.id = "bg-stage";
    s.innerHTML = `<canvas id="bg-canvas"></canvas><div class="bg-grid"></div>
      <div class="bg-spot a"></div><div class="bg-spot b"></div><div class="bg-spot c"></div>
      <div class="bg-scan"></div>`;
    document.body.prepend(s);
    const v = document.createElement("div"); v.className = "vignette"; document.body.appendChild(v);
    initParticles();
  }

  function initParticles() {
    const c = document.getElementById("bg-canvas"); if (!c) return;
    const ctx = c.getContext("2d"); let w, h, parts = [];
    const N = Math.min(90, Math.floor(window.innerWidth / 18));
    function resize() { w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio; c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px"; }
    resize(); addEventListener("resize", resize);
    for (let i = 0; i < N; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25 * devicePixelRatio, vy: (Math.random() - .5) * .25 * devicePixelRatio, r: (Math.random() * 1.4 + .3) * devicePixelRatio });
    let mx = -9999, my = -9999;
    addEventListener("mousemove", e => { mx = e.clientX * devicePixelRatio; my = e.clientY * devicePixelRatio; });
    (function loop() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 140 * devicePixelRatio) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = "rgba(220,230,255,.55)"; ctx.fill();
      }
      // links
      for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], b = parts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110 * devicePixelRatio) { ctx.strokeStyle = "rgba(120,165,255," + (.12 * (1 - d / (110 * devicePixelRatio))) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- Cursor ---------------- */
  function buildCursor() {
    if (matchMedia("(hover:none)").matches) return;
    const g = document.createElement("div"); g.id = "cursor-glow";
    const d = document.createElement("div"); d.id = "cursor-dot";
    document.body.append(g, d);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; d.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`; });
    (function f() { x += (tx - x) * .12; y += (ty - y) * .12; g.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; requestAnimationFrame(f); })();
    addEventListener("mousedown", () => d.style.width = d.style.height = "14px");
    addEventListener("mouseup", () => d.style.width = d.style.height = "7px");
  }

  /* ---------------- Loader (bar on home, spinner elsewhere) ---------------- */
  function buildLoader() {
    if (document.getElementById("loader")) return;
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const isHome = page === "" || page === "index.html" || page === "index" || page === "/";
    const l = document.createElement("div"); l.id = "loader";
    if (isHome) {
      // full CrazyStudio progress-bar experience (home only)
      l.innerHTML = `<div class="ld-logo">${MARK("ld")}</div>
        <div class="ld-name">CRAZYSTUDIO</div>
        <div class="ld-bar"><i></i></div><div class="ld-pct">0%</div>`;
      document.body.prepend(l);
      const bar = l.querySelector(".ld-bar i"), pct = l.querySelector(".ld-pct");
      let p = 0;
      const t = setInterval(() => { p += Math.random() * 14 + 6; if (p >= 100) { p = 100; clearInterval(t); setTimeout(() => l.classList.add("done"), 280); } bar.style.width = p + "%"; pct.textContent = Math.floor(p) + "%"; }, 120);
    } else {
      // minimal themed ring spinner (all other pages)
      l.classList.add("simple");
      l.innerHTML = `<div class="ld-orbit"><div class="ld-ring"></div><div class="ld-center"></div></div>
        <div class="ld-pct">CRAZYSTUDIO</div>`;
      document.body.prepend(l);
      const done = () => setTimeout(() => l.classList.add("done"), 350);
      if (document.readyState === "complete") done();
      else addEventListener("load", done);
      // safety: never hang more than 2.5s
      setTimeout(() => l.classList.add("done"), 2500);
    }
  }

  /* ---------------- Header ---------------- */
  const NAV = [
    { label: "Home", href: "index.html" },
    { label: "About", href: "about.html" },
    { label: "Services", href: "services.html", mega: [
      { i: "code",    t: "Web Development", d: "Sites, apps, dashboards", h: "services.html#web" },
      { i: "cube",    t: "Minecraft", d: "Networks, plugins, packs", h: "services.html#minecraft" },
      { i: "bot",     t: "Discord Bots", d: "Custom bots & setup", h: "services.html#discord" },
      { i: "phone",   t: "Mobile & Desktop", d: "Android & desktop apps", h: "services.html#apps" },
      { i: "bolt",    t: "Automation & API", d: "Workflows & backends", h: "services.html#automation" },
      { i: "palette", t: "UI / UX Design", d: "Premium interfaces", h: "services.html#design" }
    ]},
    { label: "Portfolio", href: "portfolio.html" },
    { label: "Pricing", href: "pricing.html" },
    { label: "Team", href: "team.html" },
    { label: "Community", href: "community.html" },
    { label: "Contact", href: "contact.html" }
  ];

  function currentPage() {
    let p = location.pathname.split("/").pop() || "index.html";
    if (!p.includes(".")) p = p + "/index.html";
    return p;
  }

  function buildHeader() {
    const h = document.createElement("header"); h.id = "site-header";
    const cur = currentPage();
    const navLinks = NAV.map(n => {
      const active = (n.href === cur) ? " active" : "";
      if (n.mega) {
        const items = n.mega.map(m => `<a href="${m.h}"><span class="ic">${I[m.i]}</span><span><b>${m.t}</b><span>${m.d}</span></span></a>`).join("");
        return `<span class="navbtn has-mega">${n.label} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg><div class="mega">${items}</div></span>`;
      }
      return `<a href="${n.href}" class="${active.trim()}">${n.label}</a>`;
    }).join("");

    h.innerHTML = `<div class="wrap">
      <a class="brand" href="index.html"><span class="mark">${MARK("hd")}</span>${WORD()}</a>
      <nav class="nav">${navLinks}</nav>
      <div class="hdr-right">
        <button class="iconbtn desktop" id="btn-search" aria-label="Search">${I.search}</button>
        <button class="iconbtn desktop" id="btn-notif" aria-label="Notifications">${I.bell}<span class="badge hide" id="notif-count">0</span></button>
        <button class="iconbtn desktop" id="btn-theme" aria-label="Accent">${I.palette}</button>
        <a class="btn btn-ghost btn-sm desktop" href="login.html">Sign in</a>
        <a class="btn btn-primary btn-sm desktop" href="contact.html">Get Started</a>
        <button class="iconbtn burger" id="btn-burger" aria-label="Menu">${I.menu}</button>
      </div>
    </div>`;
    document.body.prepend(h);

    addEventListener("scroll", () => h.classList.toggle("scrolled", scrollY > 20));
    h.querySelector("#btn-search").onclick = () => CS.openSearch();
    h.querySelector("#btn-notif").onclick = () => CS.toggleNotif();
    h.querySelector("#btn-theme").onclick = () => { const a = CS.theme.cycleAccent(); CS.toast({ type: "ok", title: "Accent: " + a }); };
    h.querySelector("#btn-burger").onclick = () => document.getElementById("m-drawer").classList.toggle("open");

    // mobile drawer
    const dr = document.createElement("div"); dr.id = "m-drawer";
    dr.innerHTML = NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join("") +
      `<div class="row"><a class="btn btn-ghost" href="login.html">Sign in</a><a class="btn btn-primary" href="contact.html">Get Started</a></div>`;
    document.body.appendChild(dr);

    // refresh auth-aware bits
    CS.refreshAuthUI && CS.refreshAuthUI();
  }

  /* ---------------- Footer ---------------- */
  function buildFooter() {
    const f = document.createElement("footer"); f.id = "site-footer";
    f.innerHTML = `<div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand">
          <a class="brand" href="index.html"><span class="mark">${MARK("ft")}</span>${WORD()}</a>
          <p>Premium software studio crafting websites, Minecraft networks, bots, apps and cloud systems.</p>
          <div class="foot-social">
            <a href="${CFG.DISCORD_INVITE}" target="_blank" rel="noopener" aria-label="Discord">${I.discord}</a>
            <a href="${CFG.WHATSAPP}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.whatsapp}</a>
            <a href="${CFG.GITHUB}" target="_blank" rel="noopener" aria-label="GitHub">${I.github}</a>
            <a href="mailto:${CFG.EMAIL}" aria-label="Email">${I.mail}</a>
          </div>
        </div>
        <div class="foot-col"><h5>Company</h5><a href="about.html">About</a><a href="team.html">Team</a><a href="portfolio.html">Portfolio</a><a href="community.html">Community</a></div>
        <div class="foot-col"><h5>Services</h5><a href="services.html#web">Web Dev</a><a href="services.html#minecraft">Minecraft</a><a href="services.html#discord">Discord</a><a href="services.html#automation">Automation</a></div>
        <div class="foot-col"><h5>Resources</h5><a href="pricing.html">Pricing</a><a href="contact.html">Contact</a><a href="dashboard.html">Dashboard</a><a href="profile.html">Profiles</a></div>
        <div class="foot-col"><h5>Legal</h5><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Cookies</a><a href="#">Licenses</a></div>
      </div>
      <div class="foot-bottom">
        <span>© ${new Date().getFullYear()} CrazyStudio — ${CFG.TAGLINE}</span>
        <div class="legal"><span>v2.0 · build ${Math.floor(Date.now()/86400000)}</span><span id="cs-status">● online</span></div>
      </div>
    </div>`;
    document.body.appendChild(f);

    // admin fab
    const fab = document.createElement("a"); fab.id = "admin-fab"; fab.href = "admin-login.html"; fab.title = "Admin";
    fab.innerHTML = I.shield; document.body.appendChild(fab);

    // maintenance banner
    const mb = document.createElement("div"); mb.id = "maint-banner";
    mb.textContent = "⚠ CrazyStudio is in maintenance mode — some features may be unavailable.";
    document.body.prepend(mb);
  }

  /* ---------------- Search overlay ---------------- */
  function buildSearch() {
    const o = document.createElement("div"); o.id = "search-overlay";
    o.innerHTML = `<div class="search-box">
      <input type="text" id="search-input" placeholder="Search users, projects, services, posts…" autocomplete="off"/>
      <div class="search-res" id="search-res"><div class="empty">Start typing to search everything.</div></div>
    </div>`;
    document.body.appendChild(o);
    o.addEventListener("click", e => { if (e.target === o) o.classList.remove("open"); });
    addEventListener("keydown", e => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); CS.openSearch(); } if (e.key === "Escape") o.classList.remove("open"); });
    o.querySelector("#search-input").addEventListener("input", e => CS.runSearch(e.target.value));
  }

  /* ---------------- Notif panel ---------------- */
  function buildNotif() {
    const p = document.createElement("div"); p.id = "notif-panel";
    p.innerHTML = `<div class="nh"><h4>Notifications</h4><button class="btn btn-sm btn-ghost" id="notif-clear">Clear all</button></div>
      <div class="notif-list" id="notif-list"></div>`;
    document.body.appendChild(p);
    p.querySelector("#notif-clear").onclick = () => { CS.notifs.clear(); CS.renderNotifs(); };
    document.addEventListener("click", e => { if (!p.contains(e.target) && e.target.id !== "btn-notif" && !e.target.closest("#btn-notif")) p.classList.remove("open"); });
    addEventListener("cs:notif", () => CS.renderNotifs());
  }

  /* ---------------- Cloudflare Turnstile verification gate ----------------
     Shown on first visit of a session. The SITE key is public; the token
     stays valid on your server (secret never ships to the browser).   */
  function buildVerifyGate() {
    const KEY = CFG.TURNSTILE_SITE_KEY;
    if (!KEY) return;
    if (sessionStorage.getItem("cs_verified") === "1") return;
    const gate = document.createElement("div"); gate.id = "verify-gate";
    gate.innerHTML = `<div class="verify-card" role="dialog" aria-modal="true" aria-label="Human verification">
      <div class="v-mark">${MARK("vg")}<span class="v-ring"></span></div>
      <h3>Quick human check</h3>
      <p class="v-sub">CrazyStudio is protected by Cloudflare Turnstile.</p>
      <div class="v-widget" id="cf-turnstile"></div>
      <div class="v-ok"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-11"/></svg></div>
      <p class="v-wait" id="v-wait">VERIFYING…</p>
    </div>`;
    document.body.appendChild(gate);

    window.__csTS = function (token) {
      const card = gate.querySelector(".verify-card");
      // send token to your verify endpoint when configured (see SETUP.txt)
      const finish = () => {
        card.classList.add("perfect");
        gate.querySelector("#v-wait").textContent = "VERIFIED ✦ WELCOME";
        sessionStorage.setItem("cs_verified", "1");
        setTimeout(() => gate.classList.add("done"), 900);
        setTimeout(() => gate.remove(), 1600);
      };
      if (CFG.TURNSTILE_VERIFY_URL) {
        fetch(CFG.TURNSTILE_VERIFY_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
          .then(r => r.json()).then(() => finish()).catch(() => finish());
      } else finish();
    };
    window.__csTSL = function () {
      try {
        window.turnstile.render("#cf-turnstile", { sitekey: KEY, theme: "dark", callback: window.__csTS, "error-callback": () => gate.querySelector("#v-wait").textContent = "RETRY ↻" });
      } catch {}
    };
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__csTSL&render=explicit";
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }

  /* ---------------- Custom themed dropdown ----------------
     Turns any <select class="cs-select-input"> into a themed menu,
     keeps the real <select> in the DOM so forms keep working.    */
  function enhanceSelects(root) {
    (root || document).querySelectorAll("select.cs-select-input:not([data-enhanced])").forEach(sel => {
      sel.dataset.enhanced = "1";
      const wrap = document.createElement("div"); wrap.className = "cs-select";
      sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "trigger";
      const menu = document.createElement("div"); menu.className = "menu";
      const idx = [...sel.options].findIndex(o => o.value === sel.value);
      const label = idx >= 0 ? sel.options[idx].textContent : (sel.options[0]?.textContent || "");
      btn.innerHTML = `<span>${label}</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
      wrap.appendChild(btn); wrap.appendChild(menu);
      const renderOpts = () => {
        menu.innerHTML = [...sel.options].map((o, i) => `<div class="opt ${o.value === sel.value ? "active" : ""}" data-i="${i}">${o.textContent}</div>`).join("");
        menu.querySelectorAll(".opt").forEach(el => el.onclick = () => {
          sel.selectedIndex = +el.dataset.i;
          btn.querySelector("span").textContent = el.textContent;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          wrap.classList.remove("open");
          renderOpts();
        });
      };
      renderOpts();
      btn.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll(".cs-select.open").forEach(o => { if (o !== wrap) o.classList.remove("open"); });
        wrap.classList.toggle("open");
      };
    });
  }
  document.addEventListener("click", () => document.querySelectorAll(".cs-select.open").forEach(o => o.classList.remove("open")));

  /* ---------------- Modal + toast roots ---------------- */
  function buildRoots() {
    const m = document.createElement("div"); m.id = "modal-root"; document.body.appendChild(m);
    const t = document.createElement("div"); t.id = "toast-root"; document.body.appendChild(t);
  }

  /* ---------------- Toast ---------------- */
  CS.toast = function ({ type = "info", title = "", text = "", timeout = 3600 } = {}) {
    const root = document.getElementById("toast-root"); if (!root) return;
    const el = document.createElement("div"); el.className = "toast " + type;
    const ic = type === "ok" ? I.check : type === "bad" ? I.x : type === "warn" ? "!" : I.bell;
    el.innerHTML = `<span class="ic">${typeof ic === "string" ? ic : ic}</span><div><p><b>${title}</b></p>${text ? `<span class="t">${text}</span>` : ""}</div>`;
    root.appendChild(el); requestAnimationFrame(() => el.classList.add("in"));
    setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 400); }, timeout);
  };

  /* ---------------- Modal ---------------- */
  CS.modal = function (html) {
    const root = document.getElementById("modal-root");
    root.innerHTML = `<div class="modal"><button class="x" aria-label="Close">${I.x}</button>${html}</div>`;
    root.classList.add("open");
    root.querySelector(".x").onclick = () => root.classList.remove("open");
    root.onclick = e => { if (e.target === root) root.classList.remove("open"); };
    return root;
  };
  CS.closeModal = () => document.getElementById("modal-root")?.classList.remove("open");

  /* ---------------- Search logic ---------------- */
  CS.openSearch = function () { const o = document.getElementById("search-overlay"); o.classList.add("open"); setTimeout(() => o.querySelector("#search-input").focus(), 50); };
  CS.runSearch = function (q) {
    const res = document.getElementById("search-res"); q = q.trim().toLowerCase();
    if (!q) { res.innerHTML = `<div class="empty">Try “minecraft”, “nova”, “bot”…</div>`; return; }
    const users = (CS.users?.all() || []).filter(u => (u.username + u.email + u.role).toLowerCase().includes(q)).map(u => ({ t: "User", n: u.username, s: u.role, h: `profile.html?u=${u.username}` }));
    const services = ["Web Development","Minecraft Network","Minecraft Plugin","Discord Bot","Android App","Automation","API","UI/UX Design"].filter(s => s.toLowerCase().includes(q)).map(s => ({ t: "Service", n: s, s: "services.html", h: "services.html" }));
    const projects = ["Nexus Network","Aurora Bot","Orbit Dashboard","Pulse Mobile","Forge Plugin","Halo Website"].filter(s => s.toLowerCase().includes(q)).map(s => ({ t: "Project", n: s, s: "portfolio", h: "portfolio.html" }));
    const all = [...users, ...services, ...projects];
    res.innerHTML = all.length ? all.slice(0, 10).map(r => `<a href="${r.h}"><span class="ic" style="width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:var(--panel-2);border:1px solid var(--line);color:var(--glow)">${I.search}</span><span><b style="color:#fff;font-size:14px">${r.n}</b><span style="display:block;font-size:11px;color:var(--muted-2);font-family:var(--font-m)">${r.t} · ${r.s}</span></span></a>`).join("") : `<div class="empty">No results for “${q}”.</div>`;
  };

  /* ---------------- Notifs render ---------------- */
  CS.toggleNotif = () => { document.getElementById("notif-panel").classList.toggle("open"); CS.renderNotifs(); };
  CS.renderNotifs = function () {
    const list = document.getElementById("notif-list"); const badge = document.getElementById("notif-count"); if (!list) return;
    const arr = CS.notifs.all();
    const unread = arr.filter(n => !n.read).length;
    if (badge) { badge.textContent = unread; badge.classList.toggle("hide", unread === 0); }
    list.innerHTML = arr.length ? arr.map(n => {
      const ic = n.type === "follow" ? I.users : n.type === "message" ? I.chat : I.bell;
      const ago = CS.ago(n.t);
      return `<div class="notif"><span class="ic">${ic}</span><div><p>${n.text}</p><div class="t">${ago}</div></div></div>`;
    }).join("") : `<div class="empty" style="padding:30px;text-align:center;color:var(--muted)">No notifications yet.</div>`;
  };

  CS.ago = function (t) { const s = Math.floor((Date.now() - t) / 1000); if (s < 60) return s + "s"; if (s < 3600) return Math.floor(s / 60) + "m"; if (s < 86400) return Math.floor(s / 3600) + "h"; return Math.floor(s / 86400) + "d"; };

  /* ---------------- Auth-aware header ---------------- */
  CS.refreshAuthUI = function () {
    const me = CS.users?.me();
    const right = document.querySelector(".hdr-right"); if (!right) return;
    const signin = right.querySelector('a[href="login.html"]');
    const start = right.querySelector('a[href="contact.html"].btn-primary');
    if (me) {
      if (signin) signin.outerHTML = `<a class="hdr-avatar desktop" href="dashboard.html" title="${me.username}">${(me.username[0] || "U").toUpperCase()}</a>`;
      if (start) start.outerHTML = `<a class="btn btn-primary btn-sm desktop" href="dashboard.html">Dashboard</a>`;
    }
  };

  /* ---------------- Scroll reveal + counters + typing ---------------- */
  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach(e => io.observe(e));
  }
  function initCounters() {
    document.querySelectorAll("[data-count]").forEach(el => {
      const io = new IntersectionObserver((es) => es.forEach(e => {
        if (!e.isIntersecting) return;
        const end = +el.dataset.count, suf = el.dataset.suf || "", pre = el.dataset.pre || "";
        const dur = 1400; const t0 = performance.now();
        (function f(t) { const p = Math.min(1, (t - t0) / dur); el.textContent = pre + Math.floor(end * (1 - Math.pow(1 - p, 3))).toLocaleString() + suf; if (p < 1) requestAnimationFrame(f); })(t0);
        io.unobserve(el);
      }), { threshold: .4 });
      io.observe(el);
    });
  }
  CS.typing = function (el, words, { speed = 70, pause = 1400 } = {}) {
    let wi = 0, ci = 0, del = false;
    (function f() {
      const w = words[wi];
      el.textContent = w.slice(0, ci);
      if (!del && ci < w.length) { ci++; setTimeout(f, speed); }
      else if (!del && ci === w.length) { del = true; setTimeout(f, pause); }
      else if (del && ci > 0) { ci--; setTimeout(f, speed / 2); }
      else { del = false; wi = (wi + 1) % words.length; setTimeout(f, 200); }
    })();
  };

  /* ---------------- Card glow follow ---------------- */
  function initGlowFollow() {
    document.querySelectorAll(".card.hover, .svc, .pf").forEach(c => {
      let g = c.querySelector(".glow-follow");
      if (!g) { g = document.createElement("div"); g.className = "glow-follow"; c.appendChild(g); }
      c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect(); g.style.left = (e.clientX - r.left) + "px"; g.style.top = (e.clientY - r.top) + "px"; });
    });
  }

  /* ---------------- Mouse parallax (hero mark) ---------------- */
  function initParallax() {
    const m = document.querySelector(".hero-mark .bigmark"); if (!m) return;
    addEventListener("mousemove", e => { const x = (e.clientX / innerWidth - .5) * 18, y = (e.clientY / innerHeight - .5) * 18; m.style.transform = `translate(${x}px,${y}px)`; });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    buildBG(); buildCursor(); buildLoader(); buildRoots(); buildHeader(); buildFooter(); buildSearch(); buildNotif(); buildVerifyGate();
    initReveal(); initCounters(); initGlowFollow(); initParallax();
    enhanceSelects(document);
    CS.renderNotifs();
    // re-init glow-follow + dropdowns after dynamic content
    const mo = new MutationObserver((muts) => {
      initGlowFollow();
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1) { if (n.matches?.("select.cs-select-input") || n.querySelector?.("select.cs-select-input")) enhanceSelects(n.nodeName === "SELECT" ? n.parentNode : n); }
      }));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // re-render any live bindings once supabase boot finishes
    CS.ready && CS.ready().then(() => { CS.refreshAuthUI(); CS.renderNotifs(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
