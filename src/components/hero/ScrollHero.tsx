'use client';

import {
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SEGMENTS,
  BEATS,
  MAX_DPR,
  MAX_CANVAS_W,
  COVER_VH,
  type Beat,
} from '@/lib/config';
import { getNearestDecoded, getDecodedFrame, decodeAhead, frameCount, prioritizeClip } from '@/lib/frames';
import { useLenis } from '@/lib/lenisContext';

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────
interface BeatEl {
  el: HTMLElement;
  beat: Beat;
}

// ─── Static geometry (segment vh map, computed once) ─────────────────────────
function buildSegmentStarts(): Map<string, number> {
  const starts = new Map<string, number>();
  let cursor = 0;
  for (const seg of SEGMENTS) {
    starts.set(seg.id, cursor);
    cursor += seg.vh;
  }
  return starts;
}

/** Total vh that the animation timeline scrubs through (no cover phase) */
function totalSegmentVh(): number {
  return SEGMENTS.reduce((s, seg) => s + seg.vh, 0);
}

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Canvas draw ──────────────────────────────────────────────────────────────
function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  alpha = 1,
): void {
  const { naturalWidth: iw, naturalHeight: ih } = img;
  if (!iw || !ih) return;

  const isPortrait = ch > cw;
  let drawW: number, drawH: number, dx: number, dy: number;

  if (isPortrait) {
    drawW = cw;
    drawH = (ih / iw) * cw;
    dx    = 0;
    dy    = (ch - drawH) / 2;
  } else {
    const scale = Math.max(cw / iw, ch / ih);
    drawW = iw * scale;
    drawH = ih * scale;
    dx    = (cw - drawW) / 2;
    dy    = (ch - drawH) / 2;
  }

  ctx.globalAlpha = alpha;
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.globalAlpha = 1;
}

// ─── Stable maps (module-level, never re-created) ────────────────────────────
const SEGMENT_STARTS = buildSegmentStarts();
const TOTAL_SEG_VH   = totalSegmentVh();

// ─── Component ────────────────────────────────────────────────────────────────
interface ScrollHeroProps {
  introReady: boolean;
}

