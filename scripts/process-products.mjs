import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assignments = [
  // 1. the-mayfair (single-breasted three-piece, peak lapels, waistcoat with watch chain, green tie)
  { file: 'Charcoal_three-piece_suit_on_man…_20261024222611.jpg', slug: 'the-mayfair', colorId: 'charcoal' },
  { file: 'Change_suit_cloth_color_20261024222611.jpg', slug: 'the-mayfair', colorId: 'navy' },
  { file: 'Changing_suit_cloth_color_20261024222611.jpg', slug: 'the-mayfair', colorId: 'forest' },
  { file: 'Changing_suit_cloth_color_20261024222611_2.jpg', slug: 'the-mayfair', colorId: 'camel' },

  // 2. the-savile (double-breasted six-button two-piece, peak lapels, pinstripe)
  { file: 'Navy_double_breasted_suit_jacket_20261024222611.jpg', slug: 'the-savile', colorId: 'navy' },
  { file: 'Change_suit_color_to_charcoal_20261024222611.jpg', slug: 'the-savile', colorId: 'charcoal' },
  { file: 'Changing_suit_cloth_color_20261024222611_3.jpg', slug: 'the-savile', colorId: 'oxblood' },
  { file: 'Change_suit_cloth_colour_20261024222611.jpg', slug: 'the-savile', colorId: 'slate' },

  // 3. the-belgravia (single-breasted dinner suit, satin shawl lapel, one button, bow tie)
  { file: 'Black_dinner_suit_on_mannequin_20261024222611.jpg', slug: 'the-belgravia', colorId: 'black' },
  { file: 'Change_suit_cloth_color_20261024222611_2.jpg', slug: 'the-belgravia', colorId: 'midnight' },
  { file: 'Change_suit_cloth_color_20261024222611_3.jpg', slug: 'the-belgravia', colorId: 'charcoal' },
  { file: 'Changing_suit_cloth_color_20261024222611_4.jpg', slug: 'the-belgravia', colorId: 'oxblood' },

  // 4. the-kensington (single-breasted two-button two-piece, notch lapels, windowpane check)
  { file: 'Grey_wool_suit_menswear_photograph_20261024222611.jpg', slug: 'the-kensington', colorId: 'grey' },
  { file: 'Changing_suit_cloth_color_to_20261024222611.jpg', slug: 'the-kensington', colorId: 'navy' },
  { file: 'Change_suit_cloth_color_to_20261024222611.jpg', slug: 'the-kensington', colorId: 'olive' },
  { file: 'Change_suit_cloth_color_20261024222611_4.jpg', slug: 'the-kensington', colorId: 'tan' },

  // 5. the-piccadilly (three-piece herringbone tweed, notch lapels)
  { file: 'Tweed_three-piece_suit_menswear_…_20261024222611.jpg', slug: 'the-piccadilly', colorId: 'brown' },
  { file: 'Changing_suit_color_to_charcoal_20261024222611.jpg', slug: 'the-piccadilly', colorId: 'charcoal' },
  { file: 'Change_suit_cloth_color_20261024222611_5.jpg', slug: 'the-piccadilly', colorId: 'olive' },
  { file: 'Changing_suit_cloth_color_20261024222611_5.jpg', slug: 'the-piccadilly', colorId: 'grey' },

  // 6. the-marylebone (unstructured linen suit, patch pockets, open collar, no tie)
  { file: 'Linen_suit_on_mannequin_20261024222611.jpg', slug: 'the-marylebone', colorId: 'stone' },
  { file: 'Change_suit_cloth_color_20261024222611_6.jpg', slug: 'the-marylebone', colorId: 'sand' },
  { file: 'Recolor_suit_to_sage_20261024222611.jpg', slug: 'the-marylebone', colorId: 'sage' },

  // 7. the-holborn (three-piece, notch lapels, chalk stripe)
  { file: 'Charcoal_three-piece_suit_on_man…_20261024222611_2.jpg', slug: 'the-holborn', colorId: 'charcoal' },
  { file: 'Change_suit_cloth_color_20261024222611_7.jpg', slug: 'the-holborn', colorId: 'navy' },
  { file: 'Change_suit_color_to_olive_20261024222611.jpg', slug: 'the-holborn', colorId: 'olive' },

  // 8. the-chelsea (double-breasted four-button two-piece, plain cloth)
  { file: 'Navy_suit_on_mannequin_20261024222611.jpg', slug: 'the-chelsea', colorId: 'navy' },
  { file: 'Change_suit_cloth_colour_black_20261024222611.jpg', slug: 'the-chelsea', colorId: 'black' },

  // 9. the-soho (slim two-piece, patch pockets, knit under jacket)
  { file: 'Olive_wool_suit_jacket_displayed_20261024222611.jpg', slug: 'the-soho', colorId: 'olive' },

  // 10. the-regent (velvet dinner jacket, peak lapels, bow tie)
  { file: 'Velvet_dinner_jacket_on_mannequin_20261024222611.jpg', slug: 'the-regent', colorId: 'forest' },
  { file: 'Changing_suit_color_to_oxblood_20261024222611.jpg', slug: 'the-regent', colorId: 'oxblood' },
  { file: 'Changing_suit_cloth_color_20261024222611_6.jpg', slug: 'the-regent', colorId: 'midnight' },
  { file: 'Change_suit_cloth_color_20261024222611_8.jpg', slug: 'the-regent', colorId: 'black' },

  // 11. the-hampstead (cotton-linen two-piece, light, open collar)
  { file: 'Bespoke_cotton-linen_suit_jacket_20261024222611.jpg', slug: 'the-hampstead', colorId: 'stone' },
  { file: 'Change_suit_color_to_sand_20261024222611.jpg', slug: 'the-hampstead', colorId: 'sand' },
  { file: 'Change_suit_color_to_sage_20261024222611.jpg', slug: 'the-hampstead', colorId: 'sage' },
  { file: 'Change_suit_color_to_mist_20261024222611.jpg', slug: 'the-hampstead', colorId: 'mist' },

  // 12. the-strand (three-piece, peak lapels, contrast buttons)
  { file: 'Three-piece_suit_on_mannequin_20261024222611.jpg', slug: 'the-strand', colorId: 'forest' },
  { file: 'Changing_suit_cloth_color_20261024222611_8.jpg', slug: 'the-strand', colorId: 'navy' },
  { file: 'Changing_suit_cloth_color_20261024222611_7.jpg', slug: 'the-strand', colorId: 'tan' },
  { file: 'Change_suit_cloth_color_20261024222611_9.jpg', slug: 'the-strand', colorId: 'charcoal' }
];

