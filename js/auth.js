/* ============================================================
   CrazyStudio — Authentication (live Supabase + mock fallback)
   - Client / Developer / Admin tabs with animated glider
   - Email + password with duplicate email/username protection
   - OAuth: Google & Discord with account-existence rules
   - Custom "check your mail" verification window
   - Remember me, session persistence, ban/role gating
   ============================================================ */
(function () {
  window.CS = window.CS || {};
  const CFG = window.CS_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- helpers ---------------- */
  const btnBusy = (btn, txt) => { if (!btn) return () => {}; btn.disabled = true; const old = btn.textContent; btn.textContent = txt; return () => { btn.disabled = false; btn.textContent = old; }; };
  const isAdminMail = (email) => (email || "").toLowerCase() === (CFG.ADMIN_EMAIL || "").toLowerCase();

  /* ================= EMAIL / PASSWORD ================= */
  async function handleLogin(form, tab) {
    const email = form.email.value.trim();
    const pass = form.password.value;
    const remember = form.remember?.checked;
    if (!email || !pass) return CS.toast({ type: "warn", title: "Fill in all fields" });
    if (tab === "admin" && window.CS.isMock && !isAdminMail(email)) return CS.toast({ type: "bad", title: "Restricted", text: "Admin access requires " + CFG.ADMIN_EMAIL });
    const done = btnBusy(form.querySelector("button[type=submit]"), "Signing in…");
    try {
      const { user } = await CS.auth.signIn({ email, password: pass });
      if (!user) throw new Error("Invalid credentials");
      // role gate for admin console
      if (tab === "admin" && user.role !== "admin" && user.role !== "owner" && !window.CS.isMock) {
        await CS.auth.signOut();
        throw new Error("This account is not an administrator");
      }
      if (remember) localStorage.setItem("cs_remember", email); else localStorage.removeItem("cs_remember");
      CS.toast({ type: "ok", title: "Welcome back, " + (user.username || email) });
      setTimeout(() => location.href = tab === "admin" ? "admin-dashboard.html" : "dashboard.html", 550);
    } catch (e) {
      CS.toast({ type: "bad", title: "Sign-in failed", text: e.message || "Check credentials" });
      done();
    }
  }

  async function handleRegister(form) {
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const pass = form.password.value;
    const pass2 = form.password2?.value;
    if (!username || !email || !pass) return CS.toast({ type: "warn", title: "All fields are required" });
    if (username.length < 3) return CS.toast({ type: "warn", title: "Username too short", text: "Minimum 3 characters." });
    if (!/^[\w.\-]+$/.test(username)) return CS.toast({ type: "warn", title: "Invalid username", text: "Letters, numbers, dots, dashes, underscores only." });
    if (pass.length < 6) return CS.toast({ type: "warn", title: "Password too short", text: "Use at least 6 characters." });
    if (pass2 !== undefined && pass !== pass2) return CS.toast({ type: "bad", title: "Passwords don't match" });
    const done = btnBusy(form.querySelector("button[type=submit]"), "Creating account…");
    try {
      await CS.ready?.();
      const { needsConfirm } = await CS.auth.signUp({ email, password, username });
      if (needsConfirm) {
        // email confirmation required → custom "check your mail" window
        renderCheckMail(form.closest(".auth-card"), email);
      } else {
        CS.toast({ type: "ok", title: "Account created ✦", text: "Welcome to CrazyStudio." });
        setTimeout(() => location.href = "dashboard.html", 600);
      }
    } catch (e) {
      CS.toast({ type: "bad", title: "Could not register", text: e.message });
      done();
    }
  }

  async function handleForgot(form) {
    const email = form.email.value.trim();
    if (!email) return CS.toast({ type: "warn", title: "Enter your email" });
    const done = btnBusy(form.querySelector("button[type=submit]"), "Sending…");
    try {
      await CS.auth.resetPassword({ email });
      renderCheckMail(form.closest(".auth-card"), email, "reset");
    } catch (e) { CS.toast({ type: "bad", title: "Error", text: e.message }); done(); }
  }

  /* ================= CHECK YOUR MAIL (custom window) ================= */
  function renderCheckMail(card, email, kind = "signup") {
    if (!card) return;
    card.innerHTML = `
      <div class="checkmail">
        <div class="env">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
          <span class="v-badge">${kind === "reset" ? "↻" : "✦"}</span>
        </div>
        <h3>Check your mail</h3>
        <p>${kind === "reset" ? "We sent a secure password-reset link to" : "We sent a confirmation link to"}</p>
        <span class="em">${email}</span>
        <p style="margin-top:14px">${kind === "reset" ? "Open the link to choose a new password." : "Click the link inside to activate your account, then sign in."}</p>
        <div class="dots"><i></i><i></i><i></i></div>
        <div class="row" style="justify-content:center;margin-top:26px">
          <button class="btn btn-ghost btn-sm" id="resend-btn">Resend email</button>
          <a class="btn btn-primary btn-sm" href="login.html">Go to sign in</a>
        </div>
        <p class="auth-foot" style="margin-top:18px">Wrong email? <a href="register.html">Start over</a></p>
      </div>`;
    const rs = $("#resend-btn", card);
    let wait = 0, iv;
    rs.onclick = async () => {
      if (wait > 0) return;
      try { await CS.auth.resend({ email }); CS.toast({ type: "ok", title: "Email resent", text: email }); } catch {}
      wait = 30; rs.disabled = true; rs.textContent = `Resend in ${wait}s`;
      iv = setInterval(() => { wait--; rs.textContent = wait > 0 ? `Resend in ${wait}s` : "Resend email"; if (wait <= 0) { clearInterval(iv); rs.disabled = false; } }, 1000);
    };
  }

  /* ================= OAUTH (Google / Discord) ================= */
  function bindOAuth() {
    $$(".oabtn[data-provider]").forEach(btn => btn.addEventListener("click", async (e) => {
      e.preventDefault();
      preshow(btn);
      const provider = btn.dataset.provider;
      const intent = btn.dataset.intent || "login";
      sessionStorage.setItem("cs_oauth_intent", intent);
      await CS.ready?.();
      if (window.CS.isMock) { // simulate provider flow in demo mode
        const em = sessionStorage.getItem("cs_oauth_email") || `oauth_${provider}@crazystudio.fun`;
        const { user, existed } = await CS.auth.oauth(provider, em);
        if (intent === "login" && !existed) return CS.toast({ type: "bad", title: "No account matched", text: "There is no account matched with these credentials. Register first." });
        if (intent === "register" && existed) { await CS.auth.finalizeOAuth(user); CS.toast({ type: "warn", title: "Already registered", text: "There is already an account made with this — logging you in." }); setTimeout(() => location.href = "dashboard.html", 800); return; }
        await CS.auth.finalizeOAuth(user);
        CS.toast({ type: "ok", title: existed ? "Welcome back ✦" : "Account created", text: "Signed in with " + provider });
        setTimeout(() => location.href = "dashboard.html", 700);
        return;
      }
      try { await CS.auth.oauthStart(provider, intent); }
      catch (e) { CS.toast({ type: "bad", title: "OAuth failed", text: e.message }); }
    }));
  }
  function preshow(btn) { btn.style.opacity = ".6"; btn.style.pointerEvents = "none"; setTimeout(() => { btn.style.opacity = ""; btn.style.pointerEvents = ""; }, 1500); }

  // After returning from a provider (redirect back to login.html)
  async function resolveOAuthCallback() {
    const intent = sessionStorage.getItem("cs_oauth_intent");
    if (!intent || window.CS.isMock || !CS.auth.resolveOAuth) return;
    sessionStorage.removeItem("cs_oauth_intent");
    try {
      await CS.ready();
      const { profile, isNew } = await CS.auth.resolveOAuth();
      if (!profile) return;
      if (intent === "login" && isNew) {
        await CS.auth.signOut();
        return CS.toast({ type: "bad", title: "No account matched", text: "There is no account matched with these credentials. Register first.", timeout: 5000 });
      }
      if (intent === "register" && !isNew) {
        CS.toast({ type: "warn", title: "Already registered", text: "There is already an account made with this — logging you in.", timeout: 4500 });
      } else if (intent === "register") {
        CS.toast({ type: "ok", title: "Account created ✦", text: "Signed in with provider." });
      } else {
        CS.toast({ type: "ok", title: "Welcome back, " + profile.username });
      }
      setTimeout(() => location.href = "dashboard.html", 700);
    } catch (e) { console.warn(e); }
  }

  /* ================= Tabs (animated glider) ================= */
  function wireTabs(root) {
    const tabs = $$(".auth-tabs button", root);
    const box = $(".auth-tabs", root);
    if (!box.querySelector(".glider")) {
      const g = document.createElement("span"); g.className = "glider"; box.prepend(g);
    }
    const panels = $$(".auth-panel", root);
    const apply = (t, animate = true) => {
      tabs.forEach(x => x.classList.remove("on")); t.classList.add("on");
      const i = tabs.indexOf(t);
      const g = box.querySelector(".glider");
      const rect = t.getBoundingClientRect(), brect = box.getBoundingClientRect();
      g.style.width = rect.width + "px";
      g.style.transform = `translateX(${rect.left - brect.left - 4}px)`;
      panels.forEach(p => {
        if (p.dataset.panel === t.dataset.tab) {
          p.classList.remove("hide");
          p.style.animation = "none"; void p.offsetHeight; p.style.animation = "";
        } else p.classList.add("hide");
      });
      history.replaceState(null, "", "#" + t.dataset.tab);
    };
    tabs.forEach(t => t.addEventListener("click", () => apply(t)));
    const hash = (location.hash || "").slice(1);
    apply(tabs.find(t => t.dataset.tab === hash) || tabs[0], false);
    addEventListener("resize", () => { const t = tabs.find(x => x.classList.contains("on")); if (t) apply(t, false); });
  }

  /* ================= Wire-up ================= */
  document.addEventListener("DOMContentLoaded", async () => {
    const authRoot = document.querySelector("[data-auth]");
    await CS.ready?.();
    bindOAuth();
    await resolveOAuthCallback();

    if (authRoot) {
      if (authRoot.querySelector(".auth-tabs")) wireTabs(authRoot);
      const loginForm = $("#login-form");
      if (loginForm) loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const active = authRoot.querySelector(".auth-tabs .on")?.dataset.tab || loginForm.dataset.tab || "client";
        handleLogin(loginForm, active);
      });
      // if already signed in, bounce to dashboard
      const me = CS.users?.me();
      if (me && !location.hash.includes("force")) { /* stay — user may want to switch account */ }
    }

    const regForm = $("#register-form");
    if (regForm) regForm.addEventListener("submit", e => { e.preventDefault(); handleRegister(regForm); });
    const forgotForm = $("#forgot-form");
    if (forgotForm) forgotForm.addEventListener("submit", e => { e.preventDefault(); handleForgot(forgotForm); });
    const loginForm = $("#login-form");
    if (loginForm && !authRoot) loginForm.addEventListener("submit", e => { e.preventDefault(); handleLogin(loginForm, loginForm.dataset.tab || "client"); });

    // prefill remembered email
    const rem = localStorage.getItem("cs_remember");
    if (rem && loginForm?.email) { loginForm.email.value = rem; if (loginForm.remember) loginForm.remember.checked = true; }
  });

  CS.authAPI = { handleLogin, handleRegister, handleForgot, renderCheckMail };
})();
