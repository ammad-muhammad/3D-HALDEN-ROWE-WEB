import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ACCEPTED = /\.(webp|jpg|jpeg|png)$/i;

const EXPECTED_COUNTS = {
  clip1: 240,
  clip2: 188,
  clip3: 240,
  clip4: 240,
};

/** Extracts the last integer number found in the filename */
function getLastNumber(filename) {
  const matches = filename.match(/\d+/g);
  if (!matches || matches.length === 0) return 0;
  return parseInt(matches[matches.length - 1], 10);
}

/**
 * Sorts files by the LAST number found in the filename (2 before 10, ezgif-frame-001 and frame-001 work)
 */
function sortByLastNumber(a, b) {
  const numA = getLastNumber(a);
  const numB = getLastNumber(b);
  if (numA !== numB) {
    return numA - numB;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Extracts prefix before the last number sequence in a filename (excluding extension) */
function getFilenamePrefix(filename) {
  const extIndex = filename.lastIndexOf('.');
  const base = extIndex !== -1 ? filename.slice(0, extIndex) : filename;
  const matches = [...base.matchAll(/\d+/g)];
  if (matches.length === 0) {
    return base;
  }
  const lastMatch = matches[matches.length - 1];
  return base.slice(0, lastMatch.index);
}

const clips = ['clip1', 'clip2', 'clip3', 'clip4'];
const manifestClips = [];
let total = 0;

for (const clipId of clips) {
  const clipDir = path.join(rootDir, 'public', 'frames', clipId);
  let rawFiles = [];

  if (fs.existsSync(clipDir)) {
    rawFiles = fs
      .readdirSync(clipDir)
      .filter((file) => ACCEPTED.test(file))
      .sort(sortByLastNumber);
  }

  const count = rawFiles.length;
  total += count;

  // 1. Check for mixed filename prefixes
  const prefixes = new Set(rawFiles.map(getFilenamePrefix));
  if (prefixes.size > 1) {
    console.warn(
      `[WARNING] Clip folder "${clipId}" contains mixed filename prefixes: ${Array.from(prefixes).map((p) => `"${p}"`).join(', ')}`
    );
  }

  // 2. Confirm expected counts
  const expectedCount = EXPECTED_COUNTS[clipId];
  if (expectedCount !== undefined && count !== expectedCount) {
    console.warn(
      `[WARNING] Clip "${clipId}" count is ${count}, expected ${expectedCount}`
    );
  }

  const firstFilename = rawFiles.length > 0 ? rawFiles[0] : '(none)';
  const lastFilename = rawFiles.length > 0 ? rawFiles[rawFiles.length - 1] : '(none)';

  // Print one line per clip: count, first filename, last filename
  console.log(`[manifest] ${clipId}: count: ${count}, first: ${firstFilename}, last: ${lastFilename}`);

  // Store each file URL using encodeURIComponent on the filename
  const encodedFiles = rawFiles.map((file) => encodeURIComponent(file));

  manifestClips.push({
    id: clipId,
    dir: `/frames/${clipId}`,
    count,
    files: encodedFiles,
  });
}

const manifest = { clips: manifestClips, total };

const outDir = path.join(rootDir, 'src', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, 'frames-manifest.json');
fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

console.log(`[manifest] Done – ${total} total frames → ${outFile}`);
