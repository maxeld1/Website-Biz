// js/main.js
(function(){
  const log = (...a)=>console.log('[nav]', ...a);

  // Normalize path to highlight active link
  function norm(p){ return ("/"+p).replace(/\/+/g,"/").replace(/\/$/,""); }

  document.addEventListener('DOMContentLoaded', ()=>{
    const here = norm(location.pathname);
    document.querySelectorAll('header nav a').forEach(a=>{
      const href = a.getAttribute('href'); if(!href) return;
      const target = norm(new URL(href, location.href).pathname);
      if (here === target) a.classList.add('is-active');
    });
  });

  let bound = false;

  function tryBind(){
    if (bound) return true;
    const header = document.querySelector('header');
    const menuBtn = document.querySelector('.menu-toggle');
    const nav = document.getElementById('mobile-menu') || document.querySelector('.site-nav');
    if (!header || !menuBtn || !nav) return false;

    // Set --header-h for mobile offset
    const root = document.documentElement;
    const setH = () => {
      const h = (header.offsetHeight || 72) + 'px';
      root.style.setProperty('--header-h', h);        // desktop + general
      root.style.setProperty('--header-h-mobile', h); // mobile should match actual header height
    };

    setH(); addEventListener('resize', setH, {passive:true}); addEventListener('orientationchange', setH);

    const lock = ()=>document.body.classList.add('no-scroll');
    const unlock = ()=>document.body.classList.remove('no-scroll');

    const toggle = (force)=>{
      const open = (typeof force==='boolean') ? force : !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);

      menuBtn.classList.toggle('is-open', open); // ✅ add this

      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      open ? lock() : unlock();
      setTimeout(setH, 50);
      log('menu', open ? 'opened' : 'closed');
    };


    menuBtn.addEventListener('click', ()=>toggle());
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>toggle(false)));
    document.addEventListener('keydown', e=>{ if(e.key==='Escape' && nav.classList.contains('is-open')) toggle(false); });
    document.addEventListener('click', e=>{
      if(!nav.classList.contains('is-open')) return;
      if(!nav.contains(e.target) && !menuBtn.contains(e.target)) toggle(false);
    });

    // Header shadow on scroll
    const onScroll = ()=>{ header.style.boxShadow = (scrollY>6) ? '0 10px 24px rgba(110,101,92,.06)' : 'none'; };
    onScroll(); addEventListener('scroll', onScroll, {passive:true});

    bound = true;
    log('bound listeners');
    return true;
  }

  // Bind now if possible
  if (!tryBind()){
    // Retry briefly (fast path)
    let tries = 0;
    const t = setInterval(()=>{
      if (tryBind() || ++tries > 12) clearInterval(t);
    }, 250);

    // And also observe DOM for late-injected header (robust path)
    const mo = new MutationObserver(() => { if (tryBind()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList:true, subtree:true });
  }

  (function () {
    const track = document.querySelector(".reviews-track");
    if (!track) return;

    const btns = document.querySelectorAll(".reviews-btn");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = Number(btn.dataset.dir || 1);
        const card = track.querySelector(".review-card");
        const step = card ? card.getBoundingClientRect().width + 18 : 320;

        track.scrollBy({ left: dir * step, behavior: "smooth" });
      });
    });
  })();
})();

// Scroll reveal (IntersectionObserver)
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // If IO isn't supported, just show everything
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  els.forEach(el => io.observe(el));
})();

// Page fade transition (multi-page) — robust for relative/absolute URLs
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("is-leaving");

  // ✅ Fade IN only after header/footer are injected (prevents header "pop")
  const markReady = () =>
      requestAnimationFrame(() => document.body.classList.add("is-ready"));

  if (document.querySelector("header")) {
    markReady(); // already present (or injected super fast)
  } else {
    document.addEventListener("partials:ready", markReady, { once: true });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    // Don’t affect modified clicks or explicit new tabs
    const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    const isNewTab = a.target === "_blank";
    const isDownload = a.hasAttribute("download");
    const isSpecial = href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:");
    if (isModified || isNewTab || isDownload || isSpecial) return;

    const url = new URL(a.href, location.href);
    const isExternal = url.origin !== location.origin;
    if (isExternal) return;

    e.preventDefault();
    document.body.classList.add("is-leaving");

    setTimeout(() => {
      location.href = url.href;
    }, 180);
  });

  // Back/forward cache restore
  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-leaving");
  });
});



