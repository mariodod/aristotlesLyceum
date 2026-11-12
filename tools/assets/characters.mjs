import { Canvas, sheet, validateMap } from './pixel.mjs';
import { ARISTOTLE_PALETTE, ISAAC_PALETTE } from './palette.mjs';

export const CHARACTER_WIDTH = 32;
export const CHARACTER_HEIGHT = 48;

/*
 * Isaac is authored front-on: messy hair, a hoodie that swallows his hands,
 * and the flat black eyes the genre uses instead of pupils. Two frames only —
 * an open-eye idle and a blink — because the dialogue carries the acting.
 *
 * Palette keys: o outline, H/h hair, s/S skin, e eye white, p pupil,
 * t/T/d hoodie, n/N trousers, W shoes.
 */

const ISAAC_BASE = [
  '................................',
  '.............oooo...............',
  '............oHHHHo..............',
  '...........oHHHHHHo.............',
  '..........oHHHHHHHHo............',
  '.........oHHhhhhhhhhHo..........',
  '........oHHhhhhhhhhhhHo.........',
  '.......oHHhhhhhhhhhhhhho........',
  '......oHHhhhhhhhhhhhhhhho.......',
  '......oHHhhhssssssshhhho........',
  '......oHhhhssssssssssshho.......',
  '.......ohsssssssssssssho........',
  '.......osssppssppsssso..........',
  '.......osssppssppsssso..........',
  '.......ossssssssssssssso........',
  '.......ossssssssssssssso........',
  '.......ossSssssssssSsso.........',
  '.......oSSssssssssSSso..........',
  '........oSSSSSSSSSSSo...........',
  '.........oSSSSSSSSSo............',
  '..........oSSSSSSSo.............',
  '..........oSSSSSSSo.............',
  '.........oooooooooooooooo.......',
  '........otttttttttttttttto......',
  '.......ottttttttttttttttto......',
  '.......oTttttttttttttttTto......',
  '......oTTTTttttttttttTTTTo......',
  '......oTTTTttttttttttTTTTo......',
  '......oTTTTttttttttttTTTTo......',
  '......oTTttttttttttttttTTo......',
  '......oTttttttttttttttttto......',
  '.....oTTtttttttttttttttttTo.....',
  '.....oTttttttttttttttttttto.....',
  '.....oTttttttttttttttttttto.....',
  '.....oTttttttttttttttttttdo.....',
  '.....oTttttttttttttttttttdo.....',
  '.....oTttttttttttttttttttdo.....',
  '......oTdddddddddddddddddddo....',
  '......oddddddddddddddddddddo....',
  '......oooooooooooooooooooooo....',
  '........onnnnnnno.nnnnnnno......',
  '........onnnnnnno.nnnnnnno......',
  '........onnnnnnno.nnnnnnno......',
  '........onnnnnnno.nnnnnnno......',
  '........onnnnnnno.nnnnnnno......',
  '.......oNNNNNNNo.oNNNNNNNo......',
  '.......oWWWWWWWo.oWWWWWWWo......',
  '.......ooooooooo.ooooooooo......',
];

const ISAAC_BLINK_ROWS = {
  12: '.......osssssssssssssso.........',
  13: '.......osssppppppsssso..........',
  14: '.......osssssssssssssso.........',
};

const ISAAC_BLINK = ISAAC_BASE.map((row, index) => ISAAC_BLINK_ROWS[index] ?? row);

/*
 * Aristotle is drawn with the attributes his own students would have
 * recognised: the beard, the himation, and the steady forward gaze.
 *
 * Palette keys: o outline, H/h hair, s/S skin, e eye white, p pupil,
 * b/B beard, r/R robe.
 */

