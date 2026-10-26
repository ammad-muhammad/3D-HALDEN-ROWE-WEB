'use client';

import { useEffect, useRef, useMemo, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LENIS_OPTIONS } from '@/lib/config';
import { LenisContext, type LenisContextValue } from '@/lib/lenisContext';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  // useMemo creates a stable object referencing the ref, avoiding .current access during render
  const ctxValue = useMemo<LenisContextValue>(
    () => ({ getLenis: () => lenisRef.current }),
    [],
  );

  useEffect(() => {
    // Guard against StrictMode double-mount
    if (lenisRef.current) return;

    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const lenis = new Lenis(LENIS_OPTIONS);
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <LenisContext.Provider value={ctxValue}>
      {children}
    </LenisContext.Provider>
  );
}
