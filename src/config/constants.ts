export const GAME_TITLE = "Aristotle's Lyceum";
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const APP_VERSION = __APP_VERSION__;

/** Bitmap font key produced by `npm run assets`. */
export const FONT_KEY = 'pixel-5x7';

/**
 * The dialogue box geometry. Everything else in the game is positioned
 * relative to the bottom of the screen so the stage can change without
 * touching the text layout.
 */
export const TEXTBOX = {
  x: 16,
  y: 250,
  width: 608,
  height: 110,
  paddingX: 12,
  paddingY: 16,
  borderWidth: 2,
} as const;

/**
 * Characters per line. The generated font advances 7 pixels per glyph and
 * the box leaves room for 608 - 24 pixels of padding.
 */
export const TEXT_COLUMNS = 82;

/** Maximum lines the box can show before the script is expected to split. */
export const MAX_TEXT_LINES = 7;

export const SAVE_KEY = 'aristotles-lyceum.save.v1';
export const SETTINGS_KEY = 'aristotles-lyceum.settings.v1';
