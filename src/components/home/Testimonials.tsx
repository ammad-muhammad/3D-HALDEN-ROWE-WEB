'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { testimonials } from '@/data/testimonials';
import { prefersReducedMotion, isDesktop } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const C = { ink: '#0B1410', brass: '#B08D57', cream: '#EDE4D3' } as const;
const F = {
  display: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
  sans:    'var(--font-sans), Jost, sans-serif',
} as const;

const TOTAL      = testimonials.length;
const AUTOPLAY   = 7000;

/* ── Word-mask helper ─────────────────────────────────────────────────────── */
function splitWords(text: string): string[] {
  return text.split(' ').filter((w) => w.length > 0);
}

/* ── Slide component ─────────────────────────────────────────────────────── */
function Slide({
  t,
  index,
  active,
  elRef,
}: {
  t: (typeof testimonials)[0];
  index: number;
  active: boolean;
  elRef: (el: HTMLDivElement | null) => void;
}) {
  const words = splitWords(t.quote);

  return (
    <div
      ref={elRef}
      style={{
        position: index === 0 ? 'relative' : 'absolute',
        top: 0, left: 0, right: 0,
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 1,
      }}
    >
      <blockquote style={{ margin: 0 }}>
        {/* Word-mask paragraph */}
        <p
          aria-label={t.quote}
          style={{
            fontFamily: F.display, fontStyle: 'italic',
            fontSize: 'clamp(1.6rem,3.2vw,2.9rem)', lineHeight: 1.25,
            color: C.cream, marginBottom: '2.2rem',
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="hr-testi-word-outer"
              style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.28em' }}
            >
              <span className="hr-testi-word-inner" style={{ display: 'inline-block' }}>{word}</span>
            </span>
          ))}
        </p>
      </blockquote>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '3rem', height: '3rem', border: `1px solid ${C.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontSize: '1.1rem', color: C.brass, flexShrink: 0, transform: 'rotate(-90deg)', opacity: 0 }} className="hr-testi-mono">
          {t.monogram}
        </div>
        <div>
          <p style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.8rem', color: C.cream, margin: '0 0 0.2rem 0' }}>{t.name}</p>
          <p style={{ fontFamily: F.sans, fontWeight: 300, fontSize: '0.9rem', color: 'rgba(237,228,211,0.6)', margin: '0 0 0.2rem 0' }}>{t.role}</p>
          <p style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.7rem', color: C.brass, margin: 0 }}>Wearing {t.suit}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Testimonials() {
  const sectionRef  = useRef<HTMLElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const quoteRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const slideRefs   = useRef<(HTMLDivElement | null)[]>([]);

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const progAnim     = useRef<gsap.core.Tween | null>(null);
  const currRef      = useRef(0);
  const animating    = useRef(false);
  const reduced      = useRef(false);

  const [dotIndex, setDotIndex] = useState(0);
  const [, setPaused] = useState(false);

  /* ── Animate slide words ──────────────────────────────────────────────── */
  const animateIn = useCallback((slideEl: HTMLDivElement) => {
    if (reduced.current) return;
    const inners = slideEl.querySelectorAll<HTMLElement>('.hr-testi-word-inner');
    const mono   = slideEl.querySelector<HTMLElement>('.hr-testi-mono');
    gsap.set(inners, { yPercent: 100 });
    gsap.to(inners, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.03 });
    if (mono) {
      gsap.set(mono, { rotate: -90, opacity: 0 });
      gsap.to(mono, { rotate: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 });
    }
  }, []);

  const animateOut = useCallback((slideEl: HTMLDivElement) => {
    if (reduced.current) return;
    const inners = slideEl.querySelectorAll<HTMLElement>('.hr-testi-word-inner');
    gsap.to(inners, { yPercent: -100, duration: 0.4, ease: 'power2.in', stagger: 0.015 });
  }, []);

  /* ── Transition ──────────────────────────────────────────────────────── */
  const goTo = useCallback((next: number) => {
    if (animating.current || next === currRef.current) return;
    animating.current = true;
    const curr   = currRef.current;
    const outEl  = slideRefs.current[curr];
    const inEl   = slideRefs.current[next];
    if (!outEl || !inEl) { animating.current = false; return; }

    if (reduced.current) {
      gsap.set(outEl, { opacity: 0, pointerEvents: 'none' });
      gsap.set(inEl,  { opacity: 1, pointerEvents: 'auto' });
      currRef.current = next; setDotIndex(next); animating.current = false;
      return;
    }

    animateOut(outEl);
    gsap.to(outEl, { opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => { outEl.style.pointerEvents = 'none'; } });

    gsap.set(inEl, { opacity: 0, pointerEvents: 'none' });
    gsap.to(inEl, {
      opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3,
      onStart: () => { inEl.style.pointerEvents = 'auto'; animateIn(inEl); },
      onComplete: () => { animating.current = false; },
    });
    currRef.current = next;
    setDotIndex(next);
  }, [animateIn, animateOut]);

  const prev = useCallback(() => goTo((currRef.current - 1 + TOTAL) % TOTAL), [goTo]);
  const next = useCallback(() => goTo((currRef.current + 1) % TOTAL),         [goTo]);

  /* ── Progress bar ────────────────────────────────────────────────────── */
  const startProgress = useCallback(() => {
    if (!progressRef.current) return;
    if (progAnim.current) progAnim.current.kill();
    gsap.set(progressRef.current, { scaleX: 0 });
    progAnim.current = gsap.to(progressRef.current, { scaleX: 1, duration: AUTOPLAY / 1000, ease: 'none', transformOrigin: 'left' });
  }, []);

  const stopProgress = useCallback(() => { progAnim.current?.pause(); }, []);

  /* ── Autoplay ────────────────────────────────────────────────────────── */
  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startProgress();
    timerRef.current = setInterval(() => {
      goTo((currRef.current + 1) % TOTAL);
      startProgress();
    }, AUTOPLAY);
  }, [goTo, startProgress]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopProgress();
  }, [stopProgress]);

  /* ── Mount ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    reduced.current = prefersReducedMotion();
    const desktop = isDesktop();

    // Init slides
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === 0) {
        gsap.set(el, { opacity: 1, pointerEvents: 'auto' });
        if (!reduced.current) animateIn(el);
      } else {
        gsap.set(el, { opacity: 0, pointerEvents: 'none' });
      }
    });

    if (!reduced.current) startAutoplay();

    const onVis = () => { if (document.hidden) stopAutoplay(); else startAutoplay(); };
    document.addEventListener('visibilitychange', onVis);

    const onKey = (e: KeyboardEvent) => {
      if (!section.contains(document.activeElement as Node)) return;
      if (e.key === 'ArrowLeft')  { prev(); startAutoplay(); }
      if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    };
    window.addEventListener('keydown', onKey);

    let startX = 0;
    const onPtrDown = (e: PointerEvent) => { startX = e.clientX; };
    const onPtrUp   = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) next(); else prev();
      startAutoplay();
    };
    section.addEventListener('pointerdown', onPtrDown);
    section.addEventListener('pointerup',   onPtrUp);

    // Section entrance — sequenced timeline
    const ctx = gsap.context(() => {
      if (reduced.current) {
        gsap.set(['.hr-testi-label', '.hr-testi-heading', '.hr-testi-rule', '.hr-testi-sub', stageRef.current, controlsRef.current], {
          opacity: 1,
          y: 0,
          scaleX: 1,
          clipPath: 'none',
        });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
        defaults: { ease: 'power3.out' },
      });

      // Label
      tl.fromTo('.hr-testi-label',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6 },
        0
      );
      // Heading wipe
      tl.fromTo('.hr-testi-heading',
        { opacity: 0, clipPath: 'inset(100% 0 0 0)', y: 28 },
        { opacity: 1, clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.9 },
        0.18
      );
      // Rule expand
      tl.fromTo('.hr-testi-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: 'power2.out' },
        0.35
      );
      // Subtext
      tl.fromTo('.hr-testi-sub',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.65 },
        0.48
      );
      // Stage
      tl.fromTo(stageRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85 },
        0.65
      );
      // Controls
      tl.fromTo(controlsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.88
      );

      // Decorative quote mark scrub
      if (quoteRef.current) {
        gsap.fromTo(quoteRef.current,
          { y: 40, opacity: 0.15 },
          { y: -40, opacity: 0.55, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      }

      // Stage parallax (desktop)
      if (stageRef.current && desktop) {
        gsap.fromTo(stageRef.current,
          { y: 30 },
          { y: -30, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      }
    }, section);

    return () => {
      stopAutoplay();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onKey);
      section.removeEventListener('pointerdown', onPtrDown);
      section.removeEventListener('pointerup',   onPtrUp);
      ctx.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnter = () => { setPaused(true);  stopAutoplay(); };
  const handleLeave = () => { setPaused(false); startAutoplay(); };
  const fmt = (n: number) => String(n + 1).padStart(2, '0');

  return (
    <section
      id="clients"
      ref={sectionRef}
      style={{ background: C.ink, paddingBlock: 'clamp(6rem,14svh,10rem)', paddingInline: '6vw', position: 'relative' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <style>{`
        .hr-testi-ctrl:focus-visible { outline: 2px solid #B08D57; outline-offset: 3px; }
        .hr-testi-dot:focus-visible  { outline: 2px solid #B08D57; outline-offset: 3px; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <span
            className="hr-testi-label"
            style={{
              fontFamily: F.sans,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontSize: '0.75rem',
              color: C.brass,
              display: 'block',
              marginBottom: '0.75rem',
            }}
          >
            12 — As Worn By
          </span>

          <h2
            className="hr-testi-heading"
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              color: C.cream,
              fontWeight: 400,
              lineHeight: 1.1,
              margin: '0 0 1rem 0',
              maxWidth: '30ch',
            }}
          >
            Clients of the House
          </h2>

          <div
            className="hr-testi-rule"
            style={{
              width: '3.5rem',
              height: '1px',
              background: C.brass,
              transformOrigin: 'left',
              marginBottom: '1rem',
            }}
          />

          <p
            className="hr-testi-sub"
            style={{
              fontFamily: F.sans,
              fontWeight: 300,
              fontSize: '0.92rem',
              color: 'rgba(237,228,211,0.6)',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            Reflections from patrons who have stood before our cutting tables across nine decades.
          </p>
        </div>

        {/* Stage */}
        <div
          ref={stageRef}
          style={{ position: 'relative', maxWidth: '62rem', margin: '0 auto', minHeight: 'clamp(18rem,40svh,26rem)' }}
        >
          {/* Decorative quote */}
          <div
            ref={quoteRef}
            aria-hidden="true"
            style={{ position: 'absolute', top: '-3rem', left: '-1rem', fontFamily: F.display, fontSize: '12rem', color: 'transparent', WebkitTextStroke: '1px rgba(176,141,87,0.35)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}
          >
            &ldquo;
          </div>

          {testimonials.map((t, i) => (
            <Slide
              key={t.id}
              t={t}
              index={i}
              active={i === dotIndex}
              elRef={(el) => { slideRefs.current[i] = el; }}
            />
          ))}
        </div>

        {/* Controls */}
        <div ref={controlsRef} className="hr-testi-entrance" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
          <button className="hr-testi-ctrl" aria-label="Previous testimonial" onClick={() => { prev(); startAutoplay(); }}
            style={{ width: '44px', height: '44px', border: `1px solid ${C.brass}`, background: 'transparent', color: C.brass, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'background 0.2s, color 0.2s' }}>
            ←
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {testimonials.map((t, i) => (
              <button key={t.id} className="hr-testi-dot" aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => { goTo(i); startAutoplay(); }}
                style={{ background: i === dotIndex ? C.brass : 'rgba(237,228,211,0.3)', border: 'none', width: i === dotIndex ? '28px' : '8px', height: i === dotIndex ? '2px' : '8px', borderRadius: i === dotIndex ? '0' : '50%', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0, flexShrink: 0 }}
              />
            ))}
          </div>

          <button className="hr-testi-ctrl" aria-label="Next testimonial" onClick={() => { next(); startAutoplay(); }}
            style={{ width: '44px', height: '44px', border: `1px solid ${C.brass}`, background: 'transparent', color: C.brass, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'background 0.2s, color 0.2s' }}>
            →
          </button>

          <span style={{ fontFamily: F.display, fontSize: '1.1rem', color: 'rgba(237,228,211,0.45)', letterSpacing: '0.08em', marginLeft: 'auto' }}>
            {fmt(dotIndex)} / {fmt(TOTAL - 1)}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '0.75rem', height: '1px', background: 'rgba(176,141,87,0.15)', position: 'relative', overflow: 'hidden', maxWidth: '62rem', margin: '0.75rem auto 0' }}>
          <div ref={progressRef} style={{ position: 'absolute', inset: 0, background: C.brass, transformOrigin: 'left', transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
}
