import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BACKDROP_ASSETS } from './backgrounds.mjs';
import {
  CHARACTER_ASSETS,
  CHARACTER_HEIGHT,
  CHARACTER_WIDTH,
  characterSheet,
  renderPortrait,
} from './characters.mjs';
import { createPixelFont } from './font.mjs';
import { writePng } from './png.mjs';
import { UI_ASSETS } from './ui.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, '..', '..');
const publicRoot = join(projectRoot, 'public');
const manifestPath = join(projectRoot, 'src', 'data', 'asset-manifest.json');

const images = [];
const spritesheets = [];

function writeImageAsset(asset) {
  const target = join(publicRoot, asset.url);
  mkdirSync(dirname(target), { recursive: true });
  writePng(target, asset.canvas.width, asset.canvas.height, asset.canvas.toBuffer());
  images.push({
    key: asset.key,
    url: asset.url,
    width: asset.canvas.width,
    height: asset.canvas.height,
  });
}

function writeSpritesheetAsset({ key, url, frameWidth, frameHeight, canvas, animations }) {
  const target = join(publicRoot, url);
  mkdirSync(dirname(target), { recursive: true });
  writePng(target, canvas.width, canvas.height, canvas.toBuffer());
  spritesheets.push({
    key,
    url,
    frameWidth,
    frameHeight,
    frameCount: canvas.width / frameWidth,
    animations: animations.map((animation) => ({
      key: animation.key,
      frames: animation.frames,
      frameRate: animation.frameRate,
      repeat: animation.repeat,
    })),
  });
}

for (const asset of CHARACTER_ASSETS) {
  writeSpritesheetAsset({
    key: asset.key,
    url: asset.url,
    frameWidth: CHARACTER_WIDTH,
    frameHeight: CHARACTER_HEIGHT,
    canvas: characterSheet(asset.frames),
    animations: asset.animations,
  });

  const neutral = asset.frames[0];

  if (neutral) {
    writeImageAsset({
      key: `${asset.key}-portrait`,
      url: `assets/portraits/${asset.key.replace('char-', '')}.png`,
      canvas: renderPortrait(neutral),
    });
  }
}

for (const asset of BACKDROP_ASSETS) {
  writeImageAsset(asset);
}

for (const asset of UI_ASSETS) {
  writeImageAsset(asset);
}

const pixelFont = createPixelFont();
const fontTarget = join(publicRoot, 'assets', 'fonts', 'pixel-5x7.png');
mkdirSync(dirname(fontTarget), { recursive: true });
writePng(fontTarget, pixelFont.canvas.width, pixelFont.canvas.height, pixelFont.canvas.toBuffer());
writeFileSync(join(publicRoot, 'assets', 'fonts', 'pixel-5x7.xml'), pixelFont.xml);

const manifest = {
  version: 1,
  images,
  spritesheets,
  bitmapFonts: [
    {
      key: 'pixel-5x7',
      textureUrl: 'assets/fonts/pixel-5x7.png',
      dataUrl: 'assets/fonts/pixel-5x7.xml',
    },
  ],
  audio: [],
};

mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated ${images.length} images, ${spritesheets.length} spritesheets, ` +
    '1 bitmap font, and the manifest.',
);
