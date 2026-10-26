'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cloths, clothGroups } from '@/data/cloths';
import type { Cloth, WeaveType, ClothGroup } from '@/data/cloths';
import { useLenis } from '@/lib/lenisContext';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const C = {
  ink:     '#0B1410',
  surface: '#0f1c17',
  brass:   '#B08D57',
  cream:   '#EDE4D3',
} as const;
const F = {
  display: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
  sans:    'var(--font-sans), Jost, sans-serif',
} as const;

/* ── Weave texture ─────────────────────────────────────────────────────────── */
function weaveStyle(weave: WeaveType, hex: string): React.CSSProperties {
  const base = { backgroundColor: hex };
  switch (weave) {
    case 'pinstripe':
      return {
        ...base,
        backgroundImage: [
          'repeating-linear-gradient(90deg, rgba(237,228,211,0.4) 0px, rgba(237,228,211,0.4) 1px, transparent 1px, transparent 18px)',
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)',
          'repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
        ].join(','),
      };
    case 'herringbone':
      return {
        ...base,
        backgroundImage: [
          'repeating-linear-gradient(45deg, rgba(237,228,211,0.14) 0px, rgba(237,228,211,0.14) 2px, transparent 2px, transparent 12px)',
          'repeating-linear-gradient(-45deg, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) 2px, transparent 2px, transparent 12px)',
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)',
        ].join(','),
        backgroundSize: '24px 24px, 24px 24px, 3px 3px',
      };
    case 'check':
      return {
        ...base,
        backgroundImage: [
          'repeating-linear-gradient(0deg, rgba(176,141,87,0.28) 0px, rgba(176,141,87,0.28) 2px, transparent 2px, transparent 40px)',
          'repeating-linear-gradient(90deg, rgba(176,141,87,0.28) 0px, rgba(176,141,87,0.28) 2px, transparent 2px, transparent 40px)',
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 4px)',
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 4px)',
        ].join(','),
      };
    case 'twill':
      return {
        ...base,
        backgroundImage: [
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1.5px, transparent 1.5px, transparent 5px)',
          'repeating-linear-gradient(-45deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1.5px, transparent 1.5px, transparent 5px)',
        ].join(','),
        backgroundSize: '6px 6px, 6px 6px',
      };
    case 'flannel':
      return {
        ...base,
        backgroundImage: [
          'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)',
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
        ].join(','),
        backgroundSize: '4px 4px, 3px 3px, 3px 3px',
      };
    default: // 'plain'
      return {
        ...base,
        backgroundImage: [
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.11) 0px, rgba(255,255,255,0.11) 1px, transparent 1px, transparent 4px)',
          'repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 4px)',
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 8px)',
        ].join(','),
        backgroundSize: '4px 4px, 4px 4px, 8px 8px',
      };
  }
}

