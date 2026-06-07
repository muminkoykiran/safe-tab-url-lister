// Bağımlılıksız PNG ikon üretici — node generate-icons.js
// Çıktı: icons/icon16.png, icons/icon48.png, icons/icon128.png
// Tasarım: koyu mavi (#1e40af) rounded-square üzerinde beyaz sekme+liste ikonu

const fs = require("fs");
const path = require("path");

// ── Minimal PNG encoder (zlib deflate kullanmadan store) ──────────────────────

function crc32(buf) {
  let c = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let v = i;
      for (let j = 0; j < 8; j++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
      t[i] = v;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const tBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tBuf, data])));
  return Buffer.concat([len, tBuf, data, crcBuf]);
}

function adler32(data) {
  let s1 = 1, s2 = 0;
  for (let i = 0; i < data.length; i++) {
    s1 = (s1 + data[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  return (s2 * 65536 + s1) >>> 0;
}

function deflateStore(data) {
  // zlib "store" metodu (sıkıştırmasız) — geçerli PNG için yeterli
  const chunks = [];
  const BLOCK = 65535;
  for (let i = 0; i < data.length; i += BLOCK) {
    const block = data.slice(i, i + BLOCK);
    const last = i + BLOCK >= data.length ? 1 : 0;
    const header = Buffer.alloc(5);
    header[0] = last;
    header.writeUInt16LE(block.length, 1);
    header.writeUInt16LE(~block.length & 0xffff, 3);
    chunks.push(header, block);
  }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE(adler32(data));
  return Buffer.concat([Buffer.from([0x78, 0x01]), ...chunks, adler]);
}

function encodePNG(pixels, size) {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // colour type: RGB
  // compression, filter, interlace = 0

  // Raw scanlines (filter byte 0 per row)
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0); // filter none
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3;
      raw.push(pixels[i], pixels[i + 1], pixels[i + 2]);
    }
  }
  const rawBuf = Buffer.from(raw);

  return Buffer.concat([
    PNG_SIG,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateStore(rawBuf)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Piksel çizici ─────────────────────────────────────────────────────────────

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 3);

  const BG   = [30, 64, 175];   // #1e40af  mavi
  const FG   = [255, 255, 255]; // beyaz
  const radius = Math.round(size * 0.18);

  function setPixel(x, y, [r, g, b]) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 3;
    pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b;
  }

  // Rounded-square arka plan
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inCornerTL = x < radius && y < radius;
      const inCornerTR = x >= size - radius && y < radius;
      const inCornerBL = x < radius && y >= size - radius;
      const inCornerBR = x >= size - radius && y >= size - radius;

      let inside = true;
      if (inCornerTL) {
        const dx = x - radius, dy = y - radius;
        inside = dx * dx + dy * dy <= radius * radius;
      } else if (inCornerTR) {
        const dx = x - (size - radius - 1), dy = y - radius;
        inside = dx * dx + dy * dy <= radius * radius;
      } else if (inCornerBL) {
        const dx = x - radius, dy = y - (size - radius - 1);
        inside = dx * dx + dy * dy <= radius * radius;
      } else if (inCornerBR) {
        const dx = x - (size - radius - 1), dy = y - (size - radius - 1);
        inside = dx * dx + dy * dy <= radius * radius;
      }
      if (inside) setPixel(x, y, BG);
    }
  }

  // Yatay çizgiler (liste ikonu) — 3 çizgi
  const pad   = Math.round(size * 0.22);
  const lineH = Math.max(1, Math.round(size * 0.09));
  const gaps  = [0.32, 0.50, 0.68]; // dikey konum oranları
  const lineW = size - pad * 2;

  for (const gy of gaps) {
    const yStart = Math.round(size * gy - lineH / 2);
    for (let dy = 0; dy < lineH; dy++) {
      for (let dx = 0; dx < lineW; dx++) {
        setPixel(pad + dx, yStart + dy, FG);
      }
    }
  }

  // Küçük kare/sekme işareti (sol üst, ilk çizginin üstünde)
  if (size >= 48) {
    const sq = Math.round(size * 0.14);
    const sx = pad, sy = Math.round(size * 0.14);
    for (let dy = 0; dy < sq; dy++) {
      for (let dx = 0; dx < sq; dx++) {
        setPixel(sx + dx, sy + dy, FG);
      }
    }
  }

  return pixels;
}

// ── Ana ───────────────────────────────────────────────────────────────────────

const outDir = path.join(__dirname, "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const pixels = drawIcon(size);
  const png = encodePNG(pixels, size);
  const out = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(out, png);
  console.log(`✓ icons/icon${size}.png (${png.length} bytes)`);
}

console.log("\nİkonlar hazır! Bu scripti artık silebilirsiniz.");
