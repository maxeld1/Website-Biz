// /js/partials.js
(function () {
  async function inject(targetSelector, file) {
    const mount = document.querySelector(targetSelector);
    if (!mount) return;

    // Respect <base href="...">
    const url = `partials/${file}`; // ← no leading slash
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const html = await res.text();
      mount.outerHTML = html;
    } catch (err) {
      console.error("Include failed:", url, err);
    }
  }

  async function run() {
    await inject('[data-include="header"]', "header.html");
    await inject('[data-include="footer"]', "footer.html");

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run);
})();
