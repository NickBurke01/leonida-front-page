// Builds the website's brand images from the original channel art in /brand.
// Run with: npm run brand   (only needed when the channel art changes; outputs are committed)
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BANNER = path.join(ROOT, 'brand', 'Leonida FrontPage YT Banner.jpg');
const PFP = path.join(ROOT, 'brand', 'LeonnidaFrontPage pfp.png');
const OUT = path.join(ROOT, 'public', 'brand');
const PUB = path.join(ROOT, 'public');

const CRIMSON = { r: 209, g: 10, b: 78 };
const INDIGO = '#0D0522';

await mkdir(OUT, { recursive: true });

/** Cut the crimson script wordmark out of the banner's newspaper card as a transparent image. */
async function wordmark() {
  // Region of the script "Leonida Front Page" on the cream card (banner is 2048x1152).
  // Starts below the thin black rule that sits above the script.
  const region = { left: 462, top: 492, width: 1118, height: 136 };
  const { data, info } = await sharp(BANNER).extract(region).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Paper is cream (green ~232); the crimson ink has green ~15. Anything dark (rules, stamp) or yellow is rejected.
    let a = smooth(212, 70, g);
    if (r < 150 || g > b + 40) a = 0;
    out[o] = CRIMSON.r; out[o + 1] = CRIMSON.g; out[o + 2] = CRIMSON.b; out[o + 3] = Math.round(a * 255);
  }
  // Remove small specks (edges of the stamp and the torn paper) by keeping only large connected shapes.
  const W = info.width, H = info.height, seen = new Uint8Array(W * H);
  for (let start = 0; start < W * H; start++) {
    if (seen[start] || out[start * 4 + 3] < 20) continue;
    const stack = [start], comp = []; seen[start] = 1;
    while (stack.length) {
      const p = stack.pop(); comp.push(p); const x = p % W, y = (p / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx; if (!seen[q] && out[q * 4 + 3] >= 20) { seen[q] = 1; stack.push(q); }
      }
    }
    if (comp.length < 600) for (const p of comp) out[p * 4 + 3] = 0;
  }
  const img = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 });
  const buf = await img.png().toBuffer();
  const meta = await sharp(buf).metadata();
  await sharp(buf).resize({ width: 1000 }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(OUT, 'wordmark.webp'));
  await sharp(buf).resize({ width: 1000 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'wordmark.png'));
  // Cream version for dark backgrounds where a crimson script would lack contrast.
  const cream = await sharp(buf).resize({ width: 1000 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < cream.data.length; i += 4) { cream.data[i] = 253; cream.data[i + 1] = 242; cream.data[i + 2] = 216; }
  await sharp(cream.data, { raw: cream.info }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(OUT, 'wordmark-cream.webp'));
  return meta;
}

/** Round channel avatar (the full profile picture). */
async function avatar() {
  for (const size of [96, 192, 384]) {
    const circle = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#fff"/></svg>`);
    await sharp(PFP).resize(size, size).composite([{ input: circle, blend: 'dest-in' }]).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, `avatar-${size}.webp`));
  }
}

/** Icons: the LFP card cropped tight so it stays legible at 16-32 px. */
async function icons() {
  const card = await sharp(PFP).extract({ left: 150, top: 150, width: 954, height: 954 }).png().toBuffer();
  const full = await sharp(PFP).png().toBuffer();
  const sizes = { 'favicon-16.png': [card, 16], 'favicon-32.png': [card, 32], 'apple-touch-icon.png': [full, 180], 'icon-192.png': [full, 192], 'icon-512.png': [full, 512] };
  const pngs = {};
  for (const [name, [src, size]] of Object.entries(sizes)) {
    const buf = await sharp(src).resize(size, size).flatten({ background: INDIGO }).png({ compressionLevel: 9 }).toBuffer();
    pngs[name] = buf;
    await writeFile(path.join(PUB, name), buf);
  }
  // favicon.ico containing the 16 and 32 px PNGs.
  const entries = [pngs['favicon-16.png'], pngs['favicon-32.png']];
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dirs = entries.map((png, i) => {
    const size = i === 0 ? 16 : 32; const d = Buffer.alloc(16);
    d.writeUInt8(size, 0); d.writeUInt8(size, 1); d.writeUInt8(0, 2); d.writeUInt8(0, 3);
    d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6); d.writeUInt32LE(png.length, 8); d.writeUInt32LE(offset, 12);
    offset += png.length; return d;
  });
  await writeFile(path.join(PUB, 'favicon.ico'), Buffer.concat([header, ...dirs, ...entries]));
}

/** Atmosphere: the sunset + palms band above the newspaper card, softened for use behind content. */
async function atmosphere() {
  await sharp(BANNER)
    .extract({ left: 0, top: 60, width: 2048, height: 380 })
    .blur(6)
    .modulate({ brightness: 0.62, saturation: 1.05 })
    .resize({ width: 1800 })
    .webp({ quality: 72 })
    .toFile(path.join(OUT, 'atmosphere-sun.webp'));
  await sharp(BANNER)
    .extract({ left: 0, top: 745, width: 2048, height: 260 })
    .blur(2)
    .modulate({ brightness: 0.55 })
    .resize({ width: 1800 })
    .webp({ quality: 70 })
    .toFile(path.join(OUT, 'atmosphere-skyline.webp'));
}

