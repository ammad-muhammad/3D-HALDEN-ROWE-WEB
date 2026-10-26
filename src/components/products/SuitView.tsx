'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import { gsap } from 'gsap';
import { Product, imageSrc, COLOR_HEX } from '@/data/products';

// ─── Module-Level Cache ───────────────────────────────────────────────────────
const imageCache = new Map<string, boolean>();

export function checkImageExists(src: string): Promise<boolean> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const img = new Image();
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        imageCache.set(src, false);
        resolve(false);
      }
    }, 800);

    img.onload = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        imageCache.set(src, true);
        resolve(true);
      }
    };
    img.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        imageCache.set(src, false);
        resolve(false);
      }
    };
    img.src = src;
  });
}

// (SVG placeholder removed — blank shown when no product image available)

// ─── SuitView Component ───────────────────────────────────────────────────────
export interface SuitViewProps {
  product: Product;
  colorId: string;
  originX?: number; // percent 0..100, default 50
  originY?: number; // percent 0..100, default 62
  instant?: boolean; // if true, skip the initial fade-in animation
}

interface LayerState {
  colorId: string;
  src: string;
  hasImage: boolean;
  hex: string;
  name: string;
}

export default function SuitView({
  product,
  colorId,
  originX = 50,
  originY = 62,
  instant = false,
}: SuitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerARef = useRef<HTMLDivElement>(null);
  const layerBRef = useRef<HTMLDivElement>(null);
  const innerARef = useRef<HTMLDivElement>(null);
  const innerBRef = useRef<HTMLDivElement>(null);
  const initialRenderRef = useRef(true);
  const activeSlotRef = useRef<'A' | 'B'>('A');
  const runningTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  const getColorMeta = (cid: string) => {
    const found = product.colors.find((c) => c.id === cid);
    const hex = found?.hex || COLOR_HEX[cid]?.hex || '#2B2D2F';
    const name = found?.name || COLOR_HEX[cid]?.name || cid;
    const src = imageSrc(product, cid);
    return { colorId: cid, src, hex, name };
  };

  const initialMeta = getColorMeta(colorId);
  const [slotA, setSlotA] = useState<LayerState>({
    ...initialMeta,
    hasImage: false,
  });
  const [slotB, setSlotB] = useState<LayerState | null>(null);

  // Check image on initial mount
  useEffect(() => {
    let cancelled = false;
    checkImageExists(initialMeta.src).then((exists) => {
      if (!cancelled) {
        setSlotA((prev) => ({ ...prev, hasImage: exists }));
        if (layerARef.current && innerARef.current) {
          if (instant) {
            gsap.set(innerARef.current, { opacity: 1, scale: 1 });
          } else {
            gsap.fromTo(
              innerARef.current,
              { opacity: 0, scale: 0.96 },
              { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
            );
          }
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle colorId change
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    const currentSlot = activeSlotRef.current;
    const currentActiveState = currentSlot === 'A' ? slotA : slotB;
    if (currentActiveState && currentActiveState.colorId === colorId) {
      return;
    }

    const nextMeta = getColorMeta(colorId);
    let cancelled = false;

    checkImageExists(nextMeta.src).then((hasImage) => {
      if (cancelled) return;

      const nextState: LayerState = { ...nextMeta, hasImage };
      const nextSlot: 'A' | 'B' = currentSlot === 'A' ? 'B' : 'A';

      if (nextSlot === 'A') {
        setSlotA(nextState);
      } else {
        setSlotB(nextState);
      }

      // Schedule GSAP animation once state updates
      requestAnimationFrame(() => {
        if (cancelled) return;

        const incomingLayer = nextSlot === 'A' ? layerARef.current : layerBRef.current;
        const incomingInner = nextSlot === 'A' ? innerARef.current : innerBRef.current;
        const outgoingLayer = currentSlot === 'A' ? layerARef.current : layerBRef.current;

        if (!incomingLayer || !incomingInner) return;

        // Kill any in-flight tweens and snap
        if (runningTweenRef.current) {
          runningTweenRef.current.kill();
          runningTweenRef.current = null;
        }

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Layer stacking
        incomingLayer.style.zIndex = '2';
        if (outgoingLayer) outgoingLayer.style.zIndex = '1';

        if (prefersReduced) {
          const tl = gsap.timeline({
            onComplete: () => {
              activeSlotRef.current = nextSlot;
              if (outgoingLayer) {
                outgoingLayer.style.opacity = '0';
                outgoingLayer.style.clipPath = 'none';
              }
            },
          });
          tl.set(incomingLayer, { opacity: 0, clipPath: 'none' })
            .to(incomingLayer, { opacity: 1, duration: 0.25, ease: 'linear' })
            .to(outgoingLayer, { opacity: 0, duration: 0.25, ease: 'linear' }, 0);
          runningTweenRef.current = tl;
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            activeSlotRef.current = nextSlot;
            if (outgoingLayer) {
              outgoingLayer.style.opacity = '0';
              outgoingLayer.style.clipPath = 'none';
            }
            incomingLayer.style.clipPath = 'none';
          },
        });

        // Clip-path circle reveal + inner scale settle
        tl.fromTo(
          incomingLayer,
          {
            clipPath: `circle(0% at ${originX}% ${originY}%)`,
            opacity: 1,
          },
          {
            clipPath: `circle(150% at ${originX}% ${originY}%)`,
            duration: 0.85,
            ease: 'power3.inOut',
          },
          0
        );

        tl.fromTo(
          incomingInner,
          { scale: 1.06 },
          { scale: 1, duration: 1.0, ease: 'power2.out' },
          0
        );

        runningTweenRef.current = tl;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [colorId, originX, originY]);

  // Clean up tweens on unmount
  useEffect(() => {
    return () => {
      if (runningTweenRef.current) {
        runningTweenRef.current.kill();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Layer A */}
      <div
        ref={layerARef}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          ref={innerARef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: `${originX}% ${originY}%`,
          }}
        >
          {slotA.hasImage && (
            <img
              src={slotA.src}
              alt=""
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45))',
                display: 'block',
              }}
            />
          )}
        </div>
      </div>

      {/* Layer B */}
      {slotB && (
        <div
          ref={layerBRef}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            ref={innerBRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformOrigin: `${originX}% ${originY}%`,
            }}
          >
            {slotB.hasImage && (
              <img
                src={slotB.src}
                alt=""
                style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45))',
                  display: 'block',
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
