# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-11-12

### Added

- **M4: the dialectic.** A battle system where the opponent is an
  argument given a face, and the only way to win it is to build a
  syllogism that takes it apart.
- **A real syllogism engine.** The classical mood and figure table, so a
  categorical syllogism is valid exactly when its mood is in the list for
  its figure. It names the mood it found: Celarent, Darii, Camestres.
- **The four moves.** Examine, refute, claim, embrace. Only one of them
  wins the argument; the other three exist to teach how.
- **A builder that teaches.** It names the figure as soon as the two
  premises are chosen and the mood as soon as the conclusion is, so a
  player who has never heard of a syllogism learns the shape of one by
  watching the readout.
- **Four opponents.** Certainty, Reductionism, Pluralism and the Marking.
  Every one has exactly one refutation, and exactly one sound argument
  that answers nothing, so the game can say "that is a valid argument, and
  it is not an answer to me".
- **A `dialectic` step kind**, so a chapter can hand over to a battle and
  pick up again at a label when the argument is won.
- **A development entry on the title screen** so the battle can be reached
  before Act II exists.

### Fixed

- **The builder would take the same premise twice.** Two copies of one
  premise is not a syllogism, and the readout had nothing useful to say
  about it.

## [0.3.0] - 2026-11-12

### Added

- **M3: the art pass.** Twelve characters, a shared face block, eight
  expressions each, portraits for the Dream Journal, and three new
  backdrops.
- **A shared face block.** Every character has the same head geometry, so an
  expression is authored once and painted over the face of the whole cast.
  Adding a character now gets every expression for free.
- **Expressions in the game.** A line of dialogue can name an expression, and
  the speaker plays it. Isaac complains with an angry face.
- **Portraits in the Dream Journal.** Each entry shows the portrait of whoever
  taught the idea, cropped and doubled from the sprite.
- **Three new backdrops.** The Library of Alexandria, Down House, and the
  classroom Isaac has to sit in at the end.
- **Garment builders.** Robes, coats and frock coats are described by the width
  of each row rather than transcribed twenty-six times.
- **Art checks in the content linter.** Every character needs a sprite, every
  sprite needs a frame for every expression, and every character needs a
  portrait.

### Fixed

- **Faces no longer have holes.** A blank in an expression patch was being
  painted as transparency rather than as skin, so every character had a hole
  in the middle of the face.

## [0.2.0] - 2026-11-12

### Added

- **M2: Act I is a finished chapter.** Sixty-four steps and about five
  minutes, rewritten from a placeholder into a room with a clock in it, a
  book that moves, and a voice that has been waiting six hours.
- **Three endings.** Each choice leads to its own branch and its own named
  ending: _The Argument_, _The Repetition_, _The Message_.
- **The chapter-complete card.** The act, the ending and its subtitle, the
  stats, the number of journal entries, and a prompt for the journal.
- **A dream transition.** The bedroom cross-fades into the Lyceum while the
  narration says the room goes somewhere else.
- **The `branch` and `chapterEnd` step kinds**, so a chapter can route to a
  different ending and name it.
- **A reachability check.** `npm run content:check` now proves that every
  step of every chapter can actually be reached. It caught eight broken
  labels the first time it ran.
- **A playtest protocol.** `docs/m2-playtest.md` — who to ask, what to watch
  for, what to ask afterwards, and how to read the results.

### Fixed

- **Flags no longer leak between runs.** A chapter owns the flags it sets and
  clears them when it starts, so replaying Act I resolves the ending the
  player just chose instead of the one the last run chose.

## [0.1.0] - 2026-11-12

### Added

- **M0: the repository.** Toolchain, CI, Pages deployment, and `AGENTS.md`.
- **Dialogue runtime.** A typed script interpreter with labelled steps,
  choices, jumps, codex unlocks, stats and flags. Pure TypeScript, fully
  unit tested.
- **Dialogue box.** Typewriter reveal, name plate, speaker highlighting, and a
  heart-cursed choice menu.
- **Art pipeline.** A dependency-free pixel canvas and PNG encoder, a
  generated 5x7 bitmap font with Latin-1 accents, authored character sprites,
  and dithered backdrops for the bedroom and the Lyceum.
- **Content linter.** `npm run content:check` validates every script, codex
  reference and source list, and reports every problem at once.
- **Act I — The Desk.** The opening chapter, playable end to end.
- **Dream Journal.** A codex screen listing the ideas unlocked so far.
- **Save service.** Progress, unlocked codex entries and stats, with a
  corrupted or unavailable store degrading gracefully.
- **Verification.** 45 unit tests, 7 browser tests, and a screenshot harness
  for visual review.
