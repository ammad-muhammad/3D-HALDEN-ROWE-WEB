'use client';

import { createContext, useContext } from 'react';
import type Lenis from 'lenis';

// ─── Context ─────────────────────────────────────────────────────────────────
// We expose lenis via a ref-wrapped context so consumers never re-render
// when lenis is assigned.

interface LenisContextValue {
  getLenis: () => Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ getLenis: () => null });

export function useLenis(): Lenis | null {
  return useContext(LenisContext).getLenis();
}

export { LenisContext };
export type { LenisContextValue };
