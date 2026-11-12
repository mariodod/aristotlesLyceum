import { Canvas, mix } from './pixel.mjs';
import { BEDROOM, LYCEUM } from './palette.mjs';

/**
 * Ordered 4x4 Bayer matrix. Dithering two colours against this threshold
 * gives a smooth-looking gradient that is still made of flat pixels, which is
 * the only kind of gradient that belongs in pixel art.
 */
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Paints a vertical gradient between two colours using ordered dithering.
 */
export function ditherGradient(canvas, x, y, width, height, top, bottom) {
  for (let row = 0; row < height; row += 1) {
    const amount = height <= 1 ? 0 : row / (height - 1);
    const color = mix(top, bottom, amount);

    for (let column = 0; column < width; column += 1) {
      const threshold = BAYER_4[row % 4][column % 4] / 16;
      canvas.set(x + column, y + row, threshold < amount ? bottom : color);
    }
  }
}

/**
 * A soft radial glow, drawn as concentric translucent ellipses.
 */
export function radialGlow(canvas, cx, cy, radius, color, strength = 0.5) {
  const steps = 7;

  for (let step = steps; step >= 1; step -= 1) {
    const t = step / steps;
    canvas.blendEllipse(
      cx,
      cy,
      radius * t,
      radius * t * 0.8,
      color,
      Math.round(255 * strength * (1 - t) * 0.6),
    );
  }
}

/**
 * Isaac's bedroom at 11:47 PM. The window is the only cold light in the
 * room; the desk lamp is the only warm one.
 *
 * Everything that matters sits above y = 230 because the dialogue box covers
 * the bottom third of the screen. A backdrop that hides its own furniture
 * behind the text box is a backdrop that never gets seen.
 */
export function bedroomBackdrop(width = 640, height = 360) {
  const canvas = new Canvas(width, height);

  ditherGradient(canvas, 0, 0, width, 232, BEDROOM.wallTop, BEDROOM.wallBottom);

  // Floor boards.
  canvas.rect(0, 232, width, height - 232, BEDROOM.floor);
  canvas.hline(0, 232, width, BEDROOM.floorLight);
  for (let y = 248; y < height; y += 14) {
    canvas.hline(0, y, width, BEDROOM.floorLight);
  }

  // Window with a night sky behind it.
  canvas.rect(392, 26, 168, 150, BEDROOM.windowFrame);
  canvas.rect(400, 34, 152, 134, 0x1c2540);
  canvas.rect(400, 34, 152, 60, 0x141c33);
  canvas.ellipse(508, 66, 15, 15, BEDROOM.moon);
  canvas.ellipse(503, 62, 12, 12, 0x1c2540);
  canvas.set(424, 50, 0xffffff);
  canvas.set(438, 86, 0xd8e4f8);
  canvas.set(466, 58, 0xd8e4f8);
  canvas.set(534, 100, 0xffffff);
  canvas.set(524, 140, 0xd8e4f8);
  canvas.vline(476, 34, 134, BEDROOM.windowFrame);
  canvas.hline(400, 98, 152, BEDROOM.windowFrame);
  radialGlow(canvas, 476, 90, 120, BEDROOM.windowGlow, 0.28);

  // Curtains.
  canvas.rect(376, 18, 16, 168, 0x2b2135);
  canvas.rect(560, 18, 16, 168, 0x2b2135);
  canvas.rect(376, 18, 4, 168, 0x382b45);
  canvas.rect(572, 18, 4, 168, 0x382b45);

  // Bookshelf on the left wall.
  canvas.rect(36, 36, 116, 196, BEDROOM.shelf);
  canvas.rect(42, 42, 104, 184, 0x241a14);
  for (let shelf = 0; shelf < 4; shelf += 1) {
    const shelfY = 42 + shelf * 45;
    canvas.rect(42, shelfY, 104, 39, 0x241a14);

    let x = 46;
    let index = 0;
    while (x < 142) {
      const bookWidth = 5 + ((shelf * 3 + index * 5) % 5);
      const bookHeight = 25 + ((shelf + index) % 3) * 4;
      const color = index % 2 === 0 ? BEDROOM.book : BEDROOM.bookAlt;
      canvas.rect(x, shelfY + 39 - bookHeight, bookWidth, bookHeight, color);
      canvas.rect(x, shelfY + 39 - bookHeight, bookWidth, 2, 0x00000033);
      x += bookWidth + 2;
      index += 1;
    }

    canvas.rect(42, shelfY + 39, 104, 4, BEDROOM.shelf);
  }

  // Poster on the wall, because every teenager has one.
  canvas.rect(238, 50, 96, 120, 0x2f2a42);
  canvas.rect(244, 56, 84, 108, 0x3b3450);
  canvas.rect(252, 68, 68, 48, 0x4d4568);
  canvas.ellipse(286, 92, 18, 18, 0x8c7fb8);
  canvas.rect(258, 128, 56, 4, 0x8c7fb8);
  canvas.rect(266, 138, 40, 4, 0x6b5f96);

  // Desk, lamp, and the book Isaac has been ignoring.
  canvas.rect(56, 196, 268, 8, BEDROOM.deskLight);
  canvas.rect(56, 204, 268, 7, BEDROOM.desk);
  canvas.rect(70, 211, 12, 84, BEDROOM.deskDark);
  canvas.rect(296, 211, 12, 84, BEDROOM.deskDark);

  // The open book, seen from slightly above.
  canvas.rect(112, 186, 40, 8, 0xd8d2c0);
  canvas.rect(152, 186, 40, 8, 0xc4bda6);
  canvas.rect(150, 184, 4, 12, 0x8a8474);
  for (let line = 0; line < 3; line += 1) {
    canvas.rect(116, 188 + line * 2, 30, 1, 0x8a8474);
    canvas.rect(158, 188 + line * 2, 28, 1, 0x8a8474);
  }

  canvas.rect(236, 186, 30, 8, BEDROOM.deskDark);
  canvas.rect(242, 166, 18, 20, BEDROOM.deskDark);
  canvas.rect(238, 158, 26, 8, BEDROOM.lamp);
  canvas.rect(238, 158, 26, 2, BEDROOM.lampGlow);
  radialGlow(canvas, 251, 156, 104, BEDROOM.lamp, 0.42);

  // Dust motes catching the lamplight.
  canvas.set(218, 140, 0xffe6a0);
  canvas.set(276, 118, 0xffe6a0);
  canvas.set(190, 96, 0xffe6a0);
  canvas.set(298, 168, 0xffe6a0);
  canvas.set(168, 154, 0xffe6a0);

  return canvas;
}

