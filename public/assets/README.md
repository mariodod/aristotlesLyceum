# Generated art pack

**Everything in this folder is generated. Do not hand-edit it.**

Run `npm run assets` to rebuild it from the scripts in `tools/assets/`. The
generator writes:

| Path                                         | Source                         |
| -------------------------------------------- | ------------------------------ |
| `fonts/pixel-5x7.png`, `fonts/pixel-5x7.xml` | `tools/assets/font.mjs`        |
| `sprites/char-*.png`                         | `tools/assets/characters.mjs`  |
| `backdrops/*.png`                            | `tools/assets/backgrounds.mjs` |
| `ui/*.png`                                   | `tools/assets/ui.mjs`          |

The list of everything that exists, with its dimensions and animations, is
written to `src/data/asset-manifest.json`, and `PreloadScene` loads the pack
from that manifest. No scene names a texture directly, so adding art never
means editing a scene.

The pack is committed so that a fresh clone runs without a build step. If you
change a generator, regenerate and commit the result in the same commit.
