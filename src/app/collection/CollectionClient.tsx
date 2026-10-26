'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product, categories, ProductCategory } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';

gsap.registerPlugin(ScrollTrigger);

interface CollectionClientProps {
  products: Product[];
}

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export default function CollectionClient({ products }: CollectionClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bigWordRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (sortOption === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // featured: preserve original array index order
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
    }
    return list;
  }, [products, activeCategory, sortOption]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Parallax on "COLLECTION" huge background text
  useEffect(() => {
    const el = containerRef.current;
    const bigWord = bigWordRef.current;
    const header = headerRef.current;
    if (!el || !bigWord || !header) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bigWord,
        { x: 0 },
        {
          x: '-12vw',
          ease: 'none',
          scrollTrigger: {
            trigger: header,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  // Scroll entrance & middle-column parallax
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 1001px)').matches;

    const ctx = gsap.context(() => {
      // Batch reveal cards
      ScrollTrigger.batch('.hr-collection-card-item', {
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
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.out',
            }
          );
        },
      });

      // Desktop alternating column parallax on column 2 (index % 3 === 1)
      if (isDesktop && !prefersReduced) {
        const col2Items = el.querySelectorAll<HTMLElement>('.hr-col-2-parallax');
        col2Items.forEach((card) => {
          gsap.fromTo(
            card,
            { y: -30 },
            {
              y: 30,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        });
      }
    }, el);

    return () => ctx.revert();
  }, [displayedProducts]);

  // Handle Category or Sort Change with fade animation
  const handleCategoryChange = (cat: string) => {
    if (cat === activeCategory || isTransitioning) return;
    setIsTransitioning(true);

    if (gridRef.current) {
      gsap.to(gridRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setActiveCategory(cat);
          setVisibleCount(6);
          requestAnimationFrame(() => {
            if (gridRef.current) {
              gsap.fromTo(
                gridRef.current,
                { opacity: 0, y: 15 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.45,
                  ease: 'power2.out',
                  onComplete: () => {
                    setIsTransitioning(false);
                    ScrollTrigger.refresh();
                  },
                }
              );
            } else {
              setIsTransitioning(false);
            }
          });
        },
      });
    } else {
      setActiveCategory(cat);
      setVisibleCount(6);
      setIsTransitioning(false);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = e.target.value as SortOption;
    if (nextSort === sortOption || isTransitioning) return;
    setIsTransitioning(true);

    if (gridRef.current) {
      gsap.to(gridRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setSortOption(nextSort);
          requestAnimationFrame(() => {
            if (gridRef.current) {
              gsap.fromTo(
                gridRef.current,
                { opacity: 0, y: 15 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.45,
                  ease: 'power2.out',
                  onComplete: () => {
                    setIsTransitioning(false);
                    ScrollTrigger.refresh();
                  },
                }
              );
            } else {
              setIsTransitioning(false);
            }
          });
        },
      });
    } else {
      setSortOption(nextSort);
      setIsTransitioning(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(filteredProducts.length, prev + 6));
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        paddingTop: '9rem',
        paddingBottom: 'clamp(5rem, 10svh, 8rem)',
        paddingInline: '6vw',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .hr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3.5rem 2.2rem;
          width: 100%;
        }
        @media (max-width: 1000px) {
          .hr-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.8rem 1.8rem;
          }
        }
        @media (max-width: 640px) {
          .hr-grid {
            grid-template-columns: 1fr;
            gap: 2.8rem;
          }
        }
        .hr-chip-btn {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 0.55rem 1.15rem;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          background: transparent;
          border: 1px solid rgba(176, 141, 87, 0.4);
          color: #EDE4D3;
          white-space: nowrap;
        }
        .hr-chip-btn:hover {
          border-color: #B08D57;
          color: #B08D57;
        }
        .hr-chip-btn--active {
          background: #B08D57;
          border-color: #B08D57;
          color: #0B1410;
          font-weight: 500;
        }
        .hr-chip-btn--active:hover {
          background: #EDE4D3;
          border-color: #EDE4D3;
          color: #0B1410;
        }
        .hr-sort-select {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          background: #14211B;
          color: #EDE4D3;
          border: 1px solid rgba(176, 141, 87, 0.4);
          padding: 0.55rem 2rem 0.55rem 1rem;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .hr-sort-select:hover, .hr-sort-select:focus-visible {
          border-color: #B08D57;
        }
        .hr-load-more-btn {
          font-family: var(--font-sans), Jost, sans-serif;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #EDE4D3;
          background: transparent;
          border: 1px solid #B08D57;
          padding: 0.95rem 2.5rem;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .hr-load-more-btn:hover {
          background: #B08D57;
          color: #0B1410;
        }
      `}</style>

      {/* Header Container */}
      <div
        ref={headerRef}
        style={{
          position: 'relative',
          marginBottom: 'clamp(3.5rem, 7svh, 5.5rem)',
          overflow: 'hidden',
          paddingBottom: '1rem',
        }}
      >
        {/* Giant Outlined Background Word */}
        <div
          ref={bigWordRef}
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(6rem, 18vw, 18rem)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(176, 141, 87, 0.18)',
            position: 'absolute',
            top: '-20%',
            left: 0,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          COLLECTION
        </div>

        {/* Content over big word */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '42rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: '#B08D57',
              display: 'block',
              marginBottom: '0.8rem',
            }}
          >
            The Collection
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(2.4rem, 5vw, 5rem)',
              color: '#EDE4D3',
              lineHeight: 1.05,
              margin: '0 0 1rem 0',
              fontWeight: 400,
            }}
          >
            Every suit, cut to you.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontWeight: 300,
              fontSize: '1.05rem',
              lineHeight: 1.65,
              color: 'rgba(237, 228, 211, 0.7)',
              margin: 0,
            }}
          >
            Twelve bespoke designs tailored from English worsted wool, Irish linen, and Italian velvet. Each silhouette cut to your individual measurements.
          </p>
        </div>
      </div>

      {/* Toolbar: Category Chips, Sort, Count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem',
          borderBottom: '1px solid rgba(176, 141, 87, 0.15)',
          paddingBottom: '1.8rem',
        }}
      >
        {/* Categories */}
        <div
          role="tablist"
          aria-label="Filter collection by category"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          {['All', ...categories].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`hr-chip-btn ${isActive ? 'hr-chip-btn--active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans), Jost, sans-serif',
              fontSize: '0.8rem',
              color: 'rgba(237, 228, 211, 0.55)',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}
          >
            {filteredProducts.length} {filteredProducts.length === 1 ? 'suit' : 'suits'}
          </span>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <label htmlFor="hr-sort-select" className="sr-only" style={{ display: 'none' }}>
              Sort by
            </label>
            <select
              id="hr-sort-select"
              className="hr-sort-select"
              value={sortOption}
              onChange={handleSortChange}
              aria-label="Sort collection"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {/* Custom dropdown arrow */}
            <span
              style={{
                position: 'absolute',
                right: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#B08D57',
                fontSize: '0.65rem',
              }}
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <div ref={gridRef} className="hr-grid">
          {displayedProducts.map((product, index) => {
            const isCol2 = index % 3 === 1;
            return (
              <div
                key={product.slug}
                className={`hr-collection-card-item ${isCol2 ? 'hr-col-2-parallax' : ''}`}
                style={{ width: '100%' }}
              >
                <ProductCard product={product} mode="page" />
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '5rem 2rem',
            textAlign: 'center',
            background: '#14211B',
            border: '1px solid rgba(176, 141, 87, 0.2)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              fontSize: '1.6rem',
              color: '#EDE4D3',
              marginBottom: '1rem',
            }}
          >
            No designs found in this category.
          </p>
          <button
            type="button"
            className="hr-chip-btn hr-chip-btn--active"
            onClick={() => handleCategoryChange('All')}
          >
            Show All Designs
          </button>
        </div>
      )}

      {/* Load More Button */}
      {displayedProducts.length < filteredProducts.length && (
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
            Showing {displayedProducts.length} of {filteredProducts.length}
          </span>
          <button
            type="button"
            className="hr-load-more-btn"
            onClick={handleLoadMore}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
