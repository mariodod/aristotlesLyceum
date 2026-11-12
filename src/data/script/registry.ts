import type { StoryScript } from '../../types/story.ts';
import { ACT_ONE } from './act-one.ts';

/**
 * Chapter registry. The order here is the order the game plays them in.
 */
export const CHAPTERS: StoryScript[] = [ACT_ONE];

export const CHAPTER_IDS = CHAPTERS.map((script) => script.id);

export function chapterById(id: string): StoryScript | undefined {
  return CHAPTERS.find((script) => script.id === id);
}

export function chapterIndex(id: string): number {
  return CHAPTER_IDS.indexOf(id);
}
