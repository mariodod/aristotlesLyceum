import { describe, expect, it } from 'vitest';
import { DialogueRuntime } from '../../src/systems/dialogue/dialogue-runtime.ts';
import { createDialogueState } from '../../src/types/story.ts';
import type { StoryScript } from '../../src/types/story.ts';

const SCRIPT: StoryScript = {
  id: 'battle',
  chapter: 'battle',
  title: 'Battle',
  backdrop: 'backdrop-lyceum',
  steps: [
    { at: 'open', kind: 'say', speaker: 'narrator', text: 'The argument begins.' },
    {
      at: 'fight',
      kind: 'dialectic',
      opponent: 'certainty',
      returnTo: 'after-fight',
    },
    { at: 'after-fight', kind: 'say', speaker: 'narrator', text: 'And that was that.' },
    { at: 'done', kind: 'end' },
  ],
};

describe('the dialectic step', () => {
  it('hands the chapter over and blocks until it is won', () => {
    const state = new DialogueRuntime(SCRIPT, createDialogueState());

    const first = state.advance();
    expect(first[0]).toMatchObject({ type: 'say' });

    const events = state.advance();
    expect(events).toEqual([{ type: 'dialectic', opponent: 'certainty', returnTo: 'after-fight' }]);
    expect(state.currentStep?.kind).toBe('dialectic');
  });

  it('does not run past the argument on its own', () => {
    const state = new DialogueRuntime(SCRIPT, createDialogueState());
    state.advance();
    state.advance();

    const events = state.advance();
    expect(events).toEqual([{ type: 'dialectic', opponent: 'certainty', returnTo: 'after-fight' }]);
  });
});

describe('resuming a chapter', () => {
  it('starts at the label it is given', () => {
    const state = new DialogueRuntime(SCRIPT, createDialogueState(), 'after-fight');

    const events = state.advance();
    expect(events[0]).toMatchObject({ type: 'say', text: 'And that was that.' });
  });

  it('refuses a label that does not exist', () => {
    expect(() => new DialogueRuntime(SCRIPT, createDialogueState(), 'nowhere')).toThrow(
      /unknown label/,
    );
  });
});
