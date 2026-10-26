'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, getFeaturedProducts } from '@/data/products';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';


gsap.registerPlugin(ScrollTrigger);

export default function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  // products.ts array is already ordered: the-mayfair is at index 1
  const featuredProducts = getFeaturedProducts();

  // Dev sanity check
  if (process.env.NODE_ENV !== 'production' && featuredProducts[1]?.slug !== 'the-mayfair') {
    console.warn('[ProductsSection] Expected cards[1].slug === "the-mayfair" but got:', featuredProducts[1]?.slug);
  }

  const [visibleCount, setVisibleCount] = useState(3);
  const [modalState, setModalState] = useState<{
    product: Product | null;
    colorId?: string;
  }>({ product: null });

  // Scroll entrance with ScrollTrigger.batch
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.hr-batch-item', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 40, opacity: 0, filter: 'blur(6px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.8,
              stagger: 0.12,
              ease: 'power3.out',
            }
          );
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(6);
    requestAnimationFrame(() => {
      const newItems = sectionRef.current?.querySelectorAll('.hr-card-revealed-new');
      if (newItems && newItems.length > 0) {
        gsap.fromTo(
          newItems,
          { y: 50, opacity: 0, filter: 'blur(8px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            onComplete: () => {
              ScrollTrigger.refresh();
            },
          }
        );
      } else {
        ScrollTrigger.refresh();
      }
    });
  };

  const handleOpenModal = (product: Product, colorId: string) => {
    setModalState({ product, colorId });
  };

  const handleCloseModal = () => {
    setModalState({ product: null });
  };

  return (
    <section
      id="collection"
      ref={sectionRef}
      style={{
        position: 'relative',
        // NO zIndex here — we must not form a stacking context below the
        // fixed suit layer (zIndex 60). Children opt in individually.
        background: '#0B1410',
        paddingBlock: 'clamp(3rem, 6svh, 5rem)',
        paddingInline: '6vw',
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .hr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem 1.8rem;
          width: 100%;
        }
        @media (max-width: 1000px) {
          .hr-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem 1.4rem;
          }
        }
        @media (max-width: 640px) {
          .hr-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .hr-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: clamp(2rem, 4svh, 3.5rem);
          flex-wrap: wrap;
        }
        .hr-view-all-link {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #B08D57;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(176, 141, 87, 0.4);
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .hr-view-all-link:hover {
          color: #EDE4D3;
          border-color: #EDE4D3;
        }
        .hr-load-more-btn {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #EDE4D3;
          background: transparent;
          border: 1px solid #B08D57;
          padding: 0.95rem 2.2rem;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .hr-load-more-btn:hover {
          background: #B08D57;
          color: #0B1410;
        }
        .hr-full-col-link {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #0B1410;
          background: #B08D57;
          border: 1px solid #B08D57;
          padding: 0.95rem 2.4rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }
        .hr-full-col-link:hover {
          background: #EDE4D3;
          border-color: #EDE4D3;
          color: #0B1410;
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header — zIndex 61 so it always paints above the flying suit (zIndex 60) */}
        <div
          style={{
            position: 'relative',
            zIndex: 61,
          }}
        >
          <div className="hr-section-header">
            <div>
              <span
                className="hr-batch-item"
                style={{
                  fontFamily: 'var(--font-sans), Jost, sans-serif',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  color: '#B08D57',
                  display: 'block',
                  marginBottom: '0.7rem',
                }}
              >
                09 — The Collection
              </span>
              <h2
                className="hr-batch-item"
                style={{
                  fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
                  fontSize: 'clamp(2.2rem, 3.8vw, 3.8rem)',
                  color: '#EDE4D3',
                  lineHeight: 1.08,
                  margin: '0 0 0.8rem 0',
                  fontWeight: 400,
                }}
              >
                Cut for every occasion.
              </h2>
              <p
                className="hr-batch-item"
                style={{
                  fontFamily: 'var(--font-sans), Jost, sans-serif',
                  fontWeight: 300,
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: 'rgba(237, 228, 211, 0.65)',
                  maxWidth: '36rem',
                  margin: 0,
                }}
              >
                Every garment is drafted by hand from unique individual measurements, carrying a silhouette refined over a century.
              </p>
            </div>

            <Link href="/collection" className="hr-view-all-link hr-batch-item">
              View all <span>→</span>
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="hr-grid">
          {featuredProducts.slice(0, visibleCount).map((product, index) => {
            const isInitial = index < 3;
            const isLanding = index === 1; // centre card — the-mayfair
            return (
              <div
                key={product.slug}
                data-landing-card={product.slug}
                {...(isLanding ? { 'data-landing-target': 'true' } : {})}
                className={isInitial ? 'hr-batch-item' : 'hr-card-revealed-new'}
                style={{ width: '100%' }}
              >
                <ProductCard
                  product={product}
                  mode="modal"
                  onOpen={handleOpenModal}
                  landing={isLanding}
                />
              </div>
            );
          })}
        </div>

        {/* Load More Row */}
        <div
          style={{
            marginTop: 'clamp(3.5rem, 7svh, 5.5rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.2rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.8rem',
              color: 'rgba(237, 228, 211, 0.55)',
              letterSpacing: '0.12em',
            }}
          >
            Showing {visibleCount} of {featuredProducts.length}
          </span>

          {visibleCount < featuredProducts.length ? (
            <button
              type="button"
              className="hr-load-more-btn"
              onClick={handleLoadMore}
            >
              Load more
            </button>
          ) : (
            <Link href="/collection" className="hr-full-col-link">
              View the full collection
            </Link>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductModal
        product={modalState.product}
        initialColorId={modalState.colorId}
        onClose={handleCloseModal}
      />
    </section>
  );
}
