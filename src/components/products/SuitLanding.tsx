'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SuitLanding() {
  useEffect(() => {
    let ctx: gsap.Context | undefined;
    let retries = 0;
    const MAX_RETRIES = 8;

    function tryInit() {
      // ── Locate required elements ──────────────────────────────────────────
      const layer    = document.querySelector<HTMLElement>('[data-atelier-suit-layer]');
      const box      = document.querySelector<HTMLElement>('[data-atelier-suit-box]');
      const spin     = document.querySelector<HTMLElement>('[data-atelier-suit-spin]');
      const floatEl  = document.querySelector<HTMLElement>('[data-atelier-suit-float]');
      const target   = document.querySelector<HTMLElement>('[data-landing-target]');
      const cardSuit = document.querySelector<HTMLElement>('[data-landing-card-suit]');
      const pin      = ScrollTrigger.getById('atelier-pin');

      const missing: string[] = [];
      if (!layer)    missing.push('data-atelier-suit-layer');
      if (!box)      missing.push('data-atelier-suit-box');
      if (!spin)     missing.push('data-atelier-suit-spin');
      if (!floatEl)  missing.push('data-atelier-suit-float');
      if (!target)   missing.push('data-landing-target');
      if (!cardSuit) missing.push('data-landing-card-suit');
      if (!pin)      missing.push('ScrollTrigger#atelier-pin');

      if (missing.length) {
        retries++;
        if (retries >= MAX_RETRIES) {
          console.warn('[SuitLanding] giving up after', MAX_RETRIES, 'retries. missing:', missing.join(', '));
          if (cardSuit) cardSuit.style.opacity = '1';
          return;
        }
        setTimeout(tryInit, 400);
        return;
      }

      // TypeScript narrowing
      const _layer    = layer!;
      const _box      = box!;
      const _spin     = spin!;
      const _floatEl  = floatEl!;
      const _target   = target!;
      const _cardSuit = cardSuit!;
      const _pin      = pin!;

      const mobile  = window.innerWidth < 900;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ── Remove any CSS transitions from layer/box that could cause phantom fades ──
      _layer.style.transition = 'none';
      _box.style.transition   = 'none';

      // ── Cached slot geometry (recalculated on every onRefresh) ─────────────
      let slotCx = 0;
      let slotCy = 0;
      let slotH  = 0;

      const readSlot = () => {
        // Save current transform, reset to identity, read rect, restore
        const savedX      = gsap.getProperty(_box, 'x')      as number;
        const savedY      = gsap.getProperty(_box, 'y')      as number;
        const savedScale  = gsap.getProperty(_box, 'scale')  as number;
        const savedRot    = gsap.getProperty(_box, 'rotation') as number;
        gsap.set(_box, { x: 0, y: 0, scale: 1, rotation: 0 });

        const r = _box.getBoundingClientRect();
        slotCx = r.left + r.width  / 2;
        slotCy = r.top  + r.height / 2;
        slotH  = _box.offsetHeight || r.height;

        gsap.set(_box, { x: savedX, y: savedY, scale: savedScale, rotation: savedRot });
      };

      // ── Overlay img ────────────────────────────────────────────────────────
      let overlay: HTMLImageElement | null = null;

      const buildOverlay = () => {
        _box.querySelector('[data-suit-landing-overlay]')?.remove();

        const cardImg = _cardSuit.querySelector<HTMLImageElement>('img');
        const src     = cardImg?.currentSrc || cardImg?.src || '/images/products/the-mayfair/charcoal.png';

        const el = document.createElement('img');
        el.setAttribute('data-suit-landing-overlay', 'true');
        el.alt = '';
        el.src = src;
        // Matches the atelier suit img exactly: inset 0, contain, same size
        el.style.cssText =
          'position:absolute;inset:0;width:100%;height:100%;' +
          'object-fit:contain;pointer-events:none;' +
          'filter:drop-shadow(0 30px 40px rgba(0,0,0,0.45));' +
          'opacity:0;transition:none;';
        _box.appendChild(el);
        overlay = el;

        el.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        cardImg?.addEventListener('load', () => {
          const newSrc = cardImg.currentSrc || cardImg.src;
          if (el.src !== newSrc) { el.src = newSrc; ScrollTrigger.refresh(); }
        }, { once: true });
      };

      // ── Helpers ────────────────────────────────────────────────────────────
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

      // The ONLY place layer/cardSuit visibility is toggled
      const handoff = (landed: boolean) => {
        _cardSuit.style.opacity    = landed ? '1' : '0';
        _layer.style.opacity       = landed ? '0' : '1';
        _layer.style.visibility    = landed ? 'hidden' : 'visible';
        _layer.style.pointerEvents = 'none';
      };

      const pauseFloat = () => {
        gsap.getTweensOf(_floatEl).forEach((t) => t.pause());
        gsap.set(_floatEl, { y: 0 });
      };
      const resumeFloat = () => {
        gsap.getTweensOf(_floatEl).forEach((t) => t.resume());
      };

      // Helper: reset originals opacity to 1 inside _spin
      const resetOriginalsOpacity = () => {
        _spin.querySelectorAll<HTMLImageElement>('img:not([data-suit-landing-overlay])').forEach((img) => {
          img.style.opacity = '1';
        });
      };

      ctx = gsap.context(() => {
        // ── Mobile / reduced-motion path: simple fade-out ─────────────────
        if (mobile || reduced) {
          ScrollTrigger.create({
            id: 'suit-landing',
            start: () => _pin.end,
            end:   () => _pin.end + window.innerHeight * 0.4,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              if (p >= 0.995) {
                handoff(true);
              } else {
                _layer.style.opacity    = String(1 - p);
                _layer.style.visibility = 'visible';
                _cardSuit.style.opacity = '0';
              }
            },
            onLeave:     () => handoff(true),
            onLeaveBack: () => { handoff(false); _layer.style.opacity = '1'; },
            onEnterBack: () => handoff(false),
          });
          return;
        }

        // ── Desktop: full flight ───────────────────────────────────────────
        const posEase  = gsap.parseEase('power2.inOut');   // position / arc
        const sizeEase = gsap.parseEase('power3.out');     // size shrinks faster

        buildOverlay();
        document.fonts.ready.then(() => ScrollTrigger.refresh());

        ScrollTrigger.create({
          id: 'suit-landing',
          refreshPriority: -1,
          invalidateOnRefresh: true,

          // FIX A: start and end functions
          start: () => _pin.end,
          end: () => {
            const pinStart = _pin.end as number;
            const r = _target.getBoundingClientRect();
            // Document-space Y of the card's centre
            const cardCentreDoc = r.top + window.scrollY + r.height / 2;
            // How much to scroll so card centre sits at 74 % of the viewport
            const scrollNeeded = cardCentreDoc - window.innerHeight * 0.74;
            return Math.max(scrollNeeded, pinStart + window.innerHeight * 0.55);
          },

          onRefresh: () => {
            readSlot();
            if (overlay) {
              const cardImg = _cardSuit.querySelector<HTMLImageElement>('img');
              const src = cardImg?.currentSrc || cardImg?.src || '/images/products/the-mayfair/charcoal.png';
              if (overlay.src !== src) overlay.src = src;
            }
          },

          onUpdate: (self) => {
            const p = self.progress;

            // Snap to exactly 1 when nearly done
            if (p >= 0.985) {
              // Final exact position
              const r   = _target.getBoundingClientRect();
              const tcx = r.left + r.width  / 2;
              const tcy = r.top  + r.height / 2;
              gsap.set(_box, {
                x:        tcx - slotCx,
                y:        tcy - slotCy,
                scale:    (r.height * 0.94) / Math.max(slotH, 1),
                rotation: 0,
              });
              gsap.set(_spin, { rotationY: 0 });
              pauseFloat();
              // Overlay fully opaque, originals hidden
              if (overlay) overlay.style.opacity = '1';
              resetOriginalsOpacity();
              // Originals set opacity 0 only after overlay is 1
              _spin.querySelectorAll<HTMLImageElement>('img:not([data-suit-landing-overlay])').forEach((img) => {
                img.style.opacity = '0';
              });
              handoff(p >= 0.995);
              return;
            }

            const ep = posEase(p);
            const es = sizeEase(p);

            // ── Live card rect ────────────────────────────────────────────
            const r   = _target.getBoundingClientRect();
            const tcx = r.left + r.width  / 2;
            const tcy = r.top  + r.height / 2;
            const th  = r.height;

            // ── Position: power2.inOut ease, arc upward ───────────────────
            const cx   = lerp(slotCx, tcx, ep);
            const arcY = -Math.sin(p * Math.PI) * 0.04 * window.innerHeight;
            const cy   = lerp(slotCy, tcy, ep) + arcY;

            // ── Size: power3.out ease (shrinks faster than it moves) ──────
            const height = lerp(slotH, th * 0.94, es);

            gsap.set(_box, {
              x:        cx - slotCx,
              y:        cy - slotCy,
              scale:    height / Math.max(slotH, 1),
              rotation: Math.sin(p * Math.PI) * 2.5,
            });

            // ── Spin: rotationY 14→0 ─────────────────────────────────────
            gsap.set(_spin, { rotationY: 14 * (1 - ep) });

            // ── Float: always paused while p > 0 ─────────────────────────
            if (p > 0) {
              pauseFloat();
            } else {
              gsap.set(_box,  { x: 0, y: 0, scale: 1, rotation: 0 });
              gsap.set(_spin, { rotationY: 14 });
              resumeFloat();
            }

            // FIX C: crossfade — originals stay opacity 1 until overlay is fully opaque
            // overlay fades in only in the last 10 % (p 0.9→1)
            const overlayOp = clamp01((p - 0.9) / 0.1);
            if (overlay) overlay.style.opacity = String(overlayOp);

            // Originals: ONLY set to 0 once overlay is exactly 1
            // Below that they stay at 1 — no gradual fading
            if (overlayOp >= 1) {
              _spin.querySelectorAll<HTMLImageElement>('img:not([data-suit-landing-overlay])').forEach((img) => {
                img.style.opacity = '0';
              });
            } else {
              resetOriginalsOpacity();
            }

            // ── Handoff ───────────────────────────────────────────────────
            handoff(p >= 0.995);
          },

          onLeave: () => {
            pauseFloat();
            if (overlay) overlay.style.opacity = '1';
            _spin.querySelectorAll<HTMLImageElement>('img:not([data-suit-landing-overlay])').forEach((img) => {
              img.style.opacity = '0';
            });
            handoff(true);
          },

          onEnterBack: () => {
            // Reverse: layer back, cardSuit hidden, originals restored
            handoff(false);
            resetOriginalsOpacity();
            if (overlay) overlay.style.opacity = '0';
          },

          onLeaveBack: () => {
            // Suit scrolled back above this trigger — AtelierSection retakes control
            handoff(false);
            gsap.set(_box,  { x: 0, y: 0, scale: 1, rotation: 0 });
            gsap.set(_spin, { rotationY: 14 });
            resetOriginalsOpacity();
            if (overlay) overlay.style.opacity = '0';
            resumeFloat();
          },
        });
      });
    }

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.addEventListener('refresh', function onceRefresh() {
        ScrollTrigger.removeEventListener('refresh', onceRefresh);
        if (!ScrollTrigger.getById('suit-landing')) tryInit();
      });
      tryInit();
    });

    return () => {
      cancelAnimationFrame(raf);
      if (ctx) ctx.revert();
      // Cleanup: restore normal visibility on unmount
      const cs = document.querySelector<HTMLElement>('[data-landing-card-suit]');
      const ly = document.querySelector<HTMLElement>('[data-atelier-suit-layer]');
      if (cs) cs.style.opacity = '1';
      if (ly) { ly.style.opacity = '1'; ly.style.visibility = 'visible'; ly.style.transition = ''; }
      document.querySelector('[data-suit-landing-overlay]')?.remove();
    };
  }, []);

  return null;
}
