// Safe Tab URL Lister — Icon Generator v3
// Output: icons/icon16.png, icons/icon48.png, icons/icon128.png
//
// ── Design Concept v3: "Bold Chain-Link on Deep Indigo" ──────────────────────
//
//  Rationale:
//   v1 used a folder-tab + list → too similar to Google Docs.
//   v2 used clipboard + chain + lines → too busy, 16px unreadable.
//   v3 uses a SINGLE strong metaphor: the chain-link (🔗) universally
//   understood as URL/hyperlink. Two interlocking ovals, horizontal,
//   centered on a deep indigo (#4338ca) rounded square.
//
//  Sizes:
//   128px: two white oval rings (28px tall × 44px wide, 8px stroke),
//          overlapping by 16px at center, centered on background.
//   48px:  same proportions, stroke ~3px.
//   16px:  SIMPLIFIED — two bold filled white pill shapes (rounded rectangles)
//          with a 2px gap between them, no ring detail. Each ~10×4px.
//
//  Colors:
//   Background: #4338ca (R=67,  G=56,  B=202) — deeper, more saturated indigo
//   Foreground: #ffffff (R=255, G=255, B=255)  — pure white
//
//  Corner radius: 22% of size
//   128px → 28px,  48px → 11px (≈ 22%),  16px → 4px
//
// No external dependencies — pure Node.js fs + Buffer.
// Run:  node generate-icons.js

"use strict";

const fs   = require("fs");
const path = require("path");

// ── CRC-32 ────────────────────────────────────────────────────────────────────

function buildCrcTable() {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let v = i;
    for (let j = 0; j < 8; j++) v = (v & 1) ? (0xedb88320 ^ (v >>> 1)) : (v >>> 1);
    t[i] = v;
  }
  return t;
}
const CRC_TABLE = buildCrcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG chunk helper ──────────────────────────────────────────────────────────

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf  = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf  = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ── Adler-32 for zlib ────────────────────────────────────────────────────────

function adler32(data) {
  let s1 = 1, s2 = 0;
  for (let i = 0; i < data.length; i++) {
    s1 = (s1 + data[i]) % 65521;
    s2 = (s2 + s1)      % 65521;
  }
  return (s2 * 65536 + s1) >>> 0;
}

// ── zlib "store" (no compression) ────────────────────────────────────────────

function deflateStore(data) {
  const BLOCK = 65535;
  const parts = [];
  for (let offset = 0; offset < data.length; offset += BLOCK) {
    const block  = data.slice(offset, offset + BLOCK);
    const isLast = (offset + BLOCK >= data.length) ? 1 : 0;
    const hdr    = Buffer.alloc(5);
    hdr[0] = isLast;
    hdr.writeUInt16LE(block.length,            1);
    hdr.writeUInt16LE((~block.length) & 0xffff, 3);
    parts.push(hdr, block);
  }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE(adler32(data), 0);
  // CMF=0x78 (deflate, 32k window), FLG=0x01 (check bits satisfy CMF*256+FLG % 31 == 0)
  // 0x78 * 256 + 0x01 = 30721; 30721 % 31 = 1 ≠ 0 → use 0x9C instead
  // 0x78 * 256 + 0x9C = 30876; 30876 % 31 = 0 ✓
  return Buffer.concat([Buffer.from([0x78, 0x9C]), ...parts, adler]);
}

// ── Encode RGBA pixel array → PNG buffer ─────────────────────────────────────

