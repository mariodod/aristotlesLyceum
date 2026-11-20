import type { StoryScript } from '../../types/story.ts';
import { ACT_ONE } from './act-one.ts';
import { ACT_TWO_LOGIC } from './act-two-logic.ts';
import { ACT_TWO_PHYSICS } from './act-two-physics.ts';
import { ACT_TWO_METAPHYSICS } from './act-two-metaphysics.ts';
import { ACT_TWO_SOUL } from './act-two-soul.ts';
import { ACT_TWO_ETHICS } from './act-two-ethics.ts';
import { ACT_TWO_POETICS } from './act-two-poetics.ts';
import { ACT_TWO_LIFE } from './act-two-life.ts';
import { ACT_THREE_ALEXANDRIA } from './act-three-alexandria.ts';
import { ACT_THREE_BAGHDAD } from './act-three-baghdad.ts';
import { ACT_THREE_PARIS } from './act-three-paris.ts';
import { ACT_THREE_PADUA } from './act-three-padua.ts';
import { ACT_THREE_LONDON } from './act-three-london.ts';
import { ACT_THREE_UTRECHT } from './act-three-utrecht.ts';
import { ACT_THREE_KONIGSBERG } from './act-three-konigsberg.ts';
import { ACT_THREE_DOWN_HOUSE } from './act-three-down-house.ts';

/**
 * Chapter registry. The order here is the order the game plays them in.
 */
export const CHAPTERS: StoryScript[] = [
  ACT_ONE,
  ACT_TWO_LOGIC,
  ACT_TWO_PHYSICS,
  ACT_TWO_METAPHYSICS,
  ACT_TWO_SOUL,
  ACT_TWO_ETHICS,
  ACT_TWO_POETICS,
  ACT_TWO_LIFE,
  ACT_THREE_ALEXANDRIA,
  ACT_THREE_BAGHDAD,
  ACT_THREE_PARIS,
  ACT_THREE_PADUA,
  ACT_THREE_LONDON,
  ACT_THREE_UTRECHT,
  ACT_THREE_KONIGSBERG,
  ACT_THREE_DOWN_HOUSE,
];

const CHAPTER_IDS = CHAPTERS.map((script) => script.id);

export function chapterById(id: string): StoryScript | undefined {
  return CHAPTERS.find((script) => script.id === id);
}

export function chapterIndex(id: string): number {
  return CHAPTER_IDS.indexOf(id);
}

/**
 * The chapter a new game starts at, or the first one the player has not
 * finished.
 *
 * The title screen offers this as CONTINUE, so a player who has finished
 * Act I lands in the Lyceum and not back in the bedroom. When the whole
 * game is finished it returns the last chapter, which is the one a replay
 * starts from.
 */
export function nextUncompletedChapter(completed: string[]): StoryScript {
  const next = CHAPTERS.find((script) => !completed.includes(script.id));

  if (next) {
    return next;
  }

  const last = CHAPTERS.at(-1);

  if (!last) {
    throw new Error('The registry has no chapters in it.');
  }

  return last;
}

/**
 * The chapter that follows the given one, if there is one.
 *
 * The chapter-complete card offers this as CONTINUE, so the player who
 * finishes a chapter walks straight into the next one.
 */
export function nextChapter(id: string): StoryScript | undefined {
  const index = chapterIndex(id);

  if (index < 0) {
    return undefined;
  }

  return CHAPTERS[index + 1];
}
