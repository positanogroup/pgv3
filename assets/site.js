/* =========================================================
   POSITANO GROUP — Site Script
   Mobile nav · Lazy Calendly · Form submission · A11y
   ========================================================= */
(function () {
  'use strict';

  /* ----- Mobile nav toggle ----- */
  function initNav() {
    var nav = document.querySelector('.site-nav');
    var toggle = document.querySelector('.nav-toggle');
    if (!nav || !toggle) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close mobile nav on link click
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (nav.classList.contains('nav-open')) {
          nav.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ----- Lazy-load Calendly on click ----- */
  function initCalendly() {
    var btns = document.querySelectorAll('.calendly-load-btn');
    if (!btns.length) return;
    var scriptLoaded = false;
    var scriptLoading = false;
    var pendingShells = [];

    function loadScript(onReady) {
      if (scriptLoaded) { onReady(); return; }
      if (scriptLoading) {
        pendingShells.push(onReady);
        return;
      }
      scriptLoading = true;

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);

      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      s.onload = function () {
        scriptLoaded = true;
        scriptLoading = false;
        onReady();
        pendingShells.forEach(function (fn) { fn(); });
        pendingShells = [];
      };
      document.head.appendChild(s);
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var shell = btn.closest('.calendly-shell');
        if (!shell) return;
        btn.disabled = true;
        var label = btn.querySelector('.cal-label');
        if (label) label.textContent = 'Loading scheduler…';

        loadScript(function () {
          var url = btn.getAttribute('data-url');
          var holder = document.createElement('div');
          holder.className = 'calendly-inline-widget';
          holder.setAttribute('data-url', url);
          holder.style.minWidth = '320px';
          holder.style.height = '700px';
          shell.innerHTML = '';
          shell.appendChild(holder);
          // Give the DOM a tick, then initialize. Calendly scans for
          // .calendly-inline-widget elements when initInlineWidgets runs.
          setTimeout(function () {
            if (window.Calendly && window.Calendly.initInlineWidgets) {
              window.Calendly.initInlineWidgets();
            }
          }, 50);
        });
      });
    });
  }

  /* ----- Async form submission to Formspree ----- */
  function initContactForm() {
    var forms = document.querySelectorAll('.contact-form');
    forms.forEach(function (form) {
      var success = form.querySelector('.form-success');
      var hasSubmittedNatively = false;

      form.addEventListener('submit', function (e) {
        if (hasSubmittedNatively) return; // let the second submit pass through
        e.preventDefault();
        var btn = form.querySelector('.form-submit');
        var labelEl = btn ? btn.querySelector('.btn-label') : null;
        var originalLabel = labelEl ? labelEl.textContent : 'Send';
        if (labelEl) labelEl.textContent = 'Sending…';
        if (btn) btn.disabled = true;

        var data = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(function (res) {
          if (res.ok) {
            form.reset();
            if (success) success.classList.add('is-visible');
            if (labelEl) labelEl.textContent = 'Sent';
            if (success) success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            throw new Error('Submission failed');
          }
        }).catch(function () {
          // Fallback — submit traditionally (Formspree's redirect flow)
          if (labelEl) labelEl.textContent = originalLabel;
          if (btn) btn.disabled = false;
          hasSubmittedNatively = true;
          form.submit();
        });
      });
    });
  }

  /* ----- Smooth scroll for in-page anchors ----- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /* ----- Mark active nav link based on current pathname ----- */
  function initActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0];
      if (href === path) a.classList.add('is-active');
    });
  }

  /* ----- Init ----- */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initNav();
    initCalendly();
    initContactForm();
    initSmoothScroll();
    initActiveNav();
  });
})();
