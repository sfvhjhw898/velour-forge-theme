/*!
 * FORGE Interactions v2.0
 * GSAP-powered. All effects via data-forge-* attributes.
 */
(function(){
  'use strict';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadGSAP(cb) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') { cb(); return; }
    var s1 = document.createElement('script');
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    s1.onload = function() {
      var s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
      s2.onload = function() { gsap.registerPlugin(ScrollTrigger); cb(); };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  }

  /* --- CURSOR --- */
  function initCursor() {
    if (!document.documentElement.dataset.forgeCursor) return;
    if ('ontouchstart' in window) return;
    if (!document.getElementById('forge-cursor')) {
      var c = document.createElement('div'); c.id = 'forge-cursor';
      c.innerHTML = '<div class="forge-cursor__dot"></div><div class="forge-cursor__ring"></div>';
      document.body.appendChild(c);
    }
    var dot = document.querySelector('.forge-cursor__dot');
    var ring = document.querySelector('.forge-cursor__ring');
    var mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; gsap.set(dot,{x:mx,y:my}); });
    gsap.ticker.add(function(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; gsap.set(ring,{x:rx,y:ry}); });
    document.querySelectorAll('a,button,[data-forge-magnet],.forge-cursor-grow').forEach(function(el){
      el.addEventListener('mouseenter',function(){ gsap.to(ring,{scale:2.8,opacity:.4,duration:.3}); gsap.to(dot,{scale:0,duration:.2}); });
      el.addEventListener('mouseleave',function(){ gsap.to(ring,{scale:1,opacity:1,duration:.5,ease:'elastic.out(1,.5)'}); gsap.to(dot,{scale:1,duration:.3}); });
    });
    document.documentElement.style.cursor = 'none';
  }

  /* --- TEXT SPLIT --- */
  function splitEl(el) {
    var mode = el.dataset.forgeSplit||'words', text = el.textContent.trim();
    el.setAttribute('aria-label',text); el.textContent = '';
    if (mode==='chars') {
      text.split('').forEach(function(c){ var s=document.createElement('span'); s.className='forge-char'; s.style.display='inline-block'; s.textContent=(c===' ')?'\u00a0':c; el.appendChild(s); });
    } else if (mode==='words') {
      text.split(' ').forEach(function(w,i,a){ var s=document.createElement('span'); s.className='forge-word'; s.style.display='inline-block'; s.textContent=w; el.appendChild(s); if(i<a.length-1){var sp=document.createElement('span'); sp.style.display='inline-block'; sp.textContent='\u00a0'; el.appendChild(sp);} });
    } else {
      text.split('\n').forEach(function(line){ var o=document.createElement('span'); o.className='forge-line'; o.style.cssText='display:block;overflow:hidden;'; var i2=document.createElement('span'); i2.style.display='block'; i2.textContent=line; o.appendChild(i2); el.appendChild(o); });
    }
  }
  function initSplit() {
    if(prefersReduced) return;
    document.querySelectorAll('[data-forge-split]').forEach(function(el){
      splitEl(el);
      var anim=el.dataset.forgeSplitAnim; if(!anim) return;
      var chars=el.querySelectorAll('.forge-char'), words=el.querySelectorAll('.forge-word'), lines=el.querySelectorAll('.forge-line>span');
      var trig={trigger:el,start:'top 82%',once:true};
      if(anim==='wave'&&chars.length) gsap.fromTo(chars,{y:40,opacity:0,rotateZ:4},{y:0,opacity:1,rotateZ:0,duration:.6,ease:'back.out(2)',stagger:.025,scrollTrigger:trig});
      if(anim==='slide'&&words.length) gsap.fromTo(words,{y:'110%',opacity:0},{y:'0%',opacity:1,duration:.7,ease:'power3.out',stagger:.06,scrollTrigger:trig});
      if(anim==='reveal'&&lines.length) gsap.fromTo(lines,{y:'101%'},{y:'0%',duration:.9,ease:'power4.out',stagger:.12,scrollTrigger:{trigger:el,start:'top 80%',once:true}});
    });
  }

  /* --- SCRAMBLE --- */
  function scramble(el,text,dur) {
    var chars=(el.dataset.forgeScrambleChars||'!@#$%ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').split('');
    var frames=Math.round((dur||1000)/40), frame=0;
    var id=setInterval(function(){
      var p=frame/frames, r=Math.floor(p*text.length);
      el.textContent=text.split('').map(function(c,i){ return c===' '?' ':i<r?c:chars[Math.floor(Math.random()*chars.length)]; }).join('');
      if(++frame>=frames){clearInterval(id);el.textContent=text;}
    },40);
  }
  function initScramble() {
    document.querySelectorAll('[data-forge-scramble]').forEach(function(el){
      var text=el.textContent.trim(), trig=el.dataset.forgeScramble;
      if(trig==='hover'){el.addEventListener('mouseenter',function(){scramble(el,text,600);});}
      else{ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:function(){scramble(el,text);}});}
    });
  }

  /* --- MAGNETIC --- */
  function initMagnetic() {
    if(prefersReduced||'ontouchstart' in window) return;
    document.querySelectorAll('[data-forge-magnet]').forEach(function(el){
      var s=parseFloat(el.dataset.forgeMagnet)||.4;
      el.addEventListener('mousemove',function(e){ var r=el.getBoundingClientRect(); gsap.to(el,{x:(e.clientX-r.left-r.width/2)*s,y:(e.clientY-r.top-r.height/2)*s,duration:.3,ease:'power2.out'}); });
      el.addEventListener('mouseleave',function(){ gsap.to(el,{x:0,y:0,duration:.5,ease:'elastic.out(1,.5)'}); });
    });
  }

  /* --- TILT --- */
  function initTilt() {
    if(prefersReduced||'ontouchstart' in window) return;
    document.querySelectorAll('[data-forge-tilt]').forEach(function(card){
      var int=parseFloat(card.dataset.forgeTiltIntensity)||12, glare=card.dataset.forgeTiltGlare==='true';
      if(glare&&!card.querySelector('.forge-tilt-glare')){var g=document.createElement('div');g.className='forge-tilt-glare';card.appendChild(g);}
      card.style.cssText+='transform-style:preserve-3d;will-change:transform;';
      card.addEventListener('mousemove',function(e){
        var r=card.getBoundingClientRect();
        var ry=((e.clientX-r.left-r.width/2)/(r.width/2))*int;
        var rx=-((e.clientY-r.top-r.height/2)/(r.height/2))*int;
        card.style.transition='transform .05s linear';
        card.style.transform='perspective(800px) rotateX('+rx+'deg) rotateY('+ry+'deg) scale3d(1.02,1.02,1.02)';
        if(glare){var gl=card.querySelector('.forge-tilt-glare');var ang=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*(180/Math.PI);if(gl){gl.style.background='linear-gradient('+ang+'deg,rgba(255,255,255,.14) 0%,transparent 60%)';gl.style.opacity='1';}}
      });
      card.addEventListener('mouseleave',function(){
        card.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1)';
        card.style.transform='perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        var gl=card.querySelector('.forge-tilt-glare'); if(gl) gl.style.opacity='0';
      });
    });
  }

  /* --- HOVER LIFT --- */
  function initHoverLift() {
    document.querySelectorAll('[data-forge-hover-lift]').forEach(function(el){
      el.addEventListener('mouseenter',function(){ gsap.to(el,{y:-6,duration:.25,ease:'power2.out',boxShadow:'0 16px 40px rgba(0,0,0,.15)'}); });
      el.addEventListener('mouseleave',function(){ gsap.to(el,{y:0,duration:.35,ease:'power2.out',boxShadow:'0 4px 16px rgba(0,0,0,.08)'}); });
    });
  }

  /* --- PARALLAX --- */
  function initParallax() {
    if(prefersReduced) return;
    document.querySelectorAll('[data-forge-parallax]').forEach(function(el){
      var s=parseFloat(el.dataset.forgeParallax)||.3;
      gsap.to(el,{yPercent:-30*s,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});
    });
  }

  /* --- COUNTER --- */
  function initCounters() {
    document.querySelectorAll('[data-forge-counter]').forEach(function(el){
      var target=parseFloat(el.dataset.forgeCounter)||0, suffix=el.dataset.forgeCounterSuffix||'', obj={val:0};
      gsap.to(obj,{val:target,duration:2,ease:'power1.out',onUpdate:function(){el.textContent=Math.round(obj.val)+suffix;},scrollTrigger:{trigger:el,start:'top 85%',once:true}});
    });
  }

  /* --- HSCROLL --- */
  function initHScroll() {
    if(prefersReduced) return;
    document.querySelectorAll('[data-forge-hscroll]').forEach(function(c){
      var track=c.querySelector('.forge-hscroll-track'); if(!track) return;
      var getDist=function(){ return track.scrollWidth-c.offsetWidth; };
      gsap.to(track,{x:function(){return -getDist();},ease:'none',scrollTrigger:{trigger:c,start:'top top',end:function(){return '+='+getDist();},pin:true,scrub:1,invalidateOnRefresh:true}});
    });
  }

  /* --- VARFONT --- */
  function initVarFont() {
    if(prefersReduced) return;
    document.querySelectorAll('[data-forge-varfont]').forEach(function(el){
      var ax=el.dataset.forgeVarfont||'wght', from=parseFloat(el.dataset.forgeVarfontFrom)||100, to=parseFloat(el.dataset.forgeVarfontTo)||900;
      gsap.fromTo(el,{fontVariationSettings:"'"+ax+"' "+from},{fontVariationSettings:"'"+ax+"' "+to,ease:'none',scrollTrigger:{trigger:el,start:'top 80%',end:'top 30%',scrub:true}});
    });
  }

  /* --- SECTION WIPES --- */
  function initWipes() {
    if(prefersReduced) return;
    document.querySelectorAll('.forge-section-wipe').forEach(function(s){
      gsap.fromTo(s,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:s,start:'top 90%',end:'top 40%',scrub:.5}});
    });
  }

  /* --- TICKERS --- */
  function initTickers() {
    document.querySelectorAll('[data-forge-ticker]').forEach(function(track){
      var speed=parseFloat(track.dataset.forgeTickerSpeed)||60;
      var dir=track.dataset.forgeTickerDir==='rtl'?1:-1;
      Array.from(track.children).map(function(i){return i.cloneNode(true);}).forEach(function(c){c.setAttribute('aria-hidden','true');track.appendChild(c);});
      var half=track.scrollWidth/2, x=0, paused=false;
      gsap.ticker.add(function(_,dt){ if(paused)return; x+=dir*speed*(dt/1000); if(Math.abs(x)>=half)x=0; gsap.set(track,{x:x}); });
      var wrap=track.closest('[data-forge-ticker-wrap]')||track.parentElement;
      if(wrap){ wrap.addEventListener('mouseenter',function(){paused=true;}); wrap.addEventListener('mouseleave',function(){paused=false;}); }
    });
  }

  /* --- PAGE INTRO --- */
  function initIntro() {
    if(!document.documentElement.dataset.forgeIntro) return;
    if(sessionStorage.getItem('forge-intro-played')) return;
    var overlay=document.querySelector('[data-forge-intro-overlay]');
    var nav=document.querySelector('.section-header,header');
    var h1=document.querySelector('[data-forge-split-anim],h1');
    document.body.style.overflow='hidden';
    var tl=gsap.timeline({onComplete:function(){document.body.style.overflow='';sessionStorage.setItem('forge-intro-played','1');ScrollTrigger.refresh();}});
    if(overlay) tl.to(overlay,{clipPath:'inset(0% 0% 100% 0%)',duration:1,ease:'power4.inOut'},0.3);
    if(nav) tl.fromTo(nav,{yPercent:-110,opacity:0},{yPercent:0,opacity:1,duration:.7,ease:'power3.out'},0.6);
    if(h1){ var targets=h1.querySelectorAll('.forge-word,.forge-char,.forge-line>span'); if(targets.length) tl.fromTo(targets,{y:'100%',opacity:0},{y:'0%',opacity:1,duration:.8,ease:'power3.out',stagger:.04},0.75); }
  }

  /* --- 3D HELPER STYLES --- */
  function inject3d() {
    if(document.getElementById('forge-3d')) return;
    var s=document.createElement('style'); s.id='forge-3d';
    s.textContent='.forge-3d-flip{perspective:800px}.forge-3d-flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.34,1.56,.64,1)}.forge-3d-flip:hover .forge-3d-flip-inner{transform:rotateY(180deg)}.forge-3d-flip-front,.forge-3d-flip-back{position:absolute;inset:0;backface-visibility:hidden}.forge-3d-flip-back{transform:rotateY(180deg)}.forge-3d-rotate-slow{animation:forge-ry 12s linear infinite}@keyframes forge-ry{from{transform:perspective(600px) rotateY(0)}to{transform:perspective(600px) rotateY(360deg)}}.forge-tilt-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;z-index:2;transition:opacity .2s}';
    document.head.appendChild(s);
  }

  /* --- INIT --- */
  function init() {
    inject3d(); initCursor(); initSplit(); initScramble(); initMagnetic();
    initTilt(); initHoverLift(); initParallax(); initCounters();
    initHScroll(); initVarFont(); initWipes(); initTickers(); initIntro();
  }

  var needsGSAP=document.querySelector('[data-forge-split],[data-forge-scramble],[data-forge-magnet],[data-forge-tilt],[data-forge-parallax],[data-forge-counter],[data-forge-hscroll],[data-forge-varfont],[data-forge-ticker],[data-forge-cursor],[data-forge-intro],.forge-section-wipe');
  if(needsGSAP){ loadGSAP(init); } else { inject3d(); initHoverLift(); initTickers(); }
  document.addEventListener('shopify:section:load', function(){ if(typeof ScrollTrigger!=='undefined'){ScrollTrigger.refresh();init();} });
})();
