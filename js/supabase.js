/* ============================================================
   CrazyStudio — Supabase data layer (live) + offline mock
   - Auth (email/password + OAuth Google/Discord)
   - Profiles, follows, messages, notifications (realtime)
   - Site settings sync (modes / branding)
   - Duplicate email / username prevention
   - Mock fallback keeps UI alive when Supabase is unreachable
   ============================================================ */
(function () {
  const CFG = window.CS_CONFIG;
  window.CS = window.CS || {};

  /* ---------- tiny local cache helper ---------- */
  const LS = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("cs_" + k)) ?? d; } catch { return d; } },
    set(k, v) { localStorage.setItem("cs_" + k, JSON.stringify(v)); },
    del(k) { localStorage.removeItem("cs_" + k); }
  };
  CS.ls = LS;

  /* ---------- shared state ---------- */
  const state = {
    client: null,
    session: null,
    profile: null,          // current user's profile row
    profiles: [],           // cached profile list (realtime-synced)
    notifs: [],
    authListeners: [],
    notifChannel: null,
    profileChannel: null,
    ready: false
  };

  const toUser = (p) => p && ({
    id: p.id, username: p.username, email: p.email, role: p.role, status: p.status || "offline",
    bio: p.bio || "", avatar: p.avatar_url || "", banner: p.banner_url || "", website: p.website || "",
    discord: p.discord || "", github: p.github || "", badges: p.badges || [],
    followers: p.followers || 0, following: p.following || 0, projects: p.projects || 0,
    joined: (p.joined_at || p.created_at || "").slice(0, 10), suspended: !!p.suspended, banned: !!p.banned
  });

  /* ================= MOCK (offline) ================= */
  function seedMock() {
    if (LS.get("seeded_mock")) return;
    const users = [
      { id: "u1", username: "nova",   email: "team@crazystudio.fun",  role: "owner",     status: "online",  joined: "2023-01-12", bio: "Founder & lead architect.", badges: ["founder","verified"], followers: 1284, following: 42, projects: 18 },
      { id: "u2", username: "kairo",  email: "kairo@crazystudio.fun", role: "admin",     status: "online",  joined: "2023-04-02", bio: "Ops & infrastructure.",     badges: ["verified"], followers: 612, following: 88, projects: 11 },
      { id: "u3", username: "zephyr", email: "zeph@crazystudio.fun",  role: "developer", status: "online",  joined: "2023-06-19", bio: "Full-stack & Minecraft core.", badges: ["dev"], followers: 430, following: 120, projects: 14 },
      { id: "u4", username: "lyra",   email: "lyra@crazystudio.fun",  role: "developer", status: "away",    joined: "2023-09-30", bio: "Design systems & UI.",       badges: ["designer"], followers: 388, following: 95, projects: 9 },
      { id: "u5", username: "orion",  email: "orion@client.io",       role: "client",    status: "offline", joined: "2024-02-14", bio: "Running a Minecraft network.", badges: [], followers: 22, following: 7, projects: 2 },
      { id: "u6", username: "echo",   email: "echo@crazystudio.fun",  role: "staff",     status: "online",  joined: "2024-05-21", bio: "Community & support.",       badges: ["mod"], followers: 140, following: 60, projects: 4 }
    ];
    LS.set("users", users);
    LS.set("session", null);
    LS.set("notifications", [
      { id: "n1", type: "follow",  text: "kairo started following you", t: Date.now() - 120000, read: false },
      { id: "n2", type: "message", text: "zephyr: pushed the new build", t: Date.now() - 3600000, read: false },
      { id: "n3", type: "system",  text: "Welcome to CrazyStudio ✦",     t: Date.now() - 86400000, read: true }
    ]);
    LS.set("settings", { theme: "dark", mode: "default", accent: "blue" });
    LS.set("seeded_mock", true);
  }

  const MockAPI = (() => {
    seedMock();
    const listeners = [];
    const users = {
      all:    () => LS.get("users", []),
      get:    (id) => LS.get("users", []).find(u => u.id === id || u.username === id),
      byName: (n) => LS.get("users", []).find(u => u.username === n),
      save:   (u) => { const a = LS.get("users", []); const i = a.findIndex(x => x.id === u.id); if (i >= 0) a[i] = u; LS.set("users", a); window.dispatchEvent(new CustomEvent("cs:profiles")); },
      me:     () => { const s = LS.get("session"); return s ? users.get(s.id) : null; }
    };
    const auth = {
      currentUser: () => users.me(),
      async signUp({ email, password, username }) {
        const all = users.all();
        if (all.find(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already registered");
        if (all.find(u => u.username.toLowerCase() === username.toLowerCase())) throw new Error("Username already taken");
        const u = { id: "u" + Date.now(), username, email, role: "client", status: "online", joined: new Date().toISOString().slice(0, 10), bio: "", badges: [], followers: 0, following: 0, projects: 0 };
        all.push(u); LS.set("users", all);
        // email confirmation simulation: do NOT auto-session when confirm required
        const needsConfirm = !!CFG.REQUIRE_EMAIL_CONFIRM;
        if (!needsConfirm) { LS.set("session", { id: u.id }); listeners.forEach(fn => fn({ event: "SIGNED_IN", user: u })); }
        return { user: u, needsConfirm };
      },
      async signIn({ email }) {
        const u = users.all().find(x => x.email.toLowerCase() === email.toLowerCase());
        if (!u) throw new Error("Invalid credentials");
        if (u.banned) throw new Error("Account suspended");
        u.status = "online"; users.save(u);
        LS.set("session", { id: u.id });
        listeners.forEach(fn => fn({ event: "SIGNED_IN", user: u }));
        return { user: u };
      },
      async oauth(provider, email) {
        const em = email || `oauth_${provider}@crazystudio.fun`;
        let u = users.all().find(x => x.email.toLowerCase() === em.toLowerCase());
        let existed = !!u;
        if (!u) {
          u = { id: "u" + Date.now(), username: provider + "_user", email: em, role: "client", status: "online", joined: new Date().toISOString().slice(0, 10), bio: "", badges: [], followers: 0, following: 0, projects: 0 };
          const a = users.all(); a.push(u); LS.set("users", a);
        }
        u.status = "online"; users.save(u);
        return { user: u, existed };
      },
      async finalizeOAuth(u) { LS.set("session", { id: u.id }); listeners.forEach(fn => fn({ event: "SIGNED_IN", user: u })); },
      async signOut() { const me = users.me(); if (me) { me.status = "offline"; users.save(me); } LS.set("session", null); listeners.forEach(fn => fn({ event: "SIGNED_OUT" })); },
      async resetPassword() { return { ok: true }; },
      async resend() { return { ok: true }; },
      onAuthStateChange(fn) { listeners.push(fn); return { data: { subscription: { unsubscribe() {} } } }; },
      async getUser() { return { user: users.me() }; }
    };
    function msgKey(a, b) { return "msgs_" + [a, b].sort().join("_"); }
    const data = {
      async listProfiles() { return users.all(); },
      async upsertProfile(u) { users.save(u); return u; },
      async messagesList(peerId) { const me = users.me(); return LS.get(msgKey(me?.id, peerId), []); },
      async messageSend(peerId, text) {
        const me = users.me(); const k = msgKey(me?.id, peerId);
        const arr = LS.get(k, []); arr.push({ from: me?.id, to: peerId, text, t: Date.now(), seen: false });
        LS.set(k, arr);
        // simulated peer reply (demo)
        setTimeout(() => {
          const a2 = LS.get(k, []);
          for (let i = a2.length - 1; i >= 0; i--) if (a2[i].from === me?.id) { a2[i].seen = true; break; }
          a2.push({ from: peerId, to: me?.id, text: ["Got it 👍","On it!","Sounds good ✦","Let me check and get back to you.","Pushed to staging."][Math.floor(Math.random() * 5)], t: Date.now() });
          LS.set(k, a2);
          CS.notifs.push({ type: "message", text: (users.get(peerId)?.username || "Peer") + ": new message" });
          data._msgSubs.forEach(cb => cb());
        }, 1200 + Math.random() * 1400);
        return { ok: true };
      },
      _msgSubs: [],
      onMessages(cb) { this._msgSubs.push(cb); addEventListener("storage", e => { if (e.key?.startsWith("cs_msgs_")) cb(); }); },
      async followToggle(targetId) { const all = users.all(); const t = users.get(targetId); if (!t) return { following: false };
        t._following = !t._following; t._following ? t.followers++ : t.followers--; users.save(t); return { following: t._following }; },
      async siteSettingsGet() { return LS.get("settings", {}); },
      async siteSettingsSet(patch) { LS.set("settings", { ...LS.get("settings", {}), ...patch }); }
    };
    const notifs = {
      all: () => LS.get("notifications", []),
      save: (n) => LS.set("notifications", n),
      push: (n) => { const arr = LS.get("notifications", []); arr.unshift({ id: "n" + Date.now(), t: Date.now(), read: false, ...n }); LS.set("notifications", arr); window.dispatchEvent(new CustomEvent("cs:notif")); },
      clear: () => LS.set("notifications", [])
    };
    const settings = { get: () => LS.get("settings", { theme: "dark", mode: "default", accent: "blue" }), set: (s) => LS.set("settings", { ...LS.get("settings", {}), ...s }) };
    const storage = { from: () => ({ async upload(p, f) { return { data: { path: p, publicUrl: URL.createObjectURL(f) }, error: null }; }, getPublicUrl: (p) => ({ data: { publicUrl: "mock://" + p } }), async remove() { return { error: null }; } }) };
    return { users, auth, data, notifs, settings, storage };
  })();

  /* ================= LIVE (Supabase) ================= */
  function loadSDK() {
    return new Promise((res, rej) => {
      if (window.supabase) return res();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function emitAuth(payload) { state.authListeners.forEach(fn => { try { fn(payload); } catch {} }); window.dispatchEvent(new CustomEvent("cs:profiles")); }

  async function loadProfile(userId) {
    const { data } = await state.client.from("user_profiles").select("*").eq("id", userId).maybeSingle();
    state.profile = data ? toUser(data) : null;
    return state.profile;
  }

  async function refreshProfiles() {
    const { data } = await state.client.from("user_profiles").select("*").order("joined_at", { ascending: true }).limit(500);
    state.profiles = (data || []).map(toUser);
    window.dispatchEvent(new CustomEvent("cs:profiles"));
    return state.profiles;
  }

  async function pullNotifications() {
    if (!state.profile) { state.notifs = []; return []; }
    const { data } = await state.client.from("notifications").select("*").eq("user_id", state.profile.id).order("created_at", { ascending: false }).limit(50);
    state.notifs = (data || []).map(n => ({ id: n.id, type: n.type, text: n.text, read: n.read, t: new Date(n.created_at).getTime() }));
    window.dispatchEvent(new CustomEvent("cs:notif"));
    return state.notifs;
  }

  async function subscribeRealtime() {
    const c = state.client;
    // notifications for me
    if (state.notifChannel) c.removeChannel(state.notifChannel);
    if (state.profile) {
      state.notifChannel = c.channel("notif:" + state.profile.id)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${state.profile.id}` }, () => pullNotifications())
        .subscribe();
    }
    // profiles broadcast
    if (!state.profileChannel) {
      state.profileChannel = c.channel("profiles")
        .on("postgres_changes", { event: "*", schema: "public", table: "user_profiles" }, () => refreshProfiles())
        .subscribe();
    }
    // presence: mark online
    if (state.profile) {
      state.client.from("user_profiles").update({ status: "online" }).eq("id", state.profile.id);
      addEventListener("beforeunload", () => { try { navigator.sendBeacon; state.client.from("user_profiles").update({ status: "offline" }).eq("id", state.profile.id); } catch {} });
    }
  }

  async function syncRemoteSettings() {
    try {
      const { data } = await state.client.from("site_settings").select("key, value");
      if (!data) return;
      const get = (k) => data.find(r => r.key === k)?.value;
      const modes = get("modes") || {};
      const local = CS.settings.get();
      const active = ["winter","christmas","halloween"].find(m => modes[m]);
      CS.settings.set({ mode: active || "default", maintenance: !!modes.maintenance });
      const accent = get("accent"); if (typeof accent === "string" && accent) CS.settings.set({ accent });
      window.dispatchEvent(new CustomEvent("cs:settings"));
      // live updates
      state.client.channel("sitesettings").on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        (async () => {
          const { data } = await state.client.from("site_settings").select("key, value");
          const modes = (data || []).find(r => r.key === "modes")?.value || {};
          const active = ["winter","christmas","halloween"].find(m => modes[m]);
          CS.settings.set({ mode: active || "default", maintenance: !!modes.maintenance });
        })();
      }).subscribe();
    } catch (e) { console.warn("[CS] settings sync failed", e); }
  }

  async function bootLive() {
    await loadSDK();
    const client = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "cs-auth" }
    });
    state.client = client;
    CS.supabase = client;
    CS.isMock = false;

    const { data: { session } } = await client.auth.getSession();
    state.session = session;
    if (session?.user) await loadProfile(session.user.id);

    client.auth.onAuthStateChange(async (event, sess) => {
      state.session = sess;
      if (sess?.user) {
        const p = await loadProfile(sess.user.id);
        if (event === "SIGNED_IN") emitAuth({ event: "SIGNED_IN", user: p || toUser({ id: sess.user.id, username: sess.user.email.split("@")[0], email: sess.user.email, role: "client" }) });
        await subscribeRealtime();
      } else if (event === "SIGNED_OUT") { state.profile = null; emitAuth({ event: "SIGNED_OUT" }); }
    });

    CS.auth = {
      currentUser: () => state.profile,
      async getUser() { return { user: state.profile }; },
      onAuthStateChange(fn) { state.authListeners.push(fn); return { data: { subscription: { unsubscribe() {} } } }; },

      async signUp({ email, password, username }) {
        // duplicate prevention (email + username)
        const e = await client.from("user_profiles").select("id").ilike("email", email).maybeSingle();
        if (e.data) throw new Error("Email already registered");
        const u = await client.from("user_profiles").select("id").ilike("username", username).maybeSingle();
        if (u.data) throw new Error("Username already taken");
        const { data, error } = await client.auth.signUp({
          email, password,
          options: { data: { username }, emailRedirectTo: CFG.SITE_URL + "/login.html" }
        });
        if (error) {
          if (error.message?.toLowerCase().includes("already")) throw new Error("Email already registered");
          throw error;
        }
        const needsConfirm = !!data.user && !data.session;
        return { user: data.user, needsConfirm };
      },

      async signIn({ email, password }) {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "Invalid credentials" : error.message);
        const p = await loadProfile(data.user.id);
        if (p?.banned) { await client.auth.signOut(); throw new Error("Account suspended"); }
        return { user: p || { id: data.user.id, email } };
      },

      async signOut() { await client.auth.signOut(); state.profile = null; },
      async resetPassword({ email }) { return client.auth.resetPasswordForEmail(email, { redirectTo: CFG.SITE_URL + "/login.html" }); },
      async resend({ email }) { return client.auth.resend({ type: "signup", email, options: { emailRedirectTo: CFG.SITE_URL + "/login.html" } }); },

      oauthStart(provider, intent) {
        sessionStorage.setItem("cs_oauth_intent", intent || "login");
        return client.auth.signInWithOAuth({ provider, options: { redirectTo: CFG.OAUTH_REDIRECT } });
      },
      // after OAuth redirect: returns { profile, isNew }
      async resolveOAuth() {
        const { data: { session } } = await client.auth.getSession();
        if (!session?.user) return { profile: null, isNew: false };
        const created = new Date(session.user.created_at).getTime();
        const isNew = (Date.now() - created) < 90_000;
        let p = await loadProfile(session.user.id);
        if (!p) {
          const username = (session.user.user_metadata?.user_name || session.user.user_metadata?.name || session.user.email.split("@")[0]).replace(/\W+/g, "").slice(0, 20) || "user";
          await client.from("user_profiles").insert({ id: session.user.id, username: username.toLowerCase(), email: session.user.email, role: "client" }).then(() => {});
          p = await loadProfile(session.user.id);
        }
        return { profile: p, isNew };
      }
    };

    CS.users = {
      all:    () => state.profiles.length ? state.profiles : (state.profile ? [state.profile] : []),
      get:    (id) => state.profiles.find(u => u.id === id || u.username === id) || (state.profile && (state.profile.id === id || state.profile.username === id) ? state.profile : null),
      byName: (n) => CS.users.get(n),
      me:     () => state.profile,
      save:   async (u) => {
        await client.from("user_profiles").update({
          username: u.username, bio: u.bio, role: u.role, status: u.status, badges: u.badges,
          avatar_url: u.avatar, banner_url: u.banner, website: u.website, suspended: u.suspended, banned: u.banned
        }).eq("id", u.id);
        if (state.profile?.id === u.id) state.profile = { ...state.profile, ...u };
        await refreshProfiles();
      }
    };

    CS.notifs = {
      all: () => state.notifs,
      save: () => {},
      async push(n) {
        // demo: notify current user; admins loop targets separately if needed
        if (!state.profile) return;
        await client.from("notifications").insert({ user_id: state.profile.id, type: n.type || "system", text: n.text });
        await pullNotifications();
      },
      async clear() {
        if (!state.profile) return;
        await client.from("notifications").delete().eq("user_id", state.profile.id);
        state.notifs = [];
        window.dispatchEvent(new CustomEvent("cs:notif"));
      }
    };

    CS.data = {
      async listProfiles() { return refreshProfiles(); },
      async followToggle(targetId) {
        const me = state.profile; if (!me || me.id === targetId) return { following: false };
        const { data: ex } = await client.from("follows").select("*").eq("follower_id", me.id).eq("followee_id", targetId).maybeSingle();
        if (ex) { await client.from("follows").delete().eq("follower_id", me.id).eq("followee_id", targetId); return { following: false }; }
        await client.from("follows").insert({ follower_id: me.id, followee_id: targetId });
        return { following: true };
      },
      async messagesList(peerId) {
        const me = state.profile; if (!me) return [];
        const { data } = await client.from("messages").select("*")
          .or(`and(sender_id.eq.${me.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${me.id})`)
          .order("created_at", { ascending: true }).limit(200);
        return (data || []).map(m => ({ from: m.sender_id, to: m.receiver_id, text: m.body, t: new Date(m.created_at).getTime(), seen: m.seen }));
      },
      async messageSend(peerId, text) {
        const me = state.profile; if (!me) throw new Error("Not signed in");
        const { error } = await client.from("messages").insert({ sender_id: me.id, receiver_id: peerId, body: text });
        if (error) throw error;
        await client.from("notifications").insert({ user_id: peerId, type: "message", text: me.username + ": sent you a message" });
        return { ok: true };
      },
      onMessages(cb) {
        const me = state.profile; if (!me) return;
        client.channel("msgs:" + me.id)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${me.id}` }, cb)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${me.id}` }, cb)
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, cb)
          .subscribe();
      },
      async siteSettingsGet() { const { data } = await client.from("site_settings").select("key, value"); const o = {}; (data || []).forEach(r => o[r.key] = r.value); return o; },
      async siteSettingsSet(key, value) { return client.from("site_settings").upsert({ key, value }, { onConflict: "key" }); },
      async pushNotifTo(userId, text, type = "admin") { return client.from("notifications").insert({ user_id: userId, type, text }); }
    };

    CS.storage = client.storage;

    // initial sync
    await refreshProfiles();
    if (state.profile) { await pullNotifications(); await subscribeRealtime(); }
    await syncRemoteSettings();
    console.info("[CrazyStudio] Supabase connected ✦");
  }

  /* ================= BOOT (with fallback) ================= */
  async function boot() {
    try { await bootLive(); }
    catch (e) {
      console.warn("[CrazyStudio] Supabase unavailable — offline/demo mode", e?.message || e);
      CS.isMock = true;
      CS.users = MockAPI.users;
      CS.auth = MockAPI.auth;
      CS.data = MockAPI.data;
      CS.notifs = MockAPI.notifs;
      CS.settings = MockAPI.settings;
      CS.storage = MockAPI.storage;
    }
    state.ready = true;
    window.dispatchEvent(new CustomEvent("cs:ready"));
  }

  // expose mock APIs pre-boot so nothing crashes before ready
  CS.isMock = true;
  CS.users = MockAPI.users;
  CS.auth = MockAPI.auth;
  CS.data = MockAPI.data;
  CS.notifs = MockAPI.notifs;
  CS.settings = MockAPI.settings;

  state.readyP = boot();
  CS.ready = () => state.readyP;
})();
