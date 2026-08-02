/* ============================================================
   CrazyStudio — Notifications wiring + sounds
   ============================================================ */
(function () {
  let audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; o.type = "sine";
      g.gain.value = .04; o.connect(g); g.connect(audioCtx.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .25); o.stop(audioCtx.currentTime + .25);
    } catch {}
  }

  // listen for new notifs and play a subtle sound + toast
  let last = CS.notifs.all().length;
  addEventListener("cs:notif", () => {
    const now = CS.notifs.all().length;
    if (now > last) { beep(); const n = CS.notifs.all()[0]; if (n) CS.toast({ type: "info", title: "New notification", text: n.text }); }
    last = now;
    CS.renderNotifs();
  });

  // realtime presence: poll mock presence
  setInterval(() => {
    if (!CS.isMock) return;
    const arr = CS.users.all();
    const u = arr[Math.floor(Math.random() * arr.length)];
    if (u) { u.status = ["online","away","offline"][Math.floor(Math.random()*3)]; CS.users.save(u); }
  }, 9000);

  window.CSNotif = { beep };
})();
