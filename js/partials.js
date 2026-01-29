// /js/partials.js
(function () {
  "use strict";

  const INCLUDE_ATTR = "data-include";

  // Find the URL of THIS script (works no matter what page you're on)
  const scriptEl =
      document.currentScript ||
      document.querySelector('script[src$="/js/partials.js"], script[src$="js/partials.js"]');

  if (!scriptEl) {
    console.error("[partials] Could not locate partials.js script tag.");
    return;
  }

  const scriptURL = new URL(scriptEl.src, window.location.href);

  // /partials/ relative to /js/partials.js
  const PARTIALS_BASE = new URL("../partials/", scriptURL);

  // Site root relative to /js/partials.js
  // e.g. https://user.github.io/repo/js/partials.js -> https://user.github.io/repo/
  const SITE_ROOT = new URL("../", scriptURL);

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return await res.text();
  }

  function applyPrefixPlaceholders(html) {
    // Use a root path like "/repo/" or "/" so links work from any depth
    const P = SITE_ROOT.pathname.endsWith("/") ? SITE_ROOT.pathname : SITE_ROOT.pathname + "/";
    return html.replaceAll("{{P}}", P);
  }

  async function inject(targetSelector, file) {
    const mount = document.querySelector(targetSelector);
    if (!mount) return;

    const url = new URL(file, PARTIALS_BASE);
    const raw = await fetchText(url);
    const html = applyPrefixPlaceholders(raw);

    mount.outerHTML = html;
  }

  async function run() {
    await inject(`[${INCLUDE_ATTR}="header"]`, "header.html");
    await inject(`[${INCLUDE_ATTR}="footer"]`, "footer.html");

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ✅ tell main.js the header/footer are now in the DOM
    document.dispatchEvent(new Event("partials:ready"));
  }

  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run);
})();
