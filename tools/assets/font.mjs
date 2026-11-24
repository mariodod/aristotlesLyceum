import { Canvas } from './pixel.mjs';

/**
 * Original 5x7 bitmap lettering. Every glyph is authored on the pixel grid so
 * the UI stays crisp at any integer scale. Widths vary per glyph; word spacing
 * is carried by the space glyph's advance.
 */
export const GLYPHS = {
  ' ': { rows: [''], advance: 6 },
  '!': { rows: ['#', '#', '#', '#', '#', '.', '#'] },
  '"': { rows: ['#.#', '#.#', '...', '...', '...', '...', '...'] },
  '#': {
    rows: ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.'],
  },
  $: {
    rows: ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'],
  },
  '%': {
    rows: ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##'],
  },
  '&': {
    rows: ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  },
  "'": { rows: ['#', '#', '.', '.', '.', '.', '.'] },
  '(': { rows: ['..#', '.#.', '#..', '#..', '#..', '.#.', '..#'] },
  ')': { rows: ['#..', '.#.', '..#', '..#', '..#', '.#.', '#..'] },
  '*': {
    rows: ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....'],
  },
  '+': {
    rows: ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  },
  ',': { rows: ['...', '...', '...', '...', '.##', '.#.', '#..'] },
  '-': {
    rows: ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  },
  '.': { rows: ['.', '.', '.', '.', '.', '.', '#'] },
  '/': {
    rows: ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  },
  0: {
    rows: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  },
  1: { rows: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'] },
  2: {
    rows: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  },
  3: {
    rows: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  },
  4: {
    rows: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  },
  5: {
    rows: ['#####', '#....', '#....', '####.', '....#', '....#', '####.'],
  },
  6: {
    rows: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  },
  7: {
    rows: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  },
  8: {
    rows: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  },
  9: {
    rows: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  },
  ':': { rows: ['.', '#', '.', '.', '.', '#', '.'] },
  ';': { rows: ['...', '.#.', '...', '...', '...', '.#.', '#..'] },
  '<': {
    rows: ['...#.', '..#..', '.#...', '#....', '.#...', '..#..', '...#.'],
  },
  '=': {
    rows: ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  },
  '>': {
    rows: ['.#...', '..#..', '...#.', '....#', '...#.', '..#..', '.#...'],
  },
  '?': {
    rows: ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  },
  '@': {
    rows: ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.###.'],
  },
  A: {
    rows: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  },
  B: {
    rows: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  },
  C: {
    rows: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  },
  D: {
    rows: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  },
  E: {
    rows: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  },
  F: {
    rows: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  },
  G: {
    rows: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  },
  H: {
    rows: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  },
  I: { rows: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'] },
  J: {
    rows: ['..###', '....#', '....#', '....#', '#...#', '#...#', '.###.'],
  },
  K: {
    rows: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  },
  L: {
    rows: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  },
  M: {
    rows: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  },
  N: {
    rows: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  },
  O: {
    rows: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  },
  P: {
    rows: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  },
  Q: {
    rows: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  },
  R: {
    rows: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  },
  S: {
    rows: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  },
  T: {
    rows: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  },
  U: {
    rows: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  },
  V: {
    rows: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  },
  W: {
    rows: ['#...#', '#...#', '#...#', '#...#', '#.#.#', '##.##', '#...#'],
  },
  X: {
    rows: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  },
  Y: {
    rows: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  },
  Z: {
    rows: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  },
  '[': { rows: ['###', '#..', '#..', '#..', '#..', '#..', '###'] },
  '\\': {
    rows: ['#....', '#....', '.#...', '..#..', '...#.', '....#', '....#'],
  },
  ']': { rows: ['###', '..#', '..#', '..#', '..#', '..#', '###'] },
  '^': {
    rows: ['..#..', '.#.#.', '#...#', '.....', '.....', '.....', '.....'],
  },
  _: {
    rows: ['.....', '.....', '.....', '.....', '.....', '.....', '#####'],
  },
  '`': { rows: ['#..', '.#.', '...', '...', '...', '...', '...'] },
  a: {
    rows: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  },
  b: {
    rows: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
  },
  c: {
    rows: ['.....', '.....', '.###.', '#....', '#....', '#....', '.###.'],
  },
  d: {
    rows: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
  },
  e: {
    rows: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
  },
  f: { rows: ['..##', '.#..', '####', '.#..', '.#..', '.#..', '.#..'] },
  g: {
    rows: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  },
  h: {
    rows: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'],
  },
  i: { rows: ['.#.', '...', '##.', '.#.', '.#.', '.#.', '###'] },
  j: {
    rows: ['..#', '...', '..#', '..#', '..#', '..#', '..#', '..#', '##.'],
  },
  k: {
    rows: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.'],
  },
  l: { rows: ['##.', '.#.', '.#.', '.#.', '.#.', '.#.', '###'] },
  m: {
    rows: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
  },
  n: {
    rows: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#'],
  },
  o: {
    rows: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  },
  p: {
    rows: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
  },
  q: {
    rows: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
  },
  r: {
    rows: ['.....', '.....', '#.##.', '##...', '#....', '#....', '#....'],
  },
  s: {
    rows: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  },
  t: { rows: ['.#.', '.#.', '###', '.#.', '.#.', '.#.', '..#'] },
  u: {
    rows: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####'],
  },
  v: {
    rows: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  },
  w: {
    rows: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  },
  x: {
    rows: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  },
  y: {
    rows: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  },
  z: {
    rows: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
  },
  '{': { rows: ['..##', '.#..', '.#..', '#...', '.#..', '.#..', '..##'] },
  '|': { rows: ['#', '#', '#', '#', '#', '#', '#'] },
  '}': { rows: ['##..', '..#.', '..#.', '...#', '..#.', '..#.', '##..'] },
  '~': {
    rows: ['.....', '.....', '.#..#', '#.#.#', '#..#.', '.....', '.....'],
  },
  // Latin-1 letters are a base glyph plus a mark above it. The base rows stay
  // untouched: an accented capital keeps its full height because the mark sits
  // in two spare rows above the cap, not in place of the cap's top two rows.
  á: { base: 'a', accent: 'acute' },
  é: { base: 'e', accent: 'acute' },
  í: { base: 'i', accent: 'acute' },
  ó: { base: 'o', accent: 'acute' },
  ú: { base: 'u', accent: 'acute' },
  ñ: { base: 'n', accent: 'tilde' },
  ü: { base: 'u', accent: 'diaeresis' },
  Á: { base: 'A', accent: 'acute' },
  É: { base: 'E', accent: 'acute' },
  Í: { base: 'I', accent: 'acute' },
  Ó: { base: 'O', accent: 'acute' },
  Ú: { base: 'U', accent: 'acute' },
  Ñ: { base: 'N', accent: 'tilde' },
  Ü: { base: 'U', accent: 'diaeresis' },
  '¿': {
    rows: ['.##', '.##', '..#', '..#', '.#.', '...', '.#.'],
  },
  '¡': {
    rows: ['.#.', '.#.', '...', '.#.', '.#.', '.#.', '.#.'],
  },
  '«': {
    rows: ['.....', '..#.#', '.#.#.', '#.#..', '.#.#.', '..#.#', '.....'],
  },
  '»': {
    rows: ['.....', '#.#..', '.#.#.', '..#.#', '.#.#.', '#.#..', '.....'],
  },
  '°': {
    rows: ['.##.', '#..#', '.##.', '.....', '.....', '.....', '.....'],
  },
  '·': {
    rows: ['.....', '.....', '.....', '..#..', '.....', '.....', '.....'],
  },
  '—': {
    rows: ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  },
  '…': {
    rows: ['.....', '.....', '.....', '.....', '.....', '.#.#.', '.#.#.'],
  },
};

/**
 * Every cell carries two rows above the cap height. Unaccented glyphs leave
 * them blank, so a mark never has to eat into the letter it sits on. The
 * rendered glyph is lifted by the same two rows (see yoffset below), which
 * keeps the body of every letter exactly where it was before.
 */
const ACCENT_ROWS = 2;
const GLYPH_HEIGHT = 7 + ACCENT_ROWS + 2;
const LINE_HEIGHT = 10;
const BASELINE_HEIGHT = 7;
const GLYPH_GAP = 1;
const ATLAS_WIDTH = 128;

const ACCENTS = {
  // Top row to the right of the bottom row: a rising stroke, not a grave.
  acute: ['...#.', '..#..'],
  tilde: ['.#.#.', '#.#.#'],
  diaeresis: ['.#.#.', '.....'],
};

function glyphRows(entry) {
  const mark = entry.accent ? ACCENTS[entry.accent] : undefined;
  const body = entry.base ? GLYPHS[entry.base].rows : entry.rows;
  const rows = [...(mark ?? ['', '']), ...body];

  while (rows.length < GLYPH_HEIGHT) {
    rows.push('');
  }

  return rows.map((row) => row.padEnd(Math.max(...rows.map((value) => value.length)), '.'));
}

/** The full atlas cell for one character, accent rows included. */
export function glyphCell(character) {
  const entry = GLYPHS[character];

  if (!entry) {
    return undefined;
  }

  const rows = glyphRows(entry);
  const width = Math.max(1, Math.max(...rows.map((row) => row.length)));

  return {
    rows,
    width,
    // Two pixels of gap. At the game's 640px width a 5px body on a 7px
    // advance gives roughly 80 characters per dialogue line, which is the
    // reading density the script format is written against.
    advance: entry.advance ?? width + 2,
  };
}

export function createPixelFont() {
  const entries = Object.entries(GLYPHS).map(([character]) => ({
    character,
    ...glyphCell(character),
  }));

  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;
  const placements = [];

  for (const entry of entries) {
    if (cursorX + entry.width + GLYPH_GAP > ATLAS_WIDTH) {
      cursorX = 0;
      cursorY += rowHeight + GLYPH_GAP;
      rowHeight = 0;
    }

    placements.push({ ...entry, x: cursorX, y: cursorY });
    cursorX += entry.width + GLYPH_GAP;
    rowHeight = Math.max(rowHeight, GLYPH_HEIGHT);
  }

  const height = cursorY + rowHeight;
  const canvas = new Canvas(ATLAS_WIDTH, height);
  const chars = [];

  for (const placement of placements) {
    placement.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] === '#') {
          canvas.set(placement.x + x, placement.y + y, 0xffffff);
        }
      }
    });

    chars.push({
      id: placement.character.codePointAt(0),
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: GLYPH_HEIGHT,
      xoffset: 0,
      // Cancel the accent rows so the letter body still starts on the same
      // scanline as the unaccented glyph it is built from.
      yoffset: -ACCENT_ROWS,
      xadvance: placement.advance,
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<font>',
    '  <info face="Lyceum Pixel" size="7" bold="0" italic="0" charset="" unicode="1" stretchH="100" smooth="0" aa="1" padding="0,0,0,0" spacing="0,0"/>',
    '  <common lineHeight="' +
      LINE_HEIGHT +
      '" base="' +
      BASELINE_HEIGHT +
      '" scaleW="128" scaleH="' +
      height +
      '" pages="1" packed="0"/>',
    '  <pages>',
    '    <page id="0" file="pixel-5x7.png"/>',
    '  </pages>',
    '  <chars count="' + chars.length + '">',
    ...chars.map(
      (char) =>
        `    <char id="${char.id}" x="${char.x}" y="${char.y}" width="${char.width}" height="${char.height}" xoffset="${char.xoffset}" yoffset="${char.yoffset}" xadvance="${char.xadvance}" page="0" chnl="15"/>`,
    ),
    '  </chars>',
    '</font>',
    '',
  ].join('\n');

  return { canvas, xml };
}
