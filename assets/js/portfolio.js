/* ============================================================
   JOHN GICHAGA — Portfolio
   Vanilla JS. No dependencies.
   ------------------------------------------------------------
   1. Theme
   2. Mobile navigation
   3. Sticky nav + active section
   4. Scroll reveal
   5. Project filtering
   6. Contact form
   7. Back to top
   8. Housekeeping
============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ============================================================
     1. THEME
     The initial value is set by an inline script in <head> so
     there is no flash. This only handles user toggling.
  ============================================================ */
  var themeToggle = document.getElementById('themeToggle');
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem('jg-theme', theme); } catch (e) {}
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#080D16' : '#FBFAF7');
  }

  if (themeToggle) {
    applyTheme(currentTheme(), false);
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }

  // Follow the OS only while the visitor hasn't made an explicit choice
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var saved = null;
      try { saved = localStorage.getItem('jg-theme'); } catch (err) {}
      if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
    });
  }

  /* ============================================================
     2. MOBILE NAVIGATION
  ============================================================ */
  var burger = document.getElementById('navBurger');
  var navLinks = document.getElementById('navLinks');
  var scrim = document.getElementById('navScrim');

  function setNav(open) {
    if (!burger || !navLinks) return;
    navLinks.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
    if (scrim) {
      scrim.classList.toggle('is-open', open);
      scrim.hidden = !open;
    }
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setNav(burger.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (scrim) scrim.addEventListener('click', function () { setNav(false); });

  if (navLinks) {
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('is-open')) {
      setNav(false);
      if (burger) burger.focus();
    }
  });

  // Reset when returning to desktop width
  var mq = window.matchMedia('(min-width: 901px)');
  function handleMq(e) { if (e.matches) setNav(false); }
  if (mq.addEventListener) mq.addEventListener('change', handleMq);
  else if (mq.addListener) mq.addListener(handleMq);

  /* ============================================================
     3. STICKY NAV + ACTIVE SECTION
  ============================================================ */
  var nav = document.getElementById('nav');
  var toTopBtn = document.getElementById('toTop');

  var sectionIds = ['about', 'skills', 'services', 'work', 'projects', 'contact'];
  var navLinkEls = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var linkFor = {};
  navLinkEls.forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') linkFor[href.slice(1)] = a;
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;

      if (nav) nav.classList.toggle('is-stuck', y > 12);
      if (toTopBtn) toTopBtn.classList.toggle('is-shown', y > 620);

      // Active section: the last one whose top has passed 35% down the viewport
      var marker = y + window.innerHeight * 0.35;
      var active = null;
      for (var i = 0; i < sectionIds.length; i++) {
        var el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= marker) active = sectionIds[i];
      }
      navLinkEls.forEach(function (a) { a.classList.remove('is-active'); });
      if (active && linkFor[active]) linkFor[active].classList.add('is-active');

      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTopBtn) {
    toTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     4. SCROLL REVEAL
  ============================================================ */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  }

  /* ============================================================
     5. PROJECT FILTERING
  ============================================================ */
  var filterBtns = document.querySelectorAll('.filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('#projectGrid .card'));
  var emptyMsg = document.getElementById('projectsEmpty');

  function applyFilter(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-cats') || '').split(/\s+/);
      var match = filter === 'all' || cats.indexOf(filter) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  Array.prototype.forEach.call(filterBtns, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(filterBtns, function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* ============================================================
     6. CONTACT FORM
     Progressive enhancement: without JS the form posts normally
     to Formspree. With JS we validate and submit via fetch.
  ============================================================ */
  var form = document.getElementById('contactForm');
  var okBox = document.getElementById('formOk');
  var errBox = document.getElementById('formErr');
  var submitBtn = document.getElementById('submitBtn');

  if (form) {
    var fields = {
      name: { el: document.getElementById('name'), err: document.getElementById('nameErr') },
      email: { el: document.getElementById('email'), err: document.getElementById('emailErr') },
      message: { el: document.getElementById('message'), err: document.getElementById('messageErr') }
    };

    function setFieldError(field, invalid) {
      if (!field.el) return;
      field.el.setAttribute('aria-invalid', String(invalid));
      if (field.err) field.err.classList.toggle('is-shown', invalid);
    }

    // Clear the error as soon as the visitor starts fixing it
    Object.keys(fields).forEach(function (k) {
      var f = fields[k];
      if (!f.el) return;
      f.el.addEventListener('input', function () {
        if (f.el.getAttribute('aria-invalid') === 'true') setFieldError(f, false);
      });
    });

    function validate() {
      var firstBad = null;

      var nameOk = fields.name.el.value.trim().length >= 2;
      setFieldError(fields.name, !nameOk);
      if (!nameOk) firstBad = firstBad || fields.name.el;

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.el.value.trim());
      setFieldError(fields.email, !emailOk);
      if (!emailOk) firstBad = firstBad || fields.email.el;

      var msgOk = fields.message.el.value.trim().length >= 10;
      setFieldError(fields.message, !msgOk);
      if (!msgOk) firstBad = firstBad || fields.message.el;

      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    function showStatus(which) {
      if (okBox) okBox.classList.toggle('is-shown', which === 'ok');
      if (errBox) errBox.classList.toggle('is-shown', which === 'err');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showStatus(null);
      if (!validate()) return;

      var label = submitBtn ? submitBtn.querySelector('.btn__label') : null;
      var originalText = label ? label.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        if (label) label.textContent = 'Sending…';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          showStatus('ok');
          if (okBox) okBox.setAttribute('tabindex', '-1'), okBox.focus();
        })
        .catch(function () {
          showStatus('err');
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            if (label) label.textContent = originalText;
          }
        });
    });
  }

  /* ============================================================
     7. HOUSEKEEPING
  ============================================================ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Marquee: duplicate the track so the loop is seamless at any width
  var track = document.querySelector('.marquee__track');
  if (track && !track.dataset.cloned) {
    track.dataset.cloned = '1';
  }
})();