const unusedFiles = [
  'Change_suit_color_to_taupe_20261024222611.jpg',
  'Bespoke_dinner_suit_on_mannequin_20261024222611.jpg',
  'Bespoke_dinner_suit_on_mannequin_20261024222611_2.jpg',
  'Bespoke_linen_suit_on_mannequin_20261024222611.jpg',
  'Bespoke_linen_suit_on_mannequin_20261024222611_2.jpg',
  'Bespoke_suit_on_mannequin_20261024222611.jpg',
  'Brown_tweed_suit_on_mannequin_20261024222611.jpg',
  'Charcoal_suit_on_invisible_manne…_20261024222611.jpg',
  'Charcoal_three-piece_suit_displayed_20261024222611.jpg',
  'Double-breasted_suit_on_invisibl…_20261024222611.jpg',
  'Double-breasted_suit_on_mannequin_20261024222611.jpg',
  'Suit_jacket_on_mannequin_20261024222611.jpg'
];

async function processImage(srcPath, outPath) {
  const img = sharp(srcPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Flood fill from outer 4 borders
  const bg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h * 2);
  let qHead = 0, qTail = 0;
  function push(x, y) {
    queue[qTail++] = x; queue[qTail++] = y; bg[y * w + x] = 1;
  }
  const thresh = 236;
  for (let x = 0; x < w; x++) {
    const iT = x * 3, iB = ((h - 1) * w + x) * 3;
    if (data[iT] > thresh && data[iT+1] > thresh && data[iT+2] > thresh) push(x, 0);
    if (data[iB] > thresh && data[iB+1] > thresh && data[iB+2] > thresh) push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    const iL = y * w * 3, iR = (y * w + w - 1) * 3;
    if (!bg[y * w] && data[iL] > thresh && data[iL+1] > thresh && data[iL+2] > thresh) push(0, y);
    if (!bg[y * w + w - 1] && data[iR] > thresh && data[iR+1] > thresh && data[iR+2] > thresh) push(w - 1, y);
  }
  while (qHead < qTail) {
    const cx = queue[qHead++], cy = queue[qHead++];
    const neighbors = [cx - 1, cy, cx + 1, cy, cx, cy - 1, cx, cy + 1];
    for (let i = 0; i < 8; i += 2) {
      const nx = neighbors[i], ny = neighbors[i+1];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const p = ny * w + nx;
        if (!bg[p]) {
          const s = p * 3;
          if (data[s] > thresh && data[s+1] > thresh && data[s+2] > thresh) {
            bg[p] = 1;
            queue[qTail++] = nx; queue[qTail++] = ny;
          }
        }
      }
    }
  }

  // Create RGBA and find bounding box of subject
  const rgba = Buffer.alloc(w * h * 4);
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x, s = p * 3, d = p * 4;
      rgba[d] = data[s]; rgba[d+1] = data[s+1]; rgba[d+2] = data[s+2];
      if (bg[p]) {
        rgba[d+3] = 0;
      } else {
        // Soften 1px edge
        let isEdge = false;
        if (x > 0 && bg[p - 1]) isEdge = true;
        else if (x < w - 1 && bg[p + 1]) isEdge = true;
        else if (y > 0 && bg[p - w]) isEdge = true;
        else if (y < h - 1 && bg[p + w]) isEdge = true;

        if (isEdge && data[s] > 220 && data[s+1] > 220 && data[s+2] > 220) {
          rgba[d+3] = 128;
        } else {
          rgba[d+3] = 255;
        }
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }

  const sW = maxX - minX + 1, sH = maxY - minY + 1;
  const cropped = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: sW, height: sH })
    .png()
    .toBuffer();

  let targetH = Math.round(1333 * 0.88); // 1173px (88% of canvas height)
  let targetW = Math.round(sW * (targetH / sH));
  if (targetW > Math.round(1000 * 0.88)) {
    targetW = Math.round(1000 * 0.88);
    targetH = Math.round(sH * (targetW / sW));
  }

  const resized = await sharp(cropped)
    .resize(targetW, targetH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const left = Math.round((1000 - targetW) / 2);
  const top = Math.round(1333 * 0.94 - targetH); // jacket hem at ~94% canvas height

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  await sharp({
    create: {
      width: 1000,
      height: 1333,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: resized, left, top }])
  .png({ palette: true, quality: 95, compressionLevel: 9 })
  .toFile(outPath);
}

