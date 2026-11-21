/**
 * Generates the game's audio from code. Every file is a deterministic
 * function of its name, so `npm run assets` reproduces the whole pack byte
 * for byte and no binary has to be committed by hand.
 *
 * Four music moods cover the acts: the desk (quiet, cold), the Lyceum
 * (warm, questioning), the walk (wide, moving) and the exam (tense).
 * The effects are short cues for choices, codex unlocks and victories.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { writeWav } from './wav.mjs';

const RATE = 22050;

/** A seeded PRNG so a regeneration produces identical bytes. */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Attack/decay envelope, so notes do not click at their edges. */
function envelope(position, length, attack = 0.08, release = 0.2) {
  const a = Math.min(1, position / (length * attack));
  const r = Math.min(1, (length - position) / (length * release));
  return Math.max(0, Math.min(a, r));
}

function tone(frequency, seconds, options = {}) {
  const { type = 'sine', gain = 0.3, attack = 0.08, release = 0.2, seed = 1 } = options;
  const length = Math.floor(RATE * seconds);
  const samples = new Float64Array(length);
  const random = prng(seed);

  for (let index = 0; index < length; index += 1) {
    const time = index / RATE;
    const phase = 2 * Math.PI * frequency * time;
    let wave;

    if (type === 'square') {
      wave = Math.sin(phase) >= 0 ? 1 : -1;
    } else if (type === 'triangle') {
      wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
    } else if (type === 'noise') {
      wave = random() * 2 - 1;
    } else {
      wave = Math.sin(phase);
    }

    samples[index] = wave * gain * envelope(index, length, attack, release);
  }

  return samples;
}

/** Lays shorter pieces into one buffer at a given time, mixing by sum. */
function mix(lengthSeconds, pieces) {
  const samples = new Float64Array(Math.floor(RATE * lengthSeconds));

  for (const [, at, buffer] of pieces) {
    const offset = Math.floor(at * RATE);
    const limit = Math.min(buffer.length, samples.length - offset);

    for (let index = 0; index < limit; index += 1) {
      samples[offset + index] += buffer[index] ?? 0;
    }
  }

  // A gentle limiter keeps overlapping notes from clipping.
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.tanh((samples[index] ?? 0) * 0.8);
  }

  return { samples, sampleRate: RATE };
}

const SCALES = {
  desk: [196.0, 233.08, 261.63, 293.66, 349.23],
  lyceum: [220.0, 261.63, 293.66, 329.63, 392.0],
  walk: [174.61, 220.0, 261.63, 329.63, 392.0],
  exam: [164.81, 196.0, 233.08, 277.18, 311.13],
};

function music(key, bars) {
  const scale = SCALES[key];
  const beat = 0.5;
  const pieces = [];
  const random = prng(key.length * 977 + bars);

  for (let bar = 0; bar < bars; bar += 1) {
    const root = scale[bar % scale.length];
    // A soft pad under every bar.
    pieces.push([1.8, bar * 4 * beat, tone(root / 2, 1.8, { gain: 0.16, seed: bar + 1 })]);

    // A sparse melody, different for each mood.
    for (let step = 0; step < 4; step += 1) {
      if (random() < (key === 'exam' ? 0.8 : 0.6)) {
        const note = scale[Math.floor(random() * scale.length)];
        pieces.push([
          0.42,
          (bar * 4 + step) * beat,
          tone(note, 0.42, {
            type: key === 'exam' ? 'triangle' : 'sine',
            gain: 0.18,
            seed: bar * 4 + step,
          }),
        ]);
      }
    }
  }

  return mix(bars * 4 * beat, pieces);
}

const EFFECTS = {
  'choice-move': () => mix(0.08, [[0.08, 0, tone(660, 0.08, { gain: 0.25, release: 0.9 })]]),
  'choice-confirm': () =>
    mix(0.18, [[0.18, 0, tone(523.25, 0.18, { gain: 0.3, type: 'triangle' })]]),
  'codex-unlocked': () =>
    mix(0.6, [
      [0.3, 0, tone(523.25, 0.3, { gain: 0.25 })],
      [0.4, 0.16, tone(783.99, 0.4, { gain: 0.25 })],
    ]),
  'argument-won': () =>
    mix(0.9, [
      [0.3, 0, tone(392.0, 0.3, { gain: 0.25 })],
      [0.35, 0.22, tone(523.25, 0.35, { gain: 0.25 })],
      [0.5, 0.42, tone(783.99, 0.5, { gain: 0.25 })],
    ]),
  'page-turn': () =>
    mix(0.16, [[0.16, 0, tone(880, 0.16, { gain: 0.12, type: 'noise', release: 0.9 })]]),
};

const musicKeys = ['desk', 'lyceum', 'walk', 'exam'];
const assets = [];

for (const key of musicKeys) {
  const bars = 8;
  const url = `assets/audio/music-${key}.wav`;
  writeWav(join('public', url), music(key, bars));
  assets.push({
    key: `music-${key}`,
    url,
    category: 'music',
    seconds: bars * 4 * 0.5,
    volume: 0.5,
  });
}

for (const [key, make] of Object.entries(EFFECTS)) {
  const url = `assets/audio/${key}.wav`;
  const audio = make();
  writeWav(join('public', url), audio);
  assets.push({
    key,
    url,
    category: 'sfx',
    seconds: Number((audio.samples.length / RATE).toFixed(3)),
    volume: 0.7,
  });
}

const manifest = { version: 1, assets };
const path = 'src/data/audio-manifest.json';
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${assets.length} audio assets.`);
