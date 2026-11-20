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

/**
 * One row of a body, placed at a column of the character grid.
 *
 * A body is described by what is in it rather than by counting the dots
 * around it, so a row cannot come out one pixel too long.
 */
function row(content, left = 0) {
  if (left + content.length > CHARACTER_WIDTH) {
    throw new Error(`Row of ${content.length} at ${left} does not fit in ${CHARACTER_WIDTH}.`);
  }

  return '.'.repeat(left) + content + '.'.repeat(CHARACTER_WIDTH - left - content.length);
}

/**
 * Paints a run of one character down a column.
 */
function paintColumn(rows, column, top, bottom, character) {
  for (let y = top; y <= bottom; y += 1) {
    const row = rows[y];

    if (row === undefined || column < 0 || column >= row.length) {
      continue;
    }

    rows[y] = row.slice(0, column) + character + row.slice(column + 1);
  }
}

/**
 * Paints a small shape into the rows, the way the face block is painted
 * into the head.
 */
function paintShape(rows, shape, left, top) {
  shape.forEach((line, y) => {
    [...line].forEach((token, x) => {
      if (token === '.') {
        return;
      }

      const row = rows[top + y];

      if (row === undefined) {
        return;
      }

      rows[top + y] = row.slice(0, left + x) + token + row.slice(left + x + 1);
    });
  });
}

/**
 * An open hand, palm up, with the fingers spread.
 */
const OPEN_HAND = ['s.ss', 'ssss', 's..s', '.oo.'];

/**
 * A scroll held low in a hand, the way a scroll is held: horizontally.
 */
const SCROLL = ['oyyyoss', 'oyyyoss', 'oooooos'];

/**
 * The arms of a character who holds a scroll in one hand and makes a point
 * with the other.
 *
 * The arms are painted over the garment rather than woven into it, so a
 * garment can still be described by its widths. The raised arm is bent: the
 * sleeve runs down from the shoulder to the elbow, the forearm comes back
 * up, and the hand is open above it. The arm stands clear of the body,
 * because an arm against a body of the same colour is not an arm.
 */
function withArms(rows, { cloth, cuff, skin, sleeveColumn }) {
  const out = [...rows];

  // The raised arm: the sleeve from the shoulder to the elbow.
  paintColumn(out, sleeveColumn, 2, 9, cloth);
  paintColumn(out, sleeveColumn + 1, 2, 9, cloth);

  // The cuff at the elbow, in the colour of the trim.
  paintColumn(out, sleeveColumn, 9, 9, cuff);
  paintColumn(out, sleeveColumn + 1, 9, 9, cuff);

  // The forearm comes back up, bare, and the hand is open above it.
  paintColumn(out, sleeveColumn + 2, 6, 8, skin);
  paintColumn(out, sleeveColumn + 3, 3, 8, skin);
  paintShape(out, OPEN_HAND, sleeveColumn + 2, 0);

  // The scroll arm: the sleeve down the side, the hand at the end of it.
  paintColumn(out, 5, 2, 12, cloth);
  paintColumn(out, 6, 2, 12, cloth);
  paintShape(out, SCROLL, 2, 11);

  return out;
}

/**
 * A band of one colour down the right of a garment.
 *
 * The himation hangs from one shoulder to the hem, and it follows the edge
 * of the cloth as the cloth widens.
 */
function withBand(rows, colour, width) {
  return rows.map((row) => {
    const edge = row.replace(/\.+$/, '').length - 1;

    if (edge < width + 1) {
      return row;
    }

    const right = edge - 1;
    const left = right - width + 1;

    return row.slice(0, left) + colour.repeat(width) + row.slice(right + 1);
  });
}

/**
 * The gold at the hem of a tunic.
 */
function withHem(rows, colour) {
  const out = [...rows];
  const row = out[out.length - 1];

  if (row === undefined) {
    return out;
  }

  const start = row.search(/[^.]/);
  const end = row.replace(/\.+$/, '').length - 1;

  if (start < 0 || end - start < 3) {
    return out;
  }

  // The interior of the last row, between the two outlines.
  out[out.length - 1] = row.slice(0, start + 1) + colour.repeat(end - start - 1) + row.slice(end);

  return out;
}

/*
 * Isaac: a teenager with hair he has not looked at in a week, a backpack he
 * has not taken off since September, and a copy of Aristotle he has been
 * reading all night. The scroll is still in his other hand.
 */

