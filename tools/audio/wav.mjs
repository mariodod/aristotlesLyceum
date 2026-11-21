/**
 * A tiny WAV writer. The game's audio is generated from code, like its
 * art: no binary asset is hand-made and the output is reproducible.
 *
 * Only the 16-bit mono PCM format the browser decodes everywhere is
 * needed, so the header is fixed and short.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Writes a 16-bit mono PCM WAV file.
 *
 * @param {string} path
 * @param {{ samples: Float64Array, sampleRate: number }} audio
 * @returns {number} the number of bytes written
 */
export function writeWav(path, audio) {
  const { samples, sampleRate } = audio;
  const dataBytes = samples.length * 2;
  const header = Buffer.alloc(44);
  const bytes = Buffer.alloc(dataBytes);

  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index] ?? 0));
    bytes.writeInt16LE(Math.round(clamped * 32767), index * 2);
  }

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(dataBytes, 40);

  const file = Buffer.concat([header, bytes]);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, file);
  return file.length;
}
