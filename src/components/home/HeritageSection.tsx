'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heritage } from '@/data/heritage';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const C = {
  ink:   '#0B1410',
  brass: '#B08D57',
  cream: '#EDE4D3',
} as const;
const F = {
  display: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
  sans:    'var(--font-sans), Jost, sans-serif',
} as const;

export default function HeritageSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const yearRef     = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLSpanElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const ruleRef     = useRef<HTMLDivElement>(null);
  const introRef    = useRef<HTMLParagraphElement>(null);
  const quoteRef    = useRef<HTMLQuoteElement>(null);
  const estRef      = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const statNumRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [yearRef.current, labelRef.current, titleRef.current,
           ruleRef.current, introRef.current, quoteRef.current,
           estRef.current, statsRef.current],
          { opacity: 1, y: 0, x: 0, scaleX: 1, scale: 1, clipPath: 'none' }
        );
        heritage.stats.forEach((s, i) => {
          if (statNumRefs.current[i]) statNumRefs.current[i]!.textContent = String(s.value);
        });
        return;
      }

      // ── Master timeline triggered when section enters viewport ────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 68%',
          once: true,
        },
        defaults: { ease: 'power3.out' },
      });

      // 0. Year watermark — blooms from centre
      tl.fromTo(yearRef.current,
        { opacity: 0, scale: 1.15 },
        { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' },
        0
      );

      // 1. Brass label — slides up
      tl.fromTo(labelRef.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.65 },
        0.2
      );

      // 2. Title — clip-path wipe from bottom
      tl.fromTo(titleRef.current,
        { opacity: 0, clipPath: 'inset(100% 0 0 0)', y: 30 },
        { opacity: 1, clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.0 },
        0.38
      );

      // 3. Brass rule — expands left→right
      tl.fromTo(ruleRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.9, duration: 0.7, ease: 'power2.inOut' },
        0.82
      );

      // 4. Intro body copy
      tl.fromTo(introRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.75 },
        0.95
      );

      // 5. Quote — slides from right
      tl.fromTo(quoteRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.85 },
        0.45
      );

      // 6. Est. line
      tl.fromTo(estRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6 },
        0.72
      );

      // 7. Stats band rises
      tl.fromTo(statsRef.current,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.85 },
        1.05
      );

      // 8. Stat counters
      heritage.stats.forEach((stat, i) => {
        const numEl = statNumRefs.current[i];
        if (!numEl) return;
        const obj = { val: stat.countFrom };
        gsap.to(obj, {
          val: stat.value,
          duration: 2.2,
          ease: 'power3.out',
          delay: 1.1 + i * 0.1,
          onUpdate() { numEl.textContent = String(Math.round(obj.val)); },
          onComplete() { numEl.textContent = String(stat.value); },
          scrollTrigger: { trigger: section, start: 'top 68%', once: true },
        });
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="heritage"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: C.ink,
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflowX: 'clip',
        paddingBlock: 'clamp(4rem, 8svh, 7rem)',
        paddingInline: '6vw',
      }}
    >
      <style>{`
        .hr-heri-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4vw;
          align-items: center;
          max-width: 1300px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .hr-heri-stats-band {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: clamp(2.5rem, 5svh, 4rem);
          border-top: 1px solid rgba(176,141,87,0.2);
          padding-top: clamp(2rem, 4svh, 3rem);
          position: relative;
          z-index: 1;
          max-width: 1300px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
        }
        .hr-heri-stat-col {
          padding-right: 3rem;
          position: relative;
        }
        .hr-heri-stat-col:not(:first-child)::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 1px;
          background: rgba(176,141,87,0.18);
        }
        .hr-heri-stat-col:not(:first-child) {
          padding-left: 3rem;
          padding-right: 0;
        }
        @media (max-width: 850px) {
          .hr-heri-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .hr-heri-stats-band { grid-template-columns: 1fr; gap: 0; }
          .hr-heri-stat-col::before { display: none !important; }
          .hr-heri-stat-col { padding: 1.2rem 0 !important; border-top: 1px solid rgba(176,141,87,0.12); }
          .hr-heri-stat-col:first-child { border-top: none; }
        }
      `}</style>

      {/* ── Watermark year ─────────────────────────────────────────── */}
      <div
        ref={yearRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-2vw',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: F.display,
          fontSize: 'clamp(14rem, 32vw, 36rem)',
          lineHeight: 0.82,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(176,141,87,0.09)',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 0,
          letterSpacing: '-0.03em',
          opacity: 0,
        }}
      >
        1927
      </div>

      {/* ── Two-column content grid ─────────────────────────────────── */}
      <div className="hr-heri-grid">

        {/* LEFT */}
        <div>
          <span ref={labelRef} style={{
            display: 'inline-block',
            fontFamily: F.sans,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.32em',
            color: C.brass,
            marginBottom: '1.4rem',
            opacity: 0,
          }}>
            {heritage.label}
          </span>

          <div ref={titleRef} style={{
            fontFamily: F.display,
            fontSize: 'clamp(2.6rem, 5.5vw, 6rem)',
            color: C.cream,
            lineHeight: 1.0,
            fontWeight: 400,
            margin: '0 0 1.6rem 0',
            opacity: 0,
          }}>
            {heritage.title}
          </div>

          <div ref={ruleRef} style={{
            width: '3.5rem',
            height: '1px',
            background: C.brass,
            marginBottom: '1.6rem',
            transformOrigin: 'left',
            transform: 'scaleX(0)',
            opacity: 0,
          }} />

          <p ref={introRef} style={{
            fontFamily: F.sans,
            fontWeight: 300,
            fontSize: 'clamp(0.92rem, 1.3vw, 1.05rem)',
            lineHeight: 1.85,
            color: 'rgba(237,228,211,0.58)',
            margin: 0,
            maxWidth: '38rem',
            opacity: 0,
          }}>
            {heritage.intro}
          </p>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem', paddingLeft: '2vw' }}>
          <blockquote ref={quoteRef} style={{
            fontFamily: F.display,
            fontStyle: 'italic',
            fontSize: 'clamp(1.4rem, 2.8vw, 2.6rem)',
            color: 'rgba(237,228,211,0.38)',
            lineHeight: 1.4,
            margin: 0,
            textAlign: 'right',
            borderRight: '2px solid rgba(176,141,87,0.35)',
            paddingRight: '1.8rem',
            maxWidth: '30rem',
            opacity: 0,
          }}>
            &ldquo;Every measurement taken by hand. Every seam pressed in silence.&rdquo;
          </blockquote>

          <div ref={estRef} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'flex-end',
            opacity: 0,
          }}>
            <div style={{ width: '2.5rem', height: '1px', background: 'rgba(176,141,87,0.4)' }} />
            <span style={{
              fontFamily: F.sans,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.28em',
              color: 'rgba(176,141,87,0.6)',
            }}>
              Est. Mayfair, 1927
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats band ─────────────────────────────────────────────── */}
      <div ref={statsRef} className="hr-heri-stats-band" style={{ opacity: 0 }}>
        {heritage.stats.map((stat, i) => (
          <div key={stat.label} className="hr-heri-stat-col">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <span ref={(el) => { statNumRefs.current[i] = el; }} style={{
                fontFamily: F.display,
                fontSize: 'clamp(3rem, 6vw, 6.5rem)',
                color: C.cream,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {stat.countFrom}
              </span>
              {stat.suffix && (
                <span style={{ fontFamily: F.display, fontStyle: 'italic', color: C.brass, fontSize: '1.15rem' }}>
                  {stat.suffix}
                </span>
              )}
            </div>
            <p style={{
              fontFamily: F.sans,
              fontWeight: 300,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(237,228,211,0.45)',
              margin: 0,
              lineHeight: 1.5,
              maxWidth: '16rem',
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
