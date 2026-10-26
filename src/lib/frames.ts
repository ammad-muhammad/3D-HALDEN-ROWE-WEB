import manifest from '@/data/frames-manifest.json';
import { FRAME_STEP, PRELOAD_CONCURRENCY } from './config';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClipManifest {
  id: string;
  dir: string;
  count: number;
  files: string[];
}

interface FrameStore {
  files: string[];       // sampled filenames (per FRAME_STEP)
  dir: string;
  images: (HTMLImageElement | null)[];
  loaded: boolean[];
  warned: boolean;
}

export interface GlobalFrameInfo {
  clipId: string;
  index: number;
  globalIndex: number;
}

// ─── Build sampled file list ─────────────────────────────────────────────────

function buildSampledFiles(clip: ClipManifest): string[] {
  const { files } = clip;
  if (files.length === 0) return [];
  if (files.length === 1) return [files[0]];

  const sampled: string[] = [];
  for (let i = 0; i < files.length; i++) {
    // Always include first and last frame; otherwise step by FRAME_STEP
    if (i === 0 || i === files.length - 1 || i % FRAME_STEP === 0) {
      sampled.push(files[i]);
    }
  }
  return sampled;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const stores = new Map<string, FrameStore>();

function getStore(clipId: string): FrameStore {
  let store = stores.get(clipId);
  if (!store) {
    const clipManifest = (manifest.clips as ClipManifest[]).find((c) => c.id === clipId);
    const files = clipManifest ? buildSampledFiles(clipManifest) : [];
    const dir   = clipManifest?.dir ?? `/frames/${clipId}`;
    store = {
      files,
      dir,
      images: new Array(files.length).fill(null),
      loaded: new Array(files.length).fill(false),
      warned: false,
    };
    stores.set(clipId, store);
  }
  return store;
}

// ─── Global frame list across clip boundaries ────────────────────────────────

const ALL_FRAMES: GlobalFrameInfo[] = [];
const FRAME_KEY_TO_GLOBAL = new Map<string, number>();

function initAllFrames(): void {
  if (ALL_FRAMES.length > 0) return;
  let gIdx = 0;
  for (const clip of manifest.clips as ClipManifest[]) {
    const store = getStore(clip.id);
    for (let i = 0; i < store.files.length; i++) {
      ALL_FRAMES.push({
        clipId: clip.id,
        index: i,
        globalIndex: gIdx,
      });
      FRAME_KEY_TO_GLOBAL.set(`${clip.id}:${i}`, gIdx);
      gIdx++;
    }
  }
}

// Initialize on module load
initAllFrames();

// ─── Decoded Set tracking ────────────────────────────────────────────────────
// Only images that have resolved img.decode() are in decodedSet.
const decodedSet = new Set<string>();
const decodingSet = new Set<string>();

export function isDecoded(clipId: string, index: number): boolean {
  return decodedSet.has(`${clipId}:${index}`);
}

/** Fire-and-forget decode for a specific frame */
export function decodeFrame(clipId: string, index: number): void {
  const key = `${clipId}:${index}`;
  if (decodedSet.has(key) || decodingSet.has(key)) return;

  const store = getStore(clipId);
  if (index < 0 || index >= store.files.length) return;

  let img = store.images[index];
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = `${store.dir}/${store.files[index]}`;
    store.images[index] = img;
  }

  decodingSet.add(key);
  img.decode()
    .then(() => {
      decodedSet.add(key);
      store.loaded[index] = true;
    })
    .catch(() => {
      // Decode failed or aborted; ignore
    })
    .finally(() => {
      decodingSet.delete(key);
    });
}

/**
 * Decode-ahead across clip boundaries:
 * Decodes 40 frames in scroll direction and 10 in opposite direction.
 */
export function decodeAhead(clipId: string, clipIndex: number, direction: number): void {
  initAllFrames();
  const key = `${clipId}:${clipIndex}`;
  const currentGlobal = FRAME_KEY_TO_GLOBAL.get(key);
  if (currentGlobal === undefined) return;

  // Ensure current frame is decoded or decoding
  decodeFrame(clipId, clipIndex);

  const total = ALL_FRAMES.length;
  if (total === 0) return;

  // Next 40 frames in scroll direction, 10 in opposite
  const forwardCount  = direction >= 0 ? 40 : 10;
  const backwardCount = direction >= 0 ? 10 : 40;

  // Ahead (higher global indices)
  const forwardStart = currentGlobal + 1;
  const forwardEnd   = Math.min(total - 1, currentGlobal + forwardCount);
  for (let g = forwardStart; g <= forwardEnd; g++) {
    const f = ALL_FRAMES[g];
    decodeFrame(f.clipId, f.index);
  }

  // Behind (lower global indices)
  const backwardStart = Math.max(0, currentGlobal - backwardCount);
  const backwardEnd   = currentGlobal - 1;
  for (let g = backwardEnd; g >= backwardStart; g--) {
    const f = ALL_FRAMES[g];
    decodeFrame(f.clipId, f.index);
  }
}

