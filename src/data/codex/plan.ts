/**
 * The chapters that are planned but not written yet, and the Codex entries
 * each of them will unlock.
 *
 * A Codex entry has to be unlocked by a chapter, but a chapter is a lot of
 * writing to do before the entries it will unlock can be written down. This
 * file is the promise in between: it names the chapters that are coming and
 * the entries each one will unlock, so the content linter can check that an
 * entry is spoken for even before its chapter exists, and can check that the
 * chapter unlocks what it promised the moment the chapter lands.
 *
 * The rule for the linter is simple. An entry is fine when a shipped chapter
 * unlocks it, or when a planned chapter claims it. When a chapter with a
 * planned id ships, it has to unlock every entry claimed for it, and the
 * claim comes out of this file.
 */
export interface PlannedChapter {
  /** The id the script will use. */
  id: string;
  /** The chapter title, for the linter's messages. */
  title: string;
  /** The Codex entries the chapter will unlock. */
  codex: string[];
}

export const PLANNED_CHAPTERS: PlannedChapter[] = [
  {
    id: 'act-two-logic',
    title: 'Act II — Logic',
    codex: ['mood-and-figure', 'categories', 'demonstration'],
  },
  {
    id: 'act-two-physics',
    title: 'Act II — Physics',
    codex: ['four-causes', 'hylomorphism', 'the-four-elements'],
  },
  {
    id: 'act-two-metaphysics',
    title: 'Act II — Metaphysics',
    codex: ['unmoved-mover', 'potentiality', 'species'],
  },
  {
    id: 'act-two-soul',
    title: 'Act II — The Soul',
    codex: ['soul-as-form', 'soul-capacities', 'memory'],
  },
  {
    id: 'act-two-ethics',
    title: 'Act II — Ethics',
    codex: ['eudaimonia', 'virtue-and-the-mean', 'practical-wisdom'],
  },
  {
    id: 'act-two-poetics',
    title: 'Act II — Poetics',
    codex: ['mimesis-and-catharsis', 'plot-structure', 'hamartia'],
  },
  {
    id: 'act-two-life',
    title: 'Act II — Life',
    codex: ['observation-and-taxonomy', 'history-of-animals', 'parts-and-whole'],
  },
];
