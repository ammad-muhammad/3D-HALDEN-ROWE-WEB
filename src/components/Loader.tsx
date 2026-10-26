'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { preloadAll, onClip1Progress } from '@/lib/frames';
import { LOADER_MIN_MS } from '@/lib/config';
import { useLenis } from '@/lib/lenisContext';

interface LoaderProps {
  onReady: () => void;
}

export default function Loader({ onReady }: LoaderProps) {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const barRef      = useRef<HTMLDivElement>(null);
  const pctRef      = useRef<HTMLSpanElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const isGone      = useRef(false);

  const lenis = useLenis();

  useEffect(() => {
    // Stop scroll while loading
    lenis?.stop();

    const startTime = Date.now();
    let lifted = false;

    // Animate bar fill with gsap to avoid janky direct style updates
    function updateBar(pct: number) {
      if (isGone.current) return;
      gsap.to(barRef.current, {
        scaleX: pct,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      });
      if (pctRef.current) {
        pctRef.current.textContent = `${Math.round(pct * 100)}%`;
      }
    }

    function lift() {
      if (isGone.current) return;
      isGone.current = true;
      lifted = true;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            if (overlayRef.current) overlayRef.current.style.display = 'none';
            lenis?.start();
            onReady();
          },
        });
        return;
      }

      // Complete the bar to 100%, then lift
      gsap.to(barRef.current, {
        scaleX: 1,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(overlayRef.current, {
            yPercent: -105,
            duration: 1,
            ease: 'power3.inOut',
            onComplete: () => {
              if (overlayRef.current) overlayRef.current.style.display = 'none';
              lenis?.start();
              onReady();
            },
          });
        },
      });
    }

    function checkReady() {
      const elapsed = Date.now() - startTime;
      const wait    = Math.max(0, LOADER_MIN_MS - elapsed);
      setTimeout(lift, wait);
    }

    // Wordmark fade in
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced && wordmarkRef.current) {
      gsap.fromTo(wordmarkRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.1 });
    }

    // Set initial bar state (origin left)
    if (barRef.current) {
      barRef.current.style.transformOrigin = 'left center';
      gsap.set(barRef.current, { scaleX: 0 });
    }

    onClip1Progress((pct) => {
      updateBar(pct);
      if (pct >= 1) checkReady();
    });

    preloadAll();

    // Fallback 1: if clip1 frames load before callback was registered, lift after min time
    setTimeout(() => {
      if (!isGone.current) {
        updateBar(1);
        checkReady();
      }
    }, LOADER_MIN_MS + 500);

    // Fallback 2 — HARD CAP: no matter what, loader MUST lift after 4 seconds
    // This prevents permanent stuck state on hard refresh / hydration race
    const hardCapTimer = setTimeout(() => {
      if (!lifted && !isGone.current) {
        updateBar(1);
        lift();
      }
    }, 4000);

    return () => {
      clearTimeout(hardCapTimer);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={overlayRef}
      className="loader-overlay"
      aria-label="Loading Halden & Rowe"
      role="status"
    >
      <div className="loader-inner">
        <h1 ref={wordmarkRef} className="loader-wordmark">
          HALDEN &amp; ROWE
        </h1>

        <div className="loader-bar-track">
          <div ref={barRef} className="loader-bar-fill" />
        </div>

        <span ref={pctRef} className="loader-pct">0%</span>
      </div>
    </div>
  );
}