const ARISTOTLE_BASE = [
  '................................',
  '.........oooooooooo.............',
  '........oHHhhhhhhHHo............',
  '.......oHHhhhhhhhhhhHHo.........',
  '......oHHhhhhhhhhhhhhhhHHo......',
  '.....oHHhhhhhhhhhhhhhhhhHHo.....',
  '.....oHHhhhhhhhhhhhhhhhhhhHo....',
  '....oHHhhhhhhhhhhhhhhhhhhhhHo...',
  '....oHHhhhhhhhhhhhhhhhhhhhhhho..',
  '....oHHhhhhhssssssssshhhhhhHo...',
  '....oHHhhhssssssssssssshhhhho...',
  '....oHhhsssssssssssssssssshho...',
  '....oHhsssssssssssssssssssho....',
  '....oHhssssssseessssseesshho....',
  '....oHhssssssppssssssppsshho....',
  '....oHhssssssssssssssssssshho...',
  '....oHhssssssssssssssssssSsho...',
  '....oHssssssssssssssssssssSsho..',
  '.....oSSSSSSSSSSSSSSSSSSSo......',
  '......oSSSSSSSSSSSSSSSSSo.......',
  '......oSSSSSSSSSSSSSSSSSo.......',
  '......oSSSSSSSSSSSSSSSSSo.......',
  '......obbbbbbbbbbbbbbbbbbbo.....',
  '......obbbbbbbbbbbbbbbbbbbo.....',
  '.....obbbbBbbbbbbbbbbBbbbbo.....',
  '.....obbbbBbbbbbbbbbbBbbbbo.....',
  '.....obbbbBbbbbbbbbbbBbbbbo.....',
  '.....obbbbbbbbbbbbbbbbbbbo......',
  '.....obbbbbbbbbbbbbbbbbbbo......',
  '......obbbbbbbbbbbbbbbbbbo......',
  '......oooooooooooooooooooooo....',
  '.....orrrrrrrrrrrrrrrrrrrro.....',
  '....orrrrrrrrrrrrrrrrrrrrrro....',
  '....oRrrrrrrrrrrrrrrrrrrrrRo....',
  '....oRrrrrrrrrrrrrrrrrrrrrRo....',
  '....oRrrrrrrrrrrrrrrrrrrrrRo....',
  '...oRRrrrrrrrrrrrrrrrrrrrrRRo...',
  '...oRRrrrrrrrrrrrrrrrrrrrrRRo...',
  '...oRRrrrrrrrrrrrrrrrrrrrrRRo...',
  '..oRRRrrrrrrrrrrrrrrrrrrrrRRRo..',
  '..oRRRrrrrrrrrrrrrrrrrrrrrRRRo..',
  '..oRRRrrrrrrrrrrrrrrrrrrrrRRRo..',
  '..oRRRrrrrrrrrrrrrrrrrrrrrRRRo..',
  '..oRRRrrrrrrrrrrrrrrrrrrrrRRRo..',
  '.oRRRRrrrrrrrrrrrrrrrrrrrrRRRRo.',
  '.oRRRRrrrrrrrrrrrrrrrrrrrrRRRRo.',
  '.oRRRRrrrrrrrrrrrrrrrrrrrrRRRRo.',
  '..oooooooooooooooooooooooooooo..',
];

function isaacColors(palette) {
  return {
    o: 0x14121a,
    H: palette.hair,
    h: palette.hairLight,
    s: palette.skin,
    S: palette.skinShade,
    e: 0xffffff,
    p: palette.eye,
    t: palette.hoodie,
    T: palette.hoodieLight,
    d: palette.hoodieDark,
    n: palette.pants,
    N: palette.pantsLight,
    W: palette.shoes,
  };
}

function aristotleColors(palette) {
  return {
    o: 0x14121a,
    H: palette.hair,
    h: palette.hairLight,
    s: palette.skin,
    S: palette.skinShade,
    e: 0xffffff,
    p: palette.eye,
    b: palette.beard,
    B: palette.beardLight,
    r: palette.robe,
    R: palette.robeShade,
  };
}

export const ISAAC_FRAMES = [
  { key: 'idle', map: ISAAC_BASE },
  { key: 'blink', map: ISAAC_BLINK },
];

export const ARISTOTLE_FRAMES = [{ key: 'idle', map: ARISTOTLE_BASE }];

/**
 * Validates an authored map against the character grid and paints it.
 */
function renderFrame(map, colors, name) {
  validateMap(map, CHARACTER_WIDTH, CHARACTER_HEIGHT, name);
  const canvas = new Canvas(CHARACTER_WIDTH, CHARACTER_HEIGHT);
  canvas.drawMap(map, colors);
  return canvas;
}

export function renderIsaacFrames() {
  const colors = isaacColors(ISAAC_PALETTE);

  return ISAAC_FRAMES.map((frame) => renderFrame(frame.map, colors, `isaac-${frame.key}`));
}

export function renderAristotleFrames() {
  const colors = aristotleColors(ARISTOTLE_PALETTE);

  return ARISTOTLE_FRAMES.map((frame) => renderFrame(frame.map, colors, `aristotle-${frame.key}`));
}

export function characterSheet(frames) {
  return sheet(frames, CHARACTER_WIDTH, CHARACTER_HEIGHT);
}

export const CHARACTER_ASSETS = [
  {
    key: 'char-isaac',
    url: 'assets/sprites/char-isaac.png',
    frames: renderIsaacFrames(),
    animations: [{ key: 'char-isaac-idle', frames: [0, 1, 0], frameRate: 2.5, repeat: -1 }],
  },
  {
    key: 'char-aristotle',
    url: 'assets/sprites/char-aristotle.png',
    frames: renderAristotleFrames(),
    animations: [{ key: 'char-aristotle-idle', frames: [0], frameRate: 1, repeat: -1 }],
  },
];

/**
 * A dimmed silhouette of a character, used for the speaker that is not
 * currently talking.
 */
export function silhouetteOf(canvas) {
  const copy = new Canvas(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;

      if (canvas.data[index + 3] > 0) {
        copy.set(x, y, 0x1a1822, 190);
      }
    }
  }

  return copy;
}
