'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DETAILS_SEGMENTS, SUIT_IMAGES } from '@/lib/config';
import { detailsA, type DetailSection } from '@/data/details';

gsap.registerPlugin(ScrollTrigger);

// ─── Colors & Fonts Constants ───────────────────────────────────────────────
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

// ─── Total details scroll distance (vh) ────────────────────────────────────
// enterA: 120, holdA: 100 => TOTAL = 220vh
const TOTAL_DETAILS_VH =
  DETAILS_SEGMENTS.enterA +
  DETAILS_SEGMENTS.holdA;

// ─── Reusable Text Block Component (Section A) ──────────────────────────────
interface PanelTextProps {
  data: DetailSection;
  panelRef: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}

function PanelText({ data, panelRef, isMobile = false }: PanelTextProps) {
  return (
    <div
      ref={panelRef}
      style={{
        maxWidth: isMobile ? '100%' : '34rem',
        width: '100%',
        gridColumn: 1,
        justifySelf: 'start',
        position: 'relative',
        zIndex: 5,
      }}
    >
      {/* Label */}
      <span
        data-part="label"
        style={{
          fontFamily: FONTS.sans,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          fontSize: '0.75rem',
          color: COLORS.brass,
          display: 'block',
          marginBottom: '1.2rem',
        }}
      >
        {data.label}
      </span>

      {/* Title */}
      <div data-part="title-wrap" style={{ overflow: 'hidden', margin: '0 0 1.5rem 0' }}>
        <h2
          style={{
            fontFamily: FONTS.display,
            fontWeight: 400,
            fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)',
            lineHeight: 1.05,
            color: COLORS.cream,
            margin: '0 0 1.5rem 0',
          }}
        >
          {data.title}
        </h2>
      </div>

      {/* Body */}
      <p
        data-part="body"
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 300,
          fontSize: '1.05rem',
          lineHeight: 1.7,
          color: 'rgba(237,228,211,0.65)',
          margin: '0 0 2rem 0',
        }}
      >
        {data.body}
      </p>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {data.items.map((item, i) => (
          <div
            key={item.title}
            data-part="list-item"
            style={{
              display: 'grid',
              gridTemplateColumns: '3rem 1fr',
              columnGap: '1rem',
              paddingBlock: '1rem',
              borderTop: '1px solid rgba(176,141,87,0.25)',
            }}
          >
            {/* Numeral */}
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: '1.1rem',
                color: COLORS.brass,
              }}
            >
              0{i + 1}
            </span>

            {/* Right Cell: Title & Text as separate block elements */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'block',
                  fontFamily: FONTS.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontSize: '0.8rem',
                  color: COLORS.cream,
                  marginBottom: '0.35rem',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  display: 'block',
                  fontFamily: FONTS.sans,
                  fontWeight: 300,
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'rgba(237,228,211,0.65)',
                }}
              >
                {item.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main DetailsStage Component ───────────────────────────────────────────
export default function DetailsStage() {
  const rootRef       = useRef<HTMLDivElement>(null);
  const stageRef      = useRef<HTMLDivElement>(null);
  const panelARef     = useRef<HTMLDivElement>(null);
  const textARef      = useRef<HTMLDivElement>(null);

  // Suit Refs (No 360 spin, no backface rotation)
  const suitOuterRef  = useRef<HTMLDivElement>(null);
  const suitTravelRef = useRef<HTMLDivElement>(null);
  const glowRef       = useRef<HTMLDivElement>(null);
  const suitImgRef    = useRef<HTMLImageElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive layout detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const updateMatch = () => setIsMobile(mq.matches);
    updateMatch();
    mq.addEventListener('change', updateMatch);
    return () => mq.removeEventListener('change', updateMatch);
  }, []);

  // Image load refresh handler
  const handleImageReady = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  // Refresh ScrollTrigger when fonts are ready
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }, []);

  // Main Scroll & Timeline Setup
  useEffect(() => {
    const root        = rootRef.current;
    const stage       = stageRef.current;
    const panelA      = panelARef.current;
    const textA       = textARef.current;
    const suitOuter   = suitOuterRef.current;
    const suitTravel  = suitTravelRef.current;
    const glow        = glowRef.current;

    if (!root || !stage || !panelA || !textA || !suitOuter || !suitTravel) return;

    const ctx = gsap.context(() => {
      // Set initial positions
      const initialSuitXPercent = isMobile ? -50 : 0;
      gsap.set(panelA, { xPercent: 0 });
      gsap.set(suitOuter, { yPercent: -50, xPercent: initialSuitXPercent });
      gsap.set(suitTravel, { x: 0, y: 0, scale: 0.9 });

      if (glow) {
        gsap.set(glow, { opacity: 0 });
      }

      // ─── Master Timeline for Section A ────────────────────────────────────
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'none' },
      });

      // ─── enterA (0 to 120): Suit drops in smoothly from above, stays facing front ───
      tl.fromTo(
        suitTravel,
        { y: '-120svh', scale: 0.9 },
        { y: '0svh', scale: 1, ease: 'power2.out', duration: 120 },
        0
      );

      // Glow fades in with suit
      if (glow) {
        tl.fromTo(
          glow,
          { opacity: 0 },
          { opacity: 0.85, ease: 'power2.out', duration: 84 },
          36
        );
      }

      // Panel A text staggers in over back half of enterA (position 30 to 90)
      const textAElements = [
        textA.querySelector('[data-part="label"]'),
        textA.querySelector('[data-part="title-wrap"]'),
        textA.querySelector('[data-part="body"]'),
        ...Array.from(textA.querySelectorAll('[data-part="list-item"]')),
      ].filter(Boolean) as Element[];

      textAElements.forEach((el, i) => {
        const staggerPos = 30 + i * 8;
        if (el.getAttribute('data-part') === 'title-wrap') {
          tl.fromTo(
            el,
            { clipPath: 'inset(100% 0 0 0)' },
            { clipPath: 'inset(0% 0 0 0)', ease: 'power3.out', duration: 22 },
            staggerPos
          );
        } else {
          tl.fromTo(
            el,
            { opacity: 0, y: 40, filter: 'blur(8px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 22 },
            staggerPos
          );
        }
      });

      // ─── holdA (120 to 220): Suit stays still at its resting spot ─────────
      tl.to(suitTravel, { scale: 1.01, duration: 100 }, 120);

      // Force timeline to reach exactly TOTAL_DETAILS_VH
      tl.to({}, { duration: 100 }, 120);

      // ─── ONE ScrollTrigger (Controls Section A) ───────────────────────────
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => '+=' + (TOTAL_DETAILS_VH / 100) * window.innerHeight,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          tl.progress(self.progress);
        },
      });
    }, root);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <>
      {/* WRAPPER: placed after hero pin spacer, solid background prevents hero bleed */}
      <div
        ref={rootRef}
        style={{
          position: 'relative',
          zIndex: 20,
          marginTop: '-100svh',
          background: COLORS.surface,
          width: '100%',
          boxShadow: '0 -40px 80px rgba(0,0,0,0.6)',
          borderTop: '1px solid rgba(176,141,87,0.15)',
        }}
        aria-label="Details section"
      >
        {/* STAGE: pinned 100svh section */}
        <div
          ref={stageRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100svh',
            overflow: 'hidden',
            background: COLORS.surface,
          }}
        >
          {/* SECTION A: Surface #14211B, text in left column (col 1), suit on right */}
          <div
            ref={panelARef}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              alignItems: 'center',
              alignContent: isMobile ? 'center' : undefined,
              paddingInline: '7vw',
              columnGap: '4vw',
              background: COLORS.surface,
              zIndex: 1,
            }}
          >
            <PanelText data={detailsA} panelRef={textARef} isMobile={isMobile} />
          </div>

          {/* THE SUIT: Resting steady on the right side, front-facing (NO 360 circle spin) */}
          <div
            ref={suitOuterRef}
            data-old-suit="true"
            style={{
              position: 'absolute',
              top: '50%',
              right: isMobile ? '50%' : '8vw',
              height: isMobile ? '40svh' : '78svh',
              aspectRatio: '900 / 1307',
              zIndex: 30,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            {/* Travel Layer (smooth drop from top on entry, no rotation) */}
            <div
              ref={suitTravelRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }}
            >
              {/* Atmospheric brass glow behind suit */}
              <div
                ref={glowRef}
                style={{
                  position: 'absolute',
                  inset: '-15%',
                  background: 'radial-gradient(closest-side, rgba(176,141,87,0.22), transparent 70%)',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              />

              {/* Pure Suit Image (Front Facing, Clean Cutout, Drop Shadow) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={suitImgRef}
                src={SUIT_IMAGES.a}
                alt=""
                decoding="async"
                onLoad={handleImageReady}
                onError={handleImageReady}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 35px 55px rgba(0,0,0,0.65))',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
