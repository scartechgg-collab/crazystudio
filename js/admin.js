/* ============================================================
   CrazyStudio — Admin dashboard
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const I = (n) => CS.icon(n);

  function requireAdmin() {
    const me = CS.users?.me();
    if (!me) { location.href = "admin-login.html"; return null; }
    // in mock, any logged user can view; in real, check role
    if (!CS.isMock && me.role !== "admin" && me.role !== "owner") { location.href = "index.html"; return null; }
    return me;
  }

  const VIEWS = {
    dashboard: vDash, analytics: vAnalytics, users: vUsers, developers: () => vFiltered("developer"),
    staff: () => vFiltered("staff"), clients: () => vFiltered("client"), roles: vRoles,
    projects: vProjects, orders: vOrders, portfolio: vPortfolio, services: vServices,
    messages: vMessages, reports: vReports, notifications: vNotifs, announcements: vAnn,
    website: vWebsite, media: vMedia, security: vSecurity, database: vDB, settings: vSettings
  };

  function side(active) {
    const groups = [
      ["Overview", [["dashboard","grid","Dashboard"],["analytics","chart","Analytics"]]],
      ["People", [["users","users","Users"],["developers","code","Developers"],["staff","shield","Staff"],["clients","user","Clients"],["roles","lock","Roles & Permissions"]]],
      ["Content", [["projects","cube","Projects"],["orders","bolt","Orders"],["portfolio","grid","Portfolio"],["services","cog","Services"]]],
      ["Comms", [["messages","chat","Messages / Logs"],["reports","bell","Reports"],["notifications","bell","Notifications"],["announcements","bell","Announcements"]]],
      ["System", [["website","palette","Website Settings"],["media","grid","Media Library"],["security","shield","Security"],["database","cloud","Database / Backups"],["settings","cog","Settings"]]]
    ];
    return `<aside class="side" id="side">
      <a class="brand" href="index.html"><span class="mark">${CS.MARK("ad")}</span>${CS.WORD()}</a>
      <div style="padding:6px 12px;margin-bottom:6px"><span class="badge-role admin">ADMIN PANEL</span></div>
      ${groups.map(([g, items]) => `<div class="sgrp">${g}</div>` + items.map(([k,ic,l]) => `<a href="#${k}" data-view="${k}" class="${k===active?"active":""}">${I(ic)}${l}</a>`).join("")).join("")}
      <div class="spacer"></div>
      <a href="dashboard.html">${I("grid")}Client view</a>
      <a href="#" id="logout">${I("logout")}Logout</a>
    </aside>`;
  }

  function topbar(me, title) {
    return `<div class="topbar"><div style="display:flex;align-items:center;gap:14px">
        <button class="iconbtn burger" id="side-toggle">${I("menu")}</button>
        <div><h1>${title}</h1><span class="muted" style="font-size:13px">Administrator console</span></div>
      </div>
      <div class="row"><span class="badge-role ${me.role}">${me.role}</span><a class="hdr-avatar" href="profile.html?u=${me.username}">${me.username[0].toUpperCase()}</a></div>
    </div>`;
  }

  function vDash() {
    const u = CS.users.all();
    return `<div class="stat-grid">
      <div class="stat"><div class="l">Total users</div><div class="v" data-count="${u.length}">0</div><div class="d">+${u.length} all time</div></div>
      <div class="stat"><div class="l">Active now</div><div class="v" data-count="${u.filter(x=>x.status==='online').length}">0</div><div class="d">realtime</div></div>
      <div class="stat"><div class="l">Open orders</div><div class="v" data-count="14">0</div><div class="d">+4 today</div></div>
      <div class="stat"><div class="l">Revenue (mo)</div><div class="v" data-count="28400" data-pre="$">0</div><div class="d">+18%</div></div>
    </div>
    <div class="grid" style="grid-template-columns:2fr 1fr">
      <div class="panel"><div class="ph"><h3>System health</h3><span class="pill on">all systems go</span></div><div class="pb">
        <div class="stack">${[["API latency","42ms",90],["DB load","31%",31],["CDN cache","98%",98],["Realtime","live",75]].map(r=>`<div><div class="between" style="font-size:13px"><span class="muted">${r[0]}</span><span style="color:#fff">${r[1]}</span></div><div style="height:6px;background:var(--panel-2);border-radius:6px;margin-top:6px;overflow:hidden"><div style="height:100%;width:${r[2]}%;background:linear-gradient(90deg,var(--glow),#fff)"></div></div></div>`).join("")}</div>
      </div></div>
      <div class="panel"><div class="ph"><h3>Modes</h3></div><div class="pb stack" id="modes-box">
        ${["winter","christmas","halloween","maintenance"].map(m=>`<div class="between"><span style="text-transform:capitalize">${m}</span><label class="chk"><input type="checkbox" data-mode="${m}" ${document.body.classList.contains(m)?"checked":""}></label></div>`).join("")}
      </div></div>
    </div>`;
  }

  function vAnalytics() {
    const bars = [30,52,40,68,72,60,85,90,78,95,88,100];
    return `<div class="panel"><div class="ph"><h3>Visitors — last 12 weeks</h3><span class="pill on">+24%</span></div><div class="pb">
      <div style="display:flex;gap:8px;align-items:flex-end;height:220px">${bars.map(b=>`<div style="flex:1;background:linear-gradient(180deg,var(--glow),rgba(255,255,255,.05));border-radius:6px 6px 0 0;height:${b}%;position:relative"><span style="position:absolute;top:-20px;left:0;right:0;text-align:center;font-size:10px;color:var(--muted);font-family:var(--font-m)">${b*12}</span></div>`).join("")}</div>
    </div></div>`;
  }

  function userCard(u) {
    return `<div class="ucard" data-user="${u.id}">
      <div class="top"><div class="av">${u.username[0].toUpperCase()}<span class="st" style="background:${u.status==='online'?'var(--ok)':u.status==='away'?'var(--warn)':'var(--muted-2)'}"></span></div>
        <div><h5>${u.username}</h5><div class="em">${u.email}</div></div></div>
      <div class="meta"><span class="badge-role ${u.role}">${u.role}</span><span class="muted" style="font-size:11px">${u.joined}</span></div>
    </div>`;
  }

  function vUsers() {
    return `<div class="between" style="margin-bottom:18px"><input class="input" id="user-search" placeholder="Search users…" style="max-width:320px">
      <div class="row"><button class="btn btn-ghost btn-sm" id="export-users">Export CSV</button></div></div>
      <div class="ucards" id="user-cards">${CS.users.all().map(userCard).join("")}</div>`;
  }
  function vFiltered(role) { return `<div class="ucards">${CS.users.all().filter(u=>u.role===role).map(userCard).join("") || '<p class="muted">No users with this role.</p>'}</div>`; }

  function vRoles() {
    const roles = [["owner","Full control"],["admin","Manage users & content"],["developer","Access dev tools"],["staff","Support & moderation"],["client","Customer access"]];
    return `<div class="grid">${roles.map(r=>`<div class="card hover"><div class="between"><span class="badge-role ${r[0]}">${r[0]}</span><button class="btn btn-sm btn-ghost">Edit</button></div><p class="muted" style="font-size:13px;margin-top:10px">${r[1]}</p></div>`).join("")}</div>`;
  }

  function vProjects() {
    const p=[["Nexus Network","Minecraft","in-progress"],["Aurora Bot","Discord","delivered"],["Orbit Dash","Web","in-progress"],["Pulse","Mobile","design"]];
    return `<div class="panel"><div class="ph"><h3>All projects</h3><button class="btn btn-sm btn-primary">+ New</button></div><div class="pb" style="overflow:auto"><table class="tbl"><thead><tr><th>Name</th><th>Category</th><th>Status</th><th></th></tr></thead><tbody>${p.map(r=>`<tr><td style="color:#fff">${r[0]}</td><td>${r[1]}</td><td><span class="pill ${r[2]==='delivered'?'on':''}">${r[2]}</span></td><td><button class="btn btn-sm btn-ghost">Manage</button></td></tr>`).join("")}</tbody></table></div></div>`;
  }
  function vOrders(){return vProjects();}
  function vPortfolio(){return `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${["Nexus","Aurora","Orbit","Pulse","Forge","Halo"].map(n=>`<div class="card hover"><div style="aspect-ratio:16/10;border-radius:12px;background:radial-gradient(circle at 30% 20%,rgba(var(--glow-r),var(--glow-g),var(--glow-b),.3),#0a0c10 70%);margin-bottom:12px"></div><h4 style="color:#fff">${n}</h4><div class="row" style="margin-top:10px"><button class="btn btn-sm btn-ghost">Edit</button><button class="btn btn-sm btn-ghost">Hide</button></div></div>`).join("")}</div>`;}
  function vServices(){return `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${["Web","Minecraft","Discord","Mobile","Automation","Design"].map(n=>`<div class="card hover"><h4 style="color:#fff">${n}</h4><label class="chk" style="margin-top:10px"><input type="checkbox" checked> Visible on site</label><button class="btn btn-sm btn-ghost" style="margin-top:12px">Edit details</button></div>`).join("")}</div>`;}
  function vMessages(){return `<div id="chat-mount"></div>`;}
  function vReports(){return `<div class="panel"><div class="ph"><h3>Reports</h3></div><div class="pb"><p class="muted">No open reports.</p></div></div>`;}
  function vNotifs(){return `<div class="panel"><div class="ph"><h3>Push a notification</h3></div><div class="pb form"><div class="field"><label>Message</label><input class="input" id="push-text" placeholder="Announce something…"></div><button class="btn btn-primary" id="push-btn">Send to all</button></div></div>`;}
  function vAnn(){return vNotifs();}

  function vWebsite() {
    const s = CS.settings.get();
    return `<div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="panel"><div class="ph"><h3>Branding</h3></div><div class="pb form">
        <div class="field"><label>Logo URL</label><input class="input" placeholder="https://…/logo.svg"></div>
        <div class="field"><label>Homepage banner</label><input class="input" placeholder="https://…/banner.jpg"></div>
        <div class="field"><label>Announcement banner</label><input class="input" id="ann-text" placeholder="Black Friday — 30% off"></div>
        <button class="btn btn-primary" onclick="CS.toast({type:'ok',title:'Branding saved'})">Save branding</button>
      </div></div>
      <div class="panel"><div class="ph"><h3>Experience</h3></div><div class="pb stack">
        ${["winter","christmas","halloween","maintenance"].map(m=>`<div class="between"><span style="text-transform:capitalize">${m} mode</span><label class="chk"><input type="checkbox" data-mode="${m}" ${document.body.classList.contains(m)?"checked":""}></label></div>`).join("")}
        <div class="between"><span>Accent</span><button class="btn btn-sm btn-ghost" onclick="CS.theme.cycleAccent()">Cycle</button></div>
      </div></div>
      <div class="panel" style="grid-column:1/-1"><div class="ph"><h3>SEO & Meta</h3></div><div class="pb form" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Meta title</label><input class="input" value="CrazyStudio — Develop • Design • Deploy"></div>
        <div class="field"><label>Meta description</label><input class="input" value="${CS_CONFIG.META.description}"></div>
        <div class="field"><label>Keywords</label><input class="input" value="${CS_CONFIG.META.keywords}"></div>
        <div class="field"><label>Favicon URL</label><input class="input" placeholder="/favicon.svg"></div>
      </div></div>
    </div>`;
  }

  function vMedia(){return `<div class="panel"><div class="ph"><h3>Media library</h3><button class="btn btn-sm btn-primary">+ Upload</button></div><div class="pb grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">${Array.from({length:8}).map((_,i)=>`<div style="aspect-ratio:1;border-radius:12px;background:linear-gradient(${i*40}deg,#14171d,#0a0c10);border:1px solid var(--line);display:grid;place-items:center;color:var(--muted-2);font-family:var(--font-m);font-size:11px">img-${i+1}</div>`).join("")}</div></div>`;}
  function vSecurity(){return `<div class="grid" style="grid-template-columns:1fr 1fr"><div class="panel"><div class="ph"><h3>Rate limiting</h3></div><div class="pb stack"><div class="between"><span>Login attempts / min</span><input class="input" value="5" style="max-width:80px"></div><div class="between"><span>2FA required for admins</span><label class="chk"><input type="checkbox" checked></label></div></div></div><div class="panel"><div class="ph"><h3>Audit log</h3></div><div class="pb" style="font-family:var(--font-m);font-size:12px;color:var(--muted)"><div>12:04 · admin signed in</div><div>12:01 · mode → winter</div><div>11:58 · user kairo role → admin</div></div></div></div>`;}
  function vDB(){return `<div class="grid" style="grid-template-columns:1fr 1fr 1fr"><div class="card hover"><h4 style="color:#fff">Backup now</h4><p class="muted" style="font-size:13px;margin-top:6px">Snapshot the full database.</p><button class="btn btn-sm btn-primary" style="margin-top:14px" onclick="CS.toast({type:'ok',title:'Backup started'})">Run backup</button></div><div class="card hover"><h4 style="color:#fff">Last backup</h4><p class="muted" style="font-size:13px;margin-top:6px">2 hours ago · 14.2 MB</p></div><div class="card hover"><h4 style="color:#fff">Schema</h4><p class="muted" style="font-size:13px;margin-top:6px">See schema.sql in repo.</p></div></div>`;}
  function vSettings(){return vWebsite();}

  function openUserModal(u) {
    CS.modal(`<div style="text-align:center"><div class="av" style="width:72px;height:72px;border-radius:18px;margin:0 auto;display:grid;place-items:center;font-family:var(--font-d);font-weight:700;font-size:26px;background:linear-gradient(160deg,#1a1e26,#0c0f15);border:1px solid var(--line)">${u.username[0].toUpperCase()}</div>
      <h3 style="color:#fff;margin-top:12px">${u.username}</h3><p class="muted" style="font-size:13px">${u.email}</p>
      <div class="row" style="justify-content:center;margin-top:10px"><span class="badge-role ${u.role}">${u.role}</span><span class="pill ${u.status==='online'?'on':'off'}">${u.status}</span></div></div>
      <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:20px;gap:8px">
        <button class="btn btn-sm btn-ghost" onclick="CS.adminAct('role','${u.id}')">Change role</button>
        <button class="btn btn-sm btn-ghost" onclick="CS.adminAct('badge','${u.id}')">Give badge</button>
        <button class="btn btn-sm btn-ghost" onclick="CS.adminAct('reset','${u.id}')">Reset password</button>
        <button class="btn btn-sm btn-ghost" onclick="CS.adminAct('notify','${u.id}')">Send notif</button>
        <button class="btn btn-sm btn-ghost" onclick="CS.adminAct('suspend','${u.id}')">Suspend</button>
        <button class="btn btn-sm btn-ghost" onclick="CS.adminAct('kick','${u.id}')">Kick</button>
        <button class="btn btn-sm btn-ghost" style="color:var(--bad)" onclick="CS.adminAct('ban','${u.id}')">Ban</button>
        <button class="btn btn-sm btn-ghost" style="color:var(--bad)" onclick="CS.adminAct('delete','${u.id}')">Delete</button>
      </div>
      <a class="btn btn-primary btn-block" style="margin-top:14px" href="profile.html?u=${u.username}">Open public profile</a>`);
  }

  CS.adminAct = function (act, id) {
    const u = CS.users.get(id); if (!u) return;
    if (act === "role") { const roles = ["client","staff","developer","admin","owner"]; u.role = roles[(roles.indexOf(u.role)+1)%roles.length]; CS.users.save(u); CS.toast({type:"ok",title:`${u.username} → ${u.role}`}); }
    else if (act === "badge") { u.badges = u.badges || []; u.badges.push("star"); CS.users.save(u); CS.toast({type:"ok",title:"Badge granted"}); }
    else if (act === "notify") { CS.notifs.push({type:"system",text:`Admin message to ${u.username}`}); CS.toast({type:"ok",title:"Notification sent"}); }
    else if (act === "ban" || act === "suspend" || act === "kick") { u.status = "offline"; CS.users.save(u); CS.toast({type:"warn",title:act+" applied"}); }
    else if (act === "delete") { const arr = CS.users.all().filter(x=>x.id!==id); CS.ls.set("users",arr); CS.toast({type:"bad",title:"User deleted"}); }
    else if (act === "reset") { CS.toast({type:"ok",title:"Password reset email sent"}); }
    CS.closeModal();
    const vc = $("#user-cards"); if (vc) vc.innerHTML = CS.users.all().map(userCard).join("");
  };

  function wire(root, view) {
    $$("#side a[data-view]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); location.hash = a.dataset.view; }));
    $("#logout").onclick = (e) => { e.preventDefault(); CS.auth.signOut(); location.href = "index.html"; };
    $("#side-toggle")?.addEventListener("click", () => $("#side").classList.toggle("open"));
    // user search + cards
    const us = $("#user-search"); if (us) us.addEventListener("input", e => { const q = e.target.value.toLowerCase(); $("#user-cards").innerHTML = CS.users.all().filter(u => (u.username+u.email+u.role).toLowerCase().includes(q)).map(userCard).join(""); bindCards(); });
    bindCards();
    $("#export-users")?.addEventListener("click", () => { const rows = [["username","email","role","joined"],...CS.users.all().map(u=>[u.username,u.email,u.role,u.joined])]; const csv = rows.map(r=>r.join(",")).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv])); a.download = "users.csv"; a.click(); CS.toast({type:"ok",title:"Exported"}); });
    // modes
    root.querySelectorAll("[data-mode]").forEach(c => c.addEventListener("change", e => { const m = e.target.dataset.mode; if (m === "maintenance") CS.theme.setMaintenance(e.target.checked); else CS.theme.setMode(e.target.checked ? m : "default"); }));
    // push notif — to everyone when live, to self in demo
    $("#push-btn")?.addEventListener("click", async () => {
      const t = $("#push-text").value.trim(); if (!t) return;
      if (!CS.isMock && CS.data?.pushNotifTo) {
        try { await Promise.all(CS.users.all().map(u => CS.data.pushNotifTo(u.id, t, "admin"))); } catch {}
      } else CS.notifs.push({ type: "system", text: t });
      $("#push-text").value = "";
      CS.toast({ type: "ok", title: "Pushed to all users" });
    });
    if (view === "messages") window.CSChat?.mount($("#chat-mount"));
  }

  function bindCards() { document.querySelectorAll(".ucard[data-user]").forEach(c => c.onclick = () => openUserModal(CS.users.get(c.dataset.user))); }

  function mount(view) {
    const me = requireAdmin(); if (!me) return;
    const root = $("#admin-root"); if (!root) return;
    const title = view[0].toUpperCase()+view.slice(1);
    root.innerHTML = side(view) + `<main class="main">${topbar(me,title)}<div id="view"></div></main>`;
    $("#view").innerHTML = (VIEWS[view]||vDash)();
    wire(root, view);
    document.querySelectorAll("#view [data-count]").forEach(el=>{const end=+el.dataset.count,pre=el.dataset.pre||"";const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/1200);el.textContent=pre+Math.floor(end*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(f);})(t0);});
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("admin-root")) return;
    (async () => {
      await CS.ready?.(); // wait for Supabase session restore before the admin gate
      const v = (location.hash||"#dashboard").slice(1);
      mount(VIEWS[v]?v:"dashboard");
      addEventListener("hashchange", () => { const v = (location.hash||"#dashboard").slice(1); mount(VIEWS[v]?v:"dashboard"); });
      // live re-render of user cards when profiles change
      addEventListener("cs:profiles", () => { const vc = $("#user-cards"); if (vc) vc.innerHTML = CS.users.all().map(userCard).join(""); });
    })();
  });
})();
