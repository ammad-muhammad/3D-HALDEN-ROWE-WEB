'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { footerData } from '@/data/footer';
import FooterNewsletter from './FooterNewsletter';
import BackToTop from './BackToTop';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

/*
  Wordmark width check: "HALDEN & ROWE" = 13 chars
  clamp(3.2rem, 10.5vw, 11rem)
  At 1280px: fontSize = min(10.5% × 1280, 176) = min(134, 176) = 134px; width ≈ 13 × 134 × 0.62 = 1079px > 92vw (1177px) ✓ (1079 < 1177)
  At 1440px: min(151, 176) = 151px; width ≈ 13 × 151 × 0.62 = 1217px > 92vw (1324px) ✓
  At 1920px: min(201, 176) = 176px (clamped); width ≈ 13 × 176 × 0.62 = 1418px > 92vw (1766px) ✓
  All widths fit.
*/

const C = {
  ink:   '#0B1410',
  brass: '#B08D57',
  cream: '#EDE4D3',
} as const;

const F = {
  display: 'var(--font-display),"Cormorant Garamond",Georgia,serif',
  sans:    'var(--font-sans),Jost,sans-serif',
} as const;

function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

const WORDMARK_LETTERS = 'HALDEN & ROWE'.split('');

export default function SiteFooter() {
  const footerRef   = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.hr-ft-letter', { color: C.cream, yPercent: 0, opacity: 1 });
        gsap.set('.hr-ft-center-line', { scaleX: 1, opacity: 1 });
        gsap.set('.hr-ft-col-child', { opacity: 1, y: 0 });
        gsap.set('.hr-ft-copy', { opacity: 1 });
        return;
      }

      const wm = wordmarkRef.current;

      // Center brass rule expands outward from middle
      const line = footer.querySelector<HTMLElement>('.hr-ft-center-line');
      if (line && wm) {
        gsap.fromTo(line,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.3,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: wm,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // Wordmark: letters emerge from behind the line, staggered from center outwards
      const letters = footer.querySelectorAll<HTMLElement>('.hr-ft-letter');
      if (wm) {
        gsap.fromTo(letters,
          {
            yPercent: 75,
            opacity: 0,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(176,141,87,0.3)',
          },
          {
            yPercent: 0,
            opacity: 1,
            color: C.cream,
            WebkitTextStroke: '1px rgba(176,141,87,0.05)',
            duration: 1.1,
            ease: 'power3.out',
            stagger: {
              each: 0.045,
              from: 'center',
            },
            scrollTrigger: {
              trigger: wm,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }

      // Column children stagger
      gsap.fromTo('.hr-ft-col-child',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.hr-ft-grid', start: 'top 88%', once: true },
        }
      );

      // Copyright fade last
      gsap.fromTo('.hr-ft-copy',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '.hr-ft-bottom', start: 'top 95%', once: true } }
      );

      // ScrollTrigger.refresh after fonts
      document.fonts.ready.then(() => ScrollTrigger.refresh());

    }, footer);

    return () => ctx.revert();
  }, []);

  const year = 2026;

  return (
    <footer
      ref={footerRef}
      style={{
        background: C.ink,
        borderTop: '1px solid rgba(176,141,87,0.15)',
        paddingInline: '6vw',
        paddingBottom: '2rem',
        position: 'relative',
        zIndex: 10,
        color: C.cream,
        overflow: 'hidden',
      }}
    >
      <style>{`
        .hr-ft-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
          gap: 3rem 4rem;
          padding-top: clamp(4rem,9svh,7rem);
        }
        @media (max-width: 1000px) { .hr-ft-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px)  { .hr-ft-grid { grid-template-columns: 1fr; } }
        .hr-ft-link {
          font-family: var(--font-sans),Jost,sans-serif;
          font-weight: 300;
          font-size: 0.95rem;
          color: rgba(237,228,211,0.7);
          text-decoration: none;
          display: inline-block;
          position: relative;
          padding-bottom: 1px;
          transition: color 0.2s;
        }
        .hr-ft-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: 0;
          width: 0; height: 1px;
          background: #B08D57;
          transition: width 0.25s ease;
          transform-origin: left;
        }
        .hr-ft-link:hover { color: #EDE4D3; }
        .hr-ft-link:hover::after { width: 100%; }
        .hr-ft-link:focus-visible { outline: 2px solid #B08D57; outline-offset: 3px; }
        .hr-ft-social {
          font-family: var(--font-sans),Jost,sans-serif;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: rgba(237,228,211,0.45);
          text-decoration: none;
          transition: color 0.2s;
        }
        .hr-ft-social:hover { color: #B08D57; }
        .hr-ft-social:focus-visible { outline: 2px solid #B08D57; outline-offset: 3px; }
        .hr-ft-bottom {
          max-width: 1400px;
          margin: 2.5rem auto 0;
          border-top: 1px solid rgba(176,141,87,0.15);
          padding-top: 1.4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .hr-ft-wordmark-wrap {
          text-align: center;
          position: relative;
          overflow: hidden;
          padding: clamp(3.5rem, 8svh, 6rem) 0 1.5rem;
        }
      `}</style>

      {/* Wordmark band with central expanding line & letters behind it */}
      <div className="hr-ft-wordmark-wrap" ref={wordmarkRef} aria-hidden="true">
        {/* Horizontal center brass line — z-index 2 (in front of letters) */}
        <div
          className="hr-ft-center-line"
          style={{
            position: 'absolute',
            top: '56%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(176,141,87,0.3) 15%, #B08D57 50%, rgba(176,141,87,0.3) 85%, transparent 100%)',
            transformOrigin: '50% 50%',
            transform: 'scaleX(0)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {/* Central brass diamond ornament */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: '6px',
              height: '6px',
              background: C.brass,
              boxShadow: '0 0 10px rgba(176,141,87,0.85)',
            }}
          />
        </div>

        {/* Letters container — z-index 1 (behind the line) */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            fontFamily: F.display,
            fontSize: 'clamp(3.2rem, 10.5vw, 11rem)',
            lineHeight: 1.15,
            letterSpacing: '0.03em',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(176,141,87,0.35)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            paddingBottom: '0.8rem',
          }}
        >
          {WORDMARK_LETTERS.map((letter, i) => (
            <span key={i} className="hr-ft-letter" style={{ display: 'inline-block' }}>
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className="hr-ft-grid">

        {/* Brand */}
        <div>
          <span className="hr-ft-col-child" style={{ fontFamily: F.display, letterSpacing: '0.3em', fontSize: '1.2rem', color: C.cream, display: 'block', marginBottom: '0.35rem' }}>
            HALDEN &amp; ROWE
          </span>
          <span className="hr-ft-col-child" style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.7rem', color: C.brass, display: 'block', marginBottom: '1.2rem' }}>
            {footerData.tagline}
          </span>
          <address className="hr-ft-col-child" style={{ fontStyle: 'normal', marginBottom: '0.6rem' }}>
            <p style={{ fontFamily: F.sans, fontWeight: 300, fontSize: '0.87rem', color: 'rgba(237,228,211,0.6)', lineHeight: 1.65, margin: 0 }}>
              {footerData.address.lines.map((line, i) => (
                <span key={i} style={{ display: 'block' }}>{line}</span>
              ))}
            </p>
          </address>
          {footerData.hours.map((h) => (
            <p key={h} className="hr-ft-col-child" style={{ fontFamily: F.sans, fontSize: '0.8rem', color: 'rgba(237,228,211,0.42)', margin: '0.12rem 0', letterSpacing: '0.04em' }}>{h}</p>
          ))}
          <a href={`tel:${footerData.phone.replace(/\s/g, '')}`} className="hr-ft-link hr-ft-col-child" style={{ marginTop: '0.6rem', display: 'inline-block', fontSize: '0.84rem' }}>
            {footerData.phone}
          </a>
        </div>

        {/* Link columns */}
        {footerData.columns.map((col) => (
          <div key={col.title}>
            <p className="hr-ft-col-child" style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.68rem', color: C.brass, margin: '0 0 1.1rem 0' }}>
              {col.title}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {col.links.map((link) => (
                <li key={link.label} className="hr-ft-col-child">
                  {isInternal(link.href)
                    ? <Link href={link.href} className="hr-ft-link">{link.label}</Link>
                    : <a href={link.href} className="hr-ft-link">{link.label}</a>
                  }
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div className="hr-ft-col-child">
          <FooterNewsletter />
        </div>
      </div>

      {/* Bottom row */}
      <div className="hr-ft-bottom hr-ft-copy">
        <span style={{ fontFamily: F.sans, fontSize: '0.74rem', color: 'rgba(237,228,211,0.38)', letterSpacing: '0.06em' }}>
          © {year} Halden &amp; Rowe. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '1.4rem', alignItems: 'center' }}>
          {footerData.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hr-ft-social" aria-label={s.label}>
              {s.label}
            </a>
          ))}
        </div>
        <BackToTop />
      </div>
    </footer>
  );
}
