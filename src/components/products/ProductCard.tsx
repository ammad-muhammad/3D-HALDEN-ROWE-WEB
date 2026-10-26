'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Product, formatPrice } from '@/data/products';
import SuitView from './SuitView';
import ColorSwatches, { originFromRect } from './ColorSwatches';

export interface ProductCardProps {
  product: Product;
  mode: 'modal' | 'page';
  onOpen?: (product: Product, colorId: string) => void;
  className?: string;
  style?: React.CSSProperties;
  /** landing card: the one the atelier suit flies into */
  landing?: boolean;
}

export default function ProductCard({
  product,
  mode,
  onOpen,
  className = '',
  style = {},
  landing = false,
}: ProductCardProps) {
  const [selectedColorId, setSelectedColorId] = useState<string>(
    product.colors[0]?.id || ''
  );
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 62 });
  const mediaRef = useRef<HTMLDivElement>(null);

  const handleSelectColor = (cid: string, rect: DOMRect) => {
    if (mediaRef.current) {
      setOrigin(originFromRect(rect, mediaRef.current));
    }
    setSelectedColorId(cid);
  };

  // Fallback: Ensure landing card suit is revealed if flight animation doesn't fire
  React.useEffect(() => {
    if (!landing) return;
    const timer = setTimeout(() => {
      const el = mediaRef.current?.querySelector<HTMLElement>('[data-landing-card-suit]');
      if (el && el.style.opacity === '0') {
        const layer = document.querySelector<HTMLElement>('[data-atelier-suit-layer]');
        if (!layer || layer.style.visibility === 'hidden' || layer.style.opacity === '0') {
          el.style.opacity = '1';
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [landing]);

  const pillText = mode === 'modal' ? 'Quick view' : 'View suit';

  return (
    <div
      className={`hr-product-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        ...style,
      }}
    >
      <style>{`
        .hr-product-card {
          box-sizing: border-box;
        }
        .hr-card-media {
          display: block;
          position: relative;
          width: 100%;
          /* 5:7 — slightly less tall than 3:4 */
          aspect-ratio: 5 / 7;
          max-height: 52svh;
          background: #14211B;
          /* inner padding gives suits breathing room */
          padding: 4% 6%;
          box-sizing: border-box;
          overflow: hidden;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }
        .hr-card-suit-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
          transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1);
          transform-origin: center bottom;
        }
        .hr-card-media:hover .hr-card-suit-wrapper,
        .hr-card-media:focus-visible .hr-card-suit-wrapper {
          transform: scale(1.05);
        }
        /* Subtle gradient at bottom so suit blends into dark bg */
        .hr-card-media::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 30%;
          background: linear-gradient(to top, #14211B 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }
        .hr-card-pill {
          position: absolute;
          bottom: 1.1rem;
          left: 50%;
          transform: translate(-50%, 8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #EDE4D3;
          background: rgba(11, 20, 16, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(176, 141, 87, 0.45);
          padding: 0.45rem 1.1rem;
          border-radius: 999px;
          white-space: nowrap;
          z-index: 10;
        }
        .hr-card-media:hover .hr-card-pill,
        .hr-card-media:focus-visible .hr-card-pill {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        .hr-card-media:focus-visible {
          outline: 2px solid #B08D57;
          outline-offset: 3px;
        }
        .hr-card-name-link {
          color: #EDE4D3;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .hr-card-name-link:hover {
          color: #B08D57;
        }
        /* Thin brass line under image, above info text */
        .hr-card-media + div::before,
        .hr-card-media + * + div::before {
          display: none;
        }
      `}</style>

      {/* Media Area */}
      <div ref={mediaRef} style={{ position: 'relative', width: '100%' }}>
        {mode === 'modal' ? (
          <button
            type="button"
            className="hr-card-media"
            {...(landing ? { 'data-landing-target': 'true' } : {})}
            onClick={() => onOpen?.(product, selectedColorId)}
            aria-label={`Quick view ${product.name}`}
          >
            {/* suit wrapper: opacity 0 when landing so only the flying suit is visible
                SuitLanding sets this to 1 once the suit has landed */}
            <div
              className="hr-card-suit-wrapper"
              data-landing-card-suit={landing ? 'true' : undefined}
              style={landing ? { opacity: 0 } : undefined}
            >
              <SuitView
                product={product}
                colorId={selectedColorId}
                originX={origin.x}
                originY={origin.y}
                instant={landing}
              />
            </div>
            <span className="hr-card-pill" aria-hidden="true">
              {pillText}
            </span>
          </button>
        ) : (
          <Link
            href={`/collection/${product.slug}`}
            className="hr-card-media"
            {...(landing ? { 'data-landing-target': 'true' } : {})}
            aria-label={`View ${product.name}`}
          >
            <div
              className="hr-card-suit-wrapper"
              data-landing-card-suit={landing ? 'true' : undefined}
              style={landing ? { opacity: 0 } : undefined}
            >
              <SuitView
                product={product}
                colorId={selectedColorId}
                originX={origin.x}
                originY={origin.y}
                instant={landing}
              />
            </div>
            <span className="hr-card-pill" aria-hidden="true">
              {pillText}
            </span>
          </Link>
        )}
      </div>

      {/* Information Area */}
      <div
        style={{
          marginTop: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans), Jost, sans-serif',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: '#B08D57',
            display: 'block',
          }}
        >
          {product.category}
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              fontSize: '1.45rem',
              color: '#EDE4D3',
              margin: 0,
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            <Link
              href={`/collection/${product.slug}`}
              className="hr-card-name-link"
            >
              {product.name}
            </Link>
          </h3>
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.95rem',
              color: '#EDE4D3',
              whiteSpace: 'nowrap',
            }}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Swatches & Colour Count */}
        <div
          style={{
            marginTop: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <ColorSwatches
            colors={product.colors}
            activeId={selectedColorId}
            onSelect={handleSelectColor}
            size={18}
          />
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(237,228,211,0.55)',
              whiteSpace: 'nowrap',
            }}
          >
            {product.colors.length} {product.colors.length === 1 ? 'colour' : 'colours'}
          </span>
        </div>
      </div>
    </div>
  );
}
