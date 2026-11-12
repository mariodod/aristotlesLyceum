import { Canvas, sheet, validateMap } from './pixel.mjs';
import { EXPRESSION_ORDER } from '../../src/data/sprite-expressions.ts';
import { buildFaceRows } from './faces.mjs';
import { ARISTOTLE_PALETTE, ISAAC_PALETTE } from './palette.mjs';

export const CHARACTER_WIDTH = 32;
export const CHARACTER_HEIGHT = 48;

/*
 * A character is authored as three parts: the hair and crown above the face,
 * the jaw and body below it, and the shape of the face block between them.
 * The face block is the same for everybody, so an expression is authored
 * once and painted over the face of every character in the game.
 */

/**
 * Assembles a character map from its parts.
 */
function buildMap({ head, face, jaw, body }) {
  return [...head, ...buildFaceRows(face.shape, face.expression, CHARACTER_WIDTH), ...jaw, ...body];
}

/**
 * Centres a run of pixels on the character grid.
 */
function centered(content) {
  const pad = CHARACTER_WIDTH - content.length;

  if (pad < 0) {
    throw new Error(`Row of ${content.length} does not fit in ${CHARACTER_WIDTH}.`);
  }

  const left = Math.floor(pad / 2);

  return '.'.repeat(left) + content + '.'.repeat(pad - left);
}

/**
 * One row of a garment: an outline, a shaded edge at each side, and the
 * fabric in between. A `fold` puts a crease down the middle of the cloth.
 */
function drape(width, shade = 0.2, fold = -1) {
  const inner = width - 2;
  const edge = Math.max(1, Math.round(inner * shade));
  const middle = inner - edge * 2;

  let body;

  if (fold >= 0 && middle > 2) {
    body =
      'R'.repeat(edge) +
      'r'.repeat(Math.max(0, fold - edge)) +
      'R' +
      'r'.repeat(Math.max(0, middle - (fold - edge) - 1)) +
      'R'.repeat(edge);
  } else {
    body = 'R'.repeat(edge) + 'r'.repeat(middle) + 'R'.repeat(edge);
  }

  return 'o' + body + 'o';
}

/**
 * A robe that widens toward the hem. `widths` gives the width of each row.
 */
function robeBody(widths, { shade = 0.2 } = {}) {
  return [
    centered('o'.repeat(16)),
    ...widths.map((width, index) => centered(drape(width, shade, index % 6 === 3 ? 8 : -1))),
  ];
}

/**
 * A coat with a ruff collar, worn by the people who owned a good deal of
 * fabric: Bacon, Descartes, Hume and Harvey.
 */
function coatBody(widths, { shade = 0.22 } = {}) {
  return [
    centered('o'.repeat(16)),
    centered('t'.repeat(14) + 'o'),
    centered('o' + 't'.repeat(16) + 'o'),
    ...widths.map((width) => centered(drape(width, shade))),
  ];
}

/**
 * A frock coat with a wide lapel.
 */
function frockBody(widths, { shade = 0.24 } = {}) {
  return [
    centered('o'.repeat(16)),
    centered('o' + 't'.repeat(16) + 'o'),
    ...widths.map((width) => centered(drape(width, shade))),
  ];
}

/*
 * Isaac: a teenager in a hoodie, hair he has not looked at in a week, and
 * the flat black eyes the genre uses instead of pupils.
 */

