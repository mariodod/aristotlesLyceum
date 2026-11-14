import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../../src/data/script/registry.ts';
import {
  readsLikeNarration,
  speaksInFirstPerson,
} from '../../src/systems/dialogue/speaker-voice.ts';

/**
 * These checks are the in-repo version of the content linter's voice rules.
 *
 * A line that reads like narration but is tagged with a character is the one
 * mistake the name plate cannot forgive: the game says Isaac said it, and
 * Isaac did not.
 */
describe('readsLikeNarration', () => {
  it('reads a line that opens a sentence with "he" as narration', () => {
    expect(readsLikeNarration('He says it again. Same thing.')).toBe(true);
    expect(readsLikeNarration('He had wanted to know why.')).toBe(true);
    expect(readsLikeNarration('Meaningless words are easier. He has noticed that before.')).toBe(
      true,
    );
  });

  it('reads a line that addresses somebody as speech', () => {
    expect(readsLikeNarration('I have been reading me for six hours.')).toBe(false);
    expect(readsLikeNarration('You close the book and you are still you.')).toBe(false);
    expect(readsLikeNarration('Give me the exam.')).toBe(false);
  });

  it('does not read a quotation as the speaker', () => {
    // The line opens with "He types:", so it is narration, and the first
    // person inside the quotation does not make it speech.
    expect(readsLikeNarration('He types: "I am not doing this again"')).toBe(true);
  });

  it('does not read a line about somebody else as narration', () => {
    // The character names the person, so the line is speech.
    expect(readsLikeNarration('Plato was wrong, and he knew it.')).toBe(false);
  });
});

describe('speaksInFirstPerson', () => {
  it('hears the first person', () => {
    expect(speaksInFirstPerson('I read it again.')).toBe(true);
    expect(speaksInFirstPerson('Give me the exam.')).toBe(true);
  });

  it('leaves a quotation out of it', () => {
    expect(speaksInFirstPerson('He types: "I am not doing this again"')).toBe(false);
  });

  it('does not hear it in the third person', () => {
    expect(speaksInFirstPerson('He turns the page anyway.')).toBe(false);
  });
});

describe('the shipped scripts', () => {
  it('never tags a narrated line with a character', () => {
    for (const script of CHAPTERS) {
      for (const step of script.steps) {
        if (step.kind !== 'say' || step.speaker === 'narrator') {
          continue;
        }

        expect(
          readsLikeNarration(step.text),
          `line "${step.at}" reads like narration but is tagged as ${step.speaker}`,
        ).toBe(false);
      }
    }
  });

  it('never lets the narrator speak in the first person', () => {
    for (const script of CHAPTERS) {
      for (const step of script.steps) {
        if (step.kind !== 'say' || step.speaker !== 'narrator') {
          continue;
        }

        expect(
          speaksInFirstPerson(step.text),
          `the narrator speaks in the first person at "${step.at}"`,
        ).toBe(false);
      }
    }
  });

  it('only lets a narrated line name a face', () => {
    for (const script of CHAPTERS) {
      for (const step of script.steps) {
        if (step.kind !== 'say') {
          continue;
        }

        if (step.face !== undefined) {
          expect(step.speaker).toBe('narrator');
        }
      }
    }
  });
});
