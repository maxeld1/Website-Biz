// /js/partials.js
(function () {
  "use strict";

  const INCLUDE_ATTR = "data-include";

  // If we are inside /pages/, go up one level to reach /partials/
  const isSubpage = location.pathname.includes("/pages/");
  const BASE = isSubpage ? "../" : "./";   // where to fetch /partials/ from
  const P = isSubpage ? "../" : "";        // prefix for links inside partials ({{P}})

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return await res.text();
  }

  function applyPrefixPlaceholders(html) {
    return html.replaceAll("{{P}}", P);
  }

  async function inject(targetSelector, file) {
    const mount = document.querySelector(targetSelector);
    if (!mount) return;

    const url = `${BASE}partials/${file}`;
    const raw = await fetchText(url);
    const html = applyPrefixPlaceholders(raw);

    mount.outerHTML = html;
  }

  async function run() {
    await inject(`[${INCLUDE_ATTR}="header"]`, "header.html");
    await inject(`[${INCLUDE_ATTR}="footer"]`, "footer.html");

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run);
})();
