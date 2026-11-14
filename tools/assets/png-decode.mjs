import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

/**
 * Reads a PNG into RGBA bytes.
 *
 * The generator can write PNGs but could not read them, which meant a
 * sprite drawn outside the repository could not be brought into the art
 * pack. This is the other half of `png.mjs`: it handles the eight bit and
 * sixteen bit forms of greyscale, truecolour, palette, and both alpha
 * variants, which is everything an exported image uses.
 */

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** How many colour channels each PNG colour type uses. */
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

export function readPng(path) {
  const buffer = readFileSync(path);

  if (!buffer.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error(`${path}: not a PNG file.`);
  }

  let header;
  const imageData = [];

  let offset = 8;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === 'PLTE') {
      header = header ?? {};
      header.palette = data;
    } else if (type === 'IDAT') {
      imageData.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length;
  }

  if (!header) {
    throw new Error(`${path}: the PNG has no header.`);
  }

  if (header.interlace !== 0) {
    throw new Error(`${path}: interlaced PNGs are not supported.`);
  }

  const channels = CHANNELS[header.colorType];

  if (channels === undefined) {
    throw new Error(`${path}: unsupported colour type ${header.colorType}.`);
  }

  const raw = inflateSync(Buffer.concat(imageData));
  const bitsPerPixel = channels * header.bitDepth;
  const stride = Math.ceil((header.width * bitsPerPixel) / 8);
  const bytesPerSample = header.bitDepth === 16 ? 2 : 1;

  const pixels = unfilter(raw, header.height, stride, bytesPerSample);
  const data = new Uint8Array(header.width * header.height * 4);

  for (let y = 0; y < header.height; y += 1) {
    for (let x = 0; x < header.width; x += 1) {
      const target = (y * header.width + x) * 4;
      const source = y * stride;

      if (header.colorType === 3) {
        const index = pixels[source + x];
        data[target] = header.palette[index * 3];
        data[target + 1] = header.palette[index * 3 + 1];
        data[target + 2] = header.palette[index * 3 + 2];
        data[target + 3] = 255;
        continue;
      }

      const sample = (channel) => {
        const at = source + x * channels * bytesPerSample + channel * bytesPerSample;

        if (header.bitDepth === 16) {
          return pixels[at] * 256 + pixels[at + 1];
        }

        if (header.bitDepth === 8) {
          return pixels[at];
        }

        // Sub-byte depths only exist for greyscale and palette images.
        const perByte = 8 / header.bitDepth;
        const shift = 8 - header.bitDepth * ((x % perByte) + 1);
        const value =
          (pixels[source + Math.floor(x / perByte)] >> shift) & ((1 << header.bitDepth) - 1);

        return value * (255 / ((1 << header.bitDepth) - 1));
      };

      if (header.colorType === 0 || header.colorType === 4) {
        const grey = sample(0);
        data[target] = grey;
        data[target + 1] = grey;
        data[target + 2] = grey;
        data[target + 3] = header.colorType === 4 ? sample(1) : 255;
        continue;
      }

      data[target] = sample(0);
      data[target + 1] = sample(1);
      data[target + 2] = sample(2);
      data[target + 3] = header.colorType === 6 ? sample(3) : 255;
    }
  }

  return { width: header.width, height: header.height, data };
}

/**
 * Undoes the per-scanline filters PNG uses to make the file compress.
 */
function unfilter(raw, height, stride, bytesPerSample) {
  const pixels = Buffer.alloc(height * stride);
  let source = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[source];
    source += 1;

    const row = y * stride;
    const previous = row - stride;

    for (let x = 0; x < stride; x += 1) {
      const value = raw[source + x];
      const left = x >= bytesPerSample ? pixels[row + x - bytesPerSample] : 0;
      const up = y > 0 ? pixels[previous + x] : 0;
      const upLeft = y > 0 && x >= bytesPerSample ? pixels[previous + x - bytesPerSample] : 0;

      let result;

      switch (filter) {
        case 0:
          result = value;
          break;
        case 1:
          result = value + left;
          break;
        case 2:
          result = value + up;
          break;
        case 3:
          result = value + Math.floor((left + up) / 2);
          break;
        case 4:
          result = value + paeth(left, up, upLeft);
          break;
        default:
          throw new Error(`Unknown PNG filter ${filter}.`);
      }

      pixels[row + x] = result & 0xff;
    }

    source += stride;
  }

  return pixels;
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const distanceLeft = Math.abs(estimate - left);
  const distanceUp = Math.abs(estimate - up);
  const distanceUpLeft = Math.abs(estimate - upLeft);

  if (distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft) {
    return left;
  }

  if (distanceUp <= distanceUpLeft) {
    return up;
  }

  return upLeft;
}
