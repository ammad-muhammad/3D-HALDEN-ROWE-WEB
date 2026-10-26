// src/lib/motion.ts
// Pure utility helpers – no React hooks, no window access at module scope.

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isDesktop(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 900;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
