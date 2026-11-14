/**
 * Renders the characters large, so a sprite can be judged.
 *
 * Usage: node tools/qa/preview-characters.mjs [out.png] [scale] [name ...]
 */
import { Canvas } from '../assets/pixel.mjs';
import { writePng } from '../assets/png.mjs';
import { CHARACTER_ASSETS, CHARACTER_WIDTH, CHARACTER_HEIGHT } from '../assets/characters.mjs';

const [, , outPath, scaleText, ...names] = process.argv;
const scale = Number(scaleText ?? 4);
const wanted = names.length > 0 ? names : null;

const assets = CHARACTER_ASSETS.filter(
  (asset) => wanted === null || wanted.some((name) => asset.key.includes(name)),
);

const columns = Math.min(assets.length, 4);
const rows = Math.ceil(assets.length / columns);
const out = new Canvas(columns * CHARACTER_WIDTH * scale, rows * CHARACTER_HEIGHT * scale);

assets.forEach((asset, index) => {
  const frame = asset.frames[0];
  const left = (index % columns) * CHARACTER_WIDTH * scale;
  const top = Math.floor(index / columns) * CHARACTER_HEIGHT * scale;

  for (let y = 0; y < CHARACTER_HEIGHT; y += 1) {
    for (let x = 0; x < CHARACTER_WIDTH; x += 1) {
      const at = (y * CHARACTER_WIDTH + x) * 4;
      const alpha = frame.data[at + 3];

      if (alpha === 0) {
        continue;
      }

      const color = (frame.data[at] << 16) | (frame.data[at + 1] << 8) | frame.data[at + 2];

      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          out.set(left + x * scale + dx, top + y * scale + dy, color, alpha);
        }
      }
    }
  }
});

const path = outPath ?? 'artifacts/qa/characters.png';
writePng(path, out.width, out.height, out.data);
console.log(`${path} (${out.width}x${out.height})`);