const ISAAC = {
  head: [
    '................................',
    '.............oooo...............',
    '............oHHHHo..............',
    '...........oHHHHHHo.............',
    '..........oHHHHHHHHo............',
    '.........oHHhhhhhhhhHo..........',
    '........oHHhhhhhhhhhhHo.........',
    '.......oHHhhhhhhhhhhhhho........',
    '......oHHhhhhhhhhhhhhhhho.......',
    '.......oHHsssssssssssho.........',
    '.......oHssssssssssssho.........',
  ],
  face: { shape: 'plain', expression: 'neutral' },
  jaw: [
    '.......oSSssssssssSSso..........',
    '........oSSSSSSSSSSSo...........',
    '.........oSSSSSSSSSo............',
    '..........oSSSSSSSo.............',
    '..........oSSSSSSSo.............',
  ],
  body: [
    '.........oooooooooooooooo.......',
    '........otttttttttttttttto......',
    '.......ottttttttttttttttto......',
    '.......oTttttttttttttttTto......',
    '......oTTTTttttttttttTTTTo......',
    '......oTTTTttttttttttTTTTo......',
    '......oTTTTttttttttttTTTTo......',
    '......oTTttttttttttttttTTo......',
    '......oTttttttttttttttttto......',
    '.....oTTtttttttttttttttttTo.....',
    '.....oTttttttttttttttttttto.....',
    '.....oTttttttttttttttttttto.....',
    '.....oTttttttttttttttttttdo.....',
    '.....oTttttttttttttttttttdo.....',
    '.....oTttttttttttttttttttdo.....',
    '......oTdddddddddddddddddddo....',
    '......oddddddddddddddddddddo....',
    '......oooooooooooooooooooooo....',
    '........onnnnnnno.nnnnnnno......',
    '........onnnnnnno.nnnnnnno......',
    '........onnnnnnno.nnnnnnno......',
    '........onnnnnnno.nnnnnnno......',
    '........onnnnnnno.nnnnnnno......',
    '.......oNNNNNNNo.oNNNNNNNo......',
    '.......oWWWWWWWo.oWWWWWWWo......',
    '.......ooooooooo.ooooooooo......',
  ],
};

/*
 * Aristotle: the himation, the beard his students would recognise, and the
 * steady forward gaze.
 */

const ARISTOTLE = {
  head: [
    '................................',
    '.........oooooooooo.............',
    '........oHHhhhhhhHHo............',
    '.......oHHhhhhhhhhhhHHo.........',
    '......oHHhhhhhhhhhhhhhhHHo......',
    '.....oHHhhhhhhhhhhhhhhhhHHo.....',
    '.....oHHhhhhhhhhhhhhhhhhhhHo....',
    '....oHHhhhhhhhhhhhhhhhhhhhhHo...',
    '....oHHhhhhhhhhhhhhhhhhhhhhhho..',
    '.......oHHsssssssssssho.........',
    '.......oHssssssssssssho.........',
  ],
  face: { shape: 'bearded', expression: 'neutral' },
  jaw: [
    '.......oBbbbbbbbbbbbBo..........',
    '........obbbbbbbbbbbbo..........',
    '.........obbbbbbbbbo............',
    '..........obbbbbbbo.............',
    '..........obbbbbbbo.............',
  ],
  body: robeBody([
    18, 18, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 24, 24,
    26,
  ]),
};

/*
 * Avicenna: the turban, and the beard that in every portrait of him is the
 * first thing you notice.
 */

const AVICENNA = {
  head: [
    '................................',
    '..........oooooooooo............',
    '........oTTTTTTTTTTTo...........',
    '.......oTTTTTTTTTTTTTTTo........',
    '......oTTTTTTTTTTTTTTTTTo.......',
    '.....oTTTTTTTTTTTTTTTTTTTo......',
    '.....oTTTTTdddddddddTTTTTTo.....',
    '.....oTTddddddddddddddTTTo......',
    '....oTTddddddddddddddddTTTo.....',
    '....oTTddssssssssssssddTTo......',
    '....oTTdssssssssssssssdTTo......',
  ],
  face: { shape: 'bearded', expression: 'neutral' },
  jaw: [
    '.....obbbbbbbbbbbbbbbbo.........',
    '.....obbbbbbbbbbbbbbbbo.........',
    '......obbbbbbbbbbbbbbbo.........',
    '.......obbbbbbbbbbbbo...........',
    '.......obbbbbbbbbbbbo...........',
  ],
  body: robeBody([
    18, 18, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 24, 24,
    26,
  ]),
};

