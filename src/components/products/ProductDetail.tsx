'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, formatPrice } from '@/data/products';
import SuitView from './SuitView';
import ColorSwatches, { originFromRect } from './ColorSwatches';
import ProductCard from './ProductCard';

gsap.registerPlugin(ScrollTrigger);

export interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainSectionRef = useRef<HTMLDivElement>(null);
  const stickyPanelRef = useRef<HTMLDivElement>(null);
  const suitTiltRef = useRef<HTMLDivElement>(null);
  const giantNameRef = useRef<HTMLDivElement>(null);
  const clothStripRef = useRef<HTMLDivElement>(null);
  const clothContentRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  const [selectedColorId, setSelectedColorId] = useState<string>(
    product.colors[0]?.id || ''
  );
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 62 });

  const activeColor =
    product.colors.find((c) => c.id === selectedColorId) || product.colors[0];

  const handleSelectColor = (cid: string, rect: DOMRect) => {
    if (stickyPanelRef.current) {
      setOrigin(originFromRect(rect, stickyPanelRef.current));
    }
    setSelectedColorId(cid);
  };

  // Scroll animations & Parallax
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Refresh after fonts load
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 901px)').matches;

    const ctx = gsap.context(() => {
      // 1. Initial Page Entrance Stagger
      gsap.fromTo(
        '.hr-detail-intro-item',
        { y: 30, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
        }
      );

      // Desktop Only Animations
      if (isDesktop && !prefersReduced) {
        // 1. Giant Outlined Name: translateX from 8vw to -22vw
        if (giantNameRef.current && mainSectionRef.current) {
          gsap.fromTo(
            giantNameRef.current,
            { x: '8vw' },
            {
              x: '-22vw',
              ease: 'none',
              scrollTrigger: {
                trigger: mainSectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // 2. Sticky Suit Panel Tilt: rotateY from -10deg to +10deg, scale 1 to 1.05, y -2% to 2%
        if (suitTiltRef.current && mainSectionRef.current) {
          gsap.fromTo(
            suitTiltRef.current,
            { rotateY: -10, scale: 1, y: '-2%' },
            {
              rotateY: 10,
              scale: 1.05,
              y: '2%',
              ease: 'none',
              scrollTrigger: {
                trigger: mainSectionRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
              },
            }
          );
        }

        // 4. "The Cloth" band: inner content parallax y -15% to +15%
        if (clothContentRef.current && clothStripRef.current) {
          gsap.fromTo(
            clothContentRef.current,
            { y: '-15%' },
            {
              y: '15%',
              ease: 'none',
              scrollTrigger: {
                trigger: clothStripRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }

        // 5. Middle card lighter parallax offset in "You may also like"
        const middleCard = relatedRef.current?.querySelector<HTMLElement>('.hr-related-middle-card');
        if (middleCard && relatedRef.current) {
          gsap.fromTo(
            middleCard,
            { y: 30 },
            {
              y: -30,
              ease: 'none',
              scrollTrigger: {
                trigger: relatedRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
      }

      // 3. Right column spec rows reveal
      ScrollTrigger.batch('.hr-spec-row', {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 30, filter: 'blur(6px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              stagger: 0.06,
              ease: 'power2.out',
            }
          );
        },
      });

      // Related cards batch reveal
      ScrollTrigger.batch('.hr-related-card', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 40, filter: 'blur(6px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.75,
              stagger: 0.12,
              ease: 'power3.out',
            }
          );
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const specRows = [
    { label: 'Fabric', value: product.details.fabric },
    { label: 'Weight', value: product.details.weight },
    { label: 'Lining', value: product.details.lining },
    { label: 'Fit', value: product.details.fit },
    { label: 'Buttons', value: product.details.buttons },
    { label: 'Origin', value: product.details.origin },
    { label: 'Lead time', value: product.details.leadTime },
  ];

  return (
    <div ref={containerRef} style={{ background: '#0B1410', width: '100%' }}>
      <style>{`
        .hr-detail-layout {
          display: grid;
          grid-template-columns: minmax(340px, 46%) 1fr;
          gap: clamp(2.5rem, 5vw, 5.5rem);
          align-items: flex-start;
          width: 100%;
        }
        @media (max-width: 900px) {
          .hr-detail-layout {
            grid-template-columns: 1fr;
          }
        }
        .hr-sticky-panel {
          position: sticky;
          top: 96px;
          background: #14211B;
          aspect-ratio: 4 / 5;
          max-height: 78svh;
          perspective: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(176, 141, 87, 0.25);
          overflow: hidden;
          padding: 2.5rem;
          box-sizing: border-box;
        }
        @media (max-width: 900px) {
          .hr-sticky-panel {
            position: relative;
            top: 0;
            max-height: 520px;
          }
        }
        .hr-detail-cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #B08D57;
          color: #0B1410;
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          padding: 1rem 2rem;
          text-decoration: none;
          border: 1px solid #B08D57;
          transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }
        .hr-detail-cta-primary:hover {
          background: #EDE4D3;
          border-color: #EDE4D3;
          color: #0B1410;
        }
        .hr-detail-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: #EDE4D3;
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          padding: 1rem 2rem;
          text-decoration: none;
          border: 1px solid rgba(176, 141, 87, 0.45);
          transition: border-color 0.25s ease, color 0.25s ease;
        }
        .hr-detail-cta-secondary:hover {
          border-color: #B08D57;
          color: #B08D57;
        }
        .hr-cloth-strip {
          position: relative;
          width: 100%;
          height: clamp(260px, 40svh, 420px);
          overflow: hidden;
          transition: background-color 0.8s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: clamp(5rem, 10svh, 8rem);
        }
        .hr-cloth-strip-overlay {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.12) 0px,
            rgba(0, 0, 0, 0.12) 2px,
            transparent 2px,
            transparent 8px
          );
          pointer-events: none;
        }
        .hr-related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3.5rem 2.2rem;
          width: 100%;
        }
        @media (max-width: 1000px) {
          .hr-related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem 1.8rem;
          }
        }
        @media (max-width: 640px) {
          .hr-related-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }
      `}</style>

      {/* Main Product Container */}
      <div
        ref={mainSectionRef}
        style={{
          paddingTop: '8rem',
          paddingInline: '6vw',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Giant Outlined Product Name (Behind sticky panel) */}
        <div
          ref={giantNameRef}
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(7rem, 20vw, 20rem)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(176, 141, 87, 0.16)',
            position: 'absolute',
            top: '4rem',
            left: 0,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {product.name.toUpperCase()}
        </div>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="hr-detail-intro-item"
          style={{
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Link
            href="/collection"
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(237, 228, 211, 0.55)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            Collection
          </Link>
          <span style={{ color: '#B08D57', fontSize: '0.75rem' }}>/</span>
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#EDE4D3',
            }}
          >
            {product.name}
          </span>
        </nav>

        {/* Two Column Section */}
        <div className="hr-detail-layout" style={{ position: 'relative', zIndex: 2 }}>
          {/* LEFT: Sticky Suit Panel */}
          <div ref={stickyPanelRef} className="hr-sticky-panel">
            <div
              ref={suitTiltRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d',
              }}
            >
              <SuitView
                product={product}
                colorId={selectedColorId}
                originX={origin.x}
                originY={origin.y}
              />
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '1rem',
                fontFamily: 'var(--font-sans), Jost, sans-serif',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'rgba(237, 228, 211, 0.5)',
                pointerEvents: 'none',
              }}
            >
              Choose a colour to see the cloth
            </span>
          </div>

          {/* RIGHT: Product Details & Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <span
              className="hr-detail-intro-item"
              style={{
                fontFamily: 'var(--font-sans), Jost, sans-serif',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                color: '#B08D57',
                display: 'block',
              }}
            >
              {product.category}
            </span>

            <h1
              className="hr-detail-intro-item"
              style={{
                fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
                fontSize: 'clamp(2.4rem, 4vw, 4rem)',
                color: '#EDE4D3',
                lineHeight: 1.05,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {product.name}
            </h1>

            <div
              className="hr-detail-intro-item"
              style={{
                fontFamily: 'var(--font-sans), Jost, sans-serif',
                fontSize: '1.3rem',
                color: '#EDE4D3',
                fontWeight: 400,
              }}
            >
              {formatPrice(product.price)}
            </div>

            <p
              className="hr-detail-intro-item"
              style={{
                fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
                fontStyle: 'italic',
                fontSize: '1.2rem',
                lineHeight: 1.45,
                color: 'rgba(237, 228, 211, 0.88)',
                margin: 0,
              }}
            >
              {product.tagline}
            </p>

            <p
              className="hr-detail-intro-item"
              style={{
                fontFamily: 'var(--font-sans), Jost, sans-serif',
                fontWeight: 300,
                fontSize: '0.98rem',
                lineHeight: 1.7,
                color: 'rgba(237, 228, 211, 0.7)',
                margin: 0,
                maxWidth: '38rem',
              }}
            >
              {product.description}
            </p>

            {/* Colour Picker */}
            <div className="hr-detail-intro-item" style={{ margin: '0.6rem 0' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans), Jost, sans-serif',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: '#B08D57',
                  display: 'block',
                  marginBottom: '0.6rem',
                }}
              >
                Colour
              </span>
              <ColorSwatches
                colors={product.colors}
                activeId={selectedColorId}
                onSelect={handleSelectColor}
                size={30}
                showLabel={true}
              />
            </div>

            <span
              className="hr-detail-intro-item"
              style={{
                fontFamily: 'var(--font-sans), Jost, sans-serif',
                fontSize: '0.82rem',
                color: '#B08D57',
                letterSpacing: '0.12em',
              }}
            >
              Made to measure · {product.details.leadTime}
            </span>

            {/* CTAs */}
            <div
              className="hr-detail-intro-item"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.2rem',
                margin: '0.8rem 0 1.6rem 0',
              }}
            >
              <a href="/#contact" className="hr-detail-cta-primary">
                Book a Private Fitting
              </a>
              <a href="/#contact" className="hr-detail-cta-secondary">
                Enquire
              </a>
            </div>

            {/* Specifications List */}
            <div style={{ marginTop: '1.5rem', width: '100%' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-sans), Jost, sans-serif',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  color: '#B08D57',
                  marginBottom: '1rem',
                }}
              >
                Specification
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {specRows.map((row) => (
                  <div
                    key={row.label}
                    className="hr-spec-row"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(176, 141, 87, 0.2)',
                      paddingBlock: '0.85rem',
                      gap: '1rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-sans), Jost, sans-serif',
                        fontSize: '0.72rem',
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
                        fontSize: '0.95rem',
                        color: 'rgba(237, 228, 211, 0.85)',
                        textAlign: 'right',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "The Cloth" Full-Width Band */}
      <section
        ref={clothStripRef}
        className="hr-cloth-strip"
        style={{
          backgroundColor: activeColor?.hex || '#14211B',
        }}
        aria-label="Fabric sample band"
      >
        <div className="hr-cloth-strip-overlay" />
        <div
          ref={clothContentRef}
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.35em',
              color: '#EDE4D3',
              display: 'block',
              marginBottom: '0.8rem',
              opacity: 0.8,
            }}
          >
            Selected Cloth
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(3rem, 8vw, 7.5rem)',
              color: '#EDE4D3',
              margin: 0,
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              lineHeight: 1,
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            {activeColor?.name || 'Bespoke Cloth'}
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.85rem',
              color: '#EDE4D3',
              letterSpacing: '0.2em',
              display: 'block',
              marginTop: '0.8rem',
              opacity: 0.75,
            }}
          >
            {product.details.fabric} · {product.details.weight}
          </span>
        </div>
      </section>

      {/* "You may also like" Section */}
      <section
        ref={relatedRef}
        style={{
          paddingBlock: 'clamp(5rem, 10svh, 8rem)',
          paddingInline: '6vw',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '3rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: '#B08D57',
              display: 'block',
              marginBottom: '0.6rem',
            }}
          >
            Related Garments
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(2rem, 3.2vw, 3.2rem)',
              color: '#EDE4D3',
              margin: 0,
              fontWeight: 400,
            }}
          >
            You may also like
          </h2>
        </div>

        <div className="hr-related-grid">
          {related.map((item, index) => {
            const isMiddle = index === 1;
            return (
              <div
                key={item.slug}
                className={`hr-related-card ${isMiddle ? 'hr-related-middle-card' : ''}`}
                style={{ width: '100%' }}
              >
                <ProductCard product={item} mode="page" />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
