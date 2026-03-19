/* pittch-scroll-reveal.js
   Intersection Observer–driven scroll reveals.
   Applies data-reveal="masked|slide-up|zoom|stagger" to Dawn built-ins
   and observes every [data-reveal] element (including those set in Liquid).
   Runs once per page. Respects prefers-reduced-motion.
*/

(function () {
  'use strict';

  if (window.__forgeRevealInit) return;
  window.__forgeRevealInit = true;

  /* Skip entirely for users who prefer reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Auto-apply reveal types to Dawn built-in elements ────────────── */

  var AUTO_RULES = [
    /* Headings → masked clip-reveal */
    {
      type: 'masked',
      selectors: [
        '.featured-collection__title',
        '.rich-text__heading',
        '.image-with-text__heading',
        '.multicolumn__title',
        '.newsletter__heading',
        '.collapsible-content__heading',
      ],
    },
    /* Subtitles / body copy → slide-up */
    {
      type: 'slide-up',
      selectors: [
        '.featured-collection .collection-description',
        '.rich-text__text p',
        '.image-with-text__text p',
        '.newsletter__subheading',
        '.psh-content__sub',
      ],
    },
    /* Image wrappers → soft zoom */
    {
      type: 'zoom',
      selectors: [
        '.image-with-text__media',
        '.banner__media',
        '.collection-hero__image',
      ],
    },
    /* Product grid → stagger children */
    {
      type: 'stagger',
      selectors: [
        '.product-grid',
      ],
    },
  ];

  AUTO_RULES.forEach(function (rule) {
    rule.selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        /* Don't overwrite explicit data-reveal set in Liquid */
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', rule.type);
        }
      });
    });
  });

  /* ── Intersection Observer ──────────────────────────────────────────── */

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  function observeAll() {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      io.observe(el);
    });
  }

  /* Handle both DOMContentLoaded and dynamic Shopify section renders */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAll);
  } else {
    observeAll();
  }

  /* Re-observe after Shopify theme editor section changes */
  document.addEventListener('shopify:section:load', function () {
    window.__forgeRevealInit = false;
    /* Re-run from scratch for the newly loaded section */
    setTimeout(observeAll, 100);
  });
})();
