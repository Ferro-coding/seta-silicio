/* ============================================================
   CUSTOM CURSOR
   Dot (fast) + Ring (slower follower).
   Magnetic pull on interactive elements.
   ============================================================ */

export function initCursor() {
    // Skip on touch devices
    if (matchMedia('(hover: none)').matches) return;

    const dot  = document.querySelector('.cursor--dot');
    const ring = document.querySelector('.cursor--ring');
    if (!dot || !ring) return;

    const dotWrap  = dot.closest('.cursor') || dot;
    const ringWrap = ring.closest('.cursor') || ring;

    // ---- Pointer tracking ----
    window.addEventListener('mousemove', e => {
        gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'power2.out' });
        gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.30, ease: 'power2.out' });
    });

    // ---- Hover states ----
    const interactives = document.querySelectorAll('a, button, .btn-magnetic');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('cursor--hover');
            ring.classList.add('cursor--hover');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('cursor--hover');
            ring.classList.remove('cursor--hover');
        });
    });

    // ---- Magnetic pull on .btn-magnetic ----
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const dx = e.clientX - r.left - r.width / 2;
            const dy = e.clientY - r.top  - r.height / 2;
            gsap.to(btn, { x: dx * 0.25, y: dy * 0.25, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
    });
}
