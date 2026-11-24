/**
 * Checks the PNG reader against the PNGs the generator wrote.
 *
 * If the reader and the writer disagree by a single pixel, a sprite brought
 * in from outside the repository would come out subtly wrong, and nobody
 * would notice until the character looked wrong on the stage.
 */
import { readPng } from '../assets/png-decode.mjs';
import { LIBRARY } from '../assets/palette.mjs';
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
 * The scroll cursor is seven by six and its pixels are known, so it proves the
 * reader gives back the colours that were written rather than merely the
 * right number of bytes.
 */
const symbols = {
  [LIBRARY.book]: 'S',
  [LIBRARY.scroll]: 'P',
  [LIBRARY.brass]: 'B',
};
const cursor = readPng(join(assetsDir, 'ui', 'cursor.png'));
const expected = [
  '..SSSSSS..',
  '.BBSSSSBB.',
  '..PPPPPP..',
  '..PPPPPP..',
  '..PPPPPP..',
  '..PPPPPP..',
  '..PPPPPP..',
  '..PPPPPP..',
  '.BBSSSSBB.',
  '..SSSSSS..',
];

for (let y = 0; y < expected.length; y += 1) {
  let row = '';

  for (let x = 0; x < cursor.width; x += 1) {
    const index = (y * cursor.width + x) * 4;

    if (cursor.data[index + 3] === 0) {
      row += '.';
      continue;
    }

    const rgb = (cursor.data[index] << 16) | (cursor.data[index + 1] << 8) | cursor.data[index + 2];
    row += symbols[rgb] ?? '?';
  }

  if (row !== expected[y]) {
    throw new Error(`cursor.png row ${y} is "${row}", expected "${expected[y]}".`);
  }
}

console.log(`read ${checked} PNGs without a mismatch, and the scroll cursor reads back exactly.`);