const ISAAC = {
  head: [
    '................................',
    '..........oooooo................',
    '.........oHHHHHHo...............',
    '........oHHhhhhHHo..............',
    '.......oHHhhhhhhhhHo............',
    '......oHHhhHHhhHHhhHo...........',
    '.....oHHhhHHhhHHhhhhho..........',
    '.....oHhhhhhhhhhhhhhhho.........',
    '.....oHHsssssssssssssho.........',
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
  body: withArms(
    [
      // The collar of the shirt, and the V of the sweater under it.
      row('owwwweeeeewwwwo', 7),
      row('owwwweeeeeewwwwo', 7),
      row('owwweeeeeeeewwwo', 7),
      // The sweater.
      row('ottttttttttttto', 7),
      row('ottttttttttttto', 7),
      row('oTtttttttttttto', 7),
      row('oTtttttttttttto', 7),
      row('oTtttttttttttto', 7),
      row('oTtttttttttttto', 7),
      row('oTtttttttttttto', 7),
      row('oTtttttttttttto', 7),
      // The strap of the backpack, over his shoulder.
      row('otttttttttttkko', 7),
      row('otttttttttttkko', 7),
      row('otttttttttttkko', 7),
      row('otttttttttttkko', 7),
      // The belt.
      row('odddddddddddddo', 7),
      // The jeans, and then the shins.
      row('onnnnnnno.nnnnnno', 8),
      row('onnnnnnno.nnnnnno', 8),
      row('onnnnnnno.nnnnnno', 8),
      row('onnnnnnno.nnnnnno', 8),
      row('oNnnnnnno.Nnnnnnno', 8),
      row('oNnnnnnno.Nnnnnnno', 8),
      row('onnnnnnno.nnnnnno', 8),
      row('onnnnnnno.nnnnnno', 8),
      // The sneakers.
      row('oWwwwwwwWo.oWwwwwwwWo', 8),
      row('ooooooooo.ooooooooo', 8),
    ],
    { cloth: 't', cuff: 'd', skin: 's', sleeveColumn: 21 },
  ),
};

/*
 * Aristotle: the silver hair his students would recognise, the beard he
 * never bothered to trim, and the himation he wears over a tunic of the
 * purple he liked. He is holding the scroll he is quoting, and his other
 * hand is making the point.
 */

const ARISTOTLE = {
  head: [
    '................................',
    '.........oooooooooo.............',
    '........oHHhhhhhhHHo............',
    '.......oHHhhhhhhhhhhHHo.........',
    '......oHHhhhHHHHhhhhhHo.........',
    '.....oHHhhhhhHHHHhhhhhhHo.......',
    '.....oHHhhhhHHHHhhhhhhhhHo......',
    '....oHHhhhhhhHHHHhhhhhhhHo......',
    '....oHHhhhhhhhhhhhhhhhhhhho.....',
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
  body: withHem(
    withArms(
      withBand(
        robeBody([
          18, 18, 20, 20, 20, 20, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 24,
          24, 24, 26,
        ]),
        'n',
        5,
      ),
      { cloth: 'r', cuff: 'd', skin: 's', sleeveColumn: 24 },
    ),
    'd',
  ),
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
 * Kant: the same silhouette as a professor in a coat, with a powdered wig
 * in place of hair. The face block is shared, so he reacts like everybody
 * else; only the head above it and the colours of the coat are his.
 */
const KANT = {
  ...SHIRT,
  face: { shape: 'plain', expression: 'neutral' },
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
      // The grey sweater, and the white shirt under it.
      t: 0x9aa0a8,
      T: 0xb4bac2,
      d: 0x6f767e,
      e: 0xe8e4dc,
      n: ISAAC_PALETTE.pants,
      N: ISAAC_PALETTE.pantsLight,
      W: 0xe8e4dc,
      w: 0x8a8a92,
      // The strap of the backpack.
      k: 0x4a4438,
      // The scroll he has been reading all night.
      y: 0xe0d4b4,
      Y: 0xb3a785,
    },
  },
  {
    key: 'char-aristotle',
    url: 'assets/sprites/char-aristotle.png',
    parts: ARISTOTLE,
    colors: {
      ...faceColors(ARISTOTLE_PALETTE.skin, ARISTOTLE_PALETTE.skinShade),
      // The silver hair and the silver beard.
      H: 0xd4d0c8,
      h: 0xa8a49c,
      b: 0x8e8a84,
      B: 0xb4b0a8,
      // The purple tunic, and the gold at its hem.
      r: 0x8a63b0,
      R: 0x6a4a8c,
      d: 0xd9b451,
      // The brown himation over his shoulder.
      n: 0x7a5236,
      N: 0x5c3d28,
      // The scroll he is quoting.
      y: 0xe0d4b4,
      Y: 0xb3a785,
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
  {
    key: 'char-kant',
    url: 'assets/sprites/char-kant.png',
    parts: KANT,
    colors: {
      ...faceColors(0xdcc0a0, 0xb99878),
      // The powdered wig is the whole of the silhouette.
      H: 0xd8d4cc,
      h: 0xb4b0a8,
      // A dark coat over a pale cravat.
      f: 0x3a3f4a,
      t: 0xe8e2d0,
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
