/**
 * The geometry of the panels that hold text.
 *
 * The numbers live here, in one place, because two other things need them:
 * the scenes that draw the panels, and the linters that prove a line fits
 * inside one. A rule that only the scene knows about is a rule nobody
 * checks.
 */

/**
 * The dialogue box geometry. Everything else in the game is positioned
 * relative to the bottom of the screen so the stage can change without
 * touching the text layout.
 */
const TEXTBOX = {
  x: 16,
  y: 250,
  width: 608,
  height: 110,
  paddingX: 12,
  paddingY: 16,
  borderWidth: 2,
} as const;

/**
 * The geometry of the standard dialogue box.
 *
 * The battle uses a narrower one, so the geometry is data rather than a
 * constant.
 */
export interface TextBoxGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  borderWidth: number;
  /**
   * The width of one character in the font the player chose.
   *
   * The box works out how many characters fit from this, so a locale with a
   * wider font wraps differently without anything else changing.
   */
  advance: number;
}

/** The geometry of the standard dialogue box. */
export const DEFAULT_TEXTBOX: TextBoxGeometry = {
  ...TEXTBOX,
  advance: 7,
};

/**
 * The geometry of the battle box.
 *
 * The dialectic uses a narrower box than the dialogue, so the two geometries
 * live side by side here rather than one of them being a local in a scene.
 */
export const BATTLE_BOX: TextBoxGeometry = {
  x: 16,
  y: 196,
  width: 296,
  height: 148,
  paddingX: 10,
  paddingY: 14,
  borderWidth: 2,
  advance: 7,
};

/**
 * Pixels from the left edge of a menu label to the centre of the cursor.
 *
 * The cursor sprite is seven pixels wide, so this leaves a four-pixel gap
 * between its right edge and the text it points at. One constant keeps every
 * menu in the game pointing at its label from the same distance.
 */
export const CURSOR_OFFSET = 8;

/**
 * How many characters fit on a line of the box.
 */
export function columnsFor(geometry: TextBoxGeometry): number {
  const usable = geometry.width - geometry.paddingX * 2;

  return Math.max(8, Math.floor(usable / Math.max(1, geometry.advance)));
}

/**
 * How many lines of text the box can show.
 *
 * The text sits inside the padding, and the lines are as tall as the font
 * says, so a line that does not fit would be drawn outside the panel, over
 * the backdrop, where nobody can read it.
 */
export function maxLinesFor(geometry: TextBoxGeometry, lineHeight: number): number {
  const inner = geometry.height - geometry.paddingY * 2;

  return Math.max(1, Math.floor(inner / Math.max(1, lineHeight)));
}

/**
 * The Dream Journal's layout.
 *
 * The journal is a fixed panel with no scrolling, so a field that is too
 * long runs over the field below it. The linter uses these numbers to prove
 * that every entry, in every language, still fits.
 */
interface CodexLayout {
  /** The left edge of the text. */
  textX: number;
  /** How many characters fit on a line of the journal. */
  textColumns: number;
  /** Where the "what he said" text starts. */
  originY: number;
  /** Where the "where it runs" heading sits. */
  modernHeadingY: number;
  /** Where the "where it runs" text starts. */
  modernY: number;
  /** Where the "where he wrote it" heading sits. */
  sourcesHeadingY: number;
  /** Where the "where he wrote it" text starts. */
  sourcesY: number;
  /** Where the entry counter sits. */
  counterY: number;
}

export const CODEX_LAYOUT: CodexLayout = {
  textX: 196,
  textColumns: 58,
  originY: 78,
  modernHeadingY: 176,
  modernY: 192,
  sourcesHeadingY: 262,
  sourcesY: 278,
  counterY: 300,
};

/** The three fields of a journal entry. */
type CodexField = 'origin' | 'modern' | 'sources';

/**
 * How many lines a field of the journal is allowed.
 *
 * A field has to stop before the heading below it, so the limit is the gap
 * between the two.
 */
export function codexMaxLines(layout: CodexLayout, field: CodexField, lineHeight: number): number {
  let start: number;
  let limit: number;

  switch (field) {
    case 'origin':
      start = layout.originY;
      limit = layout.modernHeadingY;
      break;
    case 'modern':
      start = layout.modernY;
      limit = layout.sourcesHeadingY;
      break;
    case 'sources':
      start = layout.sourcesY;
      limit = layout.counterY;
      break;
  }

  return Math.max(1, Math.floor((limit - start) / Math.max(1, lineHeight)));
}