/** Default social share image, 1200x630. */
async function shareImage() {
  const W = 1200, H = 630;
  // Sky, sun and palms only (above the newspaper card), stretched softly into the frame.
  const sun = await sharp(BANNER).extract({ left: 0, top: 40, width: 2048, height: 380 }).resize(W, H, { fit: 'cover', position: 'top' }).blur(14).modulate({ brightness: 0.72, saturation: 1.15 }).png().toBuffer();
  const wm = await sharp(path.join(OUT, 'wordmark-cream.webp')).resize({ width: 860 }).png().toBuffer();
  const wmMeta = await sharp(wm).metadata();
  const overlay = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0D0522" stop-opacity="0.25"/><stop offset="1" stop-color="#0D0522" stop-opacity="0.92"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#D10A4E"/>
      <text x="${W / 2}" y="118" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="6" fill="#FAB83C">THE FRONT PAGE OF LEONIDA</text>
      <text x="${W / 2}" y="470" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="600" fill="#FDF2D8">Shorts give you the headline.</text>
      <text x="${W / 2}" y="515" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="600" fill="#FDF2D8">We give you the complete picture.</text>
      <text x="${W / 2}" y="580" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="22" letter-spacing="3" fill="#FDF2D8" fill-opacity="0.7">GTA 6 GUIDES · SECRETS · NEWS</text>
    </svg>`);
  await sharp(sun)
    .composite([{ input: overlay }, { input: wm, top: Math.round(250 - wmMeta.height / 2), left: Math.round((W - wmMeta.width) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUB, 'og-default.png'));
}

/** Branded placeholder artwork for guides and news (replace with real screenshots any time). */
async function placeholders() {
  const dir = path.join(PUB, 'images', 'placeholders');
  await mkdir(dir, { recursive: true });
  const W = 1600, H = 900;
  const items = [
    ['guide-money', 'MONEY', 'GUIDE'], ['guide-map', 'MAP', 'GUIDE'], ['guide-getting-started', 'GETTING STARTED', 'GUIDE'],
    ['guide-secrets', 'SECRETS', 'GUIDE'], ['guide-vehicles', 'VEHICLES', 'GUIDE'], ['guide-weapons', 'WEAPONS', 'GUIDE'],
    ['news-lead', 'FRONT PAGE', 'NEWS'], ['news-update', 'UPDATE', 'NEWS'], ['news-theory', 'THEORY DESK', 'NEWS'],
    ['db-vehicle', 'VEHICLE', 'DATABASE'], ['db-weapon', 'WEAPON', 'DATABASE'], ['db-character', 'CHARACTER', 'DATABASE'], ['db-mission', 'MISSION', 'DATABASE'],
  ];
  const circle = Buffer.from('<svg width="120" height="120"><circle cx="60" cy="60" r="58" fill="#fff"/></svg>');
  const mark = await sharp(PFP).resize(120, 120).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
  // Each placeholder gets the sun in a slightly different spot so a grid of them doesn't look copy-pasted.
  const spots = [[0.78, 0.18], [0.22, 0.2], [0.65, 0.12], [0.85, 0.3], [0.35, 0.15], [0.7, 0.25], [0.5, 0.1], [0.8, 0.15], [0.28, 0.24]];
  for (const [i, [name, label, kind]] of items.entries()) {
    const [sx, sy] = spots[i % spots.length];
    const svg = Buffer.from(`
      <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sun" cx="${sx}" cy="${sy}" r="0.55">
            <stop offset="0" stop-color="#FAB83C" stop-opacity="0.85"/>
            <stop offset="0.18" stop-color="#E7594F" stop-opacity="0.55"/>
            <stop offset="0.45" stop-color="#9A2065" stop-opacity="0.28"/>
            <stop offset="1" stop-color="#0D0522" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0D0522" stop-opacity="0"/><stop offset="1" stop-color="#0D0522" stop-opacity="0.9"/>
          </linearGradient>
          <pattern id="rule" width="1600" height="14" patternUnits="userSpaceOnUse"><rect width="1600" height="1" fill="#FDF2D8" fill-opacity="0.045"/></pattern>
        </defs>
        <rect width="100%" height="100%" fill="#120530"/>
        <rect width="100%" height="100%" fill="url(#sun)"/>
        <rect width="100%" height="100%" fill="url(#rule)"/>
        <rect width="100%" height="100%" fill="url(#floor)"/>
        <rect x="96" y="${H - 300}" width="120" height="6" fill="#D10A4E"/>
        <text x="96" y="${H - 236}" font-family="Georgia, serif" font-size="30" letter-spacing="8" fill="#FAB83C">${kind}</text>
        <text x="90" y="${H - 120}" font-family="'Arial Narrow', 'Segoe UI', Arial, sans-serif" font-weight="700" font-size="${label.length > 12 ? 112 : 150}" letter-spacing="2" fill="#FDF2D8">${label}</text>
      </svg>`);
    // Database cards put the tier badge top-right, so their placeholders carry no corner mark.
    const marks = name.startsWith('db-') ? [] : [{ input: mark, top: 72, left: W - 192 }];
    await sharp(svg).composite(marks).webp({ quality: 78 }).toFile(path.join(dir, `${name}.webp`));
  }
}

const meta = await wordmark();
await placeholders();
await avatar();
await icons();
await atmosphere();
await shareImage();
console.log(`Brand assets written. Wordmark source: ${meta.width}x${meta.height}`);
