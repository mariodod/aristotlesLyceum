import { describe, expect, it } from 'vitest';
import { findUnreachableSteps } from '../../src/systems/dialogue/reachability.ts';
import { CHAPTERS } from '../../src/data/script/registry.ts';
import type { StoryScript } from '../../src/types/story.ts';

const LINEAR: StoryScript = {
  id: 'linear',
  chapter: 'linear',
  title: 'Linear',
  backdrop: 'backdrop-bedroom',
  steps: [
    { at: 'a', kind: 'say', speaker: 'isaac', text: 'One.' },
    { at: 'b', kind: 'say', speaker: 'isaac', text: 'Two.' },
    { at: 'c', kind: 'end' },
  ],
};

describe('findUnreachableSteps', () => {
  it('finds nothing in a straight line', () => {
    expect(findUnreachableSteps(LINEAR)).toEqual([]);
  });

  it('finds a step that sits behind a choice and is never jumped to', () => {
    const script: StoryScript = {
      ...LINEAR,
      steps: [
        {
          at: 'ask',
          kind: 'choice',
          speaker: 'isaac',
          prompt: 'Which?',
          options: [{ label: 'Yes', goto: 'yes' }],
        },
        { at: 'yes', kind: 'say', speaker: 'isaac', text: 'Yes.' },
        { at: 'yes-jump', kind: 'jump', to: 'done' },
        { at: 'orphan', kind: 'say', speaker: 'isaac', text: 'Never shown.' },
        { at: 'done', kind: 'end' },
      ],
    };

    expect(findUnreachableSteps(script)).toEqual(['orphan']);
  });

  it('reaches everything when both branches merge', () => {
    const script: StoryScript = {
      ...LINEAR,
      steps: [
        {
          at: 'ask',
          kind: 'choice',
          speaker: 'isaac',
          prompt: 'Which?',
          options: [
            { label: 'Yes', goto: 'yes' },
            { label: 'No', goto: 'no' },
          ],
        },
        { at: 'yes', kind: 'say', speaker: 'isaac', text: 'Yes.' },
        { at: 'yes-jump', kind: 'jump', to: 'done' },
        { at: 'no', kind: 'say', speaker: 'isaac', text: 'No.' },
        { at: 'no-jump', kind: 'jump', to: 'done' },
        { at: 'done', kind: 'end' },
      ],
    };

    expect(findUnreachableSteps(script)).toEqual([]);
  });

  it('follows both sides of a branch', () => {
    const script: StoryScript = {
      ...LINEAR,
      steps: [
        { at: 'route', kind: 'branch', flag: 'x', ifTrue: 'left', ifFalse: 'right' },
        { at: 'left', kind: 'say', speaker: 'isaac', text: 'Left.' },
        { at: 'left-jump', kind: 'jump', to: 'done' },
        { at: 'right', kind: 'say', speaker: 'isaac', text: 'Right.' },
        { at: 'right-jump', kind: 'jump', to: 'done' },
        { at: 'done', kind: 'end' },
      ],
    };

    expect(findUnreachableSteps(script)).toEqual([]);
  });

  it('reports nothing unreachable in the shipped chapters', () => {
    for (const script of CHAPTERS) {
      expect(findUnreachableSteps(script)).toEqual([]);
    }
  });
});
