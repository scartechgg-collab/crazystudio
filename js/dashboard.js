/* ============================================================
   CrazyStudio — Client / Developer dashboard + profile/settings
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const I = (n) => (window.CS.icon ? CS.icon(n) : "");

  const VIEWS = {
    overview: renderOverview,
    projects: renderProjects,
    orders: renderOrders,
    messages: renderMessages,
    followers: renderFollowers,
    saved: renderSaved,
    achievements: renderAchievements,
    security: renderSecurity,
    settings: renderSettings
  };

  function requireAuth() {
    const me = CS.users?.me();
    if (!me) { location.href = "login.html"; return null; }
    return me;
  }

  function sidebar(active) {
    const items = [
      ["overview", "grid", "Overview"],
      ["projects", "cube", "Projects"],
      ["orders", "bolt", "Orders"],
      ["messages", "chat", "Messages"],
      ["followers", "users", "Followers"],
      ["saved", "shield", "Saved Posts"],
      ["achievements", "bolt", "Achievements"],
      ["security", "lock", "Security"],
      ["settings", "cog", "Settings"]
    ];
    return `<aside class="side" id="side">
      <a class="brand" href="index.html"><span class="mark">${CS.MARK("sd")}</span>${CS.WORD()}</a>
      <div class="sgrp">Workspace</div>
      ${items.map(([k, ic, l]) => `<a href="#${k}" data-view="${k}" class="${k === active ? "active" : ""}">${I(ic)}${l}</a>`).join("")}
      <div class="spacer"></div>
      <a href="profile.html"><span>${I("user")}</span>Public profile</a>
      <a href="#" id="logout"><span>${I("logout")}</span>Logout</a>
    </aside>`;
  }

  function topbar(me, title) {
    return `<div class="topbar">
      <div style="display:flex;align-items:center;gap:14px">
        <button class="iconbtn burger" id="side-toggle">${I("menu")}</button>
        <div><h1>${title}</h1><span class="muted" style="font-size:13px">Welcome back, ${me.username}</span></div>
      </div>
      <div class="row">
        <button class="btn btn-ghost btn-sm" id="btn-search2">${I("search")} Search <span class="muted" style="font-family:var(--font-m);font-size:11px">⌘K</span></button>
        <span class="badge-role ${me.role}">${me.role}</span>
        <a class="hdr-avatar" href="profile.html?u=${me.username}">${me.username[0].toUpperCase()}</a>
      </div>
    </div>`;
  }

  function renderOverview(me) {
    return `
    <div class="stat-grid">
      <div class="stat"><div class="l">Active Projects</div><div class="v" data-count="12">0</div><div class="d">+3 this month</div></div>
      <div class="stat"><div class="l">Orders</div><div class="v" data-count="48">0</div><div class="d">+12% vs last month</div></div>
      <div class="stat"><div class="l">Followers</div><div class="v" data-count="${me.followers || 0}">0</div><div class="d">+24 this week</div></div>
      <div class="stat"><div class="l">Messages</div><div class="v" data-count="7">0</div><div class="d down">2 unread</div></div>
    </div>
    <div class="grid" style="grid-template-columns:2fr 1fr">
      <div class="panel"><div class="ph"><h3>Recent activity</h3><span class="pill on">live</span></div>
        <div class="pb">
          <table class="tbl"><thead><tr><th>Event</th><th>Project</th><th>When</th></tr></thead><tbody>
            <tr><td>Build deployed</td><td>Nexus Network</td><td>2h ago</td></tr>
            <tr><td>New order</td><td>Aurora Discord Bot</td><td>6h ago</td></tr>
            <tr><td>Plugin update</td><td>Forge Core v2.4</td><td>1d ago</td></tr>
            <tr><td>Review submitted</td><td>Orbit Dashboard</td><td>2d ago</td></tr>
          </tbody></table>
        </div></div>
      <div class="panel"><div class="ph"><h3>Quick actions</h3></div>
        <div class="pb stack">
          <a class="btn btn-primary btn-block" href="contact.html">Request a project</a>
          <a class="btn btn-ghost btn-block" href="community.html">Join community</a>
          <a class="btn btn-ghost btn-block" href="#messages">Open messages</a>
        </div></div>
    </div>`;
  }

  function renderProjects() {
    const projects = [
      { n: "Nexus Network", s: "Minecraft Network", p: 82, st: "In progress" },
      { n: "Aurora Bot", s: "Discord Bot", p: 100, st: "Delivered" },
      { n: "Orbit Dashboard", s: "Web App", p: 54, st: "In progress" },
      { n: "Pulse Mobile", s: "Android App", p: 30, st: "Design" }
    ];
    return `<div class="panel"><div class="ph"><h3>Your projects</h3><a class="btn btn-sm btn-ghost" href="contact.html">+ New</a></div>
      <div class="pb grid">${projects.map(p => `<div class="card hover"><div class="between"><h4 style="color:#fff;font-size:16px">${p.n}</h4><span class="pill">${p.st}</span></div>
        <p class="muted" style="font-size:13px;margin-top:6px">${p.s}</p>
        <div style="height:6px;background:var(--panel-2);border-radius:6px;margin-top:14px;overflow:hidden"><div style="height:100%;width:${p.p}%;background:linear-gradient(90deg,var(--glow),#fff)"></div></div>
        <div class="between" style="margin-top:8px"><span class="muted" style="font-size:12px">${p.p}% complete</span><button class="btn btn-sm btn-ghost">Details</button></div></div>`).join("")}</div></div>`;
  }

  function renderOrders() {
    const rows = [
      ["#CS-1042", "Minecraft Plugin", "$420", "Paid", "on"],
      ["#CS-1043", "Discord Bot", "$280", "Pending", ""],
      ["#CS-1044", "Website Redesign", "$1,200", "Paid", "on"],
      ["#CS-1045", "Automation Suite", "$650", "In review", ""]
    ];
    return `<div class="panel"><div class="ph"><h3>Orders</h3><span class="muted" style="font-size:12px">4 total</span></div>
      <div class="pb" style="overflow:auto"><table class="tbl"><thead><tr><th>Invoice</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td style="font-family:var(--font-m)">${r[0]}</td><td>${r[1]}</td><td style="color:#fff">${r[2]}</td><td><span class="pill ${r[4]}">${r[3]}</span></td></tr>`).join("")}
      </tbody></table></div></div>`;
  }

  function renderMessages() { return `<div id="chat-mount"></div>`; }

  function renderFollowers() {
    const users = CS.users.all().filter(u => u.id !== CS.users.me().id);
    return `<div class="ucards">${users.map(u => `
      <div class="ucard" onclick="location.href='profile.html?u=${u.username}'">
        <div class="top"><div class="av">${u.username[0].toUpperCase()}<span class="st"></span></div>
          <div><h5>${u.username}</h5><div class="em">${u.email}</div></div></div>
        <div class="meta"><span class="badge-role ${u.role}">${u.role}</span><span class="muted" style="font-size:12px">${u.followers} followers</span></div>
      </div>`).join("")}</div>`;
  }

  function renderSaved() {
    const posts = ["10 tips for Minecraft network performance","Designing premium Discord bots","Cloud architecture for game servers"];
    return `<div class="grid">${posts.map((p, i) => `<div class="card hover"><h4 style="color:#fff;font-size:16px">${p}</h4><p class="muted" style="font-size:13px;margin-top:6px">Saved ${i + 1} week${i ? "s" : ""} ago · Community</p><div class="row" style="margin-top:14px"><button class="btn btn-sm btn-ghost">Open</button><button class="btn btn-sm btn-ghost">Remove</button></div></div>`).join("")}</div>`;
  }

  function renderAchievements() {
    const a = [["First Project","Shipped your first project",1],["Community","Joined the Discord",1],["Veteran","90+ days active",1],["Mentor","Helped 10 members",0]];
    return `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${a.map(x => `<div class="card hover" style="text-align:center;opacity:${x[2] ? 1 : .5}"><div style="font-size:34px">${x[2] ? "✦" : "◇"}</div><h4 style="color:#fff;margin-top:10px">${x[0]}</h4><p class="muted" style="font-size:12px;margin-top:4px">${x[1]}</p></div>`).join("")}</div>`;
  }

  function renderSecurity() {
    return `<div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="panel"><div class="ph"><h3>Change password</h3></div><div class="pb form">
        <div class="field"><label>Current password</label><input class="input" type="password"></div>
        <div class="field"><label>New password</label><input class="input" type="password"></div>
        <button class="btn btn-primary" onclick="CS.toast({type:'ok',title:'Password updated'})">Update password</button>
      </div></div>
      <div class="panel"><div class="ph"><h3>Active sessions</h3></div><div class="pb stack">
        <div class="between"><span>Chrome · Windows</span><span class="pill on">current</span></div>
        <div class="between"><span>Safari · iPhone</span><button class="btn btn-sm btn-ghost">Revoke</button></div>
        <div class="between"><span>Firefox · macOS</span><button class="btn btn-sm btn-ghost">Revoke</button></div>
      </div></div>
    </div>`;
  }

  function renderSettings() {
    const s = CS.settings.get();
    return `<div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="panel"><div class="ph"><h3>Profile</h3></div><div class="pb form" id="profile-form-wrap">
        <div class="field"><label>Username</label><input class="input" id="set-user" value="${CS.users.me().username}"></div>
        <div class="field"><label>Bio</label><textarea class="input" id="set-bio">${CS.users.me().bio || ""}</textarea></div>
        <div class="field"><label>Website</label><input class="input" id="set-web" placeholder="https://…"></div>
        <button class="btn btn-primary" id="set-save">Save profile</button>
      </div></div>
      <div class="panel"><div class="ph"><h3>Appearance</h3></div><div class="pb stack">
        <div class="between"><span>Accent color</span><button class="btn btn-sm btn-ghost" id="set-accent">Cycle accent</button></div>
        <div class="between"><span>Seasonal mode</span>
          <select class="input cs-select-input" id="set-mode" style="max-width:160px">${CS.theme.MODES.map(m => `<option ${m === s.mode ? "selected" : ""}>${m}</option>`).join("")}</select></div>
        <div class="between"><span>Danger zone</span><button class="btn btn-sm btn-ghost" id="set-logout" style="color:var(--bad)">Logout</button></div>
      </div></div>
    </div>`;
  }

  function mount(view) {
    const me = requireAuth(); if (!me) return;
    const root = $("#dash-root"); if (!root) return;
    const title = view[0].toUpperCase() + view.slice(1);
    root.innerHTML = sidebar(view) + `<main class="main">${topbar(me, title)}<div id="view"></div></main>`;
    const v = $("#view"); v.innerHTML = (VIEWS[view] || renderOverview)(me);
    // wire sidebar
    $$("#side a[data-view]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); location.hash = a.dataset.view; }));
    $("#logout").onclick = (e) => { e.preventDefault(); CS.auth.signOut(); location.href = "index.html"; };
    $("#side-toggle")?.addEventListener("click", () => $("#side").classList.toggle("open"));
    $("#btn-search2")?.addEventListener("click", () => CS.openSearch());
    // view-specific
    if (view === "messages") window.CSChat?.mount($("#chat-mount"));
    if (view === "settings") wireSettings();
    // re-run counters/reveal for new content
    document.querySelectorAll("#view [data-count]").forEach(el => {
      const end = +el.dataset.count; const t0 = performance.now();
      (function f(t){const p=Math.min(1,(t-t0)/1200);el.textContent=Math.floor(end*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(f);})(t0);
    });
  }

  function wireSettings() {
    $("#set-save")?.addEventListener("click", () => {
      const me = CS.users.me();
      me.username = $("#set-user").value.trim() || me.username;
      me.bio = $("#set-bio").value;
      CS.users.save(me);
      CS.toast({ type: "ok", title: "Profile saved" });
    });
    $("#set-accent")?.addEventListener("click", () => CS.theme.cycleAccent());
    $("#set-mode")?.addEventListener("change", e => CS.theme.setMode(e.target.value));
    $("#set-logout")?.addEventListener("click", () => { CS.auth.signOut(); location.href = "index.html"; });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("dash-root")) return;
    (async () => {
      await CS.ready?.(); // wait for Supabase session restore before the auth gate
      const view = (location.hash || "#overview").slice(1);
      mount(VIEWS[view] ? view : "overview");
      addEventListener("hashchange", () => { const v = (location.hash || "#overview").slice(1); mount(VIEWS[v] ? v : "overview"); });
    })();
  });
})();