/*
 * A scribe of the Library of Alexandria: hooded, bearded, and about to
 * spend the next few centuries being argued with.
 */

const SCRIBE = {
  head: [
    '................................',
    '..........oooooooooo............',
    '........oHHHHHHHHHHHHo..........',
    '.......oHHHHHHHHHHHHHHo.........',
    '......oHHHHHHHHHHHHHHHHo........',
    '.....oHHHHHHHHHHHHHHHHHHo.......',
    '.....oHHHssssssssssssHHo........',
    '....oHHHssssssssssssssHHo.......',
    '....oHHssssssssssssssssHHo......',
    '....oHHsssssssssssssssssHo......',
    '....oHHsssssssssssssssssHo......',
  ],
  face: { shape: 'hooded', expression: 'neutral' },
  jaw: [
    '.....oSSsssssssssssssSo.........',
    '......oSSSSSSSSSSSSSSo..........',
    '.......oSSSSSSSSSSSo............',
    '........oSSSSSSSSSo.............',
    '........oSSSSSSSo...............',
  ],
  body: robeBody([
    18, 18, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 24, 24,
    26,
  ]),
};

/*
 * Aquinas: the Dominican habit, white tunic under a black mantle, and the
 * tonsure he is identifiable by in every portrait.
 */

const AQUINAS = {
  head: [
    '................................',
    '..........oooooo................',
    '........oHHHHHHHHo..............',
    '.......oHHHHHHHHHHo.............',
    '.......oHhhhhhhhhHo.............',
    '......oHHssssssssHHo............',
    '......oHHsssssssssHo............',
    '......oHHsssssssssHo............',
    '......oHHsssssssssHo............',
    '.......oHsssssssssHo............',
    '.......oHsssssssssHo............',
  ],
  face: { shape: 'hair', expression: 'neutral' },
  jaw: [
    '.......oSSsssssssssso...........',
    '........oSSSSSSSSSSSo...........',
    '.........oSSSSSSSSSo............',
    '..........oSSSSSSSo.............',
    '..........oSSSSSSSo.............',
  ],
  body: robeBody([
    18, 18, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 24, 24,
    26,
  ]),
};

/*
 * The coat and ruff worn by Bacon, Descartes, Hume and Harvey. They are
 * separated by two hundred years and a couple of continents, and they all
 * look like men who owned a good deal of fabric.
 */

const COAT = {
  head: [
    '................................',
    '..........oooooo................',
    '.........oHHHHHHo...............',
    '........oHHhhhhHHo..............',
    '.......oHHhhhhhhhhHo............',
    '.......oHhhhhhhhhhho............',
    '......oHHhhhhhhhhhhHo...........',
    '......oHhhhhhhhhhhhhho..........',
    '.....oHHhhhhhhhhhhhhhho.........',
    '.....oHhhhhsssssssshho..........',
    '.....oHhhhssssssssshho..........',
  ],
  face: { shape: 'hair', expression: 'neutral' },
  jaw: [
    '.....oSSsssssssssssso...........',
    '......oSSSSSSSSSSSSo............',
    '.......oSSSSSSSSSSo.............',
    '.........oSSSSSSSo..............',
    '.........oSSSSSSSo..............',
  ],
  body: coatBody([
    20, 20, 20, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24,
  ]),
};

/*
 * Darwin: the frock coat, the enormous beard, and the fact that he had
 * already begun to lose his hair.
 */

const VICTORIAN = {
  head: [
    '................................',
    '..........oooooo................',
    '.........oHHhhhhHo..............',
    '........oHhhhhhhhhHo............',
    '........oHhhhhhhhhho............',
    '.......oHhhsssssssshho..........',
    '.......oHhsssssssssho...........',
    '.......oHhsssssssssho...........',
    '.......oHhsssssssssho...........',
    '.......oHhsssssssssho...........',
    '.......oHhsssssssssho...........',
  ],
  face: { shape: 'bearded', expression: 'neutral' },
  jaw: [
    '......oBbbbbbbbbbbbBo...........',
    '......obbbbbbbbbbbbo............',
    '.......obbbbbbbbbbbo............',
    '........obbbbbbbbbo.............',
    '.........obbbbbbbo..............',
  ],
  body: frockBody([
    20, 20, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 26, 26,
  ]),
};

