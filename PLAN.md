# Aristotle's Lyceum — Project Plan

**Version:** 0.1
**Date:** 2026-11-12
**Status:** Milestone M5 complete. The engine, the art pipeline, the dialogue runtime, the content linter, Act I, the dialectic and the Codex exist and are verified end to end.

---

## 1. High concept

Isaac has an exam in philosophy tomorrow. He hates the subject, decides that
reading Aristotle will make it worse, reads Aristotle anyway, and falls asleep
at his desk.

He wakes up in ancient Greece with Aristotle waiting for him. The game is the
dream: a journey through the Lyceum, through the twenty-four centuries in
which Aristotle's ideas were argued with, corrected, abandoned, and picked up
again, and back to the exam — where the questions are no longer abstract.

**Tone:** warm, wry, curious. Not a lecture. Isaac starts as a bored teenager
and ends as someone who has seen where the scaffolding came from.

**Genre:** 2D pixel-art narrative, _Undertale_-style. Static scenes, a
typewriter dialogue box, character sprites with expressions, meaningful
choices.

**Target:** desktop browser, keyboard only, 40–60 minutes for a first
playthrough.

---

## 2. Technical stack

### 2.1 The decision

| Layer         | Choice                                                                                 | Why this one                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Language      | **TypeScript 6**, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` | The story is data. Types make a malformed script a compile error instead of a broken scene.                                  |
| Engine        | **Phaser 4.2**                                                                         | Scene lifecycle, input, tweens, bitmap fonts and audio in one dependency. The sibling project already runs it in production. |
| Bundler       | **Vite 8**                                                                             | Instant HMR for a game that is mostly data, and a trivially reproducible Pages build.                                        |
| Unit tests    | **Vitest 5**                                                                           | Same config as Vite; no second runner to keep in sync.                                                                       |
| Browser tests | **Playwright**                                                                         | Real browser, real canvas, and a test hook small enough to read at a glance.                                                 |
| Lint / format | **ESLint 10** flat + **Prettier 3**                                                    | No config drift between the two: Prettier runs last in `eslint.config.js`.                                                   |
| Art           | **Node scripts** generating PNGs                                                       | See §5. Nobody hand-paints here; the art is code.                                                                            |
| Audio         | **Node scripts** generating WAVs                                                       | Same reason. Planned for M8.                                                                                                 |
| Font          | **Generated 5x7 bitmap font**                                                          | Crisp at any integer zoom, and the generator can add Latin-1 accents for the future Spanish locale.                          |
| Hosting       | **GitHub Pages**                                                                       | Free, already wired for the sibling project, and the audience for a personal project lives on GitHub anyway.                 |
| License       | **MIT**                                                                                | Matches the author's other games.                                                                                            |

### 2.2 Alternatives that were considered and rejected

**Godot 4.** The author maintains `fiel-al-libro` in Godot and it is an
excellent choice for a 3D project. It loses here for two reasons: `.tscn`
files have to be hand-authored, which is where an agent-driven workflow
breaks most often, and GDScript is harder to verify from a terminal. For a
game whose content is typed data, TypeScript is the better fit. Godot stays
the right answer for a 3D or console project.

**Custom Canvas renderer.** The scene count here is small and the renderer
would be a second thing to maintain. Phaser gives input, tweens and the
display list for free, and its WebGL renderer handles a 640×360 pixel-art
canvas without trouble.

**A visual scripting tool (Twine, Ink).** Excellent for pure branching
narrative, but this game needs sprites on a stage, a choice menu with a heart
cursor, a codex screen and stat-driven dialogue options. A custom script
format with a typed interpreter gives more control and, crucially, something
that can be unit tested and linted. The branch format is deliberately
Ink-adjacent so a future editor would still make sense.

**Webpack / Parcel / esbuild.** Vite is already the sibling project's
bundler and does everything needed here.

### 2.3 Repository conventions

- Node 24, npm, committed lockfile, `"type": "module"`.
- Strict ESLint with `@typescript-eslint/consistent-type-imports` and
  `no-console` warnings in `src/`.
- Prettier: single quotes, semicolons, trailing commas, 100 columns.
- `tsconfig` with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `allowImportingTsExtensions`.
- **Relative imports carry the `.ts` extension.** This is what lets Node run
  the game's own modules directly, which is how the content linter reads the
  story data without a bundler.

---

## 3. Game design

### 3.1 Structure

| Act                     | Where                         | What happens                                                                                            |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **I — The Desk**        | Isaac's bedroom, 11:47 PM     | Isaac complains, reads one page, falls asleep. One choice, three options.                               |
| **II — The Lyceum**     | Athens, 4th century BC        | Aristotle's school. Seven chapters, each on one body of work, each ending with a small dialectic.       |
| **III — The Long Walk** | 24 stations across 2400 years | The dream becomes a journey. Each station is a person who used Aristotle, broke him, or kept him alive. |
| **IV — The Exam**       | Isaac's desk, morning         | The exam, playable, and answerable. Ending varies with the codex and the stats.                         |

### 3.2 Act II chapters

| #   | Chapter     | Aristotle's work                         | The core idea                                         |
| --- | ----------- | ---------------------------------------- | ----------------------------------------------------- |
| 1   | Logic       | _Prior Analytics_                        | The syllogism; what follows from what                 |
| 2   | Physics     | _Physics_                                | The four causes; why has more than one sense          |
| 3   | Metaphysics | _Metaphysics_                            | Matter and form; being and change                     |
| 4   | The Soul    | _De Anima_                               | Soul as the form of a body; memory and sensation      |
| 5   | Ethics      | _Nicomachean Ethics_                     | Eudaimonia; virtue as a disposition; the mean         |
| 6   | Poetics     | _Poetics_                                | Mimesis; catharsis; what a story does to a person     |
| 7   | Life        | _History of Animals_, _Parts of Animals_ | Taxonomy by observation; the first systematic zoology |

### 3.3 Act III stations (first eight)

Alexandria (the Library and the Alexandrian method) · Baghdad (Avicenna,
Averroes: Aristotle in Arabic) · Paris (Aquinas: faith and reason) · Padua
(Cesalpino, Vesalius, Harvey, Galileo: Aristotle's biology and its
correction) · London (Bacon: the experimental method as Aristotle's
dialectic turned against him) · Utrecht (Descartes and the limits of
Aristotle's authority) · Königsberg (Kant: the Critique of Pure Reason
answers Aristotle's unmoved mover) · Down House (Darwin: Aristotle's
natural history and the theory that replaced it).

Later stations: Poincaré and the crisis in physics · Frege and Russell:
Aristotle's logic becomes symbolic logic · Turing and Shannon: formal
inference becomes computation · Popper: falsification as dialectic with
paperwork · Kuhn: paradigms and the broken mirror · the present day:
neuroscience, ecology, machine learning, and what each of them still argues
with.

### 3.4 Mechanics

1. **Dialogue.** A typewriter box with a name plate, speaker highlighting, and
   a heart-cursed choice menu. The genre's core loop, done properly.
2. **Dialectic.** The battle system, reimagined. Instead of _Fight / Act /
   Item / Mercy_, the options are **Claim / Examine / Refute / Embrace**. The
   opponent is a philosophical error given a face — Skepticism, Certainty,
   the Fear of Error. Refuting one means assembling a valid syllogism from
   the cards on the table. Getting it wrong teaches a lesson instead of
   costing health.
3. **The Codex.** Every concept Aristotle gives Isaac is filed in the Dream
   Journal with what he said and where the same structure still runs in
   today's science. This is the educational payload and the replay hook.
4. **Three stats.** _Reason_, _Wisdom_, _Empathy_ replace attack and defence.
   They gate dialogue options, the dialectic, and the ending. They never
   represent health, and there is no way to lose them.
5. **Consequences.** One load-bearing choice in Act II changes the tone of
   Act III: Isaac can question Aristotle or accept him, and the dream
   responds.

### 3.5 Non-goals for v1.0

- No player movement, no exploration, no combat timing.
- No procedural generation, no random events.
- No online features, no accounts, no cloud saves.
- No voice acting.
- English only. The font already carries the Latin-1 accents a Spanish
  translation will need, and the codex structure is locale-shaped, but no
  second language ships with v1.0.

---

## 4. Architecture

### 4.1 The script format

The whole game is data. A chapter is a `StoryScript`: an ordered list of
labelled steps.

```
chapter  →  stage  →  say  →  say  →  choice ─┬─→ say ─→ jump ─┐
                                               └─→ say ─→ jump ─┴─→ codex → end
