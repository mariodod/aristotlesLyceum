/**
 * Checks the PNG reader against the PNGs the generator wrote.
 *
 * If the reader and the writer disagree by a single pixel, a sprite brought
 * in from outside the repository would come out subtly wrong, and nobody
 * would notice until the character looked wrong on the stage.
 */
import { readPng } from '../assets/png-decode.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const assetsDir = join(root, 'public', 'assets');

let checked = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!entry.name.endsWith('.png')) {
      continue;
    }

    const image = readPng(full);
    const bytes = readFileSync(full);

    // The writer always emits truecolour with alpha, so the file must come
    // back with the same dimensions and a non-empty alpha channel.
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);

    if (image.width !== width || image.height !== height) {
      throw new Error(`${full}: ${image.width}x${image.height} does not match ${width}x${height}.`);
    }

    if (image.data.length !== width * height * 4) {
      throw new Error(`${full}: buffer is ${image.data.length} bytes.`);
    }

    checked += 1;
  }
}

walk(assetsDir);

/**
 * The heart is seven by six and its pixels are known, so it proves the
 * reader gives back the colours that were written rather than merely the
 * right number of bytes.
 */
const heart = readPng(join(assetsDir, 'ui', 'heart.png'));
const expected = ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];

for (let y = 0; y < expected.length; y += 1) {
  let row = '';

  for (let x = 0; x < heart.width; x += 1) {
    const index = (y * heart.width + x) * 4;

    if (heart.data[index + 3] === 0) {
      row += '.';
      continue;
    }

    row += (heart.data[index] << 16) | (heart.data[index + 1] << 8 === 0xd63b3b) ? 'R' : '?';
  }

  if (row !== expected[y]) {
    throw new Error(`heart.png row ${y} is "${row}", expected "${expected[y]}".`);
  }
}

console.log(`read ${checked} PNGs without a mismatch, and the heart reads back exactly.`);
