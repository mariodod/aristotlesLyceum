# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