```

The interpreter (`src/systems/dialogue/dialogue-runtime.ts`) is a pure
function over that data. It emits events; the scene renders them. Because the
interpreter has no Phaser import, the entire story layer is testable in a
Node environment, and `npm run content:check` can prove that every label
resolves, every codex id exists, every chapter ends, and no entry is orphaned.

This is the single most important architectural decision in the project. It
turns "a narrative game" into "a narrative game plus a type-checked data
format plus a linter", which is a thing an agent can extend without breaking.

### 4.2 Layering

```
data  →  systems  →  services  →  entities  →  scenes
```

`data/` and `systems/` never import Phaser. `scenes/` contain presentation and
nothing else. The story scene is generic: it plays whatever chapter it is
handed, so adding a chapter means adding a data file and one line to the
registry.

### 4.3 The art pipeline

All art is generated by committed Node scripts with zero runtime
dependencies — a small pixel canvas and a hand-rolled PNG encoder using
`node:zlib`. Characters are authored string maps painted through a shared
palette; backdrops are painted with shapes and a 4×4 Bayer ordered dither so
gradients stay made of flat pixels.

The generated pack and its manifest are committed. The manifest is the
contract between the generator and the game, so adding art never requires
editing a scene.

### 4.4 Verification strategy

| Layer  | Tool                       | What it proves                                                                  |
| ------ | -------------------------- | ------------------------------------------------------------------------------- |
| Rules  | Vitest                     | The dialogue interpreter, wrapping, typewriter and save service behave          |
| Story  | `npm run content:check`    | Every script is internally consistent and every claim has a source              |
| Flow   | Playwright                 | The game boots, the dialogue advances, the choice menu works, the codex unlocks |
| Visual | `tools/qa/screenshots.mjs` | The frame still looks right after a change                                      |

---

## 5. Milestones

| ID      | Outcome                                                                 | State                                                                                              |
| ------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **M0**  | Repository, toolchain, art pipeline, CI/CD, AGENTS.md, this plan        | **Done**                                                                                           |
| **M1**  | Dialogue runtime, textbox, title screen, save service, content linter   | **Done** (in M0)                                                                                   |
| **M2**  | Act I complete and playtested, with a proper ending                     | In progress — written and verified; playtest open                                                  |
| **M3**  | Character art pass: 12 characters, expressions, portraits               | **Done**                                                                                           |
| **M4**  | Dialectic system and the syllogism builder                              | **Done**                                                                                           |
| **M4b** | Localisation: catalogues, a language switch, a Spanish translation      | **Done**                                                                                           |
| **M5**  | Codex screen, codex entries for Act II, codex-driven hints              | Done — the journal lists its entries, and the twenty-one Act II entries are written and translated |
| **M6**  | Act II written: seven chapters, ~40 minutes                             | Not started                                                                                        |
| **M7**  | Act III written: eight stations; Act IV exam playable                   | Not started                                                                                        |
| **M8**  | Audio: generated music and effects, settings, accessibility, text speed | Not started                                                                                        |
| **M9**  | v1.0: polish, credits, licence audit, Pages release                     | Not started                                                                                        |

### The critical path

M6 is the critical path. Seven chapters of accurate, engaging writing is the
work that decides whether this game is good. Everything else is craft around
it. If the schedule slips, cut Act III stations and Act IV variants — never
Act II chapters.

---

## 6. Risks

| Risk                                                | Likelihood | Impact | Mitigation                                                                                                                                  |
| --------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Procedurally generated characters look crude        | High       | Medium | The art is authored pixel maps, not primitives, and can be redrawn by hand in the same format. Budget a real art pass in M3.                |
| The philosophy turns into a lecture                 | Medium     | High   | Every concept must be dramatised through a person and a problem, never stated. The Codex carries the exposition instead.                    |
| Inaccurate claims about Aristotle or modern science | Medium     | High   | Every codex entry names its source; a fact-check pass per chapter; the linter blocks unsourced entries.                                     |
| Scope creep in Act III                              | High       | Medium | Hard cap at eight stations for v1.0. Cut stations before cutting Act II.                                                                    |
| The dialectic mechanic is too clever and confusing  | Medium     | Medium | Prototype it in M4 as a standalone scene before it is wired into a chapter. Fallback: a simpler "pick the valid inference" multiple choice. |
| Node-native TypeScript imports confuse contributors | Low        | Low    | Documented in AGENTS.md §8; the benefit (tooling can read the game data) is real.                                                           |
| Typwriter timing makes browser tests flaky          | Low        | Low    | `nextLine()` and `advanceUntilChoice()` helpers abstract the timing away.                                                                   |

---

## 7. Release criteria for v1.0

- A complete playthrough from the title screen to an ending, with no console
  errors, in under an hour.
- All seven Act II chapters and all eight Act III stations written and
  fact-checked.
- Every codex entry has at least one source.
- `npm run format:check`, `lint`, `typecheck`, `test`, `content:check`, `build`
  and `test:e2e` all green in CI.
- The game is deployed to GitHub Pages and playable in Chrome, Edge, Firefox
  and Safari.
- No third-party assets. `public/` is fully regenerable from `tools/`.

---

## 8. Decision log

| Date       | Decision                                  | Alternatives                | Why                                                                                               |
| ---------- | ----------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------- |
| 2026-11-12 | TypeScript + Phaser 4 + Vite              | Godot 4, custom Canvas      | Type system for story data; proven toolchain; terminal-verifiable.                                |
| 2026-11-12 | 640×360 base resolution with integer zoom | 480×270, 1280×720           | 640×360 is exactly 2× of 320×180 and scales cleanly to 1080p and 720p.                            |
| 2026-11-12 | Custom typed script format                | Ink, Twine                  | Unit-testable and lintable; the branch model still reads like Ink.                                |
| 2026-11-12 | Art and audio generated from code         | Hand-drawn assets, Aseprite | The only pipeline that works without a human illustrator; output is reproducible and diffable.    |
| 2026-11-12 | `.ts` extensions in relative imports      | Extensionless               | Lets Node execute the game's modules, which the content linter depends on.                        |
| 2026-11-12 | Three stats: reason, wisdom, empathy      | AT/DEF, HP                  | A story game should not have a health bar.                                                        |
| 2026-11-12 | A chapter owns the flags it sets          | Flags persist globally      | Replaying a chapter must not inherit the previous run's choices.                                  |
| 2026-11-12 | Localisation from the start               | Translate at the end        | A story game is mostly text. Retrofitting keys into a finished script is the expensive way round. |
| 2026-11-12 | The English story stays in the scripts    | A catalogue for everything  | A writer should read the English where it is written, and a translator should get one file.       |
