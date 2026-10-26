'use client';

import React, { useRef } from 'react';
import { ProductColor } from '@/data/products';

export interface ColorSwatchesProps {
  colors: ProductColor[];
  activeId: string;
  onSelect(colorId: string, rect: DOMRect): void;
  size?: number;
  showLabel?: boolean;
}

export function originFromRect(
  swatchRect: DOMRect,
  containerEl: HTMLElement | null
): { x: number; y: number } {
  if (!containerEl) return { x: 50, y: 62 };
  const cRect = containerEl.getBoundingClientRect();
  if (cRect.width === 0 || cRect.height === 0) return { x: 50, y: 62 };
  const cx = swatchRect.left + swatchRect.width / 2;
  const cy = swatchRect.top + swatchRect.height / 2;
  const x = ((cx - cRect.left) / cRect.width) * 100;
  const y = ((cy - cRect.top) / cRect.height) * 100;
  return {
    x: Math.max(0, Math.min(100, Math.round(x))),
    y: Math.max(0, Math.min(100, Math.round(y))),
  };
}

export default function ColorSwatches({
  colors,
  activeId,
  onSelect,
  size = 22,
  showLabel = false,
}: ColorSwatchesProps) {
  const activeColor = colors.find((c) => c.id === activeId) || colors[0];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (colors.length < 2) return;
    let targetIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = (index + 1) % colors.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = (index - 1 + colors.length) % colors.length;
    }
    if (targetIndex >= 0) {
      e.preventDefault();
      const targetColor = colors[targetIndex];
      const targetBtn = (e.currentTarget.parentElement?.children[targetIndex] as HTMLElement);
      if (targetBtn) {
        targetBtn.focus();
        onSelect(targetColor.id, targetBtn.getBoundingClientRect());
      }
    }
  };

  if (colors.length < 2) {
    if (showLabel) {
      return (
        <span
          style={{
            fontFamily: 'var(--font-sans), Jost, sans-serif',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'rgba(237,228,211,0.65)',
            display: 'inline-block',
          }}
        >
          Single colourway
        </span>
      );
    }
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <style>{`
        .hr-swatch-btn {
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          position: relative;
        }
        .hr-swatch-btn:hover {
          transform: scale(1.14);
        }
        .hr-swatch-btn:focus-visible {
          outline: 2px solid #B08D57;
          outline-offset: 3px;
        }
        .hr-swatch-label-anim {
          animation: hrSwatchFade 0.25s ease-out;
        }
        @keyframes hrSwatchFade {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {showLabel && activeColor && (
        <span
          key={activeColor.id}
          className="hr-swatch-label-anim"
          style={{
            fontFamily: 'var(--font-sans), Jost, sans-serif',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: '#EDE4D3',
            display: 'inline-block',
          }}
        >
          {activeColor.name}
        </span>
      )}

      <div
        role="radiogroup"
        aria-label="Select suit colorway"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${Math.max(6, size * 0.4)}px`,
          padding: '4px 0',
        }}
      >
        {colors.map((color, i) => {
          const isActive = color.id === activeId;
          return (
            <button
              key={color.id}
              role="radio"
              aria-checked={isActive}
              aria-label={color.name}
              className="hr-swatch-btn"
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(color.id, e.currentTarget.getBoundingClientRect());
              }}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: color.hex,
                border: '1px solid rgba(237,228,211,0.25)',
                boxShadow: isActive
                  ? '0 0 0 3px #0B1410, 0 0 0 4px #B08D57'
                  : 'none',
                padding: 0,
                outline: 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
