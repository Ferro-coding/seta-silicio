/* ============================================================
   APP — Orchestrator

   Boot sequence (order matters):
   1.  Register GSAP plugins
   2.  Start Lenis smooth scroll + sync with GSAP ticker
   3.  Wait for preloader (all images loaded)
   4.  Init cursor (non-blocking, cosmetic)
   5.  Refresh ScrollTrigger (correct measurements)
   6.  Init scroll animations

   Nothing touches ScrollTrigger before images are loaded.
   ============================================================ */

import { createPreloader } from './preloader.js';
import { initCursor }      from './cursor.js';
import { initAnimations }  from './animations.js';

// 1. GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// 2. Lenis smooth scroll ↔ GSAP sync
const lenis = new Lenis({
    lerp: 0.18,
    smoothWheel: true,
    wheelMultiplier: 1
});

// Expose for animations.js to pause/resume during horizontal pin
window.__lenis = lenis;

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// 3. Boot
(async () => {
    await createPreloader();       // blocks until every <img> is loaded

    initCursor();                  // cosmetic — doesn't affect layout

    ScrollTrigger.refresh(true);   // full recalc with correct image sizes

    initAnimations();              // all scroll-driven work

    // Recalc on resize — ignore mobile address bar show/hide
    // (only triggers refresh when WIDTH changes, not height-only changes)
    let resizeTimer;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        if (newWidth === lastWidth) return; // height-only = address bar
        lastWidth = newWidth;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(true), 250);
    });
})();
