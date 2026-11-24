# Aristotle's Lyceum

**A 2D pixel-art narrative game about Aristotle, his philosophy, and where it still runs.**

> **Status:** `v1.0.0`. The complete game: four acts from the desk to the exam, generated art and audio, the dialectic, the Dream Journal, English and Spanish, and settings for sound, motion and text speed. Every chapter and every station is written, sourced and verified; the full path has a browser test, and the game plays in Chrome, Edge, Firefox and Safari. See [`PLAN.md`](PLAN.md) for the roadmap and [`docs/licences.md`](docs/licences.md) for the audit.

Isaac has an exam in philosophy tomorrow. He hates the subject, decides that
reading Aristotle will only make it worse, reads Aristotle anyway, and falls
asleep at his desk.

He wakes up in ancient Greece, and Aristotle is waiting for him.

---

## Play

```bash
npm install
npm run dev
```

Then open <http://127.0.0.1:5173>.

| Action                   | Input                   |
| ------------------------ | ----------------------- |
| Confirm, advance, choose | `Z` / `Enter` / `Space` |
| Move a menu cursor       | `Up` / `Down`           |
| Change a setting / page  | `Left` / `Right`        |
| Read the Dream Journal   | `C` on the end card     |
| Go back                  | `Escape`                |

## What is in the game

- **The dialogue engine.** A typed script format with labelled steps, choices,
  branches, stats, flags and codex unlocks, driven by a pure interpreter that
  is unit tested and linted.
- **The dialogue box.** Typewriter reveal, a name plate that follows the
  speaker, a scroll cursor in the choice menu, and a blinking continue marker.
- **Generated art and audio.** Every file in `public/` is produced by
  committed Node scripts: a dependency-free pixel canvas, a hand-rolled PNG
  and WAV encoder, authored character sprites, dithered backdrops, four music
  moods and five effects. The bitmap font carries the accents the Spanish
  catalogue needs.
- **The Dream Journal.** The Codex that files each idea with what Aristotle
  said and where the same structure still runs in today's science.
- **Act I — The Desk.** The opening chapter, playable from the title screen,
  with three choices, three branches and three named endings.
- **The whole cast.** Twelve characters, each with an idle, a blink and eight
  expressions, plus a portrait for the Dream Journal. The face is authored
  once and painted over everybody.
- **The dialectic.** A battle system where the opponent is an argument given
  a face. To win, you build a syllogism that takes it apart: a major
  premise, a minor premise, and a conclusion, checked against the classical
  mood and figure table.
- **More than one language.** The game ships in English and Spanish. The
  language is chosen in the settings and applied immediately. Every catalogue
  is checked by `npm run i18n:check`, which proves it is complete and that the
  font can draw every character in it.

## Documentation

| Document                                           | What it covers                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`PLAN.md`](PLAN.md)                               | Vision, the technical stack and why, the design, the milestones, the risks                            |
| [`AGENTS.md`](AGENTS.md)                           | The operating manual: architecture rules, the script format, the art pipeline, the definition of done |
| [`docs/roadmap.md`](docs/roadmap.md)               | Milestone plan and acceptance criteria                                                                |
| [`docs/content-bible.md`](docs/content-bible.md)   | Every chapter, every concept, and the sources behind them                                             |
| [`docs/technical-plan.md`](docs/technical-plan.md) | Engine decisions, layering, data formats, testing strategy                                            |
| [`docs/m2-playtest.md`](docs/m2-playtest.md)       | The protocol and results table for the Act I playtest                                                 |
| [`docs/licences.md`](docs/licences.md)             | The licence audit: game, dependencies, generated assets and sources                                   |

## Technology at a glance

| Area          | Choice                                 |
| ------------- | -------------------------------------- |
| Language      | TypeScript 6, strict                   |
| Engine        | Phaser 4                               |
| Build         | Vite 8                                 |
| Tests         | Vitest 5 (unit) + Playwright (browser) |
| Lint / format | ESLint 10 (flat) + Prettier 3          |
| Art / audio   | Generated from committed Node scripts  |
| Hosting       | GitHub Pages                           |

## Scripts

| Command                 | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Development server                                       |
| `npm run build`         | Typecheck and build to `dist/`                           |
| `npm run preview`       | Serve the production build                               |
| `npm run typecheck`     | `tsc --noEmit`                                           |
| `npm run lint`          | ESLint                                                   |
| `npm run format`        | Prettier, write mode                                     |
| `npm run test`          | Unit tests                                               |
| `npm run test:e2e`      | Browser tests                                            |
| `npm run assets`        | Regenerate art, audio and both manifests                 |
| `npm run assets:check`  | Prove `public/` regenerates byte for byte                |
| `npm run content:check` | Validate every script, codex entry and source            |
| `npm run i18n:check`    | Validate every translation against the game and the font |

## Playing in Spanish

The language is in **Settings**, and it changes immediately. Every line of
the story, the Dream Journal, the dialectic and the exam is translated.

## Trying the dialectic

The battle is part of Act II, so it plays in the normal story. In development
there is also a **TRY A DIALECTIC** entry on the title screen. Run `npm run dev`
and use `?opponent=<id>` to pick one of the eight: `certainty`,
`reductionism`, `pluralism`, `marking`, `reism`, `ghost`, `imitation` or
`authority`.

## Contributing

Read [`AGENTS.md`](AGENTS.md) first. The short version:

- The source is written in **English**, even though the original brief was
  in Spanish. Spanish is a complete translation in `src/i18n/`, not a second
  source language.
- **No Undertale assets.** We take the genre and the tone, never a sprite, a
  font, a sound or a line of text. Everything in `public/` is generated by the
  scripts in `tools/`.
- **Content is data.** A chapter is a typed object in `src/data/script/`, not
  code in a scene.
- **Every philosophical claim names a source.** `npm run content:check` fails
  the build on an unsourced entry.

## Credits and rights

Written and built by Mario Dodado. Aristotle and the works cited in the Codex
are in the public domain; the translations, commentary, characters, artwork
and audio are original to this project.

## Licence

MIT. See [`LICENSE`](LICENSE).