/**
 * The Lyceum outside Athens: the colonnade Aristotle walked in, with the
 * Peripatos path running beside it.
 */
export function lyceumBackdrop(width = 640, height = 360) {
  const canvas = new Canvas(width, height);

  ditherGradient(canvas, 0, 0, width, 250, LYCEUM.skyTop, LYCEUM.skyBottom);

  // Sun and the sea on the horizon.
  canvas.ellipse(540, 64, 26, 26, LYCEUM.sun);
  canvas.rect(0, 214, width, 16, LYCEUM.sea);
  canvas.rect(0, 214, width, 2, 0x4f8fb8);
  for (let x = 0; x < width; x += 8) {
    canvas.set(x, 222 + ((x / 8) % 3), 0x5fa8cf);
  }

  // Ground.
  canvas.rect(0, 230, width, height - 230, LYCEUM.ground);
  ditherGradient(canvas, 0, 230, width, 40, LYCEUM.ground, LYCEUM.groundDark);
  for (let y = 280; y < height; y += 16) {
    canvas.hline(0, y, width, LYCEUM.groundDark);
  }

  // Colonnade on the right.
  const columnX = [356, 436, 516, 596];
  for (const x of columnX) {
    canvas.rect(x, 92, 34, 150, LYCEUM.stone);
    canvas.rect(x, 92, 8, 150, LYCEUM.stoneLight);
    canvas.rect(x + 26, 92, 8, 150, LYCEUM.stoneDark);
    canvas.rect(x - 8, 76, 50, 16, LYCEUM.stoneLight);
    canvas.rect(x - 8, 76, 50, 4, 0xf2ead4);
    canvas.rect(x - 6, 92, 46, 6, LYCEUM.stoneDark);
    canvas.rect(x - 4, 236, 42, 10, LYCEUM.stoneLight);
    canvas.rect(x - 4, 236, 42, 3, 0xf2ead4);
    canvas.rect(x + 4, 246, 30, 6, LYCEUM.stoneDark);
  }

  // Entablature across the columns.
  canvas.rect(344, 58, 288, 18, LYCEUM.stone);
  canvas.rect(344, 58, 288, 4, 0xf2ead4);
  canvas.rect(344, 72, 288, 4, LYCEUM.stoneDark);

  // Olive trees on the left.
  for (const [cx, radius] of [
    [62, 46],
    [122, 34],
    [186, 26],
  ]) {
    canvas.rect(cx - 4, 168, 8, 64, 0x5e4a2e);
    canvas.ellipse(cx, 150, radius, radius * 0.72, LYCEUM.olive);
    canvas.ellipse(cx - radius * 0.3, 142, radius * 0.55, radius * 0.42, LYCEUM.oliveDark);
    canvas.ellipse(cx + radius * 0.35, 158, radius * 0.5, radius * 0.36, LYCEUM.oliveDark);
  }

  // The path itself, and the shadows the columns throw across it.
  canvas.rect(0, 288, width, 30, LYCEUM.stone);
  canvas.rect(0, 288, width, 3, 0xf2ead4);
  for (const x of columnX) {
    // A shadow on pale stone is a slightly darker stone, not a hole.
    canvas.rect(x + 30, 288, 22, 30, LYCEUM.stoneDark);
    canvas.rect(x + 30, 288, 22, 2, 0xd6c9a6);
  }

  return canvas;
}

export const BACKDROP_ASSETS = [
  {
    key: 'backdrop-bedroom',
    url: 'assets/backdrops/bedroom.png',
    canvas: bedroomBackdrop(),
  },
  {
    key: 'backdrop-lyceum',
    url: 'assets/backdrops/lyceum.png',
    canvas: lyceumBackdrop(),
  },
];
