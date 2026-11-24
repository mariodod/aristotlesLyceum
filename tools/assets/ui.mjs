import { Canvas } from './pixel.mjs';
import { COMMON, LIBRARY } from './palette.mjs';

/**
 * The scroll the player moves through menus. A heart is the genre's default,
 * but this game is about what Aristotle wrote down, so the cursor is a roll
 * of parchment tied with a brass ribbon. The dark rod and the cream sheet
 * keep it distinct from the Codex book that shares the choice margin.
 */
const SCROLL = ['.SSSSS.', 'SPPPPPS', 'SPBRBPS', 'SPBRBPS', 'SPPPPPS', '.SSSSS.'];

/**
 * The book that marks a choice the player can answer because they read the
 * Codex. Same size as the cursor: a small solid sprite, so the menu says why
 * an option is there without a line of text.
 */
const BOOK = ['.CCCCC.', 'CPPPCPC', 'CPPPCPC', 'CPPPCPC', 'CPPPCPC', '.CCCCC.'];

export const UI_ASSETS = [
  {
    key: 'ui-cursor',
    url: 'assets/ui/cursor.png',
    canvas: (() => {
      const canvas = new Canvas(7, 6);
      canvas.drawMap(SCROLL, {
        S: LIBRARY.book,
        P: LIBRARY.scroll,
        B: LIBRARY.brass,
        R: LIBRARY.light,
      });
      return canvas;
    })(),
  },
  {
    key: 'ui-book',
    url: 'assets/ui/book.png',
    canvas: (() => {
      const canvas = new Canvas(7, 6);
      canvas.drawMap(BOOK, { C: LIBRARY.book, P: COMMON.cream });
      return canvas;
    })(),
  },
];
