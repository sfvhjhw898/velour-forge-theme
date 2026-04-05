/*!
 * FORGE Micro-Interaction Library v1.0
 * Self-initialising via data attributes. Loads GSAP from CDN only when needed.
 *
 * USAGE:
 *   data-forge-anim="fade-up"     — fade + translate up on scroll
 *   data-forge-anim="stagger"     — stagger children on scroll
 *   data-forge-anim="reveal"      — clip-path text reveal on scroll
 *   data-forge-magnet="0.3"       — magnetic pull toward cursor on hover
 *   data-forge-parallax="0.3"     — parallax scroll (speed 0–1)
 *   data-forge-counter="1000"     — count up to number on scroll
 *   data-forge-counter-suffix="+" — suffix appended to counter value
 *   data-forge-hover-lift         — lifts element on hover with shadow
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── GSAP loader ─────────────────────────────────────────────────────────────
  function loadGSAP(callback) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      callback(); return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    script.onload = function () {
      var st = document.createElement('script');
      st.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
      st.onload = function () {
        gsap.registerPlugin(ScrollTrigger);
        callback();
      };
      document.head.appendChild(st);
    };
    document.head.appendChild(script);
  }

  // ── Fade up ─────────────────────────────────────────────────────────────────
  function initFadeUp() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-anim="fade-up"]').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
      );
    });
  }

  // ── Stagger children ────────────────────────────────────────────────────────
  function initStagger() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-anim="stagger"]').forEach(function (parent) {
      gsap.fromTo(parent.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: parent, start: 'top 80%', once: true } }
      );
    });
  }

  // ── Clip-path text reveal ───────────────────────────────────────────────────
  function initReveal() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-anim="reveal"]').forEach(function (el) {
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true } }
      );
    });
  }

  // ── Magnetic button ─────────────────────────────────────────────────────────
  function initMagnetic() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-magnet]').forEach(function (el) {
      var strength = parseFloat(el.dataset.forgeMagnet) || 0.4;
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
        var dy = (e.clientY - (rect.top  + rect.height / 2)) * strength;
        gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  // ── Parallax ────────────────────────────────────────────────────────────────
  function initParallax() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-parallax]').forEach(function (el) {
      var speed = parseFloat(el.dataset.forgeParallax) || 0.3;
      gsap.to(el, {
        yPercent: -30 * speed, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  // ── Count up ────────────────────────────────────────────────────────────────
  function initCounters() {
    document.querySelectorAll('[data-forge-counter]').forEach(function (el) {
      var target = parseFloat(el.dataset.forgeCounter) || 0;
      var suffix = el.dataset.forgeCounterSuffix || '';
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2, ease: 'power1.out',
        onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
  }

  // ── Hover lift ──────────────────────────────────────────────────────────────
  function initHoverLift() {
    document.querySelectorAll('[data-forge-hover-lift]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        gsap.to(el, { y: -6, duration: 0.25, ease: 'power2.out',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.15)' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { y: 0, duration: 0.35, ease: 'power2.out',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)' });
      });
    });
  }

  // ── Custom cursor ────────────────────────────────────────────────────────────
  function initCustomCursor() {
    if (!document.documentElement.dataset.forgeCursor) return;
    if ('ontouchstart' in window) return;
    if (!document.getElementById('forge-cursor')) {
      var el = document.createElement('div');
      el.id = 'forge-cursor';
      el.innerHTML = '<div class="forge-cursor__dot"></div><div class="forge-cursor__ring"></div>';
      document.body.appendChild(el);
    }
    var dot = document.querySelector('.forge-cursor__dot');
    var ring = document.querySelector('.forge-cursor__ring');
    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    var LERP = 0.12;
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    });
    gsap.ticker.add(function () {
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      gsap.set(ring, { x: ringX, y: ringY });
    });
    document.querySelectorAll('a,button,[data-forge-magnet],.forge-cursor-grow').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        gsap.to(ring, { scale: 2.8, opacity: 0.4, duration: 0.3, ease: 'power2.out' });
        gsap.to(dot,  { scale: 0, duration: 0.2 });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' });
        gsap.to(dot,  { scale: 1, duration: 0.3 });
      });
    });
    document.documentElement.style.cursor = 'none';
  }

  // ── Text splitting ────────────────────────────────────────────────────────────
  function splitText(el) {
    var mode = el.dataset.forgeSplit || 'words';
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    if (mode === 'chars') {
      text.split('').forEach(function (char) {
        var s = document.createElement('span');
        s.className = 'forge-char'; s.style.display = 'inline-block';
        s.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(s);
      });
    } else if (mode === 'words') {
      text.split(' ').forEach(function (word, i, arr) {
        var s = document.createElement('span');
        s.className = 'forge-word'; s.style.display = 'inline-block';
        s.textContent = word; el.appendChild(s);
        if (i < arr.length - 1) {
          var sp = document.createElement('span');
          sp.style.display = 'inline-block'; sp.textContent = '\u00A0'; el.appendChild(sp);
        }
      });
    } else if (mode === 'lines') {
      text.split('\n').forEach(function (line) {
        var outer = document.createElement('span');
        outer.className = 'forge-line';
        outer.style.cssText = 'display:block;overflow:hidden;';
        var inner = document.createElement('span');
        inner.style.display = 'block'; inner.textContent = line;
        outer.appendChild(inner); el.appendChild(outer);
      });
    }
  }

  function initTextSplit() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-split]').forEach(function (el) {
      splitText(el);
      var anim  = el.dataset.forgeSplitAnim; if (!anim) return;
      var chars = el.querySelectorAll('.forge-char');
      var words = el.querySelectorAll('.forge-word');
      var lines = el.querySelectorAll('.forge-line > span');
      if (anim === 'wave' && chars.length)
        gsap.fromTo(chars, { y: 40, opacity: 0, rotateZ: 4 },
          { y: 0, opacity: 1, rotateZ: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.025,
            scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
      if (anim === 'slide' && words.length)
        gsap.fromTo(words, { y: '110%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06,
            scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
      if (anim === 'reveal' && lines.length)
        gsap.fromTo(lines, { y: '101%' },
          { y: '0%', duration: 0.9, ease: 'power4.out', stagger: 0.12,
            scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
    });
  }

  // ── Letter scramble ───────────────────────────────────────────────────────────
  function scrambleText(el, finalText, dur) {
    var chars  = (el.dataset.forgeScrambleChars || '!@#$%ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').split('');
    var frames = Math.round((dur || 1000) / 40);
    var frame  = 0;
    var id = setInterval(function () {
      var progress = frame / frames;
      var resolved = Math.floor(progress * finalText.length);
      el.textContent = finalText.split('').map(function (c, i) {
        return c === ' ' ? ' ' : i < resolved ? c : chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (++frame >= frames) { clearInterval(id); el.textContent = finalText; }
    }, 40);
  }

  function initScramble() {
    document.querySelectorAll('[data-forge-scramble]').forEach(function (el) {
      var text    = el.textContent.trim();
      var trigger = el.dataset.forgeScramble;
      if (trigger === 'hover') {
        el.addEventListener('mouseenter', function () { scrambleText(el, text, 600); });
      } else {
        ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
          onEnter: function () { scrambleText(el, text); } });
      }
    });
  }

  // ── 3D card tilt ──────────────────────────────────────────────────────────────
  function initCardTilt() {
    if (prefersReduced || 'ontouchstart' in window) return;
    document.querySelectorAll('[data-forge-tilt]').forEach(function (card) {
      var intensity = parseFloat(card.dataset.forgeTiltIntensity) || 12;
      var hasGlare  = card.dataset.forgeTiltGlare === 'true';
      if (hasGlare && !card.querySelector('.forge-tilt-glare')) {
        var g = document.createElement('div'); g.className = 'forge-tilt-glare'; card.appendChild(g);
      }
      card.style.cssText += 'transform-style:preserve-3d;will-change:transform;';
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var ry =  ((e.clientX - r.left  - r.width  / 2) / (r.width  / 2)) * intensity;
        var rx = -((e.clientY - r.top   - r.height / 2) / (r.height / 2)) * intensity;
        card.style.transition = 'transform 0.05s linear';
        card.style.transform  = 'perspective(800px) rotateX('+rx+'deg) rotateY('+ry+'deg) scale3d(1.02,1.02,1.02)';
        if (hasGlare) {
          var glare = card.querySelector('.forge-tilt-glare');
          var angle = Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2))*(180/Math.PI);
          if (glare) { glare.style.background='linear-gradient('+angle+'deg,rgba(255,255,255,0.14) 0%,transparent 60%)'; glare.style.opacity='1'; }
        }
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        var glare = card.querySelector('.forge-tilt-glare');
        if (glare) glare.style.opacity = '0';
      });
    });
  }

  // ── Pinned horizontal scroll ──────────────────────────────────────────────────
  function initHorizontalScroll() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-hscroll]').forEach(function (container) {
      var track = container.querySelector('.forge-hscroll-track');
      if (!track) return;
      gsap.to(track, {
        x: function () { return -(track.scrollWidth - container.offsetWidth); },
        ease: 'none',
        scrollTrigger: {
          trigger: container, start: 'top top',
          end: function () { return '+='+(track.scrollWidth - container.offsetWidth); },
          pin: true, scrub: 1, invalidateOnRefresh: true
        }
      });
    });
  }

  // ── Variable font weight on scroll ────────────────────────────────────────────
  function initVariableFont() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-forge-varfont]').forEach(function (el) {
      var axis = el.dataset.forgeVarfont      || 'wght';
      var from = parseFloat(el.dataset.forgeVarfontFrom) || 100;
      var to   = parseFloat(el.dataset.forgeVarfontTo  ) || 900;
      gsap.fromTo(el,
        { fontVariationSettings: "'"+axis+"' "+from },
        { fontVariationSettings: "'"+axis+"' "+to, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 30%', scrub: true } }
      );
    });
  }

  // ── Section clip-path wipes ───────────────────────────────────────────────────
  function initSectionWipes() {
    if (prefersReduced) return;
    document.querySelectorAll('.forge-section-wipe').forEach(function (section) {
      gsap.fromTo(section,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 90%', end: 'top 40%', scrub: 0.5 } }
      );
    });
  }

  // ── Ticker / marquee ─────────────────────────────────────────────────────────
  function initTickers() {
    document.querySelectorAll('[data-forge-ticker]').forEach(function (track) {
      var speed = parseFloat(track.dataset.forgeTickerSpeed) || 60;
      var dir   = track.dataset.forgeTickerDir === 'rtl' ? 1 : -1;
      Array.from(track.children).map(function (item) { return item.cloneNode(true); })
        .forEach(function (c) { c.setAttribute('aria-hidden','true'); track.appendChild(c); });
      var halfWidth = track.scrollWidth / 2;
      var x = 0, paused = false;
      gsap.ticker.add(function (_, dt) {
        if (paused) return;
        x += dir * speed * (dt / 1000);
        if (Math.abs(x) >= halfWidth) x = 0;
        gsap.set(track, { x: x });
      });
      var wrap = track.closest('[data-forge-ticker-wrap]') || track.parentElement;
      if (wrap) {
        wrap.addEventListener('mouseenter', function () { paused = true; });
        wrap.addEventListener('mouseleave', function () { paused = false; });
      }
    });
  }

  // ── Page intro choreography ───────────────────────────────────────────────────
  function initPageIntro() {
    if (!document.documentElement.dataset.forgeIntro) return;
    if (sessionStorage.getItem('forge-intro-played')) return;
    var overlay = document.querySelector('[data-forge-intro-overlay]');
    var nav     = document.querySelector('.section-header,header');
    var heading = document.querySelector('[data-forge-split-anim],h1');
    document.body.style.overflow = 'hidden';
    var tl = gsap.timeline({
      onComplete: function () {
        document.body.style.overflow = '';
        sessionStorage.setItem('forge-intro-played', '1');
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }
    });
    if (overlay)
      tl.to(overlay, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.0, ease: 'power4.inOut' }, 0.3);
    if (nav)
      tl.fromTo(nav, { yPercent: -110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.6);
    if (heading) {
      var targets = heading.querySelectorAll('.forge-word,.forge-char,.forge-line > span');
      if (targets.length)
        tl.fromTo(targets, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.04 }, 0.75);
    }
  }

  // ── 3D helper styles (injected once) ─────────────────────────────────────────
  function inject3DHelperStyles() {
    if (document.getElementById('forge-3d-styles')) return;
    var s = document.createElement('style'); s.id = 'forge-3d-styles';
    s.textContent =
      '.forge-3d-flip{perspective:800px}' +
      '.forge-3d-flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.34,1.56,.64,1)}' +
      '.forge-3d-flip:hover .forge-3d-flip-inner{transform:rotateY(180deg)}' +
      '.forge-3d-flip-front,.forge-3d-flip-back{position:absolute;inset:0;backface-visibility:hidden}' +
      '.forge-3d-flip-back{transform:rotateY(180deg)}' +
      '.forge-3d-rotate-slow{animation:forge-ry 12s linear infinite}' +
      '@keyframes forge-ry{from{transform:perspective(600px) rotateY(0)}to{transform:perspective(600px) rotateY(360deg)}}' +
      '.forge-tilt-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;z-index:2;transition:opacity .2s}';
    document.head.appendChild(s);
  }

  // ── Init all ────────────────────────────────────────────────────────────────
  function init() {
    inject3DHelperStyles();
    initFadeUp(); initStagger(); initReveal();
    initMagnetic(); initParallax(); initCounters(); initHoverLift();
    initCustomCursor(); initTextSplit(); initScramble();
    initCardTilt(); initHorizontalScroll(); initVariableFont();
    initSectionWipes(); initTickers(); initPageIntro();
  }

  // Only load GSAP if there are elements that need it
  var needsGSAP = document.querySelector(
    '[data-forge-anim],[data-forge-magnet],[data-forge-parallax],[data-forge-counter],[data-forge-hover-lift]'
  );
  if (needsGSAP) {
    loadGSAP(init);
  }

  // Refresh after Shopify theme editor section loads
  document.addEventListener('shopify:section:load', function () {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
      init();
    }
  });
})();
