'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export type RevealMode = 'words' | 'lines' | 'scrub';

interface RevealTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  mode: RevealMode;
  className?: string;
  style?: React.CSSProperties;
  stagger?: number;
  start?: string;
}

function lerpVal(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function RevealText({
  text,
  as: Tag = 'div',
  mode,
  className,
  style,
  stagger,
  start,
}: RevealTextProps) {
  // Use a plain div wrapper so the ref is always HTMLDivElement,
  // then style/role semantics come from the Tag rendered inside.
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  const words = text.split(' ').filter((w) => w.length > 0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reduced) return;

    const innerSpans = Array.from(el.querySelectorAll<HTMLElement>('[data-rw]'));
    if (!innerSpans.length) return;

    const ctx = gsap.context(() => {
      if (mode === 'words' || mode === 'lines') {
        gsap.set(innerSpans, { yPercent: 110 });
        gsap.to(innerSpans, {
          yPercent: 0,
          duration: 1.1,
          ease: 'power4.out',
          stagger: stagger ?? 0.045,
          scrollTrigger: {
            trigger: el,
            start: start ?? 'top 85%',
            once: true,
          },
        });
      } else {
        // scrub: per-word opacity + blur driven by scroll progress
        const total = innerSpans.length;
        innerSpans.forEach((span, i) => {
          const wordStart = (i / total) * 0.6;
          gsap.fromTo(
            span,
            { opacity: 0.14, filter: 'blur(3px)' },
            {
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: start ?? 'top 82%',
                end: 'bottom 48%',
                scrub: true,
                onUpdate: (self) => {
                  const p = Math.max(0, Math.min(1, (self.progress - wordStart) / (1 - wordStart + 0.001)));
                  gsap.set(span, {
                    opacity: lerpVal(0.14, 1, p),
                    filter: `blur(${lerpVal(3, 0, p)}px)`,
                  });
                },
              },
            }
          );
        });
      }
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (reduced) {
    // Render semantically correct tag, no wrapper
    return (
      <Tag className={className} style={style} aria-label={text}>
        {text}
      </Tag>
    );
  }

  // For animated version: wrap in a div (so ref is always HTMLDivElement),
  // render inner Tag with aria-label + aria-hidden spans
  return (
    <div ref={wrapRef} className={className} style={style}>
      {/* Accessible full text */}
      <span className="sr-only" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>{text}</span>
      {/* Visual word spans */}
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            marginRight: '0.25em',
          }}
        >
          <span
            data-rw="true"
            style={{ display: 'inline-block' }}
          >
            {word}
          </span>
        </span>
      ))}
    </div>
  );
}
