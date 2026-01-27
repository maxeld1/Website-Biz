// /js/reviews.js
(function () {
    "use strict";

    function getShell(btn) {
        return btn.closest(".quote-shell");
    }

    function getQuotes(shell) {
        return Array.from(shell.querySelectorAll('[data-quote]'));
    }

    function showQuote(quotes, index) {
        quotes.forEach((q, i) => {
            const isActive = i === index;
            q.hidden = !isActive;                 // uses your existing hidden attribute
            q.classList.toggle("is-active", isActive);
        });
    }

    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-quote-dir]");
        if (!btn) return;

        const shell = getShell(btn);
        if (!shell) return;

        const quotes = getQuotes(shell);
        if (!quotes.length) return;

        // Find current visible
        let current = quotes.findIndex((q) => !q.hidden);
        if (current === -1) current = 0;

        const dir = parseInt(btn.getAttribute("data-quote-dir"), 10) || 0;
        let next = (current + dir) % quotes.length;
        if (next < 0) next += quotes.length;

        showQuote(quotes, next);
    });

    // Ensure one quote is visible on load (in case markup gets weird)
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".quote-shell").forEach((shell) => {
            const quotes = getQuotes(shell);
            if (!quotes.length) return;

            let current = quotes.findIndex((q) => !q.hidden);
            if (current === -1) current = 0;
            showQuote(quotes, current);
        });
    });
})();
