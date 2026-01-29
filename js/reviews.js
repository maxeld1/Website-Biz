// /js/reviews.js
(function () {
  "use strict";

  function getShell(btn) {
    return btn.closest(".quote-shell");
  }

  function getQuotes(shell) {
    return Array.from(shell.querySelectorAll("[data-quote]"));
  }

  function getCurrentIndex(quotes) {
    let current = quotes.findIndex((q) => !q.hidden);
    return current === -1 ? 0 : current;
  }

  function showQuote(quotes, index) {
    quotes.forEach((q, i) => {
      const isActive = i === index;
      q.hidden = !isActive;
      q.classList.toggle("is-active", isActive);
    });
  }

  function go(shell, dir) {
    const quotes = getQuotes(shell);
    if (!quotes.length) return;

    const current = getCurrentIndex(quotes);
    let next = (current + dir) % quotes.length;
    if (next < 0) next += quotes.length;

    showQuote(quotes, next);
  }

  // Click arrows
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quote-dir]");
    if (!btn) return;

    const shell = getShell(btn);
    if (!shell) return;

    const dir = parseInt(btn.getAttribute("data-quote-dir"), 10) || 0;
    if (!dir) return;

    go(shell, dir);
  });

  // Swipe support (mobile)
  function bindSwipe(shell) {
    let startX = 0;
    let startY = 0;
    let moved = false;

    const threshold = 35;      // px needed to count as swipe
    const restraint = 60;      // max vertical movement allowed

    shell.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        startX = t.clientX;
        startY = t.clientY;
        moved = false;
      },
      { passive: true }
    );

    shell.addEventListener(
      "touchmove",
      (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        // Only prevent scroll if it’s clearly a horizontal swipe
        if (Math.abs(dx) > 10 && Math.abs(dy) < 10) {
          moved = true;
          e.preventDefault(); // allows swiping without page scroll fighting
        }
      },
      { passive: false }
    );

    shell.addEventListener(
      "touchend",
      (e) => {
        if (!moved) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (Math.abs(dy) > restraint) return;      // ignore vertical gestures
        if (Math.abs(dx) < threshold) return;      // not far enough

        // swipe left -> next, swipe right -> prev
        go(shell, dx < 0 ? 1 : -1);
      },
      { passive: true }
    );
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".quote-shell").forEach((shell) => {
      const quotes = getQuotes(shell);
      if (!quotes.length) return;

      showQuote(quotes, getCurrentIndex(quotes));
      bindSwipe(shell);
    });
  });
})();