/* ── Lightbox ──────────────────────────────────────────────────────────────── */
function ClothLightbox({ cloth, onClose }: { cloth: Cloth; onClose: () => void }) {
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    // Entrance animation
    if (innerRef.current) {
      gsap.fromTo(innerRef.current,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' }
      );
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (lenis) lenis.start(); else document.body.style.overflow = '';
      prev?.focus();
    };
  }, [lenis, onClose]);

  const handleBook = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('hr:book', { detail: { cloth: cloth.name } }));
    const el = document.getElementById('book');
    if (el) {
      if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
      else el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label={`${cloth.name} detail`}
      ref={dialogRef} tabIndex={-1}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(11,20,16,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', outline: 'none',
      }}
    >
      <div
        ref={innerRef}
        style={{
          display: 'flex', gap: '3.5rem', alignItems: 'flex-start',
          flexWrap: 'wrap', maxWidth: '900px', width: '100%',
          background: '#0f1c17',
          border: '1px solid rgba(176,141,87,0.2)',
          padding: 'clamp(2rem, 4vw, 3.5rem)',
          opacity: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swatch preview */}
        <div style={{
          width: 'min(280px, 48vw)',
          aspectRatio: '1/1',
          flexShrink: 0,
          ...weaveStyle(cloth.weave, cloth.hex),
          border: '1px solid rgba(237,228,211,0.1)',
        }} />

        {/* Details */}
        <div style={{ flex: 1, minWidth: '14rem', paddingTop: '0.2rem' }}>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(237,228,211,0.5)',
              fontFamily: F.sans, fontSize: '0.75rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: 'pointer', padding: 0, marginBottom: '2rem',
              transition: 'color 0.2s',
            }}
          >
            ✕ &nbsp;Close
          </button>

          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(1.8rem,3vw,2.4rem)', color: C.cream, margin: '0 0 0.5rem 0', fontWeight: 400 }}>
            {cloth.name}
          </h2>
          <p style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.68rem', color: C.brass, margin: '0 0 0.3rem 0' }}>
            {cloth.mill}
          </p>
          <p style={{ fontFamily: F.sans, fontSize: '0.82rem', color: 'rgba(237,228,211,0.5)', margin: '0 0 0.8rem 0', letterSpacing: '0.08em' }}>
            {cloth.weight} &nbsp;·&nbsp; {cloth.composition}
          </p>

          {/* Brass rule */}
          <div style={{ width: '2.5rem', height: '1px', background: C.brass, opacity: 0.5, margin: '1.4rem 0 1.6rem' }} />

          <button
            onClick={handleBook}
            style={{
              background: C.brass, color: C.ink,
              border: 'none', fontFamily: F.sans,
              textTransform: 'uppercase', letterSpacing: '0.2em',
              fontSize: '0.75rem', padding: '0.9rem 2.2rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            Book a fitting with this cloth →
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Color helper for dynamic border beam ──────────────────────────────────── */
function adjustHex(hex: string, amount: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/* ── Swatch Card (3D Flip Card) ─────────────────────────────────────────── */
function SwatchCard({ cloth, onOpen, index }: { cloth: Cloth; onOpen: (c: Cloth) => void; index: number }) {
  const texture = weaveStyle(cloth.weave, cloth.hex);
  const beamColor = cloth.hex;
  const beamLight = adjustHex(cloth.hex, 45);
  const beamDark = adjustHex(cloth.hex, -25);

  return (
    <button
      onClick={() => onOpen(cloth)}
      className="card hr-swatch-card"
      aria-label={`Inspect ${cloth.name}, ${cloth.mill}`}
      style={{
        '--card-beam': beamColor,
        '--card-beam-light': beamLight,
        '--card-beam-dark': beamDark,
      } as React.CSSProperties}
    >
      <div className="content">
        {/* Back face (First Look: real fabric color & texture with card-color rotating border) */}
        <div className="back">
          <div className="back-content">
            {/* Background fabric weave texture — FULL COLOR SHOWCASING */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: cloth.hex,
                backgroundImage: texture.backgroundImage,
                backgroundSize: texture.backgroundSize,
                opacity: 1,
              }}
            />
            {/* Subtle bottom vignette only so text is clear while fabric color shines */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(11,20,16,0.85) 0%, rgba(11,20,16,0.2) 40%, transparent 68%)',
              }}
            />

            {/* Top row */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontFamily: F.sans, fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.cream, background: 'rgba(11,20,16,0.65)', padding: '0.24rem 0.55rem', borderRadius: '4px', border: '1px solid rgba(237,228,211,0.2)' }}>
                {cloth.mill}
              </span>
              <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: '0.95rem', color: C.brass }}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Center: Luxury Tailoring Shears icon (NOT a pizza slice!) & Title */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {/* Bespoke Tailoring Shears SVG */}
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(237,228,211,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>

              <strong style={{ fontFamily: F.display, fontSize: '1.25rem', color: C.cream, margin: '2px 0 0', fontWeight: 400, letterSpacing: '0.02em', textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                {cloth.name}
              </strong>
              <span style={{ fontFamily: F.sans, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: C.brass, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {cloth.weight} &nbsp;·&nbsp; {cloth.weave}
              </span>
            </div>

            {/* Hover Me button */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span style={{
                fontFamily: F.sans,
                fontSize: '0.62rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.cream,
                background: 'rgba(11,20,16,0.65)',
                border: '1px solid rgba(237,228,211,0.25)',
                padding: '0.35rem 0.9rem',
                borderRadius: '16px',
                display: 'inline-block',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}>
                Hover for Details ↺
              </span>
            </div>
          </div>
        </div>

        {/* Front face (Flipped on hover: Full details & specifications) */}
        <div className="front">
          <div className="img">
            {/* Ambient floating blur circles tinted in this cloth's color */}
            <div className="circle" style={{ backgroundColor: cloth.hex, opacity: 0.7 }} />
            <div className="circle" id="right" style={{ backgroundColor: beamLight, opacity: 0.45 }} />
            <div className="circle" id="bottom" style={{ backgroundColor: beamDark, opacity: 0.55 }} />

            {/* Background fabric weave texture layer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: cloth.hex,
                backgroundImage: texture.backgroundImage,
                backgroundSize: texture.backgroundSize,
                opacity: 0.5,
              }}
            />
          </div>

          <div className="front-content">
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <small className="badge">{cloth.mill}</small>
              <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: '1rem', color: C.brass }}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Bottom description tray with all details */}
            <div className="description">
              <div className="title">
                <p className="title">
                  <strong style={{ fontFamily: F.display, fontSize: '1.15rem', color: C.cream, fontWeight: 400 }}>
                    {cloth.name}
                  </strong>
                </p>
                {/* Gold arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B08D57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>

              <p className="card-footer" style={{ fontFamily: F.sans, color: 'rgba(237,228,211,0.85)', fontSize: '0.74rem' }}>
                {cloth.composition}
              </p>
              <p className="card-footer" style={{ fontFamily: F.sans, color: C.brass, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.62rem' }}>
                {cloth.weight} &nbsp;|&nbsp; {cloth.weave} weave
              </p>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(176,141,87,0.22)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: F.sans, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.cream }}>
                  Click to book fitting
                </span>
                <span style={{ color: C.brass, fontSize: '0.85rem' }}>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function ClothLibrary() {
  const lenis      = useLenis();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const chipsRef   = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  const [activeGroup, setActiveGroup] = useState<'All' | ClothGroup>('All');
  const [visible, setVisible]         = useState(true);
  const [openCloth, setOpenCloth]     = useState<Cloth | null>(null);

  const filtered = activeGroup === 'All' ? cloths : cloths.filter((c) => c.group === activeGroup);

  /* ── Filter change animation ─────────────────────────────────────────────── */
  const playReveal = useCallback((container: HTMLDivElement) => {
    const items = container.querySelectorAll<HTMLElement>('.hr-swatch-item');
    gsap.fromTo(items,
      { opacity: 0, y: 30, clipPath: 'inset(100% 0 0 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.75, stagger: 0.055, ease: 'power3.out' }
    );
  }, []);

  const handleGroupChange = useCallback((g: typeof activeGroup) => {
    if (g === activeGroup) return;
    const grid = gridRef.current;
    if (!grid) { setActiveGroup(g); return; }
    gsap.to(grid, {
      opacity: 0, y: -10, duration: 0.25,
      onComplete: () => {
        setActiveGroup(g);
        setVisible(false);
        requestAnimationFrame(() => {
          setVisible(true);
          gsap.set(grid, { opacity: 1, y: 0 });
          requestAnimationFrame(() => playReveal(grid));
        });
      },
    });
  }, [activeGroup, playReveal]);

  const handleBookLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('book');
    if (el) {
      if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
      else el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ── Entrance animations ─────────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (reduced) return;

      // ── Header block animation ───────────────────────────────────────────
      const headerTl = gsap.timeline({
        scrollTrigger: { trigger: headerRef.current, start: 'top 78%', once: true },
        defaults: { ease: 'power3.out' },
      });

      // Label
      headerTl.fromTo('.hr-cloth-label',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6 },
        0
      );
      // Heading wipe
      headerTl.fromTo('.hr-cloth-heading',
        { opacity: 0, clipPath: 'inset(100% 0 0 0)', y: 28 },
        { opacity: 1, clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.9 },
        0.18
      );
      // Subtext
      headerTl.fromTo('.hr-cloth-sub',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.75 },
        0.5
      );
      // CTA link
      headerTl.fromTo('.hr-cloth-cta',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.6 },
        0.65
      );

      // ── Filter chips — stagger in ─────────────────────────────────────────
      const chips = chipsRef.current?.querySelectorAll('button, span');
      if (chips) {
        gsap.fromTo(chips,
          { opacity: 0, y: 12, scale: 0.94 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5, stagger: 0.055, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: chipsRef.current, start: 'top 85%', once: true },
          }
        );
      }

      // ── Cards — batch reveal, one by one ─────────────────────────────────
      // Use a single ScrollTrigger batch so each visible card animates in sequence
      ScrollTrigger.batch('.hr-swatch-item', {
        start: 'top 92%',
        once: true,
        batchMax: 4,
        onEnter: (batch) => {
          gsap.fromTo(batch,
            { opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)' },
            {
              opacity: 1, y: 0,
              clipPath: 'inset(0% 0 0 0)',
              duration: 0.8,
              stagger: 0.09,
              ease: 'power3.out',
            }
          );
        },
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="cloth"
      ref={sectionRef}
      style={{
        background: C.surface,
        paddingBlock: 'clamp(5rem, 12svh, 9rem)',
        paddingInline: '6vw',
        position: 'relative',
      }}
    >
      <style>{`
        .hr-cloth-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.6rem;
          width: 100%;
        }
        @media (max-width: 1100px) { .hr-cloth-grid { grid-template-columns: repeat(3, 1fr); gap: 1.3rem; } }
        @media (max-width: 780px)  { .hr-cloth-grid { grid-template-columns: repeat(2, 1fr); gap: 1.1rem; } }
        @media (max-width: 480px)  { .hr-cloth-grid { grid-template-columns: 1fr; gap: 1.1rem; } }

        .hr-swatch-item {
          background: transparent;
          overflow: visible;
        }

        /* ── 3D Flip Card (Uiverse style) ─────────────────────────────────── */
        .card.hr-swatch-card {
          overflow: visible;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          perspective: 1000px;
          text-align: left;
          position: relative;
        }

        .hr-swatch-card .content {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 1000ms cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0px 8px 24px 2px rgba(0,0,0,0.65);
          border-radius: 8px;
          position: relative;
        }

        .hr-swatch-card:hover .content,
        .hr-swatch-card:focus-visible .content {
          transform: rotateY(180deg);
        }

        .hr-swatch-card .front,
        .hr-swatch-card .back {
          background-color: #0B1410;
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(176,141,87,0.25);
        }

        .hr-swatch-card .back {
          width: 100%;
          height: 100%;
          justify-content: center;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hr-swatch-card .back::before {
          position: absolute;
          content: ' ';
          display: block;
          width: 190px;
          height: 190%;
          background: linear-gradient(90deg, transparent 0%, var(--card-beam-dark, #0B1410) 20%, var(--card-beam, #B08D57) 45%, var(--card-beam-light, #EDE4D3) 50%, var(--card-beam, #B08D57) 55%, var(--card-beam-dark, #0B1410) 80%, transparent 100%);
          animation: hr_rotation_481 5000ms infinite linear;
        }

        .hr-swatch-card .back-content {
          position: absolute;
          width: calc(100% - 4px);
          height: calc(100% - 4px);
          background-color: #0B1410;
          border-radius: 7px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          overflow: hidden;
        }

        @keyframes hr_rotation_481 {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(360deg); }
        }

        .hr-swatch-card .front {
          transform: rotateY(180deg);
          color: white;
        }

        .hr-swatch-card .front .front-content {
          position: absolute;
          width: 100%;
          height: 100%;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 2;
        }

        .hr-swatch-card .front-content .badge {
          background-color: rgba(11,20,16,0.75);
          padding: 3px 10px;
          border-radius: 12px;
          backdrop-filter: blur(4px);
          width: fit-content;
          border: 1px solid rgba(176,141,87,0.35);
          color: #B08D57;
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .hr-swatch-card .description {
          box-shadow: 0px 4px 15px 5px rgba(0,0,0,0.65);
          width: 100%;
          padding: 12px 14px;
          background-color: rgba(11,20,16,0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(176,141,87,0.3);
          border-radius: 6px;
        }

        .hr-swatch-card .title {
          font-size: 13px;
          max-width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hr-swatch-card .title p {
          margin: 0;
        }

        .hr-swatch-card .card-footer {
          color: rgba(237,228,211,0.72);
          margin-top: 5px;
          font-size: 0.72rem;
          line-height: 1.4;
          margin-bottom: 0;
        }

        .hr-swatch-card .front .img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .hr-swatch-card .circle {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background-color: rgba(176,141,87,0.35);
          position: relative;
          filter: blur(18px);
          animation: hr_floating 2600ms infinite linear;
        }

        .hr-swatch-card #bottom {
          background-color: rgba(176,141,87,0.25);
          left: 40px;
          top: 20px;
          width: 160px;
          height: 160px;
          animation-delay: -800ms;
        }

        .hr-swatch-card #right {
          background-color: rgba(237,228,211,0.18);
          left: 140px;
          top: -70px;
          width: 50px;
          height: 50px;
          animation-delay: -1800ms;
        }

        @keyframes hr_floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
          100% { transform: translateY(0px); }
        }

        .hr-swatch-card:focus-visible { outline: 2px solid #B08D57; outline-offset: 3px; }
        .hr-cloth-chip  { transition: background 0.22s, color 0.22s, border-color 0.22s; }
        .hr-cloth-chip:focus-visible { outline: 2px solid #B08D57; outline-offset: 3px; }

        /* Header text initial hidden for GSAP */
        .hr-cloth-label, .hr-cloth-heading, .hr-cloth-sub, .hr-cloth-cta { opacity: 0; }

        /* Swatch items initially hidden for GSAP */
        .hr-swatch-item { opacity: 0; }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          ref={headerRef}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: 'clamp(2.5rem, 5svh, 4rem)',
          }}
        >
          <div>
            <span className="hr-cloth-label" style={{
              fontFamily: F.sans,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontSize: '0.72rem',
              color: C.brass,
              display: 'block',
              marginBottom: '0.85rem',
            }}>
              11 — The Cloth Library
            </span>

            <h2 className="hr-cloth-heading" style={{
              fontFamily: F.display,
              fontSize: 'clamp(2.4rem, 5vw, 5.2rem)',
              color: C.cream,
              lineHeight: 1.05,
              margin: '0 0 0.9rem 0',
              fontWeight: 400,
            }}>
              Twelve thousand cloths.
              <br />
              <span style={{ fontStyle: 'italic', color: 'rgba(237,228,211,0.55)' }}>Twelve to start.</span>
            </h2>

            <p className="hr-cloth-sub" style={{
              fontFamily: F.sans,
              fontWeight: 300,
              fontSize: 'clamp(0.92rem, 1.3vw, 1rem)',
              lineHeight: 1.7,
              color: 'rgba(237,228,211,0.55)',
              maxWidth: '36rem',
              margin: 0,
            }}>
              Every cloth is selected by the cutters themselves — touched, weighted, held up to daylight. These are the ones they would choose for themselves.
            </p>
          </div>

          <a
            href="#book"
            className="hr-cloth-cta"
            onClick={handleBookLink}
            style={{
              fontFamily: F.sans,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: C.brass,
              textDecoration: 'none',
              borderBottom: '1px solid rgba(176,141,87,0.4)',
              paddingBottom: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'borderColor 0.2s, color 0.2s',
            }}
          >
            Book a fitting to feel them →
          </a>
        </div>

        {/* ── Filter chips ──────────────────────────────────────────────────── */}
        <div
          ref={chipsRef}
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
            alignItems: 'center',
          }}
        >
          {clothGroups.map((g) => {
            const isActive = g === activeGroup;
            return (
              <button
                key={g}
                className="hr-cloth-chip"
                onClick={() => handleGroupChange(g)}
                style={{
                  fontFamily: F.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  fontSize: '0.7rem',
                  padding: '0.42rem 1.05rem',
                  border: `1px solid ${isActive ? C.brass : 'rgba(176,141,87,0.3)'}`,
                  background: isActive ? C.brass : 'transparent',
                  color: isActive ? C.ink : 'rgba(237,228,211,0.65)',
                  cursor: 'pointer',
                  borderRadius: 0,
                }}
              >
                {g}
              </button>
            );
          })}
          <span style={{
            fontFamily: F.sans,
            fontSize: '0.75rem',
            color: 'rgba(237,228,211,0.3)',
            marginLeft: '0.6rem',
            letterSpacing: '0.1em',
          }}>
            {filtered.length} cloths
          </span>
        </div>

        {/* ── Cloth Grid ───────────────────────────────────────────────────── */}
        {visible && (
          <div className="hr-cloth-grid" ref={gridRef} role="list">
            {filtered.map((cloth, idx) => (
              <div
                key={cloth.id}
                role="listitem"
                className="hr-swatch-item"
              >
                <SwatchCard cloth={cloth} onOpen={setOpenCloth} index={idx} />
              </div>
            ))}
          </div>
        )}
      </div>

      {openCloth && <ClothLightbox cloth={openCloth} onClose={() => setOpenCloth(null)} />}
    </section>
  );
}
