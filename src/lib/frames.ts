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
const decodedSet = new Set<string>();
const decodingMap = new Map<string, Promise<boolean>>();
const failedCooldown = new Map<string, number>();

export function isDecoded(clipId: string, index: number): boolean {
  return decodedSet.has(`${clipId}:${index}`);
}

/** Asynchronously decode a specific frame with deduping & cooldown */
export function decodeFrame(clipId: string, index: number): Promise<boolean> {
  const key = `${clipId}:${index}`;
  if (decodedSet.has(key)) return Promise.resolve(true);

  const existing = decodingMap.get(key);
  if (existing) return existing;

  const now = Date.now();
  const failedAt = failedCooldown.get(key);
  if (failedAt && now - failedAt < 2000) {
    return Promise.resolve(false);
  }

  const store = getStore(clipId);
  if (index < 0 || index >= store.files.length) return Promise.resolve(false);

  let img = store.images[index];
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = `${store.dir}/${store.files[index]}`;
    store.images[index] = img;
  }

  const promise = img.decode()
    .then(() => {
      decodedSet.add(key);
      store.loaded[index] = true;
      decodingMap.delete(key);
      failedCooldown.delete(key);
      return true;
    })
    .catch(() => {
      decodingMap.delete(key);
      failedCooldown.set(key, Date.now());
      return false;
    });

  decodingMap.set(key, promise);
  return promise;
}

let activePriorityClip = 'clip1';
export function prioritizeClip(clipId: string) {
  activePriorityClip = clipId;
}

/**
 * Decode-ahead across clip boundaries prioritized by distance:
 * Immediate closest frames load first!
 */
export function decodeAhead(clipId: string, clipIndex: number, direction: number): void {
  initAllFrames();
  const key = `${clipId}:${clipIndex}`;
  const currentGlobal = FRAME_KEY_TO_GLOBAL.get(key);
  if (currentGlobal === undefined) return;

  // Ensure current frame is decoded
  decodeFrame(clipId, clipIndex);

  const total = ALL_FRAMES.length;
  if (total === 0) return;

  const forwardCount  = direction >= 0 ? 16 : 6;
  const backwardCount = direction >= 0 ? 5 : 12;

  // Interleave closest frames first (+1, +2, -1, +3, +4, -2, etc.)
  const maxDelta = Math.max(forwardCount, backwardCount);
  for (let d = 1; d <= maxDelta; d++) {
    // Forward
    if (d <= forwardCount) {
      const g = currentGlobal + d;
      if (g < total) {
        const f = ALL_FRAMES[g];
        decodeFrame(f.clipId, f.index);
      }
    }
    // Backward
    if (d <= backwardCount) {
      const g = currentGlobal - d;
      if (g >= 0) {
        const f = ALL_FRAMES[g];
        decodeFrame(f.clipId, f.index);
      }
    }
  }
}

// ─── Preloading ───────────────────────────────────────────────────────────────

let clip1ProgressCallback: ((pct: number) => void) | null = null;

export function onClip1Progress(cb: (pct: number) => void) {
  clip1ProgressCallback = cb;
}

/**
 * Concurrent loader with concurrency limit.
 */
async function loadIndicesConcurrent(
  clipId: string,
  indices: number[],
  concurrency: number,
  onItemDone?: () => void,
): Promise<void> {
  const store = getStore(clipId);
  if (store.files.length === 0 || indices.length === 0) return;

  let next = 0;
  async function worker(): Promise<void> {
    while (next < indices.length) {
      const idx = indices[next++];
      await decodeFrame(clipId, idx);
      onItemDone?.();
    }
  }

  const workers: Promise<void>[] = [];
  const limit = Math.min(concurrency, indices.length);
  for (let w = 0; w < limit; w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

/**
 * Multi-tier intelligent preloader:
 * Tier 1: Initial clip1 chunk for fast loader completion.
 * Tier 2: Keyframe pass across ALL 4 clips (every 4th frame) so all sections have instant frames!
 * Tier 3: Fill in remaining frames, prioritizing active clip.
 */
export function preloadAll(): void {
  const clips = ['clip1', 'clip2', 'clip3', 'clip4'];

  // Tier 1: First 25 frames of clip1 for the loader bar
  const clip1Store = getStore('clip1');
  const initialCount = Math.min(25, clip1Store.files.length);
  const initialIndices = Array.from({ length: initialCount }, (_, i) => i);
  let loadedInitial = 0;

  loadIndicesConcurrent('clip1', initialIndices, PRELOAD_CONCURRENCY, () => {
    loadedInitial++;
    clip1ProgressCallback?.(loadedInitial / initialCount);
  }).then(async () => {
    clip1ProgressCallback?.(1);
    clip1ProgressCallback = null;

    // Tier 2: Keyframe pass across all clips (step of 4)
    // Ensures NO clip ever displays blank or old clip fallback!
    for (const cId of clips) {
      const store = getStore(cId);
      const keyframeIndices: number[] = [];
      for (let i = 0; i < store.files.length; i += 4) {
        if (!decodedSet.has(`${cId}:${i}`)) {
          keyframeIndices.push(i);
        }
      }
      // Always include last frame of each clip
      const last = store.files.length - 1;
      if (last >= 0 && !keyframeIndices.includes(last)) {
        keyframeIndices.push(last);
      }

      await loadIndicesConcurrent(cId, keyframeIndices, 6);
    }

    // Tier 3: Fill in remaining frames progressively
    for (const cId of clips) {
      const targetClip = activePriorityClip && activePriorityClip.startsWith('clip') ? activePriorityClip : cId;
      const store = getStore(targetClip);
      const remaining: number[] = [];
      for (let i = 0; i < store.files.length; i++) {
        if (!decodedSet.has(`${targetClip}:${i}`)) {
          remaining.push(i);
        }
      }
      await loadIndicesConcurrent(targetClip, remaining, 4);
    }
  }).catch(() => {
    /* silent */
  });
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
