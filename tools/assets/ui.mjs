import { Canvas } from './pixel.mjs';

/**
 * The heart the player moves through menus. Undertale-style games lean on it
 * hard, so it ships as a real sprite rather than a shape drawn at runtime.
 */
const HEART = ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];

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
];
