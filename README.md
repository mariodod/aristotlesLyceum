# Aristotle's Lyceum

**A 2D pixel-art narrative game about Aristotle, his philosophy, and where it still runs.**

> **Status:** `v0.2.0`. The engine, the art pipeline, the dialogue runtime and
> Act I exist and are verified end to end. Act I is a finished five-minute
> chapter with three endings. Act II onward is still to be written. See
> [`PLAN.md`](PLAN.md) for the roadmap.

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
| Move the choice cursor   | `Up` / `Down`           |

## What is here so far

- **The dialogue engine.** A typed script format with labelled steps, choices,
  branches, stats, flags and codex unlocks, driven by a pure interpreter that
  is unit tested and linted.
- **The dialogue box.** Typewriter reveal, a name plate that follows the
  speaker, a heart cursor in the choice menu, and a blinking continue marker.
- **A generated art pipeline.** Every pixel in `public/` is produced by
  committed Node scripts: a dependency-free pixel canvas, a hand-rolled PNG
  encoder, authored character sprites, dithered backdrops and a bitmap font
  that already carries the accents a Spanish translation will need.
- **The Dream Journal.** The Codex that files each idea with what Aristotle
  said and where the same structure still runs in today's science.
- **Act I — The Desk.** The opening chapter, playable from the title screen,
  with three choices, three branches and three named endings.

## Documentation

| Document                                           | What it covers                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`PLAN.md`](PLAN.md)                               | Vision, the technical stack and why, the design, the milestones, the risks                            |
| [`AGENTS.md`](AGENTS.md)                           | The operating manual: architecture rules, the script format, the art pipeline, the definition of done |
| [`docs/roadmap.md`](docs/roadmap.md)               | Milestone plan and acceptance criteria                                                                |
| [`docs/content-bible.md`](docs/content-bible.md)   | Every chapter, every concept, and the sources behind them                                             |
| [`docs/technical-plan.md`](docs/technical-plan.md) | Engine decisions, layering, data formats, testing strategy                                            |
| [`docs/m2-playtest.md`](docs/m2-playtest.md)       | The protocol for testing Act I on people who have never heard of Aristotle                            |

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

| Command                 | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Development server                             |
| `npm run build`         | Typecheck and build to `dist/`                 |
| `npm run preview`       | Serve the production build                     |
| `npm run typecheck`     | `tsc --noEmit`                                 |
| `npm run lint`          | ESLint                                         |
| `npm run format`        | Prettier, write mode                           |
| `npm run test`          | Unit tests                                     |
| `npm run test:e2e`      | Browser tests                                  |
| `npm run assets`        | Regenerate the art pack and the asset manifest |
| `npm run content:check` | Validate every script, codex entry and source  |

## Contributing

Read [`AGENTS.md`](AGENTS.md) first. The short version:

- The project is written in **English**, even though the original brief was
  in Spanish. A Spanish translation is a future locale, not a second source
  language.
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
