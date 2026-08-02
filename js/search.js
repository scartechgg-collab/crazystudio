/* ============================================================
   CrazyStudio — Search wiring (page-level helpers)
   The overlay itself lives in main.js; this module exposes
   programmatic search + keyboard shortcut hints on pages.
   ============================================================ */
(function () {
  window.CSSearch = {
    focus() { CS.openSearch(); },
    // search across all entities, returns grouped results
    all(q) {
      q = (q || "").trim().toLowerCase(); if (!q) return { users: [], services: [], projects: [], posts: [] };
      const users = CS.users.all().filter(u => (u.username + u.email + u.role).toLowerCase().includes(q));
      const services = ["Web Development","Minecraft Network","Minecraft Plugin","Discord Bot","Android App","Automation","API","UI/UX Design","Hosting","SEO","Security"].filter(s => s.toLowerCase().includes(q));
      const projects = ["Nexus Network","Aurora Bot","Orbit Dashboard","Pulse Mobile","Forge Plugin","Halo Website"].filter(s => s.toLowerCase().includes(q));
      const posts = ["Scaling Minecraft networks","Design systems at CrazyStudio","Realtime chat architecture"].filter(s => s.toLowerCase().includes(q));
      return { users, services, projects, posts };
    }
  };
  // hint pill
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-search-hint]").forEach(el => {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => CS.openSearch());
    });
  });
})();
