/**
 * Rafi9i — generates the logo assets from the VEROX brand sheet.
 * Usage: node scripts/gen-logo.mjs [path/to/VEROX.png]
 *
 * Outputs (public/images/):
 *   rafi9i-mark.png       fox mark, transparent background
 *   rafi9i-wordmark.png   "Rafi9i" in black (light backgrounds)
 *   rafi9i-wordmark-light.png  "Rafi9i" in white (dark backgrounds)
 *   rafi9i-logo.png       mark + wordmark lockup on white (OG / structured data)
 *   og-default.png        1200×630 social sharing image
 *   ../favicon.png        64px mark
 */
import sharp from "sharp";

const SRC = process.argv[2] ?? "VEROX_20261022_171117_0000.png";
const OUT = "public/images";

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const px = (x, y) => (y * W + x) * 4;

/** Bounding box of non-white pixels inside a region. */
function bbox(x0, y0, x1, y1) {
  let minX = x1, minY = y1, maxX = x0, maxY = y0;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = px(x, y);
      if (Math.min(data[i], data[i + 1], data[i + 2]) < 235) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** "Color to alpha" against white: unmixes anti-aliased edges cleanly. */
function unwhite(buf, i) {
  const a = (255 - Math.min(buf[i], buf[i + 1], buf[i + 2])) / 255;
  if (a <= 0.01) { buf[i + 3] = 0; return; }
  for (let c = 0; c < 3; c++) buf[i + c] = Math.round((buf[i + c] - 255 * (1 - a)) / a);
  buf[i + 3] = Math.round(a * 255);
}

async function extract(box, pad) {
  const { data: d, info: inf } = await sharp(SRC)
    .ensureAlpha()
    .extract(box)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { d, w: inf.width, h: inf.height };
}

// ── Fox mark: only background connected to the edges becomes transparent,
//    so the white ears / tail tip inside the outline stay white.
{
  const box = bbox(300, 520, 660, 862);
  const { d, w, h } = await extract(box, 6);
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    const i = p * 4;
    if (Math.min(d[i], d[i + 1], d[i + 2]) < 150) continue;
    seen[p] = 1;
    unwhite(d, i);
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  const mark = sharp(d, { raw: { width: w, height: h, channels: 4 } }).png();
  await mark.clone().toFile(`${OUT}/rafi9i-mark.png`);
  await mark.clone().resize(64, 64, { fit: "contain", background: "#0000" }).toFile("public/favicon.png");
}

// ── Wordmark: no enclosed white to keep, so every white pixel goes.
{
  const box = bbox(300, 862, 700, 1000);
  const { d, w, h } = await extract(box, 4);
  for (let i = 0; i < d.length; i += 4) unwhite(d, i);
  await sharp(Buffer.from(d), { raw: { width: w, height: h, channels: 4 } }).png().toFile(`${OUT}/rafi9i-wordmark.png`);
  // Light variant: neutral (black/grey) pixels turn white, the orange dot stays.
  for (let i = 0; i < d.length; i += 4) {
    const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
    if (sat < 40) d[i] = d[i + 1] = d[i + 2] = 255;
  }
  await sharp(Buffer.from(d), { raw: { width: w, height: h, channels: 4 } }).png().toFile(`${OUT}/rafi9i-wordmark-light.png`);
}

// ── Horizontal lockup (top of the sheet) on white, for OG / JSON-LD.
await sharp(SRC).extract(bbox(60, 60, 700, 320)).extend({ top: 24, bottom: 24, left: 24, right: 24, background: "#ffffff" })
  .png().toFile(`${OUT}/rafi9i-logo.png`);

// ── Social sharing image (1200×630): wordmark + tagline left, big fox right.
{
  const W_OG = 1200, H_OG = 630;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W_OG}" height="${H_OG}">
    <rect width="100%" height="100%" fill="#fcfbfa"/>
    <circle cx="910" cy="315" r="250" fill="#ffffff" stroke="#f88541" stroke-width="22"/>
    <text x="90" y="400" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="600" fill="#141210">Orientation &amp; soft skills</text>
    <text x="90" y="452" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="600" fill="#141210">pour les lycéens au Maroc</text>
    <rect x="90" y="500" width="90" height="8" rx="4" fill="#f88541"/>
  </svg>`);
  const word = await sharp(`${OUT}/rafi9i-wordmark.png`).resize({ height: 150 }).toBuffer();
  const mark = await sharp(`${OUT}/rafi9i-mark.png`).resize({ height: 340 }).toBuffer();
  const markMeta = await sharp(mark).metadata();
  await sharp(bg)
    .composite([
      { input: word, left: 84, top: 170 },
      { input: mark, left: 910 - Math.round(markMeta.width / 2), top: 140 },
    ])
    .png()
    .toFile(`${OUT}/og-default.png`);
}

console.log("Logo assets written to", OUT);
