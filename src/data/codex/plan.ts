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

/**
 * No chapter is planned but unwritten now that Act II has shipped. The
 * file stays because it is the contract the linter uses while a chapter
 * is being written: add a claim here and the chapter owes its entries.
 */
export const PLANNED_CHAPTERS: PlannedChapter[] = [
  {
    id: 'act-three-london',
    title: 'Act III — London',
    codex: ['baconian-method'],
  },
  {
    id: 'act-three-utrecht',
    title: 'Act III — Utrecht',
    codex: ['cartesian-doubt'],
  },
  {
    id: 'act-three-konigsberg',
    title: 'Act III — Königsberg',
    codex: ['kantian-categories'],
  },
  {
    id: 'act-three-down-house',
    title: 'Act III — Down House',
    codex: ['darwinian-descent'],
  },
];
