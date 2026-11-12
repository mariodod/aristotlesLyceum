import { Canvas, mix } from './pixel.mjs';
import { BEDROOM, CLASSROOM, DOWNHOUSE, LIBRARY, LYCEUM } from './palette.mjs';

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

/**
 * The great hall of the Library of Alexandria: shelves to the ceiling, a
 * reading table, and one lamp that the whole room is lit by.
 */
export function libraryBackdrop(width = 640, height = 360) {
  const canvas = new Canvas(width, height);

  ditherGradient(canvas, 0, 0, width, 236, LIBRARY.wallTop, LIBRARY.wallBottom);
  canvas.rect(0, 236, width, height - 236, LIBRARY.floor);
  for (let y = 248; y < height; y += 14) {
    canvas.hline(0, y, width, LIBRARY.floorLight);
  }

  // The high window that lights the room from above.
  canvas.rect(286, 6, 68, 44, LIBRARY.frame);
  canvas.rect(292, 12, 56, 32, LIBRARY.light);
  canvas.rect(318, 12, 4, 32, LIBRARY.frame);
  canvas.rect(292, 26, 56, 4, LIBRARY.frame);
  radialGlow(canvas, 320, 30, 150, LIBRARY.light, 0.22);

  // Shelves, left and right, with scrolls and codices.
  for (const shelfX of [24, 456]) {
    const shelfWidth = 160;
    canvas.rect(shelfX, 20, shelfWidth, 212, LIBRARY.shelf);
    canvas.rect(shelfX + 6, 26, shelfWidth - 12, 200, LIBRARY.shelfDark);

    for (let shelf = 0; shelf < 5; shelf += 1) {
      const shelfY = 26 + shelf * 40;
      canvas.rect(shelfX + 6, shelfY, shelfWidth - 12, 36, LIBRARY.shelfDark);

      let x = shelfX + 10;
      let index = 0;
      while (x < shelfX + shelfWidth - 14) {
        const bookWidth = 4 + ((shelf * 5 + index * 3) % 4);
        const bookHeight = 22 + ((index + shelf) % 3) * 4;
        const color = (index + shelf) % 3 === 0 ? LIBRARY.scroll : LIBRARY.book;
        canvas.rect(x, shelfY + 36 - bookHeight, bookWidth, bookHeight, color);
        canvas.rect(x, shelfY + 36 - bookHeight, bookWidth, 2, 0x00000044);
        x += bookWidth + 2;
        index += 1;
      }

      canvas.rect(shelfX + 6, shelfY + 36, shelfWidth - 12, 4, LIBRARY.shelf);
    }
  }

  // The reading table, with a scroll open on it.
  canvas.rect(150, 196, 340, 10, LIBRARY.tableLight);
  canvas.rect(150, 206, 340, 8, LIBRARY.table);
  canvas.rect(166, 214, 14, 80, LIBRARY.tableDark);
  canvas.rect(460, 214, 14, 80, LIBRARY.tableDark);
  canvas.rect(250, 186, 140, 10, LIBRARY.scroll);
  canvas.rect(250, 186, 140, 3, 0xf0e6c8);
  for (let line = 0; line < 2; line += 1) {
    canvas.rect(258, 190 + line * 3, 124, 1, 0xb0a488);
  }

  // The lamp on the table.
  canvas.rect(420, 176, 26, 8, LIBRARY.brass);
  canvas.rect(426, 158, 14, 18, LIBRARY.brass);
  canvas.rect(420, 150, 26, 8, LIBRARY.flame);
  radialGlow(canvas, 433, 150, 120, LIBRARY.flame, 0.4);

  // A bust of somebody nobody remembers, in a niche.
  canvas.rect(292, 86, 56, 52, LIBRARY.niche);
  canvas.rect(298, 92, 44, 40, LIBRARY.nicheDark);
  canvas.ellipse(320, 108, 10, 12, LIBRARY.stone);
  canvas.rect(310, 120, 20, 14, LIBRARY.stone);

  return canvas;
}

/**
 * Down House: the drawing room where a very slow book was written.
 */
