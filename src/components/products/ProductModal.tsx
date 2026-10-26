'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Product, formatPrice } from '@/data/products';
import { useLenis } from '@/lib/lenisContext';
import SuitView from './SuitView';
import ColorSwatches, { originFromRect } from './ColorSwatches';

export interface ProductModalProps {
  product: Product | null;
  initialColorId?: string;
  onClose(): void;
}

export default function ProductModal({
  product,
  initialColorId,
  onClose,
}: ProductModalProps) {
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<string>(
    initialColorId || product?.colors[0]?.id || ''
  );
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 62 });

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update selected color when initialColorId or product changes
  useEffect(() => {
    if (product) {
      setSelectedColorId(initialColorId || product.colors[0]?.id || '');
    }
  }, [product, initialColorId]);

  // Lock scroll & focus management
  useEffect(() => {
    if (!product) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    if (lenis) {
      lenis.stop();
    } else {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (lenis) {
        lenis.start();
      } else {
        document.body.style.overflow = '';
      }
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
      }
    };
  }, [product, lenis]);

  // GSAP Open Animation
  useEffect(() => {
    if (!product || !overlayRef.current || !panelRef.current) return;
    isClosingRef.current = false;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const rightCol = rightColRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'linear' });
      tl.fromTo(
        panel,
        { y: 40, scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' },
        0
      );

      if (rightCol) {
        const items = rightCol.querySelectorAll('.hr-modal-stagger-item');
        if (items.length > 0) {
          tl.fromTo(
            items,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.05 },
            0.15
          );
        }
      }
    });

    closeBtnRef.current?.focus();

    return () => ctx.revert();
  }, [product]);

  // Animated Close
  const handleAnimatedClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (!overlayRef.current || !panelRef.current) {
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
      },
    });

    tl.to(panelRef.current, {
      y: 30,
      scale: 0.96,
      opacity: 0,
      duration: 0.28,
      ease: 'power2.in',
    });
    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.28,
        ease: 'linear',
      },
      0
    );
  };

  // Keyboard navigation & trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleAnimatedClose();
      return;
    }

    if (e.key === 'Tab') {
      if (!panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  const handleSelectColor = (cid: string, rect: DOMRect) => {
    if (mediaRef.current) {
      setOrigin(originFromRect(rect, mediaRef.current));
    }
    setSelectedColorId(cid);
  };

  if (!mounted || !product) return null;

  const detailRows = [
    { label: 'Fabric', value: product.details.fabric },
    { label: 'Weight', value: product.details.weight },
    { label: 'Lining', value: product.details.lining },
    { label: 'Fit', value: product.details.fit },
    { label: 'Buttons', value: product.details.buttons },
    { label: 'Origin', value: product.details.origin },
    { label: 'Lead time', value: product.details.leadTime },
  ];

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} quick view`}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          handleAnimatedClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(11, 20, 16, 0.82)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: '3vw',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .hr-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: min(1100px, 100%);
          height: min(86svh, 760px);
          background: #0B1410;
          border: 1px solid rgba(176, 141, 87, 0.3);
          position: relative;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
        }
        @media (max-width: 800px) {
          .hr-modal-grid {
            grid-template-columns: 1fr;
            height: auto;
            max-height: 92svh;
            overflow-y: auto;
          }
        }
        .hr-modal-close-btn {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          padding: 0;
        }
        .hr-modal-close-line {
          position: absolute;
          width: 22px;
          height: 1px;
          background: #EDE4D3;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .hr-modal-close-btn:hover .hr-modal-close-line,
        .hr-modal-close-btn:focus-visible .hr-modal-close-line {
          background: #B08D57;
        }
        .hr-modal-close-btn:focus-visible {
          outline: 2px solid #B08D57;
          outline-offset: 2px;
        }
        .hr-modal-cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #B08D57;
          color: #0B1410;
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 0.9rem 1.6rem;
          text-decoration: none;
          border: 1px solid #B08D57;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          box-sizing: border-box;
        }
        .hr-modal-cta-primary:hover {
          background: #EDE4D3;
          border-color: #EDE4D3;
          color: #0B1410;
        }
        .hr-modal-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: #EDE4D3;
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 0.9rem 1.6rem;
          text-decoration: none;
          border: 1px solid rgba(176, 141, 87, 0.45);
          transition: border-color 0.25s ease, color 0.25s ease;
          box-sizing: border-box;
        }
        .hr-modal-cta-secondary:hover {
          border-color: #B08D57;
          color: #B08D57;
        }
        .hr-modal-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .hr-modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(176, 141, 87, 0.25);
          border-radius: 4px;
        }
      `}</style>

      <div ref={panelRef} className="hr-modal-grid">
        {/* Close button */}
        <button
          ref={closeBtnRef}
          type="button"
          className="hr-modal-close-btn"
          onClick={handleAnimatedClose}
          aria-label="Close dialog"
        >
          <span
            className="hr-modal-close-line"
            style={{ transform: 'rotate(45deg)' }}
          />
          <span
            className="hr-modal-close-line"
            style={{ transform: 'rotate(-45deg)' }}
          />
        </button>

        {/* Left Column: Suit Media */}
        <div
          ref={mediaRef}
          style={{
            background: '#14211B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem',
            position: 'relative',
            minHeight: '360px',
            overflow: 'hidden',
          }}
        >
          <SuitView
            product={product}
            colorId={selectedColorId}
            originX={origin.x}
            originY={origin.y}
          />
        </div>

        {/* Right Column: Information & Details */}
        <div
          ref={rightColRef}
          className="hr-modal-scroll"
          data-lenis-prevent="true"
          style={{
            overflowY: 'auto',
            padding: '2.8rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <span
            className="hr-modal-stagger-item"
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: '#B08D57',
              display: 'block',
            }}
          >
            {product.category}
          </span>

          <h2
            className="hr-modal-stagger-item"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              color: '#EDE4D3',
              lineHeight: 1.1,
              margin: '0 0 0.2rem 0',
              fontWeight: 400,
            }}
          >
            {product.name}
          </h2>

          <div
            className="hr-modal-stagger-item"
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '1.15rem',
              color: '#EDE4D3',
              fontWeight: 400,
            }}
          >
            {formatPrice(product.price)}
          </div>

          <div
            className="hr-modal-stagger-item"
            style={{
              width: '100%',
              height: '1px',
              background: 'rgba(176, 141, 87, 0.25)',
              margin: '0.4rem 0',
            }}
          />

          <p
            className="hr-modal-stagger-item"
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 300,
              lineHeight: 1.65,
              color: 'rgba(237, 228, 211, 0.7)',
              margin: '0 0 0.5rem 0',
            }}
          >
            {product.description}
          </p>

          {/* Colorways */}
          <div className="hr-modal-stagger-item" style={{ marginBottom: '0.6rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans), Jost, sans-serif',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#B08D57',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              Colour
            </span>
            <ColorSwatches
              colors={product.colors}
              activeId={selectedColorId}
              onSelect={handleSelectColor}
              size={26}
              showLabel={true}
            />
          </div>

          {/* Details list */}
          <div
            className="hr-modal-stagger-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: '0.8rem 0',
            }}
          >
            {detailRows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(176, 141, 87, 0.2)',
                  paddingBlock: '0.75rem',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans), Jost, sans-serif',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: '#B08D57',
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans), Jost, sans-serif',
                    fontWeight: 300,
                    fontSize: '0.92rem',
                    color: 'rgba(237, 228, 211, 0.85)',
                    textAlign: 'right',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Row */}
          <div
            className="hr-modal-stagger-item"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '0.5rem',
            }}
          >
            <a
              href="#contact"
              onClick={handleAnimatedClose}
              className="hr-modal-cta-primary"
            >
              Book a Private Fitting
            </a>
            <Link
              href={`/collection/${product.slug}`}
              onClick={handleAnimatedClose}
              className="hr-modal-cta-secondary"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