(() => {
  function initProcess() {
    const rail = document.querySelector(".process-tabs");
    const dataEl = document.getElementById("process-data");
    const panel = document.getElementById("process-panel");
    const processWrap = document.querySelector(".process-panel-wrap");
    if (!rail || !dataEl || !panel || !processWrap) return;

    let data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch {
      return;
    }

    let activeStep = 1;
    let timer = null;
    const steps = Object.keys(data).map(Number).sort((a, b) => a - b);

    const badge = document.getElementById("process-badge");
    const title = document.getElementById("process-title");
    const desc  = document.getElementById("process-desc");
    const p1    = document.getElementById("process-p1");
    const p2    = document.getElementById("process-p2");
    const img   = document.getElementById("process-img");
    const cta1  = document.getElementById("process-cta-primary");
    const cta2  = document.getElementById("process-cta-secondary");

    const setActive = (step) => {
      const d = data[String(step)];
      activeStep = Number(step);
      if (!d) return;

      // highlight active tab
      rail.querySelectorAll(".process-tab").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.step === String(step));
      });

      // Start fade
      processWrap.classList.add("is-swapping");

      // Preload next image first (prevents flicker)
      const pre = new Image();
      pre.src = d.img;

      const apply = () => {
        if (badge) badge.textContent = d.badge || "";
        if (title) title.textContent = d.title || "";
        if (desc)  desc.textContent  = d.desc  || "";

        if (p1) p1.textContent = d.p?.[0] || "";
        if (p2) p2.textContent = d.p?.[1] || "";

        if (img) {
          img.src = d.img || "";
          img.alt = d.alt || "";
        }

        if (cta1) {
          cta1.textContent = d.ctaPrimary?.label || "Get started";
          cta1.href = d.ctaPrimary?.href || "#";
        }
        if (cta2) {
          cta2.textContent = d.ctaSecondary?.label || "See work";
          cta2.href = d.ctaSecondary?.href || "#";
        }
      };

      pre.onload = () => {
        requestAnimationFrame(() => {
          apply();
          setTimeout(() => processWrap.classList.remove("is-swapping"), 180);
        });
      };

      pre.onerror = () => {
        requestAnimationFrame(() => {
          apply();
          setTimeout(() => processWrap.classList.remove("is-swapping"), 180);
        });
      };
    };

    const startAuto = () => {
      stopAuto();
      timer = setInterval(() => {
        const i = steps.indexOf(activeStep);
        const next = steps[(i + 1) % steps.length];
        setActive(next);
      }, 5200); // change timing here
    };

    const stopAuto = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    rail.addEventListener("click", (e) => {
      const btn = e.target.closest(".process-tab");
      if (!btn) return;
      setActive(btn.dataset.step);
    });

    // Initial
    const initial = rail.querySelector(".process-tab.is-active")?.dataset.step || "1";
    setActive(initial);

    startAuto();

// Pause when user interacts with the section
    const section = document.getElementById("process") || panel.closest(".process");
    if (section){
      section.addEventListener("mouseenter", stopAuto);
      section.addEventListener("mouseleave", startAuto);
      section.addEventListener("focusin", stopAuto);
      section.addEventListener("focusout", startAuto);
    }

// Also pause briefly after click, then resume
    rail.addEventListener("click", () => {
      stopAuto();
      setTimeout(startAuto, 8000);
    });
  }

  document.addEventListener("partials:ready", initProcess);
  document.addEventListener("DOMContentLoaded", initProcess);
})();