async function main() {
  console.log('--- STEP 4: PROCESSING IMAGES ---');
  const rawDir = 'd:/3d web/halden-rowe/raw-products';
  const outBase = 'd:/3d web/halden-rowe/public/images/products';

  for (let i = 0; i < assignments.length; i++) {
    const { file, slug, colorId } = assignments[i];
    const srcPath = path.join(rawDir, file);
    const outPath = path.join(outBase, slug, `${colorId}.png`);
    process.stdout.write(`[${i + 1}/${assignments.length}] ${slug}/${colorId}.png ... `);
    await processImage(srcPath, outPath);
    const stat = fs.statSync(outPath);
    console.log(`OK (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  // Move unused files to raw-products/_unused
  const unusedDir = path.join(rawDir, '_unused');
  if (!fs.existsSync(unusedDir)) fs.mkdirSync(unusedDir, { recursive: true });
  for (const uf of unusedFiles) {
    const src = path.join(rawDir, uf);
    const dst = path.join(unusedDir, uf);
    if (fs.existsSync(src) && !fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
    }
  }

  console.log('\n--- STEP 5: RUNNING VALIDATION ---');
  let failures = 0;
  const designColorMap = {};

  for (const { slug, colorId } of assignments) {
    if (!designColorMap[slug]) designColorMap[slug] = new Set();
    if (designColorMap[slug].has(colorId)) {
      console.error(`FAIL: Duplicate colorId ${colorId} in ${slug}`);
      failures++;
    }
    designColorMap[slug].add(colorId);

    const filePath = path.join(outBase, slug, `${colorId}.png`);
    if (!fs.existsSync(filePath)) {
      console.error(`FAIL: Missing ${slug}/${colorId}.png`);
      failures++;
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.size > 900 * 1024) {
      console.error(`FAIL: ${slug}/${colorId}.png is ${stat.size} bytes (> 900 KB)`);
      failures++;
    }

    const img = sharp(filePath);
    const meta = await img.metadata();
    if (meta.format !== 'png') {
      console.error(`FAIL: ${slug}/${colorId}.png format is ${meta.format} (not png)`);
      failures++;
    }
    if (meta.width !== 1000 || meta.height !== 1333) {
      console.error(`FAIL: ${slug}/${colorId}.png dimensions ${meta.width}x${meta.height} (expected 1000x1333)`);
      failures++;
    }
    if (!meta.hasAlpha) {
      console.error(`FAIL: ${slug}/${colorId}.png lacks alpha channel`);
      failures++;
    }

    const { data } = await img.raw().toBuffer({ resolveWithObject: true });
    // Check top-left (0,0) and bottom-right (999, 1332)
    const tlA = data[3];
    const brA = data[(1000 * 1333 - 1) * 4 + 3];
    if (tlA !== 0 || brA !== 0) {
      console.error(`FAIL: ${slug}/${colorId}.png TL alpha=${tlA}, BR alpha=${brA} (expected 0)`);
      failures++;
    }

    // Find bounding box height
    let minY = 1333, maxY = 0;
    for (let y = 0; y < 1333; y++) {
      for (let x = 0; x < 1000; x++) {
        const a = data[(y * 1000 + x) * 4 + 3];
        if (a > 10) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const bHeight = maxY - minY + 1;
    const ratio = bHeight / 1333;
    if (ratio < 0.80 || ratio > 0.92) {
      console.error(`FAIL: ${slug}/${colorId}.png bbox height ratio ${(ratio * 100).toFixed(1)}% (expected 80%-92%)`);
      failures++;
    }
  }

  console.log(`Validation finished with ${failures} failure(s).`);

  if (failures === 0) {
    console.log('Validation passed 100%! Cleaning up original flat jpgs from public/images/products/...');
    const flatJpgs = fs.readdirSync(outBase).filter(f => f.endsWith('.jpg'));
    for (const j of flatJpgs) {
      fs.unlinkSync(path.join(outBase, j));
    }
    console.log(`Removed ${flatJpgs.length} original flat jpgs from public/images/products/.`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
