// /js/partials.js
(function () {
  const isSubpage = /\/pages\//.test(location.pathname);
  const P = isSubpage ? '../' : '';

  function inject(selector, file) {
    const el = document.querySelector(selector);
    if (!el) return;
    fetch(P + 'partials/' + file)
      .then(r => r.text())
      .then(html => {
        // replace {{P}} placeholders with proper prefix
        html = html.replaceAll('{{P}}', P);
        el.outerHTML = html;
      })
      .catch(err => console.error('Include failed:', file, err));
  }

  // run after DOM is ready
  if (document.readyState !== 'loading') {
    inject('[data-include="header"]', 'header.html');
    inject('[data-include="footer"]', 'footer.html');
  } else {
    document.addEventListener('DOMContentLoaded', function(){
      inject('[data-include="header"]', 'header.html');
      inject('[data-include="footer"]', 'footer.html');
    });
  }
})();
