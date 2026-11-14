import { readPng } from './png-decode.mjs';
import { Canvas } from './pixel.mjs';
import { writePng } from './png.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

/**
 * Brings a sprite drawn outside the repository into the game's grid.
 *
 * The art pack is code, so a character is a pixel map in the generator. This
 * tool reads a PNG, finds the figure inside it, scales it down to the
 * character grid, and writes out both a preview and the map, so the map can
 * be pasted into `characters.mjs`.
 *
 * Usage:
 *   node tools/assets/import-sprite.mjs <png> [options]
 *
 *   --width 32          the width of the character grid
 *   --height 48         the height of the character grid
 *   --background 0x1a1a26   the colour to treat as background
 *   --out artifacts/import  where to write the preview and the map
 *   --palette 0x7a5236:r,0xd8d0bc:h  colour to palette key
 */

/**
 * Finds the bounds of the figure.
 *
 * The background is the most common colour in the image, which is how these
 * sprites are drawn: a flat field with one figure on it.
 */
export function findFigure(image, background) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const index = (y * image.width + x) * 4;
      const color =
        (image.data[index] << 16) | (image.data[index + 1] << 8) | image.data[index + 2];

      if (color === background) {
        continue;
      }

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) {
    throw new Error('The whole image is background.');
  }

  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * The colour that covers most of the image, which is the background.
 */
export function backgroundColor(image) {
  const counts = new Map();

  for (let index = 0; index < image.data.length; index += 4) {
    const color = (image.data[index] << 16) | (image.data[index + 1] << 8) | image.data[index + 2];
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }

  let best = 0;
  let bestCount = -1;

  for (const [color, count] of counts) {
    if (count > bestCount) {
      best = color;
      bestCount = count;
    }
  }

  return best;
}

/**
 * Scales a region of an image down to the character grid.
 *
 * The figure keeps its proportions and stands on the bottom row, because a
 * character that floats is a character that looks wrong.
 */
export function scaleToGrid(image, figure, width, height) {
  const scale = Math.min(width / figure.width, height / figure.height);
  const targetWidth = Math.max(1, Math.round(figure.width * scale));
  const targetHeight = Math.max(1, Math.round(figure.height * scale));
  const canvas = new Canvas(width, height);
  const offsetX = Math.floor((width - targetWidth) / 2);
  const offsetY = height - targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      // The centre of the source pixel, so a downscale averages the area
      // rather than always taking the top left one.
      const sourceX = figure.left + Math.floor(((x + 0.5) / targetWidth) * figure.width);
      const sourceY = figure.top + Math.floor(((y + 0.5) / targetHeight) * figure.height);
      const index = (sourceY * image.width + sourceX) * 4;
      const alpha = image.data[index + 3];

      if (alpha === 0) {
        continue;
      }

      canvas.set(
        offsetX + x,
        offsetY + y,
        (image.data[index] << 16) | (image.data[index + 1] << 8) | image.data[index + 2],
        alpha,
      );
    }
  }

  return canvas;
}

/**
 * Turns a canvas into the rows of a pixel map.
 *
 * A colour with no key in the palette becomes a `.`, which the generator
 * treats as a hole, so the report below lists every colour that needs one.
 */
export function toMap(canvas, palette) {
  const unknown = new Set();
  const rows = [];

  for (let y = 0; y < canvas.height; y += 1) {
    let row = '';

    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;

      if (canvas.data[index + 3] === 0) {
        row += '.';
        continue;
      }

      const color =
        (canvas.data[index] << 16) | (canvas.data[index + 1] << 8) | canvas.data[index + 2];
      const key = palette[color];

      if (key === undefined) {
        unknown.add(color);
        row += '?';
        continue;
      }

      row += key;
    }

    rows.push(row);
  }

  return { rows, unknown };
}

function parseColors(value) {
  const colors = {};

  for (const entry of value.split(',')) {
    const [raw, key] = entry.split(':');

    if (!raw || !key) {
      continue;
    }

    colors[Number(raw)] = key.trim();
  }

  return colors;
}

if (
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())
) {
  const args = process.argv.slice(2);
  const file = args[0];

  if (!file) {
    console.error('Usage: node tools/assets/import-sprite.mjs <png> [--width 32] [--height 48]');
    process.exit(1);
  }

  const option = (name, fallback) => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
  };

  const width = Number(option('width', 32));
  const height = Number(option('height', 48));
  const out = option('out', 'artifacts/import');
  const backgroundOption = option('background', null);
  const paletteOption = option('palette', null);

  const image = readPng(file);
  const background = backgroundOption ? Number(backgroundOption) : backgroundColor(image);
  const figure = findFigure(image, background);
  const canvas = scaleToGrid(image, figure, width, height);
  const palette = paletteOption ? parseColors(paletteOption) : {};
  const { rows, unknown } = toMap(canvas, palette);

  mkdirSync(out, { recursive: true });
  writePng(`${out}/preview.png`, width, height, canvas.data);
  writeFileSync(`${out}/map.json`, JSON.stringify(rows, null, 2));

  console.log(`${file}: ${image.width}x${image.height}`);
  console.log(`figure: ${figure.width}x${figure.height} at ${figure.left},${figure.top}`);
  console.log(`scaled to ${width}x${height}, written to ${out}/preview.png`);

  if (unknown.size > 0) {
    console.log('\ncolours with no palette key:');

    for (const color of unknown) {
      console.log(`  0x${color.toString(16).padStart(6, '0')}`);
    }
  }

  console.log('\nmap:');

  for (const row of rows) {
    console.log(`  '${row}',`);
  }
}

export { parseColors };
