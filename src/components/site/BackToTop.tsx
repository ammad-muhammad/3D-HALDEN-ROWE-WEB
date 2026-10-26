'use client';

import { useLenis } from '@/lib/lenisContext';

const C = { brass: '#B08D57', cream: '#EDE4D3' } as const;
const F = { sans: 'var(--font-sans), Jost, sans-serif' } as const;

export default function BackToTop() {
  const lenis = useLenis();

  const handleClick = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Back to top"
      style={{
        background: 'none',
        border: '1px solid rgba(176,141,87,0.3)',
        color: 'rgba(237,228,211,0.5)',
        fontFamily: F.sans,
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        padding: '0.45rem 1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'color 0.2s, border-color 0.2s',
      }}
    >
      ↑ Top
    </button>
  );
}
