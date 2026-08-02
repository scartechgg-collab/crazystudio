/* ============================================================
   CrazyStudio — Theme, seasonal modes, FX (snow/particles)
   ============================================================ */
(function () {
  window.CS = window.CS || {};

  const MODES = ["default", "winter", "christmas", "halloween"];

  function applySettings(s) {
    document.body.classList.remove("winter", "christmas", "halloween", "maintenance");
    if (s.mode && s.mode !== "default") document.body.classList.add(s.mode);
    if (s.maintenance) document.body.classList.add("maintenance");
    renderFX(s.mode);
  }

  function renderFX(mode) {
    let layer = document.getElementById("fx-layer");
    if (!layer) { layer = document.createElement("div"); layer.id = "fx-layer"; document.body.appendChild(layer); }
    layer.innerHTML = "";
    if (mode === "winter" || mode === "christmas") {
      const N = mode === "christmas" ? 60 : 90;
      for (let i = 0; i < N; i++) {
        const f = document.createElement("span");
        f.className = "snow";
        f.textContent = mode === "christmas" && Math.random() > .85 ? "❄" : "•";
        f.style.left = Math.random() * 100 + "vw";
        f.style.fontSize = (Math.random() * 14 + 6) + "px";
        f.style.animationDuration = (Math.random() * 8 + 6) + "s";
        f.style.animationDelay = (-Math.random() * 10) + "s";
        f.style.opacity = (Math.random() * .6 + .3).toFixed(2);
        layer.appendChild(f);
      }
    }
    if (mode === "halloween") {
      for (let i = 0; i < 18; i++) {
        const f = document.createElement("span");
        f.className = "snow";
        f.textContent = ["🦇","","👻"][i % 3];
        f.style.left = Math.random() * 100 + "vw";
        f.style.fontSize = (Math.random() * 16 + 12) + "px";
        f.style.animationDuration = (Math.random() * 10 + 8) + "s";
        f.style.animationDelay = (-Math.random() * 10) + "s";
        layer.appendChild(f);
      }
    }
  }

  function cycleAccent() {
    const accents = {
      blue:   [120, 165, 255],
      silver: [200, 210, 225],
      ice:    [120, 220, 255]
    };
    const cur = window.CS.settings.get();
    const keys = Object.keys(accents);
    const next = keys[(keys.indexOf(cur.accent || "blue") + 1) % keys.length];
    const [r, g, b] = accents[next];
    document.documentElement.style.setProperty("--glow-r", r);
    document.documentElement.style.setProperty("--glow-g", g);
    document.documentElement.style.setProperty("--glow-b", b);
    window.CS.settings.set({ accent: next });
    return next;
  }

  window.CS.theme = { applySettings, renderFX, cycleAccent, MODES,
    setMode(m) {
      window.CS.settings.set({ mode: m }); applySettings(window.CS.settings.get());
      // persist to Supabase site_settings when live
      if (!CS.isMock && CS.data?.siteSettingsGet) (async () => {
        try {
          const all = await CS.data.siteSettingsGet();
          const modes = all.modes || {};
          ["winter","christmas","halloween"].forEach(k => modes[k] = (m === k));
          await CS.data.siteSettingsSet("modes", modes);
        } catch {}
      })();
    },
    setMaintenance(on) {
      window.CS.settings.set({ maintenance: !!on }); applySettings(window.CS.settings.get());
      if (!CS.isMock && CS.data?.siteSettingsGet) (async () => {
        try {
          const all = await CS.data.siteSettingsGet();
          const modes = all.modes || {};
          modes.maintenance = !!on;
          await CS.data.siteSettingsSet("modes", modes);
        } catch {}
      })();
    }
  };

  document.addEventListener("cs:settings", () => applySettings(window.CS.settings.get()));
  document.addEventListener("DOMContentLoaded", () => applySettings(window.CS.settings.get()));
})();
