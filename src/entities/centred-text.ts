import type Phaser from 'phaser';
import { FONT_KEY, GAME_WIDTH } from '../config/constants.ts';

/**
 * Text in the middle of the screen, on a whole pixel.
 *
 * A bitmap text with a centred origin starts half a pixel off whenever the
 * text is an odd number of pixels wide. The browser resamples the canvas
 * with subpixel antialiasing, and a glyph that starts between two pixels
 * gets split across the colour channels: the "I" in BEGIN THE DREAM came out
 * as a smear while SETTINGS, which starts on a whole pixel, stayed crisp.
 *
 * So the text is placed by its left edge, on a whole pixel, and centred by
 * hand.
 */
export function centredText(
  scene: Phaser.Scene,
  y: number,
  content: string,
  options: { centre?: number; scale?: number } = {},
): Phaser.GameObjects.BitmapText {
  const centre = options.centre ?? GAME_WIDTH / 2;
  const scale = options.scale ?? 1;
  const text = scene.add.bitmapText(0, y, FONT_KEY, content).setOrigin(0, 0).setScale(scale);

  text.x = Math.round(centre - text.displayWidth / 2);

  return text;
}

/**
 * Moves a piece of text so that it starts on a whole pixel.
 *
 * The same rule as `centredText`, for text that is already placed and only
 * needs snapping.
 */
export function snapToWholePixel(
  text: Phaser.GameObjects.BitmapText,
  centre: number = GAME_WIDTH / 2,
): void {
  text.setOrigin(0, 0);
  text.x = Math.round(centre - text.displayWidth / 2);
}
