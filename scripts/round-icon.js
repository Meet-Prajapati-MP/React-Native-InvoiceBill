/**
 * Creates app-icon.png from logo.jpg with rounded corners.
 * Run: node scripts/round-icon.js
 */
const sharp = require('sharp');
const path = require('path');

const SIZE = 1024;
const RADIUS = 220; // Squircle-style rounded corners

const inputPath = path.join(__dirname, '../assets/logo.jpg');
const outputPath = path.join(__dirname, '../assets/app-icon.png');

const roundedMask = Buffer.from(
  `<svg><rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="white"/></svg>`
);

async function main() {
  await sharp(inputPath)
    .resize(SIZE, SIZE)
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .png()
    .toFile(outputPath);
  console.log('Created assets/app-icon.png with rounded corners');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
