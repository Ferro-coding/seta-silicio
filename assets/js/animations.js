/* ============================================================
   SCROLL ANIMATIONS v3
   Every scroll-driven animation in one place.
   Called AFTER preloader resolves and layout is calculated.

   Flow: Hero → Mosaic (clip-path reveal) → Itineraries → Cinematic → Footer
   ============================================================ */

export function initAnimations() {
    _heroEntrance();
    _heroParallax();
    _heroFadeOut();
    _mosaicAnimations();
    _horizontalScroll();
    _cinematicZoom();
    _footerReveal();
}


/* ═══════════════════ HERO ═══════════════════ */

function _heroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero .line-reveal__inner', {
        y: 0, duration: 1.3, stagger: 0.12
    })
    .to('.hero__tag',         { opacity: 1, duration: 0.8 }, '-=0.7')
    .to('.hero__cta',         { opacity: 1, duration: 0.8 }, '-=0.5')
    .to('.hero__coords',      { opacity: 0.7, duration: 0.8 }, '-=0.4')
    .to('.hero__scroll-hint', { opacity: 0.7, duration: 0.8 }, '-=0.5');
}

function _heroParallax() {
    // Background moves DOWN (away from user)
    gsap.to('.hero__bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // Text content moves UP (opposite direction → depth)
    gsap.to('#hero-content', {
        yPercent: -25,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}

function _heroFadeOut() {
    // Entire hero fades out as you scroll away
    gsap.to('.hero', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: '60% top',
            end: 'bottom top',
            scrub: true
        }
    });
}


/* ═══════════════════ MOSAIC ═══════════════════ */

/* Agency-style mosaic: images slide in from edges, text fades up.
   Fully scrub-driven for reversibility. */
function _mosaicAnimations() {
    const images = document.querySelectorAll('.mosaic__img');
    const headline = document.querySelector('.mosaic__text');
    if (!images.length) return;

    // Directions: each image slides in from its corner
    const directions = [
        { x: -80, y: -40 },   // top-left
        { x: 80, y: -40 },    // top-right
        { x: -80, y: 40 },    // bottom-left
        { x: 80, y: 40 }      // bottom-right
    ];

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.mosaic',
            start: 'top 85%',
            end: 'center center',
            scrub: true
        }
    });

    // Images slide in from their edges
    images.forEach((img, i) => {
        const dir = directions[i] || { x: 0, y: 60 };
        tl.fromTo(img,
            {
                x: dir.x,
                y: dir.y,
                opacity: 0,
                scale: 0.88
            },
            {
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'none'
            },
            i * 0.12
        );
    });

    // Headline fades in and scales up
    if (headline) {
        tl.fromTo(headline,
            { opacity: 0, y: 50, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'none' },
            0.1
        );
    }

    // Subtle parallax on images as you scroll through
    images.forEach(img => {
        const inner = img.querySelector('img');
        if (!inner) return;
        gsap.fromTo(inner,
            { scale: 1.15 },
            {
                scale: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.mosaic',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    });
}

/* ═══════════════════ ITINERARIES (horizontal scroll — sticky approach) ═══════════════════
   Uses position:sticky instead of ScrollTrigger pin.
   The section's natural height creates scroll room.
   Zero Lenis conflicts — smooth scroll stays active throughout.
   ═══════════════════════════════════════════════════════════════════════════════════════ */

function _horizontalScroll() {
    const section    = document.querySelector('.itineraries');
    const track      = document.querySelector('.itineraries__track');
    const fill       = document.querySelector('.itineraries__progress-fill');
    const counterEl  = document.querySelector('.itineraries__counter-current');
    const cards      = [...document.querySelectorAll('.itineraries__card')];
    const header     = document.querySelector('.itineraries__header');
    const pin        = document.querySelector('.itineraries__pin');

    if (!section || !track || !cards.length) return;

    const measure = () => track.scrollWidth - window.innerWidth;

    // Set section height = scroll distance + viewport
    // This creates the scroll room that drives the animation
    function setDimensions() {
        const dist = measure();
        gsap.set(section, { height: dist + window.innerHeight });
    }
    setDimensions();

    // ---- Entrance: starts before pin, ready when you arrive ----
    const entranceTl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'top top',
            scrub: true
        }
    });

    if (header) {
        entranceTl.fromTo(header,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'none' },
            0
        );
    }
    cards.forEach((card, i) => {
        entranceTl.fromTo(card,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 0.5, duration: 0.5, ease: 'none' },
            0.08 * i
        );
    });


    // Set first card active
    cards[0].classList.add('is-active');

    gsap.to(track, {
        x: () => -measure(),
        ease: 'none',
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            // scrub: true = perfectly in sync with Lenis, no lag
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: setDimensions,
            onUpdate(self) {
                const progress = self.progress;

                // Progress bar (GPU-accelerated scaleX)
                if (fill) {
                    fill.style.transform = `scaleX(${progress})`;
                }

                // Active card — which is closest to viewport center?
                const viewCenter = window.innerWidth / 2;
                let closest = 0;
                let closestDist = Infinity;

                cards.forEach((card, i) => {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.left + rect.width / 2;
                    const dist = Math.abs(cardCenter - viewCenter);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closest = i;
                    }
                });

                cards.forEach((card, i) => {
                    card.classList.toggle('is-active', i === closest);
                });

                // Counter
                if (counterEl) {
                    const num = String(closest + 1).padStart(2, '0');
                    if (counterEl.textContent !== num) {
                        counterEl.textContent = num;
                    }
                }
            }
        }
    });
}


/* ═══════════════════ CINEMATIC ═══════════════════ */

function _cinematicZoom() {
    const section = document.querySelector('.cinematic');
    if (!section) return;

    // Background scales from small → large
    gsap.fromTo('.cinematic__bg',
        { scale: 0.4 },
        {
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        }
    );

    // Overlay fades: opaque → transparent
    gsap.fromTo('.cinematic__overlay',
        { opacity: 0.85 },
        {
            opacity: 0.12,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'center center',
                scrub: true
            }
        }
    );

    // Text scales up subtly with the image (immersive feel)
    gsap.fromTo('#cinematic-content',
        { scale: 0.9, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top 60%',
                end: 'center center',
                scrub: true
            }
        }
    );

    // Text line reveals
    gsap.utils.toArray('.cinematic .line-reveal__inner').forEach((line, i) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 45%',
            once: true,
            onEnter() {
                gsap.to(line, { y: 0, duration: 1.2, delay: i * 0.12, ease: 'power4.out' });
            }
        });
    });
}


/* ═══════════════════ FOOTER ═══════════════════ */

function _footerReveal() {
    gsap.utils.toArray('.footer .line-reveal__inner').forEach((line, i) => {
        ScrollTrigger.create({
            trigger: '.footer',
            start: 'top 65%',
            once: true,
            onEnter() {
                gsap.to(line, { y: 0, duration: 1.2, delay: i * 0.12, ease: 'power4.out' });
            }
        });
    });
}