function encodePNG(pixels, size) {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 6; // colour type: RGBA (type 6)
  ihdr[10] = 0; // compression: deflate
  ihdr[11] = 0; // filter: adaptive
  ihdr[12] = 0; // interlace: none

  // Raw scanlines: filter byte (0=None) + RGBA per pixel
  const stride = 1 + size * 4;
  const raw    = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter type: None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = y * stride + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  return Buffer.concat([
    PNG_SIG,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateStore(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Anti-aliased coverage via 4×4 super-sampling ─────────────────────────────

// Returns 0.0–1.0 fraction of pixel inside the rounded rectangle.
function roundRectCoverage(px, py, rx0, ry0, rx1, ry1, rr) {
  let inside = 0;
  const r = Math.max(0, rr);
  for (let sy = 0; sy < 4; sy++) {
    for (let sx = 0; sx < 4; sx++) {
      const spx = px + (sx + 0.5) / 4;
      const spy = py + (sy + 0.5) / 4;
      if (spx < rx0 || spx > rx1 || spy < ry0 || spy > ry1) continue;
      // corner zones
      const inLeft  = spx < rx0 + r;
      const inRight = spx > rx1 - r;
      const inTop   = spy < ry0 + r;
      const inBot   = spy > ry1 - r;
      if (inLeft && inTop) {
        const dx = spx - (rx0 + r), dy = spy - (ry0 + r);
        if (dx * dx + dy * dy > r * r) continue;
      } else if (inRight && inTop) {
        const dx = spx - (rx1 - r), dy = spy - (ry0 + r);
        if (dx * dx + dy * dy > r * r) continue;
      } else if (inLeft && inBot) {
        const dx = spx - (rx0 + r), dy = spy - (ry1 - r);
        if (dx * dx + dy * dy > r * r) continue;
      } else if (inRight && inBot) {
        const dx = spx - (rx1 - r), dy = spy - (ry1 - r);
        if (dx * dx + dy * dy > r * r) continue;
      }
      inside++;
    }
  }
  return inside / 16;
}

// Returns 0.0–1.0 fraction of pixel inside an axis-aligned ellipse.
function ellipseCoverage(px, py, cx, cy, rx, ry) {
  let inside = 0;
  for (let sy = 0; sy < 4; sy++) {
    for (let sx = 0; sx < 4; sx++) {
      const spx = px + (sx + 0.5) / 4;
      const spy = py + (sy + 0.5) / 4;
      const dx  = (spx - cx) / rx;
      const dy  = (spy - cy) / ry;
      if (dx * dx + dy * dy <= 1.0) inside++;
    }
  }
  return inside / 16;
}

// ── Alpha-composite src over dst ──────────────────────────────────────────────

function compositePixel(pixels, idx, r, g, b, srcA255) {
  const srcA = srcA255 / 255;
  const dstA = pixels[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  pixels[idx]     = Math.round((r   * srcA + pixels[idx]     * dstA * (1 - srcA)) / outA);
  pixels[idx + 1] = Math.round((g   * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA);
  pixels[idx + 2] = Math.round((b   * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA);
  pixels[idx + 3] = Math.round(outA * 255);
}

function paint(pixels, size, px, py, rgb, alpha255) {
  if (px < 0 || py < 0 || px >= size || py >= size) return;
  compositePixel(pixels, (py * size + px) * 4, rgb[0], rgb[1], rgb[2], alpha255);
}

// Fill a rounded rectangle with anti-aliasing.
function fillRoundRect(pixels, size, x0, y0, x1, y1, rr, rgb) {
  if (x1 <= x0 || y1 <= y0) return;
  const minX = Math.max(0, Math.floor(x0) - 1);
  const maxX = Math.min(size - 1, Math.ceil(x1) + 1);
  const minY = Math.max(0, Math.floor(y0) - 1);
  const maxY = Math.min(size - 1, Math.ceil(y1) + 1);
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const cov = roundRectCoverage(px, py, x0, y0, x1, y1, rr);
      if (cov > 0) paint(pixels, size, px, py, rgb, Math.round(cov * 255));
    }
  }
}

// Draw an ellipse ring (outer ellipse minus inner ellipse) with anti-aliasing.
// outerRx/Ry = outer semi-axes, stroke = stroke width in pixels.
function strokeEllipse(pixels, size, cx, cy, outerRx, outerRy, stroke, rgb) {
  const innerRx = Math.max(0.5, outerRx - stroke);
  const innerRy = Math.max(0.5, outerRy - stroke);
  const minX = Math.max(0, Math.floor(cx - outerRx) - 1);
  const maxX = Math.min(size - 1, Math.ceil(cx + outerRx) + 1);
  const minY = Math.max(0, Math.floor(cy - outerRy) - 1);
  const maxY = Math.min(size - 1, Math.ceil(cy + outerRy) + 1);
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const outer = ellipseCoverage(px, py, cx, cy, outerRx, outerRy);
      if (outer <= 0) continue;
      const inner = ellipseCoverage(px, py, cx, cy, innerRx, innerRy);
      const cov = outer - inner;
      if (cov > 0) paint(pixels, size, px, py, rgb, Math.round(cov * 255));
    }
  }
}

// ── Erase (set to fully transparent) a rounded rect region ───────────────────
// Used to punch the transparent interior of the chain-link overlap zone.
function eraseRoundRect(pixels, size, x0, y0, x1, y1, rr) {
  if (x1 <= x0 || y1 <= y0) return;
  const minX = Math.max(0, Math.floor(x0) - 1);
  const maxX = Math.min(size - 1, Math.ceil(x1) + 1);
  const minY = Math.max(0, Math.floor(y0) - 1);
  const maxY = Math.min(size - 1, Math.ceil(y1) + 1);
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const cov = roundRectCoverage(px, py, x0, y0, x1, y1, rr);
      if (cov <= 0) continue;
      const idx = (py * size + px) * 4;
      // Blend toward transparent by coverage amount
      // Full coverage → fully transparent; partial → blend
      const erase = cov;
      pixels[idx + 3] = Math.round(pixels[idx + 3] * (1 - erase));
      if (pixels[idx + 3] === 0) {
        pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = 0;
      }
    }
  }
}

// ── Set pixel directly (no compositing) ──────────────────────────────────────
function setPixel(pixels, size, px, py, r, g, b, a) {
  if (px < 0 || py < 0 || px >= size || py >= size) return;
  const idx = (py * size + px) * 4;
  pixels[idx]     = r;
  pixels[idx + 1] = g;
  pixels[idx + 2] = b;
  pixels[idx + 3] = a;
}

// ── Core drawing function ─────────────────────────────────────────────────────

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4); // all transparent

  const BG  = [67,  56,  202]; // #4338ca — deep indigo
  const W   = [255, 255, 255]; // #ffffff — white

  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;

  // ── Step 1: Rounded-square background ───────────────────────────────────────
  // Corner radius: 22% of size
  const bgRadius = Math.round(size * 0.22);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const cov = roundRectCoverage(px, py, 0, 0, size - 1, size - 1, bgRadius);
      if (cov > 0) {
        paint(pixels, size, px, py, BG, Math.round(cov * 255));
      }
    }
  }

  // ── Step 2: Chain-link symbol ────────────────────────────────────────────────

  if (size <= 16) {
    // ── 16px: Two bold filled white pill shapes ────────────────────────────────
    //
    // Spec: two bold filled white rectangles with rounded ends (like ▬▬)
    // representing a link. Each ~10px wide × 4px tall. 2px gap between them.
    // Centered in the ~10×10 usable area.
    //
    // At 16px the usable interior (inside bgRadius=4 corners) is roughly 8×8.
    // We use:  each pill = 10w × 4h, fully filled white, rounded ends (r=2)
    // Gap = 2px between the two pills.
    // Stack vertically (top pill, gap, bottom pill), all centered.

    const pillW  = 9.5;   // width of each pill
    const pillH  = 3.5;   // height of each pill
    const pillR  = pillH / 2; // radius for fully-rounded ends
    const gap    = 1.5;   // gap between the two pills

    // Total height: pillH + gap + pillH
    const totalH = pillH + gap + pillH;

    // Center them in the icon
    const pillCY1 = cy - gap / 2 - pillH / 2; // center Y of top pill
    const pillCY2 = cy + gap / 2 + pillH / 2; // center Y of bottom pill
    const pillX0  = cx - pillW / 2;
    const pillX1  = cx + pillW / 2;

    // Top pill
    fillRoundRect(pixels, size,
      pillX0, pillCY1 - pillH / 2,
      pillX1, pillCY1 + pillH / 2,
      pillR, W);

    // Bottom pill
    fillRoundRect(pixels, size,
      pillX0, pillCY2 - pillH / 2,
      pillX1, pillCY2 + pillH / 2,
      pillR, W);

  } else {
    // ── 48px / 128px: Two interlocking ellipse rings ───────────────────────────
    //
    // Spec (at 128px):
    //   Each ring: 28px tall × 44px wide, stroke 8px, overlap 16px at center.
    //   Total chain width: 44 + 44 - 16 = 72px, centered.
    //
    // We scale from 128px base:
    //   ringH   = 28 / 128 = 21.875% of size  → half-axis ry = 14/128
    //   ringW   = 44 / 128 = 34.375% of size  → half-axis rx = 22/128
    //   stroke  =  8 / 128 =  6.25%  of size
    //   overlap = 16 / 128 = 12.5%   of size  → center-to-center = 44-16 = 28px
    //                                            i.e. offset = 14/128 of size each side
    //
    // The two ring centers are offset ±(overlap/2 from total center) in X.
    // center-to-center distance = ringW_full - overlap = 44 - 16 = 28px at 128px
    // so each center is at cx ± 14px at 128px, i.e. cx ± (14/128)*size

    const ry      = (14  / 128) * size;  // vertical semi-axis of each ring
    const rx      = (22  / 128) * size;  // horizontal semi-axis of each ring
    const stroke  = Math.max(3, (8   / 128) * size);  // stroke width
    const offset  = (14  / 128) * size;  // center offset from icon center

    // Ring centers
    const r1cx = cx - offset;
    const r2cx = cx + offset;

    // The overlap zone x-range: from r1cx+rx back to r2cx-rx
    // i.e., x in [r1cx+rx-stroke*0.5 .. r2cx-rx+stroke*0.5] roughly
    // More precisely: [r2cx - rx, r1cx + rx]
    const overlapX0 = r2cx - rx;
    const overlapX1 = r1cx + rx;

    // ── Draw ring 1 (left) ────────────────────────────────────────────────
    // We draw only the LEFT half of ring 1 (from cx-rx to cx), then the
    // full ring but clipped to avoid overwriting ring 2's overlap section.
    // Simpler: draw both full rings, then draw the "front" half of ring 2
    // over the overlap so the links interlock visually.
    //
    // Interlocking chain technique:
    //  1. Draw ring 1 stroke (full ellipse ring, white)
    //  2. Draw ring 2 stroke (full ellipse ring, white)
    //  3. Re-draw ring 1's RIGHT stroke (upper+lower arcs) OVER ring 2
    //     to make ring 1 appear to go in FRONT of ring 2 on the right side.
    //
    // This creates the classic interlocking chain look.

    // First: draw ring 1 fully
    strokeEllipse(pixels, size, r1cx, cy, rx, ry, stroke, W);
    // Then: draw ring 2 fully (overlapping region overwrites ring 1)
    strokeEllipse(pixels, size, r2cx, cy, rx, ry, stroke, W);
    // Then: redraw the BACK arc of ring 1 (left half of ring 1, top+bottom arcs)
    // over ring 2, so ring 1 appears to wrap around ring 2.
    // We do this by repainting ring 1 pixels that are LEFT of the center overlap.
    // "Left of center" means x < cx (icon center).

    // Repaint ring 1 pixels where x <= cx (left half of ring 1 goes in front)
    {
      const innerRx1 = Math.max(0.5, rx - stroke);
      const innerRy1 = Math.max(0.5, ry - stroke);
      const minX = Math.max(0, Math.floor(r1cx - rx) - 1);
      const maxX = Math.min(size - 1, Math.ceil(r1cx + rx) + 1);
      const minY = Math.max(0, Math.floor(cy - ry) - 1);
      const maxY = Math.min(size - 1, Math.ceil(cy + ry) + 1);
      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          // Only repaint the RIGHT half of ring 1 (px >= cx) so it goes OVER ring 2
          if (px < cx) continue;
          const outer = ellipseCoverage(px, py, r1cx, cy, rx, ry);
          if (outer <= 0) continue;
          const inner = ellipseCoverage(px, py, r1cx, cy, innerRx1, innerRy1);
          const cov = outer - inner;
          if (cov > 0) {
            // Set directly (overwrite whatever ring 2 drew here)
            const idx = (py * size + px) * 4;
            const alpha = Math.round(cov * 255);
            // Composite white at this coverage over the existing indigo background
            // We need to SET to white at full coverage, blend at edges.
            // Since BG is fully opaque indigo, outColor = white*cov + BG*(1-cov)
            pixels[idx]     = Math.round(W[0] * cov + BG[0] * (1 - cov));
            pixels[idx + 1] = Math.round(W[1] * cov + BG[1] * (1 - cov));
            pixels[idx + 2] = Math.round(W[2] * cov + BG[2] * (1 - cov));
            pixels[idx + 3] = 255;
          }
        }
      }
    }
  }

  return pixels;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const outDir = path.join(__dirname, "icons");
fs.mkdirSync(outDir, { recursive: true });

const sizes = [16, 48, 128];

for (const size of sizes) {
  const pixels = drawIcon(size);
  const png    = encodePNG(pixels, size);
  const out    = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(out, png);
  console.log(`Generated  icons/icon${size}.png  (${png.length} bytes)`);
}

console.log("\nDone. All icons written to icons/");
