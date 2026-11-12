# Roadmap — Aristotle's Lyceum

**Version:** 0.1
**Date:** 2026-11-12
**Status:** M0 complete.

---

## 1. Milestone overview

| ID  | Milestone      | Outcome                                                             | Status      |
| --- | -------------- | ------------------------------------------------------------------- | ----------- |
| M0  | Foundation     | Repository, toolchain, art pipeline, CI/CD, docs                    | Done        |
| M1  | Engine         | Dialogue runtime, textbox, title, save, content linter              | Done        |
| M2  | Act I          | The opening chapter, finished and playtested                        | Partial     |
| M3  | Art pass       | Twelve characters with expressions, portraits, three more backdrops | Not started |
| M4  | Dialectic      | The battle system and the syllogism builder                         | Not started |
| M5  | Codex          | Journal screen complete, Act II entries authored                    | Partial     |
| M6  | Act II         | Seven chapters, forty minutes of writing                            | Not started |
| M7  | Act III & IV   | Eight stations and a playable exam                                  | Not started |
| M8  | Audio & access | Generated music, settings, text speed, accessibility                | Not started |
| M9  | v1.0           | Polish, credits, licence audit, release                             | Not started |

---

## 2. Milestone details

### M0 — Foundation

**Outcome:** a repository that a stranger can clone and run.

- Toolchain: TypeScript, Vite, ESLint, Prettier, Vitest, Playwright.
- Art pipeline: pixel canvas, PNG encoder, bitmap font, characters, backdrops.
- CI on every push; Pages deployment on `main`.
- `AGENTS.md`, `PLAN.md`, `README.md`, and the `docs/` set.

**Done when:** a clean clone passes `format:check`, `lint`, `typecheck`,
`content:check`, `test`, `build` and `test:e2e` on a machine with only Node
installed.

### M1 — Engine

- The script format, the interpreter, the textbox, the title screen.
- The save service and the content linter.

**Done when:** Act I plays from the title screen to its end with no console
errors, and a broken script fails `npm run content:check`.

### M2 — Act I

- Write the full chapter: the lamp, the book, the choice and its three
  branches, the transition into the dream.
- Add the ending variants for Act I.
- Playtest on ten people who have never heard of Aristotle; watch them.

**Done when:** a non-philosopher can describe the game's premise afterwards
without being told.

### M3 — Art pass

- Twelve characters with a silhouette that survives at 32×48, plus a larger
  portrait per character for the Codex.
- Expression sets: neutral, happy, sad, surprised, thinking, angry, tired,
  determined.
- Backdrops: the Lyceum walkway, the Library, Baghdad, Padua, London,
  Königsberg, Down House, the exam room.

**Done when:** every character in the cast has a sprite that reads at 1×
without the name plate.

### M4 — Dialectic

- A standalone prototype scene with the four options.
- The syllogism builder: pick a major premise, a minor premise and a
  conclusion; the game checks the mood and the figure.
- Three opponents for Act II, one for the exam.

**Done when:** a player who has never heard of a syllogism can win one
argument in under three minutes and can explain why it worked.

### M5 — Codex

- Journal screen: list, detail, sources, and the modern echo.
- Twenty-one Act II entries, each sourced.
- Codex-driven hints: an unlocked entry can be referenced from a choice.

**Done when:** every entry names the Aristotelian work it comes from and one
specific modern field.

### M6 — Act II

- Seven chapters, per `docs/content-bible.md`.
- Roughly forty minutes of play.
- The load-bearing choice that changes Act III's tone.

**Done when:** the whole act can be played without a single "and then
Aristotle explained" line.

### M7 — Act III & IV

- Eight stations, each with a person, a place and a year.
- The playable exam, six questions, three endings.

**Done when:** a player who finishes the game can name three people who used
Aristotle and one who corrected him.

### M8 — Audio & access

- Generated music for four moods, and generated sound effects.
- Settings: text speed, master volume, music volume, screen shake.
- Accessibility: hold-to-skip, instant text, reduced motion, colour-blind
  safe accents.

**Done when:** the game is fully playable with sound off and with text
appearing instantly.

### M9 — v1.0

- Polish pass, credits, licence audit, a release on GitHub Pages.

---

## 3. Definition of done

Per change:

- `format:check`, `lint`, `typecheck`, `content:check`, `test`, `build` and
  `test:e2e` pass.
- New behaviour has a test.
- New art is regenerated and committed.
- New content has sources.

Per milestone:

- The acceptance criteria above.
- A note in `CHANGELOG.md`.
- The `docs/` set updated if a decision moved.

---

## 4. Scope reduction plan

If the schedule slips, in this order:

1. Cut Act III from eight stations to four.
2. Cut the exam's six questions to four.
3. Cut the Act IV ending variants to two.
4. Cut one Act II chapter, Poetics, and move it to the post-release backlog.

**Never cut:** Act II's Logic and Ethics chapters, the Codex, or the
content linter. They are the game.

---

## 5. Stretch backlog

- A Spanish translation. The font already has the accents and the codex
  structure is locale-shaped.
- A second dialectic opponent set for a New Game Plus.
- A "show the syllogism" panel that explains every inference the game has
  made, in the player's own terms.
- An export button that prints the Codex as a booklet.
