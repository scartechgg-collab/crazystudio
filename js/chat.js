/* ============================================================
   CrazyStudio — Realtime chat (Supabase-backed when live)
   1:1 conversations · seen status · presence · emoji
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const I = (n) => CS.icon(n);
  const state = { peer: null, subbed: false };

  const peers = () => { const me = CS.users.me(); return CS.users.all().filter(u => u.id !== me?.id); };
  const esc = (s) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  async function render(peerId) {
    const me = CS.users.me(); const peer = CS.users.get(peerId); if (!peer) return;
    document.querySelectorAll(".chat-list .ci").forEach(c => c.classList.toggle("active", c.dataset.peer === peerId));
    const head = $(".chat-head", document); const body = $(".chat-body", document);
    if (!head || !body) return;
    head.innerHTML = `<div class="av" style="width:36px;height:36px;border-radius:10px;background:#14171d;display:grid;place-items:center;font-family:var(--font-d);font-weight:700">${peer.username[0].toUpperCase()}</div>
      <div><b style="color:#fff">${peer.username}</b><div style="font-size:11px;color:${peer.status === "online" ? "var(--ok)" : "var(--muted)"}">● ${peer.status}</div></div>`;
    const msgs = await CS.data.messagesList(peerId);
    body.innerHTML = msgs.map(m => `<div class="msg ${m.from === me.id ? "me" : "them"}">${esc(m.text)}<span class="t">${new Date(m.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${m.seen && m.from === me.id ? " · seen" : ""}</span></div>`).join("")
      || `<div class="muted" style="text-align:center;margin:auto">Start the conversation with ${peer.username}.</div>`;
    body.scrollTop = body.scrollHeight;
  }

  async function send(peerId) {
    const input = $("#chat-input"); const text = input.value.trim(); if (!text) return;
    input.value = "";
    try {
      await CS.data.messageSend(peerId, text);
      await render(peerId);
    } catch (e) { CS.toast({ type: "bad", title: "Message failed", text: e.message }); }
  }

  async function mount(root) {
    if (!root) return;
    await CS.ready?.();
    const me = CS.users.me();
    if (!me) { root.innerHTML = `<div class="card"><h4 style="color:#fff">Sign in to message</h4><p class="muted" style="margin-top:6px;font-size:13px">Your conversations live here once you're signed in.</p><a class="btn btn-primary btn-sm" style="margin-top:12px" href="login.html">Sign in</a></div>`; return; }
    let ps = peers();
    if (!ps.length) { // nobody else yet
      root.innerHTML = `<div class="card"><h4 style="color:#fff">No members yet</h4><p class="muted" style="margin-top:6px;font-size:13px">Invite people from the community page.</p></div>`;
      addEventListener("cs:profiles", () => { if (peers().length) mount(root); }, { once: true });
      return;
    }
    state.peer = state.peer && ps.find(p => p.id === state.peer) ? state.peer : ps[0].id;
    root.innerHTML = `<div class="chat-shell">
      <div class="chat-list">
        <div style="padding:14px 16px;border-bottom:1px solid var(--line);font-family:var(--font-m);font-size:11px;letter-spacing:.2em;color:var(--muted-2)">CONVERSATIONS</div>
        ${ps.map(p => `<div class="ci" data-peer="${p.id}"><div class="av">${p.username[0].toUpperCase()}<span class="st ${p.status === "online" ? "on" : ""}"></span></div><div style="min-width:0"><div style="color:#fff;font-size:13px;font-weight:600">${p.username}</div><div style="color:var(--muted);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.role}</div></div></div>`).join("")}
      </div>
      <div class="chat-main">
        <div class="chat-head"></div>
        <div class="chat-body"></div>
        <div class="chat-input">
          <button class="iconbtn" title="Emoji" id="emoji-btn">☺</button>
          <input class="input" id="chat-input" placeholder="Type a message… (Enter to send)">
          <button class="iconbtn" title="Attach" id="attach-btn">+</button>
          <button class="btn btn-primary" id="send-btn">${I("arrow")}</button>
        </div>
      </div>
    </div>`;
    root.querySelectorAll(".ci").forEach(c => c.addEventListener("click", () => { state.peer = c.dataset.peer; render(state.peer); }));
    const input = $("#chat-input", root);
    input.addEventListener("keydown", e => { if (e.key === "Enter") send(state.peer); });
    $("#send-btn", root).addEventListener("click", () => send(state.peer));
    $("#emoji-btn", root).addEventListener("click", () => { input.value += ["✦","👍","🔥","✨","🚀"][Math.floor(Math.random() * 5)]; input.focus(); });
    $("#attach-btn", root).addEventListener("click", () => CS.toast({ type: "info", title: "Attachments", text: "Uploads via Supabase Storage — see SETUP.txt" }));
    await render(state.peer);
    if (!state.subbed) { state.subbed = true; CS.data.onMessages(() => { if (state.peer) render(state.peer); }); }
    addEventListener("cs:profiles", () => { if (state.peer) render(state.peer); });
  }

  window.CSChat = { mount };
})();
