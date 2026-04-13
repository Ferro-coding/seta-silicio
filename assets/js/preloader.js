/* ============================================================
   PRELOADER
   Loads only above-the-fold (eager) images, tracks progress.
   Returns a Promise — nothing else runs until this resolves.
   ============================================================ */

export function createPreloader() {
    const el       = document.querySelector('.loader');
    const countEl  = el.querySelector('.loader__count');
    const barFill  = el.querySelector('.loader__bar-fill');

    // Only eager images — lazy ones load on scroll, don't block
    const images = [...document.querySelectorAll('img:not([loading="lazy"])')];
    const total  = images.length || 1;
    let loaded   = 0;
    let counter  = { val: 0 };   // single tween target, no overlap

    return new Promise(resolve => {
        if (!images.length) {
            _finish(resolve);
            return;
        }

        images.forEach(img => {
            if (img.complete && img.naturalWidth > 0) {
                _tick(resolve);
            } else {
                img.addEventListener('load',  () => _tick(resolve), { once: true });
                img.addEventListener('error', () => _tick(resolve), { once: true });
            }
        });

        // Safety — never block longer than 4s
        setTimeout(() => {
            if (loaded < total) _finish(resolve);
        }, 4000);
    });

    function _tick(resolve) {
        loaded++;
        const pct = Math.round((loaded / total) * 100);

        // Single tween — kill previous to avoid overlap
        gsap.killTweensOf(counter);
        gsap.to(counter, {
            val: pct,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate() {
                const v = Math.round(counter.val);
                countEl.textContent = v;
                barFill.style.width = v + '%';
            },
            onComplete() {
                if (loaded >= total) _finish(resolve);
            }
        });
    }

    function _finish(resolve) {
        // Prevent double-fire
        if (el.dataset.done) return;
        el.dataset.done = '1';

        // Snap to 100
        gsap.killTweensOf(counter);
        countEl.textContent = '100';
        barFill.style.width = '100%';

        gsap.to(el, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power4.inOut',
            delay: 0.4,
            onComplete() {
                el.style.display = 'none';
                resolve();
            }
        });
    }
}