/*
 * Turing: a man in a shirt and tie who spent his life writing about
 * machines that could not yet be built.
 */

const SHIRT = {
  head: [
    '................................',
    '..........oooooo................',
    '.........oHHHHHHo...............',
    '........oHHhhhhHHo..............',
    '.......oHHhhhhhhhhHo............',
    '.......oHhhhhhhhhhho............',
    '......oHHhhhhhhhhhhHo...........',
    '......oHhhhhhhhhhhhhho..........',
    '.....oHHhhhhhhhhhhhhhho.........',
    '.....oHhhhhsssssssshho..........',
    '.....oHhhhssssssssshho..........',
  ],
  face: { shape: 'hair', expression: 'neutral' },
  jaw: [
    '.....oSSsssssssssssso...........',
    '......oSSSSSSSSSSSSo............',
    '.......oSSSSSSSSSSo.............',
    '.........oSSSSSSSo..............',
    '.........oSSSSSSSo..............',
  ],
  body: [
    '........oooooooooooooooo........',
    '.......offffffffffffffffo.......',
    '......offffffffffffffffffo......',
    '......offfffffttttfffffffo......',
    '......offfffffttttfffffffo......',
    '......offfffffttttfffffffo......',
    '......offfffffttttfffffffo......',
    '......offfffffttttfffffffo......',
    '......offfffffttttfffffffo......',
    '......offfffffttttfffffffo......',
    '.....offffffffttttffffffffo.....',
    '.....offfffffttttttfffffffo.....',
    '.....offfffffttttttfffffffo.....',
    '.....offffffffttttffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '.....offffffffffffffffffffo.....',
    '....offffffffffffffffffffffo....',
  ],
};

/*
 * Mrs. Okonkwo, who teaches the philosophy class and is going to read the
 * results.
 */

const TEACHER = {
  head: [
    '................................',
    '..........oooooo................',
    '.........oHHHHHHHHo.............',
    '........oHHHHHHHHHHo............',
    '.......oHHhhhhhhhhHHo...........',
    '......oHHhhhhhhhhhhhhHo.........',
    '......oHhhhhhhhhhhhhhhho........',
    '.....oHHhhhhhhhhhhhhhhhho.......',
    '.....oHHhhhhhhhhhhhhhhhho.......',
    '.....oHHssssssssssssssho........',
    '.....oHHssssssssssssssho........',
  ],
  face: { shape: 'hair', expression: 'neutral' },
  jaw: [
    '.....oSSsssssssssssssso.........',
    '......oSSSSSSSSSSSSSSo..........',
    '.......oSSSSSSSSSSSo............',
    '........oSSSSSSSSSo.............',
    '........oSSSSSSSo...............',
  ],
  body: coatBody(
    [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 24],
    { shade: 0.18 },
  ),
};

/**
 * The palettes. Every character needs the same face keys so the shared face
 * block can be painted over any of them.
 */
function faceColors(skin, skinShade, eye = 0x14121a, mouth = 0x6b3f36) {
  return {
    o: 0x14121a,
    s: skin,
    S: skinShade,
    e: 0xf6f2e8,
    p: eye,
    m: mouth,
  };
}

