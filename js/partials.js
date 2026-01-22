// /js/partials.js
(function () {
  // If we're on GitHub Pages project site, base is "/<repo>"
  const BASE =
      location.hostname.endsWith("github.io")
          ? `/${location.pathname.split("/")[1]}`
          : "";

  async function inject(targetSelector, file) {
    const mount = document.querySelector(targetSelector);
    if (!mount) return;

    const url = `${BASE}/partials/${file}`; // ✅ works on GH Pages + local
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
