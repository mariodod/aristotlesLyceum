import { Canvas } from './pixel.mjs';
import { COMMON, LIBRARY } from './palette.mjs';

/**
 * The heart the player moves through menus. Undertale-style games lean on it
 * hard, so it ships as a real sprite rather than a shape drawn at runtime.
 */
const HEART = ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];

/**
 * The book that marks a choice the player can answer because they read the
 * Codex. Same shape language as the heart: a small solid sprite, so the
 * menu says why an option is there without a line of text.
 */
const BOOK = ['.CCCCC.', 'CPPPCPC', 'CPPPCPC', 'CPPPCPC', 'CPPPCPC', '.CCCCC.'];

export const UI_ASSETS = [
  {
    key: 'ui-heart',
    url: 'assets/ui/heart.png',
    canvas: (() => {
      const canvas = new Canvas(7, 6);
      canvas.drawMap(HEART, { R: 0xd63b3b, r: 0xa32222 });
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
