# Generated art pack

**Everything in this folder is generated. Do not hand-edit it.**

Run `npm run assets` to rebuild it from the scripts in `tools/`. The
generator writes:

| Path                                         | Source                         |
| -------------------------------------------- | ------------------------------ |
| `fonts/pixel-5x7.png`, `fonts/pixel-5x7.xml` | `tools/assets/font.mjs`        |
| `sprites/char-*.png`                         | `tools/assets/characters.mjs`  |
| `backdrops/*.png`                            | `tools/assets/backgrounds.mjs` |
| `ui/*.png`                                   | `tools/assets/ui.mjs`          |
| `audio/*.wav`                                | `tools/audio/build-audio.mjs`  |

The list of images, spritesheets, animations and fonts is written to
`src/data/asset-manifest.json`; audio has its own `audio-manifest.json`.
The preload scenes load both from those manifests. No scene names a texture
or a sound by hand, so adding an asset never means editing a scene.

The pack is committed so that a fresh clone runs without a build step. If you
change a generator, regenerate and commit the result in the same commit.
