/**
 * The shape of a locale.
 *
 * A locale is a pair of catalogues: one for the words the game itself says
 * (menus, labels, the names of characters) and one for the words the story
 * says (dialogue and the Codex).
 *
 * The English story lives inline in the scripts, so the English content
 * catalogue is empty and the scripts are the fallback. Every other language
 * ships a content catalogue with the same keys.
 */

export type LocaleId = string;

/** A flat map of message key to the text in that language. */
export type MessageCatalog = Record<string, string>;

/**
 * The metrics a bitmap font has to have before the layout can rely on it.
 *
 * The dialogue box wraps on a fixed character count, which is only correct
 * while every glyph is the same width. A locale that needs a different font
 * declares its advance here, and the box works out how many characters fit.
 */
export interface FontMetrics {
  /** The width of one character, in pixels. */
  advance: number;
  /** The height of one line, in pixels. */
  lineHeight: number;
}

export interface LocaleDefinition {
  id: LocaleId;
  /** The name of the language, written in that language. */
  name: string;
  /** The bitmap font used to draw this locale. */
  fontKey: string;
  /** The writing direction. The layout is left to right for now. */
  direction: 'ltr' | 'rtl';
  /** The words the game says. */
  ui: MessageCatalog;
  /** The words the story says. */
  content: MessageCatalog;
}

/**
 * The metrics of every font the game knows about.
 *
 * A locale that needs a font the game does not have yet adds it here, adds
 * the atlas to the manifest, and nothing else changes.
 */
export const FONT_METRICS: Record<string, FontMetrics> = {
  'pixel-5x7': { advance: 7, lineHeight: 10 },
};

/**
 * The metrics of a font, with a sensible default so a missing entry breaks
 * the layout rather than the game.
 */
export function metricsFor(fontKey: string): FontMetrics {
  return FONT_METRICS[fontKey] ?? { advance: 7, lineHeight: 10 };
}