export function downHouseBackdrop(width = 640, height = 360) {
  const canvas = new Canvas(width, height);

  ditherGradient(canvas, 0, 0, width, 234, DOWNHOUSE.wallTop, DOWNHOUSE.wallBottom);
  canvas.rect(0, 234, width, height - 234, DOWNHOUSE.floor);
  for (let y = 246; y < height; y += 12) {
    canvas.hline(0, y, width, DOWNHOUSE.floorLight);
  }

  // The window, and the garden behind it.
  canvas.rect(40, 28, 132, 140, DOWNHOUSE.frame);
  canvas.rect(46, 34, 120, 128, DOWNHOUSE.garden);
  canvas.rect(46, 34, 120, 46, DOWNHOUSE.sky);
  canvas.ellipse(130, 56, 12, 12, DOWNHOUSE.sun);
  for (const [cx, radius] of [
    [70, 22],
    [104, 15],
  ]) {
    canvas.ellipse(cx, 128, radius, radius * 0.8, DOWNHOUSE.bush);
    canvas.rect(cx - 3, 140, 6, 22, 0x5e4a2e);
  }
  canvas.vline(106, 34, 128, DOWNHOUSE.frame);
  canvas.hline(46, 94, 120, DOWNHOUSE.frame);
  canvas.rect(36, 166, 140, 8, DOWNHOUSE.sill);

  // Portraits of the family, hung too high.
  for (const [x, w, h] of [
    [214, 52, 66],
    [280, 44, 56],
    [338, 60, 72],
  ]) {
    canvas.rect(x, 34, w, h, DOWNHOUSE.gold);
    canvas.rect(x + 4, 38, w - 8, h - 8, DOWNHOUSE.portrait);
    canvas.ellipse(x + w / 2, 38 + (h - 8) * 0.4, 9, 11, DOWNHOUSE.paint);
    canvas.rect(x + w / 2 - 7, 38 + (h - 8) * 0.66, 14, 12, DOWNHOUSE.paint);
  }

  // A bookcase on the right.
  canvas.rect(452, 40, 168, 192, DOWNHOUSE.wood);
  canvas.rect(458, 46, 156, 180, DOWNHOUSE.woodDark);
  for (let shelf = 0; shelf < 4; shelf += 1) {
    const shelfY = 46 + shelf * 45;
    canvas.rect(458, shelfY, 156, 40, DOWNHOUSE.woodDark);

    let x = 462;
    let index = 0;
    while (x < 606) {
      const bookWidth = 5 + ((shelf * 3 + index * 5) % 5);
      const bookHeight = 24 + ((shelf + index) % 3) * 4;
      const color = (index + shelf) % 3 === 0 ? DOWNHOUSE.red : DOWNHOUSE.book;
      canvas.rect(x, shelfY + 40 - bookHeight, bookWidth, bookHeight, color);
      canvas.rect(x, shelfY + 40 - bookHeight, bookWidth, 2, 0x00000033);
      x += bookWidth + 2;
      index += 1;
    }

    canvas.rect(458, shelfY + 40, 156, 4, DOWNHOUSE.wood);
  }

  // The writing desk, with specimens on it.
  canvas.rect(180, 190, 220, 10, DOWNHOUSE.wood);
  canvas.rect(180, 200, 220, 7, DOWNHOUSE.woodDark);
  canvas.rect(196, 207, 12, 60, DOWNHOUSE.woodDark);
  canvas.rect(372, 207, 12, 60, DOWNHOUSE.woodDark);

  // A shell, a skull, and a stack of notes.
  canvas.rect(230, 184, 34, 6, DOWNHOUSE.paper);
  canvas.rect(232, 180, 30, 4, DOWNHOUSE.paper);
  canvas.ellipse(296, 186, 12, 8, DOWNHOUSE.bone);
  canvas.ellipse(300, 182, 7, 6, DOWNHOUSE.bone);
  canvas.rect(330, 180, 24, 10, DOWNHOUSE.bone);
  canvas.rect(330, 180, 24, 3, DOWNHOUSE.boneDark);

  // The lamp.
  canvas.rect(420, 176, 24, 6, DOWNHOUSE.brass);
  canvas.rect(426, 158, 12, 18, DOWNHOUSE.brass);
  canvas.rect(418, 142, 28, 16, DOWNHOUSE.shade);
  canvas.rect(418, 142, 28, 4, 0xf0e0b0);
  radialGlow(canvas, 432, 146, 118, 0xffd894, 0.4);

  return canvas;
}

