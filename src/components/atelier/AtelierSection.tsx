'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ATELIER } from '@/lib/atelierConfig';
import { atelier } from '@/data/atelier';

gsap.registerPlugin(ScrollTrigger);

// ─── Design Tokens ──────────────────────────────────────────────────────────
const COLORS = {
  ink:     '#0B1410',
  surface: '#14211B',
  brass:   '#B08D57',
  cream:   '#EDE4D3',
} as const;

const FONTS = {
  display: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
  sans:    'var(--font-sans), Jost, sans-serif',
} as const;

export default function AtelierSection() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  // Structural Refs
  const wrapperRef        = useRef<HTMLElement>(null);
  const stageRef          = useRef<HTMLDivElement>(null);
  const contentRef        = useRef<HTMLDivElement>(null);
  const headerRef         = useRef<HTMLDivElement>(null);
  const indexRef          = useRef<HTMLDivElement>(null);
  const fillRef           = useRef<HTMLDivElement>(null);
  const ctaRef            = useRef<HTMLDivElement>(null);

  // Tabs & Slides Refs
  const tabRefs           = useRef<(HTMLDivElement | null)[]>([]);
  const tabNumeralRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const tabTitleRefs      = useRef<(HTMLSpanElement | null)[]>([]);
  const slideRefs         = useRef<(HTMLDivElement | null)[]>([]);

  // Suit Portal Refs
  const portalLayerRef    = useRef<HTMLDivElement>(null);
  const suitBoxRef        = useRef<HTMLDivElement>(null);
  const suitPerspectiveRef= useRef<HTMLDivElement>(null);
  const suitSpinRef       = useRef<HTMLDivElement>(null);
  const suitImgRef        = useRef<HTMLImageElement | null>(null);

  // Handoff & Swap state
  const chosenImgRef      = useRef<HTMLImageElement | null>(null);
  const swappedRef        = useRef(false);

  // StrictMode-safe portal container setup (guarantees exactly 1 suit layer in document.body)
  useEffect(() => {
    // Remove every existing node matching [data-atelier-suit-layer] before mounting
    document.querySelectorAll('[data-atelier-suit-layer]').forEach((node) => node.remove());

    const container = document.createElement('div');
    container.setAttribute('data-atelier-suit-layer', 'true');
    container.setAttribute('data-atelier-root', 'true');
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      // Restore old suit if unmounting while swapped
      const oldSuitEl = document.querySelector<HTMLElement>('[data-old-suit]');
      if (oldSuitEl) {
        oldSuitEl.style.removeProperty('visibility');
      }
      container.remove();
      document.querySelectorAll('[data-atelier-suit-layer]').forEach((node) => node.remove());
    };
  }, []);

  // Suit Image handlers
  const handleSuitLoad = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  const handleSuitError = useCallback(() => {
    if (suitImgRef.current && suitImgRef.current.src !== ATELIER.SUIT_FALLBACK_SRC) {
      suitImgRef.current.src = ATELIER.SUIT_FALLBACK_SRC;
    } else {
      setImgFailed(true);
    }
    ScrollTrigger.refresh();
  }, []);

  // Main Animation Effects
  useEffect(() => {
    if (!portalContainer) return;

    const wrapper     = wrapperRef.current;
    const stage       = stageRef.current;
    const portalLayer = portalLayerRef.current;
    const suitBox     = suitBoxRef.current;
    const suitSpin    = suitSpinRef.current;
    const suitPerspective = suitPerspectiveRef.current;
    const content     = contentRef.current;
    const header      = headerRef.current;
    const indexEl     = indexRef.current;
    const cta         = ctaRef.current;

    if (!wrapper || !stage || !portalLayer || !suitBox || !suitSpin || !content || !header || !indexEl || !cta) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Refresh when fonts are loaded
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    // ─── Swap Handler ─────────────────────────────────────────────────────
    // swapped = true  → portal layer visible, old suit hidden
    // swapped = false → portal layer hidden,  old suit visible  (only when above atelier section)
    const setSwapState = (swapped: boolean) => {
      if (swappedRef.current === swapped) return;
      swappedRef.current = swapped;

      const oldSuitEl = document.querySelector<HTMLElement>('[data-old-suit]');

      if (swapped) {
        // Show new portal layer
        portalLayer.style.opacity = '1';
        portalLayer.style.visibility = 'visible';
        // Hide old suit using !important
        if (oldSuitEl) {
          oldSuitEl.style.setProperty('visibility', 'hidden', 'important');
        } else {
          document.querySelectorAll<HTMLElement>('img[src*="/images/suit-"]').forEach((img) => {
            if (!img.closest('[data-atelier-root]')) {
              img.style.setProperty('visibility', 'hidden', 'important');
            }
          });
        }
      } else {
        // ONLY hide portal layer when scrolling back ABOVE the atelier section
        portalLayer.style.opacity = '0';
        portalLayer.style.visibility = 'hidden';
        // Restore old suit
        if (oldSuitEl) {
          oldSuitEl.style.removeProperty('visibility');
        } else {
          document.querySelectorAll<HTMLElement>('img[src*="/images/suit-"]').forEach((img) => {
            if (!img.closest('[data-atelier-root]')) {
              img.style.removeProperty('visibility');
            }
          });
        }
      }
    };

    const ctx = gsap.context(() => {
      // ─── Slot Metrics Calculator ──────────────────────────────────────────
      const getSlotMetrics = () => {
        const vW = window.innerWidth;
        const vH = window.innerHeight;
        const mobile = window.matchMedia('(max-width: 900px)').matches;

        let slotH: number;
        let slotW: number;
        let slotL: number;
        let slotT: number;

        if (mobile) {
          slotH = (34 / 100) * vH;
          slotW = slotH * ATELIER.SLOT.aspect;
          slotL = (vW - slotW) / 2;
          slotT = (14 / 100) * vH;
        } else {
          slotH = (ATELIER.SLOT.heightSvh / 100) * vH;
          slotW = slotH * ATELIER.SLOT.aspect;
          slotL = (ATELIER.SLOT.leftVw / 100) * vW;
          slotT = (vH - slotH) / 2;
        }

        return {
          slotW,
          slotH,
          slotL,
          slotT,
          slotCenterX: slotL + slotW / 2,
          slotCenterY: slotT + slotH / 2,
        };
      };

      // ─── Content Height & Viewport Fitting ────────────────────────────────
      const layoutContent = () => {
        const vH = window.innerHeight;
        const headerH = header.offsetHeight || 130;
        const naturalHeight = headerH + 32 + 272 + 35.2 + 54.4;

        const fit = Math.min(1, (vH * 0.88) / naturalHeight);
        gsap.set(content, { scale: fit });

        const scaledHeight = naturalHeight * fit;
        const topPx = Math.max(24, (vH - scaledHeight) / 2);
        content.style.top = `${topPx}px`;
      };

      layoutContent();

      // ─── Subtle Idle Float on perspective wrapper ──────────────────────────
      let floatTween: gsap.core.Tween | null = null;
      if (!prefersReducedMotion && suitPerspective) {
        floatTween = gsap.fromTo(
          suitPerspective,
          { y: -6 },
          {
            y: 6,
            duration: 1.7,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          }
        );
      }

      let scrollTimeout: NodeJS.Timeout | null = null;
      const pauseFloatOnScroll = () => {
        if (floatTween && floatTween.isActive()) {
          floatTween.pause();
        }
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (floatTween && !prefersReducedMotion) {
            floatTween.play();
          }
        }, 350);
      };

      window.addEventListener('scroll', pauseFloatOnScroll, { passive: true });
      window.addEventListener('resize', layoutContent);

      // ─── ST1: "RISE" Trigger (Suit Handoff & Reverse Motion) ─────────────
      const easeInOut = gsap.parseEase('power2.inOut');

      const st1 = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        refreshPriority: 0,
        invalidateOnRefresh: true,
        onEnter: (self) => {
          if (self.progress > 0) {
            setSwapState(true);
          }
        },
        onEnterBack: (self) => {
          if (self.progress > 0) {
            setSwapState(true);
          }
        },
        // onLeave: suit stays visible (swap remains true). Do NOT hide portal layer here.
        onLeave: () => {
          setSwapState(true);
          // Reset suitBox transform to identity so SuitLanding gets a clean start
          gsap.set(suitBox, { x: 0, y: 0, scale: 1, rotateZ: 0 });
          // Ensure portal layer is fully visible with no leftover opacity/visibility
          portalLayer.style.opacity = '1';
          portalLayer.style.visibility = 'visible';
        },
        onLeaveBack: () => {
          // Scrolled back above atelier — hide portal layer, restore details suit
          setSwapState(false);
        },
        onUpdate: (self) => {
          const p = self.progress;

          if (p > 0) {
            setSwapState(true);
          } else {
            setSwapState(false);
          }

          const e = easeInOut(p);
          const vW = window.innerWidth;
          const vH = window.innerHeight;
          const metrics = getSlotMetrics();

          // Set base slot coordinates on suitBox
          gsap.set(suitBox, {
            width: metrics.slotW,
            height: metrics.slotH,
            top: metrics.slotT,
            left: metrics.slotL,
          });

          // Identify highest-opacity image inside oldSuitEl
          let liveImg = chosenImgRef.current;
          const oldSuitEl = document.querySelector<HTMLElement>('[data-old-suit]');

          if (oldSuitEl) {
            const candidateImgs = Array.from(oldSuitEl.querySelectorAll<HTMLImageElement>('img'));
            let maxOp = -1;
            for (const img of candidateImgs) {
              const r = img.getBoundingClientRect();
              if (r.width > 40 && r.height > 40) {
                const op = parseFloat(window.getComputedStyle(img).opacity || '1');
                if (op > maxOp) {
                  maxOp = op;
                  liveImg = img;
                }
              }
            }
          }

          if (liveImg) {
            chosenImgRef.current = liveImg;
            const src = liveImg.currentSrc || liveImg.src;
            if (suitImgRef.current && src && suitImgRef.current.src !== src) {
              suitImgRef.current.src = src;
            }
          }

          // Read live start rect
          let sx: number;
          let sy: number;
          let sh: number;

          if (liveImg) {
            const r = liveImg.getBoundingClientRect();
            sx = r.left + r.width / 2;
            sy = r.top + r.height / 2;
            sh = r.height;

            sx = Math.max(-0.5 * vW, Math.min(1.5 * vW, sx));
            sy = Math.max(-0.5 * vH, Math.min(1.5 * vH, sy));
          } else {
            sh = (ATELIER.FALLBACK_START.heightSvh / 100) * vH;
            const sw = sh * ATELIER.FALLBACK_START.aspect;
            const sl = vW - (ATELIER.FALLBACK_START.rightVw / 100) * vW - sw;
            const st = (vH - sh) / 2;
            sx = sl + sw / 2;
            sy = st + sh / 2;
          }

          const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
          const centerX = lerp(sx, metrics.slotCenterX, e);
          const arcDip = Math.sin(p * Math.PI) * (ATELIER.ARC_DIP_SVH / 100) * vH;
          const centerY = lerp(sy, metrics.slotCenterY, e) + arcDip;
          const currentHeight = lerp(sh, metrics.slotH, e);
          const scale = currentHeight / metrics.slotH;
          const rotateZ = prefersReducedMotion ? 0 : Math.sin(p * Math.PI) * -3;

          const x = centerX - metrics.slotCenterX;
          const y = centerY - metrics.slotCenterY;

          gsap.set(suitBox, {
            x,
            y,
            scale,
            rotateZ,
          });
        },
      });

      // ─── ST2: "CONTENT" Trigger (380vh Pinned Content Scroll) ─────────────
      // id: "atelier-pin" — referenced by SuitLanding
      // Does NOT touch the suit layer on onLeave/onEnterBack.
      ScrollTrigger.create({
        id: 'atelier-pin',
        trigger: stage,
        start: 'top top',
        end: () => '+=' + (ATELIER.CONTENT_VH / 100) * window.innerHeight,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        refreshPriority: 0,
        invalidateOnRefresh: true,
        onRefresh: () => {
          layoutContent();
        },
        onUpdate: (self) => {
          const p = self.progress;

          // 1. Header: fades in during 0 to 0.12
          const hp = gsap.utils.clamp(0, 1, p / 0.12);
          if (headerRef.current) {
            gsap.set(headerRef.current, {
              opacity: hp,
              y: (1 - hp) * 30,
              filter: `blur(${(1 - hp) * 8}px)`,
            });
          }

          // 2. INDEX: fades in 0.06 to 0.16
          const ip = gsap.utils.clamp(0, 1, (p - 0.06) / 0.10);
          if (indexRef.current) {
            gsap.set(indexRef.current, { opacity: ip });
          }

          // 3. Steps i = 0..3
          for (let i = 0; i < 4; i++) {
            let a_i = 0;
            let dir = 0;

            if (i === 0) {
              if (p < 0.12) { a_i = 0; dir = 1; }
              else if (p < 0.16) { a_i = (p - 0.12) / 0.04; dir = 1; }
              else if (p <= 0.31) { a_i = 1; dir = 0; }
              else if (p < 0.35) { a_i = 1 - (p - 0.31) / 0.04; dir = -1; }
              else { a_i = 0; dir = -1; }
            } else if (i === 1) {
              if (p < 0.31) { a_i = 0; dir = 1; }
              else if (p < 0.35) { a_i = (p - 0.31) / 0.04; dir = 1; }
              else if (p <= 0.46) { a_i = 1; dir = 0; }
              else if (p < 0.50) { a_i = 1 - (p - 0.46) / 0.04; dir = -1; }
              else { a_i = 0; dir = -1; }
            } else if (i === 2) {
              if (p < 0.46) { a_i = 0; dir = 1; }
              else if (p < 0.50) { a_i = (p - 0.46) / 0.04; dir = 1; }
              else if (p <= 0.61) { a_i = 1; dir = 0; }
              else if (p < 0.65) { a_i = 1 - (p - 0.61) / 0.04; dir = -1; }
              else { a_i = 0; dir = -1; }
            } else if (i === 3) {
              if (p < 0.61) { a_i = 0; dir = 1; }
              else if (p < 0.65) { a_i = (p - 0.61) / 0.04; dir = 1; }
              else { a_i = 1; dir = 0; }
            }

            a_i = Math.max(0, Math.min(1, a_i));

            const slide = slideRefs.current[i];
            if (slide) {
              gsap.set(slide, {
                opacity: a_i,
                y: (1 - a_i) * 20 * dir,
                filter: `blur(${(1 - a_i) * 6}px)`,
              });
              slide.style.pointerEvents = a_i > 0.5 ? 'auto' : 'none';
            }

            const tab = tabRefs.current[i];
            const num = tabNumeralRefs.current[i];
            const tit = tabTitleRefs.current[i];

            if (tab) { tab.style.opacity = `${0.38 + 0.62 * a_i}`; }
            if (num) {
              num.style.color = a_i > 0.5 ? COLORS.brass : 'transparent';
              num.style.webkitTextStroke = a_i > 0.5 ? '0px' : `1px ${COLORS.brass}`;
            }
            if (tit) { gsap.set(tit, { x: a_i * 8 }); }
          }

          // 4. Progress track fill
          const trackFill = gsap.utils.clamp(0, 1, (p - 0.16) / 0.6);
          if (fillRef.current) {
            gsap.set(fillRef.current, { scaleY: trackFill });
          }

          // 5. CTA
          const ctaOp = gsap.utils.clamp(0, 1, (p - 0.88) / 0.1);
          if (ctaRef.current) {
            gsap.set(ctaRef.current, {
              opacity: ctaOp,
              y: (1 - ctaOp) * 16,
            });
            ctaRef.current.style.pointerEvents = ctaOp > 0.5 ? 'auto' : 'none';
          }

          // 6. Suit tilt during ST2 — rotateY lerps between -TILT_DEG and +TILT_DEG
          if (!prefersReducedMotion && suitSpin) {
            const rotY = gsap.utils.interpolate(-ATELIER.TILT_DEG, ATELIER.TILT_DEG, p);
            gsap.set(suitSpin, { rotateY: rotY });
          }
        },
        // ST2 onLeave / onEnterBack: do NOT touch opacity, visibility, y of the suit layer.
        // SuitLanding owns everything from pin.end onwards.
      });

      // Clean up resize and scroll listeners
      return () => {
        window.removeEventListener('scroll', pauseFloatOnScroll);
        window.removeEventListener('resize', layoutContent);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        if (st1) st1.kill();
      };
    }, wrapper);

    return () => ctx.revert();
  }, [portalContainer]);

  return (
    <>
      {/* ─── Main Section ───────────────────────────────────────────────────── */}
      <section
        ref={wrapperRef}
        data-atelier-root
        style={{
          position: 'relative',
          zIndex: 40,
          background: COLORS.ink,
          marginTop: 0,
        }}
      >
        <div
          ref={stageRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100svh',
            overflow: 'hidden',
            background: COLORS.ink,
          }}
        >
          {/* ─── Right Content Area ──────────────────────────────────────────── */}
          <div
            ref={contentRef}
            style={{
              position: 'absolute',
              left: '46vw',
              right: '7vw',
              top: 0,
              maxWidth: '40rem',
              transformOrigin: 'top left',
              zIndex: 10,
            }}
          >
            {/* 1. Header */}
            <div
              ref={headerRef}
              style={{
                marginBottom: '2rem',
                willChange: 'opacity, transform, filter',
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  fontSize: '0.75rem',
                  color: COLORS.brass,
                  display: 'block',
                  marginBottom: '0.6rem',
                }}
              >
                {atelier.label}
              </span>
              <h2
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 'clamp(1.9rem, 3.2vw, 3.2rem)',
                  color: COLORS.cream,
                  lineHeight: 1.05,
                  margin: '0 0 0.6rem 0',
                }}
              >
                {atelier.title}
              </h2>
              <p
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 300,
                  fontSize: '0.98rem',
                  lineHeight: 1.6,
                  color: 'rgba(237,228,211,0.65)',
                  maxWidth: '34rem',
                  margin: 0,
                }}
              >
                {atelier.intro}
              </p>
            </div>

            {/* 2. INDEX Block (Fixed 17rem height) */}
            <div
              ref={indexRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(13rem, 17rem) 1fr',
                columnGap: '3rem',
                height: '17rem',
                opacity: 0,
                willChange: 'opacity',
              }}
            >
              {/* Left Column = TABS */}
              <div
                style={{
                  position: 'relative',
                  paddingLeft: '1.6rem',
                  height: '17rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* 1px Vertical Track */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '1px',
                    background: 'rgba(176,141,87,0.25)',
                  }}
                />

                {/* Vertical Fill Line */}
                <div
                  ref={fillRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '1px',
                    height: '100%',
                    background: COLORS.brass,
                    transformOrigin: 'top',
                    transform: 'scaleY(0)',
                    willChange: 'transform',
                  }}
                />

                {/* 4 Tab Rows */}
                {atelier.rows.map((row, i) => (
                  <div
                    key={`tab-${row.numeral}`}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    style={{
                      height: '4.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      columnGap: '1rem',
                      borderTop: '1px solid rgba(176,141,87,0.2)',
                      opacity: 0.38,
                      transition: 'opacity 0.1s linear',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      ref={(el) => { tabNumeralRefs.current[i] = el; }}
                      style={{
                        fontFamily: FONTS.display,
                        fontStyle: 'italic',
                        fontSize: '1.9rem',
                        color: 'transparent',
                        WebkitTextStroke: `1px ${COLORS.brass}`,
                        width: '2.4rem',
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      {row.numeral}
                    </span>
                    <span
                      ref={(el) => { tabTitleRefs.current[i] = el; }}
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)',
                        color: COLORS.cream,
                        lineHeight: 1.2,
                        willChange: 'transform',
                      }}
                    >
                      {row.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Column = PANEL */}
              <div
                style={{
                  position: 'relative',
                  height: '17rem',
                  borderLeft: '1px solid rgba(176,141,87,0.2)',
                  paddingLeft: '2.5rem',
                }}
              >
                {/* 4 Step Slides Stacked Absolutely */}
                {atelier.rows.map((row, i) => (
                  <div
                    key={`slide-${row.numeral}`}
                    ref={(el) => { slideRefs.current[i] = el; }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      paddingLeft: '2.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      opacity: 0,
                      pointerEvents: 'none',
                      willChange: 'opacity, transform, filter',
                    }}
                  >
                    {/* Big Numeral */}
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontStyle: 'italic',
                        fontSize: '5.5rem',
                        lineHeight: 1,
                        color: 'transparent',
                        WebkitTextStroke: '1px rgba(176,141,87,0.55)',
                        margin: 0,
                        display: 'block',
                      }}
                    >
                      {row.numeral}
                    </span>

                    {/* Meta */}
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        textTransform: 'uppercase',
                        fontSize: '0.72rem',
                        letterSpacing: '0.22em',
                        color: COLORS.brass,
                        marginTop: '0.6rem',
                        display: 'block',
                      }}
                    >
                      {row.meta}
                    </span>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 'clamp(1.5rem, 2.2vw, 2.1rem)',
                        color: COLORS.cream,
                        marginTop: '0.4rem',
                        marginBottom: 0,
                        lineHeight: 1.15,
                      }}
                    >
                      {row.title}
                    </h3>

                    {/* Body */}
                    <p
                      style={{
                        fontFamily: FONTS.sans,
                        fontWeight: 300,
                        fontSize: '0.98rem',
                        lineHeight: 1.65,
                        color: 'rgba(237,228,211,0.65)',
                        maxWidth: '26rem',
                        marginTop: '0.8rem',
                        marginBottom: 0,
                      }}
                    >
                      {row.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. CTA Row */}
            <div
              ref={ctaRef}
              style={{
                marginTop: '2.2rem',
                display: 'flex',
                alignItems: 'center',
                columnGap: '2rem',
                flexWrap: 'wrap',
                height: '3.4rem',
                opacity: 0,
                pointerEvents: 'none',
                willChange: 'opacity, transform',
              }}
            >
              {/* Primary CTA */}
              <a
                href="#contact"
                style={{
                  background: COLORS.brass,
                  color: COLORS.ink,
                  fontFamily: FONTS.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontSize: '0.78rem',
                  padding: '1rem 1.8rem',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  outline: 'none',
                  border: 'none',
                  transition: 'background 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.outline = `2px solid ${COLORS.brass}`; e.currentTarget.style.outlineOffset = '3px'; }}
                onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#C9A870'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.brass; }}
              >
                {atelier.cta.primary}
              </a>

              {/* Secondary CTA */}
              <a
                href="#atelier"
                style={{
                  color: COLORS.cream,
                  fontFamily: FONTS.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontSize: '0.78rem',
                  borderBottom: `1px solid ${COLORS.brass}`,
                  paddingBottom: '0.3rem',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  outline: 'none',
                  transition: 'color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.outline = `2px solid ${COLORS.brass}`; e.currentTarget.style.outlineOffset = '3px'; }}
                onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
                onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.brass; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.cream; }}
              >
                {atelier.cta.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Portal Suit Layer (Position: Fixed on Document Body) ─────────── */}
      {portalContainer &&
        createPortal(
          <div
            ref={portalLayerRef}
            data-atelier-root
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100svh',
              zIndex: 60,
              pointerEvents: 'none',
              // Start hidden; ST1 sets visibility=visible when scrolling in
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            {/* The Single Suit Box — data-atelier-suit-box for SuitLanding */}
            <div
              ref={suitBoxRef}
              data-atelier-suit-box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            >
              {/* Perspective Wrapper — data-atelier-suit-float for SuitLanding */}
              <div
                ref={suitPerspectiveRef}
                data-atelier-suit-float
                style={{
                  width: '100%',
                  height: '100%',
                  perspective: 1200,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Spin Element — data-atelier-suit-spin for SuitLanding */}
                <div
                  ref={suitSpinRef}
                  data-atelier-suit-spin
                  style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'visible',
                  }}
                >
                  {imgFailed ? (
                    /* Fallback Brass Placeholder Box */
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid rgba(176,141,87,0.4)',
                        borderRadius: '16px',
                        display: 'grid',
                        placeItems: 'center',
                        fontFamily: FONTS.sans,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        color: 'rgba(176,141,87,0.7)',
                        background: 'rgba(176,141,87,0.04)',
                      }}
                    >
                      <span>Suit image</span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      ref={suitImgRef}
                      src={ATELIER.SUIT_SRC}
                      alt=""
                      decoding="async"
                      onLoad={handleSuitLoad}
                      onError={handleSuitError}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.5))',
                        backfaceVisibility: 'visible',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>,
          portalContainer
        )}
    </>
  );
}
