# Licences and sources

This document is the licence audit for v1.0. It records what the game ships,
where each part came from, and what would have to be true for a claim of
"no third-party assets" to be false.

## The game

The game's own source, documentation and generated assets are released under
the MIT License. See [`LICENSE`](../LICENSE) in the repository root.

Copyright (c) 2026 Mario Dodado.

## Dependencies

These are build and runtime tools. None of their code is copied into the
repository; they are installed from npm in CI and their licences permit the
use here.

| Package                | Version | Licence    | Used for                            |
| ---------------------- | ------- | ---------- | ----------------------------------- |
| phaser                 | 4.2.1   | MIT        | Scenes, input, audio, display       |
| typescript             | 6.0.3   | Apache-2.0 | Type checking and type stripping    |
| vite                   | 8.3.8   | MIT        | Dev server and production build     |
| vitest                 | 5.1.0   | MIT        | Unit tests                          |
| @playwright/test       | 1.65.0  | Apache-2.0 | Browser tests                       |
| eslint                 | 10.14.0 | MIT        | Linting                             |
| @eslint/js             | 10.0.1  | MIT        | ESLint's base rules                 |
| typescript-eslint      | 8.72.2  | MIT        | TypeScript-aware ESLint rules       |
| eslint-config-prettier | 10.1.8  | MIT        | Turning off conflicting rules       |
| prettier               | 3.10.1  | MIT        | Formatting                          |
| globals                | 17.14.0 | MIT        | Browser and Node globals for ESLint |
| @types/node            | 26.6.6  | MIT        | Node type declarations              |

The versions above are the ones in `package-lock.json` at the time of the
audit. The lockfile is the authority; this table is a record, not a pin.

## Art and audio

There are no third-party assets. Every file under `public/` is written by a
script under `tools/`:

| Path                     | Generator                       |
| ------------------------ | ------------------------------- |
| `assets/sprites/*.png`   | `tools/assets/characters.mjs`   |
| `assets/portraits/*.png` | `tools/assets/characters.mjs`   |
| `assets/backdrops/*.png` | `tools/assets/backgrounds.mjs`  |
| `assets/ui/*.png`        | `tools/assets/ui.mjs`           |
| `assets/fonts/*`         | `tools/assets/font.mjs`         |
| `assets/audio/*.wav`     | `tools/audio/build-audio.mjs`   |
| `favicon.svg`            | `tools/assets/build-assets.mjs` |
| `assets/README.md`       | `tools/assets/build-assets.mjs` |

The sprites are original pixel maps drawn in code, using one shared face
block and one outline colour. The backdrops are shapes and ordered dithering.
The font is a generated 5×7 bitmap with original glyphs. The audio is tones
and noise synthesised into WAV files by a hand-written encoder. No sprite,
font, sound, texture or line of dialogue was taken from another game.

`npm run assets:check` proves the claim: it hashes every file under `public/`,
regenerates the whole pack and compares the hashes. A hand-edited or
unattributed file fails the check.

No Undertale asset, sprite, font, sound or line of text is used. The game
borrows a genre and a tone, never its content.

## Text

The dialogue, the Codex and the interface text are original to this
repository. Aristotle's works are in the public domain and his claims are
attributed in every Codex entry, with the work and section named in `sources`.

Secondary works are cited, not reproduced. `docs/content-bible.md` names
Jonathan Barnes, G.E.R. Lloyd, James Lennox, Myles Burnyeat, Charles Taylor,
Alasdair MacIntyre, Elizabeth Anscombe, James Gleick and Lorraine Daston as
the readings behind the modern side of the entries. No passage from those
books appears in the game; the positions are paraphrased and attributed.

Historical people are depicted as original pixel-art portraits. They are
public figures, not private individuals, and no photograph or likeness right
is used. The credits say so plainly.

## Release

The built game in `dist/` is served as a static site. It makes no network
calls after loading, needs no accounts and sends no data anywhere. The two
local storage keys hold progress, locale and settings in the player's own
browser.