// ─── Preloading ───────────────────────────────────────────────────────────────

let clip1ProgressCallback: ((pct: number) => void) | null = null;

export function onClip1Progress(cb: (pct: number) => void) {
  clip1ProgressCallback = cb;
}

async function loadOne(store: FrameStore, index: number, clipId: string): Promise<void> {
  const key = `${clipId}:${index}`;
  if (decodedSet.has(key)) return;

  const filename = store.files[index];
  const src      = `${store.dir}/${filename}`;
  let img        = store.images[index];
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = src;
    store.images[index] = img;
  }

  decodingSet.add(key);
  try {
    await img.decode();
    decodedSet.add(key);
    store.loaded[index] = true;
  } catch {
    // Image failed to decode
    return;
  } finally {
    decodingSet.delete(key);
  }
}

async function loadClipConcurrent(
  clipId: string,
  concurrency: number,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const store = getStore(clipId);
  if (store.files.length === 0) {
    if (!store.warned) {
      console.warn(`[frames] ${clipId} has no frames – canvas will show ink fill.`);
      store.warned = true;
    }
    return;
  }

  let next = 0;
  let done = 0;
  const total = store.files.length;

  async function worker(): Promise<void> {
    while (next < total) {
      const idx = next++;
      await loadOne(store, idx, clipId);
      done++;
      onProgress?.(done, total);
    }
  }

  const workers: Promise<void>[] = [];
  for (let w = 0; w < Math.min(concurrency, total); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

/** Preload clip1 first (loader waits for it), then clip2-4 in background. */
export function preloadAll(): void {
  // Clip 1 – notify loader on each frame loaded
  loadClipConcurrent('clip1', PRELOAD_CONCURRENCY, (done, total) => {
    clip1ProgressCallback?.(done / total);
  }).then(() => {
    clip1ProgressCallback?.(1);
    // Reset so next mount (hard refresh / Strict Mode) gets a clean registration
    clip1ProgressCallback = null;
    // Continue with remaining clips sequentially
    return loadClipConcurrent('clip2', PRELOAD_CONCURRENCY);
  }).then(() => loadClipConcurrent('clip3', PRELOAD_CONCURRENCY))
    .then(() => loadClipConcurrent('clip4', PRELOAD_CONCURRENCY))
    .catch(() => { /* silent – individual failures already handled */ });
}

// ─── Public accessors ─────────────────────────────────────────────────────────

/** Total sampled frame count for a clip. */
export function frameCount(clipId: string): number {
  return getStore(clipId).files.length;
}

/** Return the decoded image at sampled index i, or null if not yet finished decode. */
export function getFrame(clipId: string, i: number): HTMLImageElement | null {
  const key = `${clipId}:${i}`;
  if (!decodedSet.has(key)) return null;
  const store = getStore(clipId);
  if (i < 0 || i >= store.images.length) return null;
  return store.images[i];
}

export const getDecodedFrame = getFrame;

/**
 * Return the closest already-decoded frame at or before index i.
 * Searches across clip boundaries so it never blanks or blocks.
 * Never returns an image that has not finished decode.
 */
export function getNearestLoaded(clipId: string, i: number): HTMLImageElement | null {
  return getNearestDecoded(clipId, i);
}

/**
 * Return the exact frame if decoded, or closest already-decoded frame across clip boundaries.
 * Guaranteed never to return an image that has not finished decode.
 */
export function getNearestDecoded(clipId: string, i: number): HTMLImageElement | null {
  initAllFrames();

  // 1. Exact match if already decoded
  const exact = getFrame(clipId, i);
  if (exact) return exact;

  const key = `${clipId}:${i}`;
  let gIdx = FRAME_KEY_TO_GLOBAL.get(key);
  if (gIdx === undefined) {
    gIdx = 0;
  }

  const total = ALL_FRAMES.length;
  // 2. Search backward across all clips first
  for (let g = gIdx - 1; g >= 0; g--) {
    const f = ALL_FRAMES[g];
    const img = getFrame(f.clipId, f.index);
    if (img) return img;
  }

  // 3. Search forward across all clips
  for (let g = gIdx + 1; g < total; g++) {
    const f = ALL_FRAMES[g];
    const img = getFrame(f.clipId, f.index);
    if (img) return img;
  }

  return null;
}

/** Sampled frame count per clip (for reporting). */
export function getSampledCounts(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const clip of manifest.clips as ClipManifest[]) {
    result[clip.id] = buildSampledFiles(clip).length;
  }
  return result;
}
