/*!
 * FORGE Scroll Reveal v2.0
 * IntersectionObserver — no dependencies.
 */
(function(){
  'use strict';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  var style = document.createElement('style');
  style.textContent = [
    '[data-forge-anim]{opacity:0}',
    '[data-forge-anim="fade-up"]{transform:translateY(40px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}',
    '[data-forge-anim="reveal"]{clip-path:inset(0 100% 0 0);transition:opacity .4s,clip-path .9s cubic-bezier(.25,.46,.45,.94)}',
    '[data-forge-anim].forge-visible{opacity:1;transform:none;clip-path:inset(0 0% 0 0)}',
    '[data-forge-anim="stagger"]{opacity:1}',
    '[data-forge-anim="stagger"]>*{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1)}',
    '[data-forge-anim="stagger"].forge-visible>*{opacity:1;transform:none}',
    '[data-forge-anim="stagger"].forge-visible>*:nth-child(1){transition-delay:0s}',
    '[data-forge-anim="stagger"].forge-visible>*:nth-child(2){transition-delay:.08s}',
    '[data-forge-anim="stagger"].forge-visible>*:nth-child(3){transition-delay:.16s}',
    '[data-forge-anim="stagger"].forge-visible>*:nth-child(4){transition-delay:.24s}',
    '[data-forge-anim="stagger"].forge-visible>*:nth-child(n+5){transition-delay:.32s}',
  ].join('');
  document.head.appendChild(style);

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('forge-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  function observe() {
    document.querySelectorAll('[data-forge-anim]').forEach(function(el) { io.observe(el); });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', observe)
    : observe();
  document.addEventListener('shopify:section:load', observe);
})();
