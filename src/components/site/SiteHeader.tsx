'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';
  const isCollection = pathname.startsWith('/collection');

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: '6vw',
        background: scrolled ? 'rgba(11, 20, 16, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(176, 141, 87, 0.15)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .hr-header-wordmark {
          font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
          font-size: 1.15rem;
          letter-spacing: 0.3em;
          color: #EDE4D3;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }
        .hr-header-wordmark:hover {
          color: #B08D57;
        }
        .hr-header-nav {
          display: flex;
          align-items: center;
          gap: 2.8rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (max-width: 768px) {
          .hr-header-nav {
            display: none;
          }
        }
        .hr-header-link {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: rgba(237, 228, 211, 0.7);
          text-decoration: none;
          padding-bottom: 4px;
          border-bottom: 1px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .hr-header-link:hover {
          color: #EDE4D3;
        }
        .hr-header-link--active {
          color: #EDE4D3;
          border-bottom-color: #B08D57;
        }
        .hr-header-enquire {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #EDE4D3;
          border: 1px solid rgba(176, 141, 87, 0.45);
          padding: 0.6rem 1.4rem;
          text-decoration: none;
          transition: border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
        }
        .hr-header-enquire:hover {
          border-color: #B08D57;
          background: #B08D57;
          color: #0B1410;
        }
      `}</style>

      {/* Left: Wordmark */}
      <Link href="/" className="hr-header-wordmark" aria-label="Halden & Rowe Home">
        HALDEN &amp; ROWE
      </Link>

      {/* Centre: Navigation links */}
      <nav aria-label="Secondary navigation">
        <ul className="hr-header-nav">
          <li>
            <Link
              href="/"
              className={`hr-header-link ${isHome ? 'hr-header-link--active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/collection"
              className={`hr-header-link ${isCollection ? 'hr-header-link--active' : ''}`}
            >
              Collection
            </Link>
          </li>
        </ul>
      </nav>

      {/* Right: Enquire */}
      <div>
        <a href="/#contact" className="hr-header-enquire">
          Enquire
        </a>
      </div>
    </header>
  );
}