export const CHARACTERS_DEFS = [
  {
    key: 'char-isaac',
    url: 'assets/sprites/char-isaac.png',
    parts: ISAAC,
    colors: {
      ...faceColors(ISAAC_PALETTE.skin, ISAAC_PALETTE.skinShade),
      H: ISAAC_PALETTE.hairLight,
      h: ISAAC_PALETTE.hair,
      t: ISAAC_PALETTE.hoodie,
      T: ISAAC_PALETTE.hoodieLight,
      d: ISAAC_PALETTE.hoodieDark,
      n: ISAAC_PALETTE.pants,
      N: ISAAC_PALETTE.pantsLight,
      W: ISAAC_PALETTE.shoes,
    },
  },
  {
    key: 'char-aristotle',
    url: 'assets/sprites/char-aristotle.png',
    parts: ARISTOTLE,
    colors: {
      ...faceColors(ARISTOTLE_PALETTE.skin, ARISTOTLE_PALETTE.skinShade),
      H: ARISTOTLE_PALETTE.hairLight,
      h: ARISTOTLE_PALETTE.hair,
      b: ARISTOTLE_PALETTE.beard,
      B: ARISTOTLE_PALETTE.beardLight,
      r: ARISTOTLE_PALETTE.robe,
      R: ARISTOTLE_PALETTE.robeShade,
    },
  },
  {
    key: 'char-avicenna',
    url: 'assets/sprites/char-avicenna.png',
    parts: AVICENNA,
    colors: {
      ...faceColors(0xd6ac82, 0xb0855f),
      H: 0xd8c8a8,
      h: 0xbfae8c,
      T: 0xf0ead8,
      d: 0x4a3f2e,
      b: 0x4a3524,
      B: 0x6b4c32,
      r: 0xe4dcc4,
      R: 0xbdb396,
    },
  },
  {
    key: 'char-alexandria-scribe',
    url: 'assets/sprites/char-alexandria-scribe.png',
    parts: SCRIBE,
    colors: {
      ...faceColors(0xc99a6e, 0xa87a53),
      H: 0x8a7a5a,
      h: 0x6b5c42,
      r: 0xd8cfb4,
      R: 0xaea487,
    },
  },
  {
    key: 'char-aquinas',
    url: 'assets/sprites/char-aquinas.png',
    parts: AQUINAS,
    colors: {
      ...faceColors(0xe0b088, 0xb98b62),
      H: 0x9a8464,
      h: 0x7a6448,
      r: 0xf2eee0,
      R: 0xc8c2ae,
    },
  },
  {
    key: 'char-bacon',
    url: 'assets/sprites/char-bacon.png',
    parts: COAT,
    colors: {
      ...faceColors(0xd2a87e, 0xae8459),
      H: 0x8a8478,
      h: 0x5f5a52,
      t: 0xf2eee0,
      r: 0x3a3a44,
      R: 0x27272f,
    },
  },
  {
    key: 'char-descartes',
    url: 'assets/sprites/char-descartes.png',
    parts: COAT,
    colors: {
      ...faceColors(0xdcb68c, 0xb28a60),
      H: 0x6b5a48,
      h: 0x453a30,
      t: 0xf2eee0,
      r: 0x2c2c36,
      R: 0x1c1c24,
    },
  },
  {
    key: 'char-hume',
    url: 'assets/sprites/char-hume.png',
    parts: COAT,
    colors: {
      ...faceColors(0xd8b490, 0xae8a66),
      H: 0xd8d4cc,
      h: 0xa8a49c,
      t: 0xf2eee0,
      r: 0x4a4438,
      R: 0x322e26,
    },
  },
  {
    key: 'char-harvey',
    url: 'assets/sprites/char-harvey.png',
    parts: COAT,
    colors: {
      ...faceColors(0xd6a97c, 0xb0855a),
      H: 0x6b5340,
      h: 0x48382a,
      t: 0xefe8d8,
      r: 0x54483a,
      R: 0x3a3128,
    },
  },
  {
    key: 'char-darwin',
    url: 'assets/sprites/char-darwin.png',
    parts: VICTORIAN,
    colors: {
      ...faceColors(0xd0a67e, 0xa8845c),
      H: 0xa89c8c,
      h: 0x8a7f70,
      t: 0xefe8d8,
      b: 0xb0a698,
      B: 0x8e857a,
      r: 0x46404a,
      R: 0x2e2a33,
    },
  },
  {
    key: 'char-turing',
    url: 'assets/sprites/char-turing.png',
    parts: SHIRT,
    colors: {
      ...faceColors(0xd8b490, 0xae8a66),
      H: 0x6b5a48,
      h: 0x483a2e,
      t: 0x4a5a76,
      f: 0xe8e4da,
    },
  },
  {
    key: 'char-examiner',
    url: 'assets/sprites/char-examiner.png',
    parts: TEACHER,
    colors: {
      ...faceColors(0x8a5a3c, 0x6b4229),
      H: 0x2e2620,
      h: 0x1a1612,
      t: 0xe8dfd0,
      r: 0x6b4a7a,
      R: 0x4c3358,
    },
  },
];