export default function ScrollHero({ introReady }: ScrollHeroProps) {
  // DOM refs
  const rootRef        = useRef<HTMLElement>(null);
  const stageRef       = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const heroTextRef    = useRef<HTMLDivElement>(null);
  const scrollCueRef   = useRef<HTMLDivElement>(null);
  const inkOverlayRef  = useRef<HTMLDivElement>(null);  // dark overlay for cover phase
  const beatElsRef     = useRef<BeatEl[]>([]);

  // Animation state – no React state, no re-renders
  const progressRef        = useRef(0);
  const displayedRef       = useRef(0);
  const lastScrollPosRef   = useRef(0);
  const scrollDirectionRef = useRef(1); // 1 = forward, -1 = backward
  const lastFrameRef       = useRef<{
    clipId: string;
    idx: number;
    seamAlpha: number;
    drawnImg: HTMLImageElement | null;
  }>({
    clipId: '',
    idx: -1,
    seamAlpha: -1,
    drawnImg: null,
  });
  const lastAheadRef   = useRef({ clipId: '', idx: -1 });
  const ctxRef         = useRef<CanvasRenderingContext2D | null>(null);
  const canvasSizeRef  = useRef({ w: 0, h: 0 });
  const introPlayedRef = useRef(false);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stRef          = useRef<ScrollTrigger | null>(null);

  const lenis = useLenis();

  // ─── Beat DOM updates ──────────────────────────────────────────────────────
  const updateBeats = useCallback((posVh: number) => {
    for (const { el, beat } of beatElsRef.current) {
      const segStart = SEGMENT_STARTS.get(beat.segment) ?? 0;
      const segVhVal = SEGMENTS.find((s) => s.id === beat.segment)?.vh ?? 0;

      const beatStart = segStart + beat.from * segVhVal;
      const rawEnd    = segStart + beat.to   * segVhVal;

      // Before beat starts → hidden
      if (posVh < beatStart) {
        el.style.visibility    = 'hidden';
        el.style.pointerEvents = 'none';
        continue;
      }

      // Past beat end (only non-sticky beats) → hidden
      if (!beat.sticky && posVh > rawEnd) {
        el.style.visibility    = 'hidden';
        el.style.pointerEvents = 'none';
        continue;
      }

      el.style.visibility    = 'visible';
      el.style.pointerEvents = 'auto';

      // For sticky beats clamp localT to 1 so it never shows exit state
      const beatRange = rawEnd - beatStart;
      const localT    = beatRange > 0 ? Math.min(1, (posVh - beatStart) / beatRange) : 1;
      const enterT    = Math.min(1, localT / 0.2);

      // Exit only for non-sticky beats
      const exitT = beat.sticky ? 0 : Math.max(0, (localT - 0.8) / 0.2);

      const opacity = enterT < 1 ? enterT : exitT > 0 ? 1 - exitT : 1;
      const ty      = enterT < 1 ? 40 * (1 - enterT) : exitT > 0 ? -40 * exitT : 0;
      const blur    = enterT < 1 ? 8  * (1 - enterT) : exitT > 0 ? 8  * exitT  : 0;

      el.style.opacity   = String(Math.max(0, Math.min(1, opacity)));
      el.style.transform = `translateY(${ty}px)`;
      el.style.filter    = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
    }
  }, []);

  // ─── Hero text exit ────────────────────────────────────────────────────────
  const updateHeroText = useCallback((posVh: number) => {
    const heroEl = heroTextRef.current;
    const cueEl  = scrollCueRef.current;
    if (!heroEl) return;

    const t   = Math.max(0, Math.min(1, posVh / 70));
    heroEl.style.opacity   = String(1 - t);
    heroEl.style.transform = `translateY(${-60 * t}px)`;
    heroEl.style.filter    = t > 0.01 ? `blur(${(8 * t).toFixed(2)}px)` : 'none';

    if (cueEl) {
      cueEl.style.opacity = String(1 - Math.max(0, Math.min(1, posVh / 15)));
    }
  }, []);

  // ─── Render tick ──────────────────────────────────────────────────────────
  const renderTick = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { w: cw, h: ch } = canvasSizeRef.current;
    if (!cw || !ch) return;

    const posVh = displayedRef.current;

    // Track scroll direction for decode-ahead
    const delta = posVh - lastScrollPosRef.current;
    if (Math.abs(delta) > 0.01) {
      scrollDirectionRef.current = delta > 0 ? 1 : -1;
      lastScrollPosRef.current = posVh;
    }

    // Find the active segment – clamp to last segment when past the end
    let activeSegId = SEGMENTS[0].id;
    let segStartVh  = 0;
    let segVh       = SEGMENTS[0].vh;

    for (let si = 0; si < SEGMENTS.length; si++) {
      const seg   = SEGMENTS[si];
      const start = SEGMENT_STARTS.get(seg.id) ?? 0;
      if (posVh >= start && posVh < start + seg.vh) {
        activeSegId = seg.id;
        segStartVh  = start;
        segVh       = seg.vh;
        break;
      }
      // At or past end → hold on last segment's last frame
      if (si === SEGMENTS.length - 1 && posVh >= start + seg.vh) {
        activeSegId = seg.id; // stay on last segment (clip4)
        segStartVh  = start;
        segVh       = seg.vh;
      }
    }

    const localT = segVh > 0 ? Math.max(0, Math.min(1, (posVh - segStartVh) / segVh)) : 0;

    let clipId    = 'clip1';
    let frameIdx  = 0;
    let seamAlpha = -1;

    if (activeSegId === 'seam') {
      seamAlpha = easeInOutCubic(localT);
      clipId    = 'clip2';
      frameIdx  = Math.max(0, frameCount('clip2') - 1);
    } else {
      // For the last segment (clip4) clamp to last frame at progress ≥1
      clipId   = activeSegId;
      frameIdx = Math.round(localT * Math.max(0, frameCount(activeSegId) - 1));
    }

    // Decode-ahead prioritized frames when active clip or frame changes
    if (lastAheadRef.current.clipId !== clipId || lastAheadRef.current.idx !== frameIdx) {
      lastAheadRef.current = { clipId, idx: frameIdx };
      decodeAhead(clipId, frameIdx, scrollDirectionRef.current);
      prioritizeClip(clipId);
    }

    const roundedSeamAlpha = seamAlpha >= 0 ? Math.round(seamAlpha * 100) / 100 : -1;

    const img = activeSegId === 'seam'
      ? getNearestDecoded('clip2', Math.max(0, frameCount('clip2') - 1))
      : getNearestDecoded(clipId, frameIdx);

    // Skip canvas redraw if rounded frame index, seam alpha, and image have not changed
    const last = lastFrameRef.current;
    if (
      last.clipId === clipId &&
      last.idx === frameIdx &&
      last.seamAlpha === roundedSeamAlpha &&
      last.drawnImg === img
    ) {
      updateBeats(posVh);
      updateHeroText(posVh);
      return;
    }
    lastFrameRef.current = {
      clipId,
      idx: frameIdx,
      seamAlpha: roundedSeamAlpha,
      drawnImg: img,
    };

    ctx.fillStyle = '#0B1410';
    ctx.fillRect(0, 0, cw, ch);

    if (activeSegId === 'seam') {
      if (img) drawFrame(ctx, img, cw, ch);
      const img3 = getDecodedFrame('clip3', 0) ?? getNearestDecoded('clip3', 0);
      if (img3 && img3 !== img && roundedSeamAlpha > 0) {
        drawFrame(ctx, img3, cw, ch, Math.max(0, roundedSeamAlpha));
      }
    } else {
      if (img) drawFrame(ctx, img, cw, ch);
    }

    updateBeats(posVh);
    updateHeroText(posVh);
  }, [updateBeats, updateHeroText]);

  // ─── Resize canvas ────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w   = Math.min(window.innerWidth * dpr, MAX_CANVAS_W);
    const h   = window.innerHeight * dpr;
    canvas.width  = w;
    canvas.height = h;
    canvasSizeRef.current = { w, h };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctxRef.current = ctx;
    }
    // Force full redraw next tick
    lastFrameRef.current = { clipId: '', idx: -1, seamAlpha: -1, drawnImg: null };
  }, []);

  // ─── GSAP ticker ──────────────────────────────────────────────────────────
  const setupTicker = useCallback(() => {
    function tick() {
      // Direct scroll-to-frame mapping: Lenis alone provides smoothing
      // progressRef goes 0→1 over the timeline portion (TOTAL_SEG_VH).
      // The extra COVER_VH is appended to the pin, so progress can exceed 1 slightly.
      // Clamp posVh so canvas never goes past the last frame.
      const target = Math.min(progressRef.current * (TOTAL_SEG_VH + COVER_VH), TOTAL_SEG_VH);
      displayedRef.current = target;
      renderTick();
    }

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [renderTick]);

  // ─── Intro sequence ───────────────────────────────────────────────────────
  const runIntro = useCallback(() => {
    if (introPlayedRef.current) return;
    introPlayedRef.current = true;

    const stageEl = stageRef.current;
    const heroEl  = heroTextRef.current;
    if (!stageEl || !heroEl) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Draw first frame of clip1 immediately
    const firstFrame = getNearestDecoded('clip1', 0);
    if (firstFrame && ctxRef.current) {
      const { w, h } = canvasSizeRef.current;
      ctxRef.current.fillStyle = '#0B1410';
      ctxRef.current.fillRect(0, 0, w, h);
      drawFrame(ctxRef.current, firstFrame, w, h);
    }

    // Refresh ScrollTrigger now that it's visible + after fonts settle
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });

    if (prefersReduced) {
      gsap.set(stageEl, { opacity: 1, scale: 1 });
      gsap.set(heroEl.querySelectorAll('[data-intro]'), { opacity: 1, y: 0 });
      lenis?.start();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        lenis?.start();
        // One more refresh after Lenis starts so pinSpacing is accurate
        ScrollTrigger.refresh();
      },
    });

    tl.fromTo(
      stageEl,
      { opacity: 0, scale: 1.12 },
      { opacity: 1, scale: 1, duration: 2.2, ease: 'power3.out' },
      0,
    );

    const eyebrow = heroEl.querySelector('[data-intro="eyebrow"]');
    const h1lines = heroEl.querySelectorAll('[data-intro="h1-line"]');
    const sub     = heroEl.querySelector('[data-intro="sub"]');
    const btns    = heroEl.querySelectorAll('[data-intro="btn"]');
    const cue     = scrollCueRef.current;

    tl.fromTo(eyebrow, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.0);

    h1lines.forEach((line, i) => {
      const inner = line.querySelector('[data-h1-inner]');
      tl.fromTo(inner, { y: '110%' }, { y: '0%', duration: 1.2, ease: 'power4.out' }, 1.15 + i * 0.15);
    });

    tl.fromTo(sub,  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.5);
    tl.fromTo(btns, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, 1.65);
    if (cue) tl.fromTo(cue, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.9);
  }, [lenis]);

  // ─── Effect: mount ────────────────────────────────────────────────────────
  useEffect(() => {
    const root  = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    resizeCanvas();

    // Total pinned px = animation range + cover range
    const totalScrollPx = () =>
      ((TOTAL_SEG_VH + COVER_VH) / 100) * window.innerHeight;

    const st = ScrollTrigger.create({
      trigger:             root,
      start:               'top top',
      end:                 () => `+=${totalScrollPx()}`,
      pin:                 stage,
      pinSpacing:          true,
      anticipatePin:       1,
      invalidateOnRefresh: true,
      refreshPriority:     2,
      onUpdate(self) {
        progressRef.current = self.progress;
      },
    });
    stRef.current = st;

    // ── Cover-phase parallax (runs over the last COVER_VH of the pin) ──────
    const inkEl = inkOverlayRef.current;
    if (inkEl && stage) {
      // We'll drive this via onUpdate of the same ST rather than a separate one,
      // using a plain JS calculation in the tick
      // (avoids needing a second ScrollTrigger that shares the same trigger)
    }

    // Resize: debounce, then refresh canvas + ST
    function onResize() {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        resizeCanvas();
        ScrollTrigger.refresh();
      }, 150);
    }

    window.addEventListener('resize', onResize);
    const removeTicker = setupTicker();

    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      st.kill();
      stRef.current = null;
      removeTicker();
    };
  }, [resizeCanvas, setupTicker]);

  // ─── Cover-phase parallax via a separate scrubbed ScrollTrigger ───────────
  useEffect(() => {
    const root  = rootRef.current;
    const stage = stageRef.current;
    const ink   = inkOverlayRef.current;
    if (!root || !stage || !ink) return;

    // This ST starts where the animation ends (TOTAL_SEG_VH into the pin)
    // and covers the last COVER_VH.
    const ctx = gsap.context(() => {
      const coverStart = () =>
        `+=${(TOTAL_SEG_VH / 100) * window.innerHeight}`;
      const coverEnd   = () =>
        `+=${((TOTAL_SEG_VH + COVER_VH) / 100) * window.innerHeight}`;

      const tl = gsap.timeline({ paused: true });
      tl.fromTo(stage, { y: '0svh', scale: 1 },     { y: '-8svh', scale: 1.04, ease: 'none' }, 0);
      tl.fromTo(ink,   { opacity: 0 },               { opacity: 0.65,           ease: 'none' }, 0);

      ScrollTrigger.create({
        trigger:             root,
        start:               () => coverStart(),
        end:                 () => coverEnd(),
        scrub:               true,
        invalidateOnRefresh: true,
        refreshPriority:     2,
        animation:           tl,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  // ─── Run intro after loader ───────────────────────────────────────────────
  useEffect(() => {
    if (introReady) {
      // 100ms so the loader overlay is visually gone before we draw
      setTimeout(runIntro, 100);
    }
  }, [introReady, runIntro]);

  // ─── Beat ref collector ───────────────────────────────────────────────────
  const beatRefCallback = useCallback((el: HTMLElement | null, beat: Beat) => {
    if (!el) return;
    beatElsRef.current = beatElsRef.current.filter((b) => b.beat.id !== beat.id);
    beatElsRef.current.push({ el, beat });
  }, []);

  return (
    // Outer section: no height set – GSAP pinSpacing injects a spacer div
    <section
      ref={rootRef}
      aria-label="Halden &amp; Rowe – bespoke tailors"
    >
      {/* Stage: exactly 100svh, pinned by ScrollTrigger */}
      <div
        ref={stageRef}
        className="hero-stage"
        style={{ opacity: 0 }}
      >
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          aria-hidden="true"
        />

        {/* Static film grain overlay */}
        <div className="hero-grain"    aria-hidden="true" />
        {/* Radial vignette */}
        <div className="hero-vignette" aria-hidden="true" />
        {/* Bottom scrim */}
        <div className="hero-scrim"    aria-hidden="true" />

        {/* Dark ink overlay – grows during cover phase */}
        <div
          ref={inkOverlayRef}
          className="hero-ink-overlay"
          aria-hidden="true"
          style={{ opacity: 0 }}
        />

        {/* Hero copy – bottom-center, inside the scrim area */}
        <div
          ref={heroTextRef}
          className="hero-copy"
          aria-label="Hero headline"
        >
          <p data-intro="eyebrow" className="hero-eyebrow" style={{ opacity: 0 }}>
            BESPOKE TAILORS &nbsp;·&nbsp; EST. 1927
          </p>

          <h1 className="hero-h1">
            <span className="hero-h1-line" data-intro="h1-line">
              <span data-h1-inner="" style={{ display: 'block', transform: 'translateY(110%)' }}>
                Worn Once.
              </span>
            </span>
            <span className="hero-h1-line" data-intro="h1-line">
              <span data-h1-inner="" style={{ display: 'block', transform: 'translateY(110%)' }}>
                <em>Remembered</em> Always.
              </span>
            </span>
          </h1>

          <p data-intro="sub" className="hero-sub" style={{ opacity: 0 }}>
            Hand-cut suits for the man who dresses for the moment,{' '}
            and the one after it.
          </p>

          <div className="hero-btns">
            <a href="#contact"  data-intro="btn" className="btn-solid"     style={{ opacity: 0 }}>Book a Private Fitting</a>
            <a href="#atelier"  data-intro="btn" className="btn-text-link" style={{ opacity: 0 }}>
              Explore the Atelier <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Scroll cue – pinned at bottom-center of stage */}
        {/* <div ref={scrollCueRef} className="scroll-cue" aria-hidden="true" style={{ opacity: 0 }}>
          <span className="scroll-cue-label">SCROLL</span>
          <span className="scroll-cue-line" />
        </div> */}

        {/* Beat overlays */}
        {BEATS.map((beat) => (
          <div
            key={beat.id}
            ref={(el) => beatRefCallback(el, beat)}
            className={`beat beat--${beat.side}`}
            style={{ visibility: 'hidden', opacity: 0, willChange: 'transform, opacity, filter' }}
            role="region"
            aria-label={`${beat.label ? beat.label + ': ' : ''}${beat.title}`}
          >
            {beat.label && <p className="beat-label">{beat.label}</p>}
            <h2 className="beat-title">{beat.title}</h2>
            <p className="beat-body">{beat.body}</p>
            {beat.ctas && (
              <div className="beat-ctas">
                {beat.ctas.map((cta) => (
                  <a
                    key={cta.label}
                    href={cta.href}
                    className={cta.variant === 'solid' ? 'btn-solid' : 'btn-outline'}
                  >
                    {cta.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
