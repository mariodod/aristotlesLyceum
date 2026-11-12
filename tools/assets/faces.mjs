/**
 * The face block.
 *
 * Every character in the game has the same head geometry, so an expression is
 * authored once and painted over the face of every character in the game.
 * A face is six rows of twelve columns, covering rows 11 to 16 of the
 * character grid:
 *
 * ```text
 *   brow      ssssssssssss
 *   eyes   ss pp ssss pp ss
 *   eyes   ss pp ssss pp ss
 *   nose       .. SS ..
 *   mouth     .. mmmm ..
 *   mouth     ............
 * ```
 *
 * The letters are palette keys, so the same patch is painted in every
 * character's own skin and eye colours.
 */

export const FACE_WIDTH = 12;
export const FACE_HEIGHT = 6;

/** Row in the character grid where the face starts. */
export const FACE_TOP = 11;
/** Column in the character grid where the face starts. */
export const FACE_LEFT = 8;

/**
 * The expression patches. The order matches `EXPRESSION_ORDER` in
 * `src/data/sprite-expressions.ts`.
 *
 * A patch is a complete face, not an overlay: every column is painted, and
 * the blank parts are skin. A `.` here would be a hole in the head.
 */
export const EXPRESSION_PATCHES = {
  neutral: [
    'ssssssssssss',
    'ssppssssppss',
    'ssppssssppss',
    'sssssSSsssss',
    'ssssmmmmssss',
    'ssssssssssss',
  ],
  happy: [
    'ssssssssssss',
    'spsssssspsss',
    'ssppssssppss',
    'sssssSSsssss',
    'sssmssssmsss',
    'ssssmmmmssss',
  ],
  sad: [
    'ssssssssssss',
    'ssppssssppss',
    'spsssssspsss',
    'sssssSSsssss',
    'ssssmmmmssss',
    'sssmssssmsss',
  ],
  surprised: [
    'ssssssssssss',
    'sseesssseess',
    'ssppssssppss',
    'sssssSSsssss',
    'sssmmmmmmsss',
    'sssmssssmsss',
  ],
  thinking: [
    'ssssssssssss',
    'ssssppssppss',
    'ssssppssppss',
    'sssssSSsssss',
    'ssssmmmmssss',
    'ssssssssssss',
  ],
  angry: [
    'ssssssssssss',
    'spsssssspsss',
    'sppsssssspps',
    'sssssSSsssss',
    'ssssmmmmssss',
    'sssmssssmsss',
  ],
  tired: [
    'ssssssssssss',
    'ssppssssppss',
    'ssssssssssss',
    'sssssSSsssss',
    'ssssmmmmssss',
    'ssssssssssss',
  ],
  determined: [
    'ssssssssssss',
    'ssppssssppss',
    'ssppssssppss',
    'sssssSSsssss',
    'ssssmmmmssss',
    'ssssmmmmssss',
  ],
};

/**
 * The shape of the face block for the different kinds of character. A plain
 * face has an outline at each side; a bearded, hooded or long-haired face
 * has a collar of hair or cloth with the outline further out.
 */
export const FACE_SHAPES = {
  plain: { left: 'o', right: 'o', outline: false },
  bearded: { left: 'b', right: 'b', outline: true },
  hooded: { left: 'h', right: 'h', outline: true },
  hair: { left: 'H', right: 'H', outline: true },
};

/**
 * Lays an expression out as six rows of the character grid.
 *
 * The padding is computed from the face position rather than written out by
 * hand, so the row is always exactly the width of the character grid.
 */
export function buildFaceRows(shape, expression, width = 32) {
  const spec = FACE_SHAPES[shape];
  const patch = EXPRESSION_PATCHES[expression];

  if (!spec) {
    throw new Error(`Unknown face shape "${shape}".`);
  }

  if (!patch) {
    throw new Error(`No face patch for expression "${expression}".`);
  }

  for (const line of patch) {
    if (line.length !== FACE_WIDTH) {
      throw new Error(
        `Expression "${expression}" has a row of ${line.length}, expected ${FACE_WIDTH}.`,
      );
    }
  }

  const collar = spec.outline ? 1 : 0;
  const prefix = '.'.repeat(FACE_LEFT - 1 - collar);
  const suffix = '.'.repeat(width - FACE_LEFT - FACE_WIDTH - 1 - collar);

  return patch.map(
    (line) =>
      `${prefix}${spec.outline ? 'o' : ''}${spec.left}${line}${spec.right}${
        spec.outline ? 'o' : ''
      }${suffix}`,
  );
}

/**
 * Every palette key a face patch uses. A character palette has to provide
 * all of them or the face will be painted with holes.
 */
export function facePatchKeys() {
  const keys = new Set();

  for (const patch of Object.values(EXPRESSION_PATCHES)) {
    for (const line of patch) {
      for (const key of line) {
        keys.add(key);
      }
    }
  }

  return keys;
}
