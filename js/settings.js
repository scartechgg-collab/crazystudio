/* ============================================================
   CrazyStudio — Settings helpers (used by dashboard + admin)
   ============================================================ */
(function () {
  window.CSSettings = {
    exportAll() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("cs_")) data[k] = localStorage.getItem(k); }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "crazystudio-settings.json"; a.click();
    },
    resetAll() {
      if (!confirm("Reset all local CrazyStudio data?")) return;
      Object.keys(localStorage).filter(k => k.startsWith("cs_")).forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  };
})();