/**
 * The classroom. Fluorescent light, a whiteboard, and a clock that is
 * counting down the minutes of Isaac's whole life.
 */
export function classroomBackdrop(width = 640, height = 360) {
  const canvas = new Canvas(width, height);

  ditherGradient(canvas, 0, 0, width, 230, CLASSROOM.wallTop, CLASSROOM.wallBottom);
  canvas.rect(0, 230, width, height - 230, CLASSROOM.floor);
  for (let y = 242; y < height; y += 10) {
    canvas.hline(0, y, width, CLASSROOM.floorLight);
  }

  // Fluorescent tubes.
  for (const x of [120, 420]) {
    canvas.rect(x, 12, 100, 8, CLASSROOM.tube);
    canvas.rect(x, 12, 100, 3, 0xffffff);
    radialGlow(canvas, x + 50, 16, 130, CLASSROOM.tube, 0.3);
  }

  // The whiteboard, with a half-erased argument on it.
  canvas.rect(196, 40, 248, 124, CLASSROOM.boardFrame);
  canvas.rect(202, 46, 236, 112, CLASSROOM.board);
  canvas.rect(202, 152, 236, 6, CLASSROOM.boardFrame);
  canvas.rect(210, 62, 96, 4, CLASSROOM.chalk);
  canvas.rect(210, 76, 140, 4, CLASSROOM.chalk);
  canvas.rect(210, 90, 78, 4, CLASSROOM.chalk);
  canvas.rect(210, 112, 54, 4, CLASSROOM.chalkFaint);
  canvas.rect(300, 104, 110, 4, CLASSROOM.chalkFaint);

  // The clock.
  canvas.ellipse(560, 52, 24, 24, CLASSROOM.clock);
  canvas.ellipse(560, 52, 19, 19, CLASSROOM.clockFace);
  canvas.rect(559, 40, 2, 12, CLASSROOM.ink);
  canvas.rect(560, 51, 10, 2, CLASSROOM.ink);

  // A door.
  canvas.rect(30, 62, 76, 168, CLASSROOM.door);
  canvas.rect(30, 62, 76, 4, CLASSROOM.doorFrame);
  canvas.rect(44, 80, 48, 44, CLASSROOM.doorGlass);
  canvas.rect(88, 140, 6, 6, CLASSROOM.brass);

  // Rows of desks, going back.
  for (let row = 0; row < 3; row += 1) {
    const y = 196 + row * 28;
    const inset = row * 14;
    for (let desk = 0; desk < 3; desk += 1) {
      const x = 150 + inset + desk * 130;
      canvas.rect(x, y, 96, 8, CLASSROOM.desk);
      canvas.rect(x, y + 8, 96, 3, CLASSROOM.deskDark);
      canvas.rect(x + 6, y + 11, 7, 22, CLASSROOM.deskDark);
      canvas.rect(x + 82, y + 11, 7, 22, CLASSROOM.deskDark);
    }
  }

  // A poster nobody has read.
  canvas.rect(520, 96, 92, 66, CLASSROOM.poster);
  canvas.rect(526, 102, 80, 54, CLASSROOM.posterInner);
  canvas.rect(534, 112, 52, 4, CLASSROOM.chalk);
  canvas.rect(534, 124, 64, 4, CLASSROOM.chalk);
  canvas.rect(534, 136, 40, 4, CLASSROOM.chalk);

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
  {
    key: 'backdrop-library',
    url: 'assets/backdrops/library.png',
    canvas: libraryBackdrop(),
  },
  {
    key: 'backdrop-down-house',
    url: 'assets/backdrops/down-house.png',
    canvas: downHouseBackdrop(),
  },
  {
    key: 'backdrop-classroom',
    url: 'assets/backdrops/classroom.png',
    canvas: classroomBackdrop(),
  },
];
