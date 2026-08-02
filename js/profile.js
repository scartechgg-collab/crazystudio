/* ============================================================
   CrazyStudio — Public profile (/user/username or ?u=name)
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);

  function resolveUsername() {
    const params = new URLSearchParams(location.search);
    let u = params.get("u");
    if (!u) {
      const parts = location.pathname.split("/").filter(Boolean);
      if (parts[0] === "user" && parts[1]) u = parts[1];
    }
    return u;
  }

  function social(name) {
    const map = { discord: CS.icon("discord"), github: CS.icon("github"), web: CS.icon("code") };
    return map[name] || "";
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const root = $("#profile-root"); if (!root) return;
    await CS.ready?.(); // let live profiles load first
    const name = resolveUsername();
    const me = CS.users.me();
    const u = (name && CS.users.byName(name)) || me || CS.users.all()[0];
    if (!u) { root.innerHTML = `<div class="wrap section center"><h2>User not found</h2></div>`; return; }

    const isMe = me && me.id === u.id;
    const initials = u.username[0].toUpperCase();

    root.innerHTML = `
    <div class="wrap" style="padding-top:calc(var(--hdr-h) + 30px)">
      <div class="profile-banner"></div>
      <div class="profile-head">
        <div class="profile-av">${initials}<span class="st" style="background:${u.status==='online'?'var(--ok)':u.status==='away'?'var(--warn)':'var(--muted-2)'}"></span></div>
        <div style="flex:1;min-width:200px;padding-bottom:14px">
          <div class="row" style="gap:10px"><h2 style="color:#fff;font-size:28px">${u.username}</h2><span class="badge-role ${u.role}">${u.role}</span><span class="pill ${u.status==='online'?'on':'off'}">${u.status}</span>${(u.badges||[]).map(b=>`<span class="pill">✦ ${b}</span>`).join("")}</div>
          <p class="muted" style="margin-top:6px">${u.bio || "No bio yet."}</p>
        </div>
        <div class="row" style="padding-bottom:14px">
          ${isMe ? `<a class="btn btn-ghost btn-sm" href="dashboard.html#settings">Edit profile</a>` : `<button class="btn btn-primary btn-sm" id="follow-btn">Follow</button><button class="btn btn-ghost btn-sm" id="msg-btn">Message</button>`}
        </div>
      </div>

      <div class="grid" style="grid-template-columns:260px 1fr;gap:24px;margin-top:30px">
        <aside class="stack">
          <div class="card"><div class="between"><span class="muted">Followers</span><b style="color:#fff;font-family:var(--font-d);font-size:20px">${u.followers||0}</b></div>
            <div class="between" style="margin-top:10px"><span class="muted">Following</span><b style="color:#fff;font-family:var(--font-d);font-size:20px">${u.following||0}</b></div>
            <div class="between" style="margin-top:10px"><span class="muted">Projects</span><b style="color:#fff;font-family:var(--font-d);font-size:20">${(u.projects||3)}</b></div>
            <div class="between" style="margin-top:10px"><span class="muted">Joined</span><span style="color:#fff;font-family:var(--font-m);font-size:12px">${u.joined}</span></div></div>
          <div class="card"><h4 style="color:#fff;font-size:14px;margin-bottom:10px">Links</h4>
            <div class="stack-sm">
              <a class="row" style="gap:10px;color:var(--muted)" href="${CS_CONFIG.DISCORD_INVITE}">${social('discord')} Discord</a>
              <a class="row" style="gap:10px;color:var(--muted)" href="${CS_CONFIG.GITHUB}">${social('github')} GitHub</a>
              <a class="row" style="gap:10px;color:var(--muted)" href="#">${social('web')} Website</a>
            </div></div>
        </aside>
        <section class="stack">
          <div class="panel"><div class="ph"><h3>Projects</h3></div><div class="pb grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
            ${["Nexus Network","Aurora Bot","Orbit Dashboard"].map(n=>`<div class="card hover"><div style="aspect-ratio:16/10;border-radius:12px;background:radial-gradient(circle at 30% 20%,rgba(var(--glow-r),var(--glow-g),var(--glow-b),.3),#0a0c10 70%);margin-bottom:12px"></div><h4 style="color:#fff;font-size:15px">${n}</h4><p class="muted" style="font-size:12px;margin-top:4px">by ${u.username}</p></div>`).join("")}
          </div></div>
          <div class="panel"><div class="ph"><h3>Activity</h3></div><div class="pb timeline">
            <div class="tl-item"><div class="yr">2 DAYS AGO</div><h4>Shipped v2.4</h4><p>Released Forge Core update.</p></div>
            <div class="tl-item"><div class="yr">1 WEEK AGO</div><h4>Joined project</h4><p>Started work on Orbit Dashboard.</p></div>
            <div class="tl-item"><div class="yr">3 WEEKS AGO</div><h4>Earned badge</h4><p>Received the “Mentor” badge.</p></div>
          </div></div>
        </section>
      </div>
    </div>`;

    const fb = $("#follow-btn"); let following = false;
    fb?.addEventListener("click", async () => {
      fb.disabled = true;
      try {
        const me = CS.users.me();
        if (!me) { location.href = "login.html"; return; }
        const r = await CS.data.followToggle(u.id);
        following = r.following;
        fb.textContent = following ? "Following" : "Follow";
        fb.classList.toggle("btn-ghost", following); fb.classList.toggle("btn-primary", !following);
        CS.toast({ type: following ? "ok" : "info", title: following ? "Followed " + u.username : "Unfollowed" });
      } catch (e) { CS.toast({ type: "bad", title: "Follow failed", text: e.message }); }
      fb.disabled = false;
    });
    $("#msg-btn")?.addEventListener("click", () => { location.href = "dashboard.html#messages"; });
  });
})();
