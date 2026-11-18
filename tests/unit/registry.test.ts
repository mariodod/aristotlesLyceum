import { describe, expect, it } from 'vitest';
import {
  CHAPTERS,
  chapterById,
  chapterIndex,
  nextChapter,
  nextUncompletedChapter,
} from '../../src/data/script/registry.ts';

describe('the chapter registry', () => {
  it('holds the chapters in the order the game plays them in', () => {
    expect(CHAPTERS.map((script) => script.id)).toEqual([
      'act-one',
      'act-two-logic',
      'act-two-physics',
    ]);
  });

  it('finds a chapter by its id and knows its place in the order', () => {
    expect(chapterById('act-two-logic')?.id).toBe('act-two-logic');
    expect(chapterIndex('act-two-logic')).toBe(1);
    expect(chapterById('not-a-chapter')).toBeUndefined();
    expect(chapterIndex('not-a-chapter')).toBe(-1);
  });

  it('starts a new game at the first chapter', () => {
    expect(nextUncompletedChapter([]).id).toBe('act-one');
  });

  it('continues at the first chapter the player has not finished', () => {
    expect(nextUncompletedChapter(['act-one']).id).toBe('act-two-logic');
    expect(nextUncompletedChapter(['act-one', 'act-two-logic']).id).toBe('act-two-physics');
    // Completing a later chapter first still starts at the earlier one.
    expect(nextUncompletedChapter(['act-two-logic']).id).toBe('act-one');
  });

  it('replays the last chapter once the whole game is finished', () => {
    expect(nextUncompletedChapter(CHAPTERS.map((script) => script.id)).id).toBe(
      CHAPTERS[CHAPTERS.length - 1]?.id,
    );
  });

  it('knows which chapter comes next, and when there is none', () => {
    expect(nextChapter('act-one')?.id).toBe('act-two-logic');
    expect(nextChapter('act-two-logic')?.id).toBe('act-two-physics');
    expect(nextChapter('act-two-physics')).toBeUndefined();
    expect(nextChapter('not-a-chapter')).toBeUndefined();
  });
});