/**
 * Builds the sheet for a character: the neutral idle frame, its blink, and
 * one frame per expression.
 */
export function renderCharacterFrames(definition) {
  const frames = [];

  // Frame 0 is the neutral face, frame 1 is the blink, and the rest are the
  // expressions in `EXPRESSION_ORDER`. The blink reuses the closed-eye
  // expression, which is what a blink is.
  const frameExpressions = ['neutral', 'tired', ...EXPRESSION_ORDER];

  for (const expression of frameExpressions) {
    const map = buildMap({
      head: definition.parts.head,
      face: { shape: definition.parts.face.shape, expression },
      jaw: definition.parts.jaw,
      body: definition.parts.body,
    });

    validateMap(map, CHARACTER_WIDTH, CHARACTER_HEIGHT, `${definition.key}-${expression}`);
    validatePalette(map, definition.colors, `${definition.key}-${expression}`);

    const frame = new Canvas(CHARACTER_WIDTH, CHARACTER_HEIGHT);
    frame.drawMap(map, definition.colors);
    frames.push(frame);
  }

  return frames;
}

/**
 * Every palette key a map uses has to exist, or the sprite is painted with
 * holes and the failure is invisible in the source.
 */
function validatePalette(map, colors, name) {
  for (const row of map) {
    for (const key of row) {
      if (key === '.' || key === ' ') {
        continue;
      }

      if (colors[key] === undefined) {
        throw new Error(`${name}: no palette entry for "${key}".`);
      }
    }
  }
}

export const CHARACTER_ASSETS = CHARACTERS_DEFS.map((definition) => ({
  key: definition.key,
  url: definition.url,
  frames: renderCharacterFrames(definition),
  animations: [
    { key: `${definition.key}-idle`, frames: [0, 1, 0], frameRate: 2.5, repeat: -1 },
    ...EXPRESSION_ORDER.map((expression, index) => ({
      key: `${definition.key}-${expression}`,
      frames: [2 + index],
      frameRate: 1,
      repeat: 0,
    })),
  ],
}));

export function characterSheet(frames) {
  return sheet(frames, CHARACTER_WIDTH, CHARACTER_HEIGHT);
}

/**
 * A portrait is the head of a character, doubled up. It is cheap to make
 * and it keeps the Codex consistent with the sprites.
 */
export const PORTRAIT_SOURCE = { top: 0, left: 3, width: 26, height: 26 };

export function renderPortrait(frame) {
  const { top, left, width, height } = PORTRAIT_SOURCE;
  const canvas = new Canvas(width * 2, height * 2);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = (top + y) * frame.width + (left + x);
      const index = source * 4;

      if (frame.data[index + 3] === 0) {
        continue;
      }

      const color =
        (frame.data[index] << 16) | (frame.data[index + 1] << 8) | frame.data[index + 2];

      for (let dy = 0; dy < 2; dy += 1) {
        for (let dx = 0; dx < 2; dx += 1) {
          canvas.set(x * 2 + dx, y * 2 + dy, color);
        }
      }
    }
  }

  return canvas;
}
