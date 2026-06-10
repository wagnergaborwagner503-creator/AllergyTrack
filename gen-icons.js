/**
 * Generate Android app icons – 🌿 emoji on light-green background
 * Usage: node gen-icons.js
 */
const sharp  = require('sharp');
const path   = require('path');
const fs     = require('fs');

const RES = 'android/app/src/main/res';

/* ── Full icon SVG (light green background + 🌿 emoji rendered via text) ──
   SVG <text> with the 🌿 emoji renders correctly in sharp/librsvg on most
   systems. The background is #A5D6A7 (light green, Material Green 200).
   The rounded rectangle has a 40px corner radius matching Android 12+ style. */
const fullIconSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <!-- Light green background -->
  <rect width="192" height="192" rx="40" fill="#A5D6A7"/>
  <!-- 🌿 emoji centred -->
  <text x="96" y="130"
        font-size="110"
        text-anchor="middle"
        dominant-baseline="auto"
        font-family="Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif">🌿</text>
</svg>
`);

/* ── Foreground SVG for adaptive icon (transparent bg, emoji centred in safe zone) ──
   Adaptive icon safe zone = inner 72dp of the 108dp canvas → 25% padding each side.
   At 432px canvas that means the emoji should sit at ~25% inset. */
const fgSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432">
  <!-- 🌿 emoji centred in safe zone -->
  <text x="216" y="300"
        font-size="240"
        text-anchor="middle"
        dominant-baseline="auto"
        font-family="Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif">🌿</text>
</svg>
`);

const ICON_SIZES = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

const FG_SIZES = [
  { dir: 'mipmap-mdpi',    size: 108 },
  { dir: 'mipmap-hdpi',    size: 162 },
  { dir: 'mipmap-xhdpi',   size: 216 },
  { dir: 'mipmap-xxhdpi',  size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
];

async function main() {
  console.log('Generating icons...');

  for (const { dir, size } of ICON_SIZES) {
    const destDir = path.join(RES, dir);
    fs.mkdirSync(destDir, { recursive: true });

    /* Square icon */
    await sharp(fullIconSvg, { density: Math.round(size * 72 / 192) })
      .resize(size, size)
      .png()
      .toFile(path.join(destDir, 'ic_launcher.png'));

    /* Round icon — same but circular mask */
    const circleSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="black"/>
      </svg>`;
    await sharp(fullIconSvg, { density: Math.round(size * 72 / 192) })
      .resize(size, size)
      .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
      .png()
      .toFile(path.join(destDir, 'ic_launcher_round.png'));

    console.log(`  ${dir}: ${size}×${size} ✓`);
  }

  for (const { dir, size } of FG_SIZES) {
    const destDir = path.join(RES, dir);
    fs.mkdirSync(destDir, { recursive: true });

    await sharp(fgSvg, { density: Math.round(size * 72 / 432) })
      .resize(size, size)
      .png()
      .toFile(path.join(destDir, 'ic_launcher_foreground.png'));

    console.log(`  ${dir} (fg): ${size}×${size} ✓`);
  }

  console.log('\nAll icons generated successfully.');
}

main().catch(e => { console.error(e); process.exit(1); });
