/**
 * All tunable values for the Halden & Rowe scroll-driven hero.
 * Change values here; components read from this file at build time.
 */

// ─── Layer / curtain transition ────────────────────────────────────────────
/** Extra svh the hero pin is extended for the cover/curtain phase. */
export const COVER_VH = 100;

// ─── Details stage segments (vh each) ─────────────────────────────────────
export const DETAILS_SEGMENTS = {
  enterA:  120,
  holdA:   100,
} as const;

// ─── Suit image paths ──────────────────────────────────────────────────────
export const SUIT_IMAGES = {
  a: '/images/final-suit.png',
  b: '/images/final-suit.png',
} as const;

// ─── Frame sampling ────────────────────────────────────────────────────────
/** Use every Nth source frame. First and last frame of each clip are ALWAYS included. */
export const FRAME_STEP = 2;

// ─── Timeline segments ─────────────────────────────────────────────────────
export type SegmentId = 'clip1' | 'clip2' | 'seam' | 'clip3' | 'clip4' | 'hold';

export interface Segment {
  id: SegmentId;
  /** Scroll length in vh */
  vh: number;
}

export const SEGMENTS: Segment[] = [
  { id: 'clip1', vh: 200 },
  { id: 'clip2', vh: 170 },
  { id: 'seam',  vh: 20  },
  { id: 'clip3', vh: 260 },
  { id: 'clip4', vh: 230 },
];

/** Extra breathing room appended after all segments (legacy, kept for reference) */
export const SECTION_EXTRA_VH = 0;

// ─── Text beats ─────────────────────────────────────────────────────────────
export interface BeatCta {
  label: string;
  variant: 'solid' | 'outline';
  href: string;
}

export interface Beat {
  id: string;
  /** Which clip segment the beat lives in */
  segment: 'clip1' | 'clip2' | 'clip3' | 'clip4';
  /** If true, this beat never exits once entered */
  sticky?: boolean;
  /** 0..1 fraction inside that segment where the beat starts */
  from: number;
  /** 0..1 fraction inside that segment where the beat ends */
  to: number;
  side: 'left' | 'right' | 'center';
  label: string;
  title: string;
  body: string;
  ctas?: BeatCta[];
}

export const BEATS: Beat[] = [
  {
    id: 'beat-1',
    segment: 'clip1',
    from: 0.45,
    to: 0.92,
    side: 'left',
    label: '01 — The Door',
    title: 'One door. Since 1927.',
    body: 'Step inside the atelier, where every suit begins as a conversation.',
  },
  {
    id: 'beat-2',
    segment: 'clip2',
    from: 0.30,
    to: 0.95,
    side: 'right',
    label: '02 — The Foundation',
    title: 'Pure cotton, cut to you.',
    body: 'Every garment starts with a shirt measured to the line of your shoulder.',
  },
  {
    id: 'beat-3',
    segment: 'clip3',
    from: 0.08,
    to: 0.50,
    side: 'left',
    label: '03 — The Layers',
    title: 'Layer by layer.',
    body: 'Waistcoat, silk and a jacket built on canvas, fitted entirely by hand.',
  },
  {
    id: 'beat-4',
    segment: 'clip3',
    from: 0.58,
    to: 0.96,
    side: 'right',
    label: '04 — The Craft',
    title: 'Nothing off the rack.',
    body: 'Eighty hours of hand stitching. One suit, made for one man.',
  },
  {
    id: 'beat-5',
    segment: 'clip4',
    from: 0.04,
    to: 0.46,
    side: 'left',
    label: '05 — The Silhouette',
    title: 'Worn once. Remembered always.',
    body: 'The cut that walks into a room before you do.',
  },
  {
    id: 'beat-6',
    segment: 'clip4',
    from: 0.52,
    to: 2,          // intentionally > 1 so it never exits within the segment
    side: 'center',
    label: '',
    title: 'Your suit is waiting.',
    body: 'Private fittings by appointment, in the atelier.',
    sticky: true,   // never exit once entered
    ctas: [
      { label: 'Book a Private Fitting', variant: 'solid',   href: '#contact' },
      { label: 'View the Collection',    variant: 'outline', href: '#collections' },
    ],
  },
];

// ─── Lenis options ──────────────────────────────────────────────────────────
export const LENIS_OPTIONS = {
  lerp:            0.14,
  smoothWheel:     true,
  wheelMultiplier: 1.1,
  syncTouch:       false,
} as const;

// ─── Rendering ──────────────────────────────────────────────────────────────
/** Per-tick display smoothing factor (lerp toward target). Applied as delta-time corrected. */
export const DISPLAY_LERP  = 0.16;
export const MAX_DPR       = 1.5;
export const MAX_CANVAS_W  = 2560;

// ─── Loader ─────────────────────────────────────────────────────────────────
export const LOADER_MIN_MS = 1600;

// ─── Preloader concurrency ───────────────────────────────────────────────────
export const PRELOAD_CONCURRENCY = 6;
