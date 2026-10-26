'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

const NAV_LINKS = [
  { label: 'Atelier',     href: '#clients'    },
  { label: 'Collections', href: '/collection' },
  { label: 'Bespoke',     href: '#cloth'      },
  { label: 'Heritage',    href: '#heritage'   },
  { label: 'Contact',     href: '#book'       },
];

const HIDE_THRESHOLD = 40; // px: navbar hides above this scrollY

interface NavbarProps {
  introReady: boolean;
}

export default function Navbar({ introReady }: NavbarProps) {
  const navRef     = useRef<HTMLElement>(null);
  const wordRef    = useRef<HTMLAnchorElement>(null);
  const linksRef   = useRef<(HTMLLIElement | null)[]>([]);
  const enquireRef = useRef<HTMLAnchorElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const introPlayed  = useRef(false);
  // Track hide state to avoid duplicate GSAP calls
  const hiddenRef    = useRef(false);

  // ── Hide / show navbar on scroll threshold ─────────────────────────────────
  useEffect(() => {
    if (!navRef.current) return;
    // Assert non-null: the early return above guarantees this
    const navEl = navRef.current as HTMLElement;

    function handleScroll() {
      const past = window.scrollY > HIDE_THRESHOLD;

      if (past && !hiddenRef.current) {
        hiddenRef.current = true;
        gsap.to(navEl, {
          yPercent:  -100,
          opacity:   0,
          duration:  0.45,
          ease:      'power3.out',
          overwrite: true,
          onComplete: () => { navEl.style.pointerEvents = 'none'; },
        });
      } else if (!past && hiddenRef.current) {
        hiddenRef.current = false;
        navEl.style.pointerEvents = '';
        gsap.to(navEl, {
          yPercent:  0,
          opacity:   1,
          duration:  0.45,
          ease:      'power3.out',
          overwrite: true,
        });
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Intro stagger ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!introReady || introPlayed.current) return;
    introPlayed.current = true;

    const targets = [
      wordRef.current,
      ...linksRef.current,
      enquireRef.current,
      menuBtnRef.current,
    ].filter(Boolean);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(targets, { opacity: 0, y: -16 });
    gsap.to(targets, {
      opacity:  1,
      y:        0,
      duration: 0.9,
      ease:     'power3.out',
      stagger:  0.08,
      delay:    0.6,
    });
  }, [introReady]);

  // ── Mobile menu open / close ───────────────────────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (menuOpen) {
      gsap.fromTo(overlay, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: 'power3.inOut' });
    } else {
      gsap.to(overlay, { yPercent: -100, duration: 0.4, ease: 'power3.inOut' });
    }
  }, [menuOpen]);

  return (
    <>
      <nav ref={navRef} className="navbar" aria-label="Main navigation">
        {/* Wordmark */}
        <Link
          ref={wordRef}
          href="/"
          className="navbar-wordmark"
          style={{ opacity: 0 }}
          aria-label="Halden & Rowe – home"
        >
          HALDEN &amp; ROWE
        </Link>

        {/* Desktop links */}
        <ul className="navbar-links" role="list">
          {NAV_LINKS.map((link, i) => (
            <li key={link.href} ref={(el) => { linksRef.current[i] = el; }} style={{ opacity: 0 }}>
              <a href={link.href} className="navbar-link">{link.label}</a>
            </li>
          ))}
        </ul>

        {/* Enquire */}
        <a ref={enquireRef} href="#book" className="navbar-enquire" style={{ opacity: 0 }}>
          Enquire
        </a>

        {/* Mobile toggle */}
        <button
          ref={menuBtnRef}
          className="navbar-menu-btn"
          style={{ opacity: 0 }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`menu-line ${menuOpen ? 'menu-line--open-top' : ''}`} />
          <span className={`menu-line ${menuOpen ? 'menu-line--open-bot' : ''}`} />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        className="mobile-menu"
        aria-hidden={!menuOpen}
        style={{ transform: 'translateY(-100%)' }}
      >
        <ul role="list" className="mobile-menu-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="mobile-menu-link mobile-menu-enquire" onClick={() => setMenuOpen(false)}>
              Enquire
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
