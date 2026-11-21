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

/*
 * The two text files under public/ are generated too, so the whole folder is
 * reproducible from tools/ and no hand-edited asset can creep in.
 */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <rect width="16" height="16" fill="#07070c" />
  <rect x="3" y="3" width="10" height="1" fill="#f2c14e" />
  <rect x="2" y="4" width="12" height="1" fill="#f2c14e" />
  <rect x="3" y="5" width="2" height="7" fill="#e4dcc4" />
  <rect x="7" y="5" width="2" height="7" fill="#e4dcc4" />
  <rect x="11" y="5" width="2" height="7" fill="#e4dcc4" />
  <rect x="2" y="12" width="12" height="1" fill="#a89a78" />
  <rect x="3" y="13" width="10" height="1" fill="#a89a78" />
</svg>
`;
writeFileSync(join(publicRoot, 'favicon.svg'), favicon);

const packReadme = `# Generated art pack

**Everything in this folder is generated. Do not hand-edit it.**

Run \`npm run assets\` to rebuild it from the scripts in \`tools/\`. The
generator writes:

| Path                                         | Source                         |
| -------------------------------------------- | ------------------------------ |
| \`fonts/pixel-5x7.png\`, \`fonts/pixel-5x7.xml\` | \`tools/assets/font.mjs\`        |
| \`sprites/char-*.png\`                         | \`tools/assets/characters.mjs\`  |
| \`backdrops/*.png\`                            | \`tools/assets/backgrounds.mjs\` |
| \`ui/*.png\`                                   | \`tools/assets/ui.mjs\`          |
| \`audio/*.wav\`                                | \`tools/audio/build-audio.mjs\`  |

The list of images, spritesheets, animations and fonts is written to
\`src/data/asset-manifest.json\`; audio has its own \`audio-manifest.json\`.
The preload scenes load both from those manifests. No scene names a texture
or a sound by hand, so adding an asset never means editing a scene.

The pack is committed so that a fresh clone runs without a build step. If you
change a generator, regenerate and commit the result in the same commit.
`;
writeFileSync(join(publicRoot, 'assets', 'README.md'), packReadme);

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
