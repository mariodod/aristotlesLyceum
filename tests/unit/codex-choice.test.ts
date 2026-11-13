import { describe, expect, it } from 'vitest';
import { DialogueRuntime } from '../../src/systems/dialogue/dialogue-runtime.ts';
import { createDialogueState } from '../../src/types/story.ts';
import type { DialogueState, StoryScript } from '../../src/types/story.ts';

/**
 * A choice with an option that refers to a Codex entry, one that does not,
 * and a second choice later in the chapter.
 */
const SCRIPT: StoryScript = {
  id: 'codex-choice',
  chapter: 'codex-choice',
  title: 'Codex Choice',
  backdrop: 'backdrop-bedroom',
  steps: [
    {
      at: 'ask',
      kind: 'choice',
      speaker: 'aristotle',
      prompt: 'What do you say?',
      options: [
        { label: 'Guess.', goto: 'guess' },
        { label: 'Cite the journal.', goto: 'cite', codex: 'syllogism' },
        { label: 'Walk away.', goto: 'walk' },
      ],
    },
    { at: 'guess', kind: 'say', speaker: 'isaac', text: 'He guesses.' },
    { at: 'guess-end', kind: 'jump', to: 'file' },
    { at: 'cite', kind: 'say', speaker: 'isaac', text: 'He cites it.' },
    { at: 'cite-end', kind: 'jump', to: 'file' },
    { at: 'walk', kind: 'say', speaker: 'isaac', text: 'He walks away.' },
    { at: 'walk-end', kind: 'jump', to: 'file' },
    { at: 'file', kind: 'codex', entry: 'dialectic' },
    {
      at: 'ask-again',
      kind: 'choice',
      speaker: 'aristotle',
      prompt: 'And now?',
      options: [
        { label: 'Stay quiet.', goto: 'quiet' },
        { label: 'Use what he just taught you.', goto: 'use-it', codex: 'dialectic' },
      ],
    },
    { at: 'quiet', kind: 'say', speaker: 'isaac', text: 'He stays quiet.' },
    { at: 'quiet-end', kind: 'jump', to: 'done' },
    { at: 'use-it', kind: 'say', speaker: 'isaac', text: 'He uses it.' },
    { at: 'use-it-end', kind: 'jump', to: 'done' },
    { at: 'done', kind: 'end' },
  ],
};

function optionsOf(events: ReturnType<DialogueRuntime['advance']>): string[] {
  const choice = events.find((event) => event.type === 'choice');

  if (!choice || choice.type !== 'choice') {
    throw new Error('No choice was offered.');
  }

  return choice.options.map((option) => option.label);
}

describe('codex-driven choices', () => {
  it('does not offer an option the player has not read the entry for', () => {
    const runtime = new DialogueRuntime(SCRIPT, createDialogueState());

    expect(optionsOf(runtime.advance())).toEqual(['Guess.', 'Walk away.']);
  });

  it('offers the option once the entry has been read', () => {
    const state: DialogueState = { ...createDialogueState(), unlockedCodex: ['syllogism'] };
    const runtime = new DialogueRuntime(SCRIPT, state);

    expect(optionsOf(runtime.advance())).toEqual(['Guess.', 'Cite the journal.', 'Walk away.']);
  });

  it('opens an option with an entry the player has just read', () => {
    const runtime = new DialogueRuntime(SCRIPT, createDialogueState());

    // The first choice, then the branch that files an entry.
    runtime.advance();
    runtime.choose(0);

    const events = runtime.advance();

    expect(events.some((event) => event.type === 'codex')).toBe(true);
    expect(optionsOf(events)).toEqual(['Stay quiet.', 'Use what he just taught you.']);
  });

  it('takes the option the player picked from the list that was offered', () => {
    const runtime = new DialogueRuntime(SCRIPT, createDialogueState());

    runtime.advance();

    // The offered list is the two options that do not need the Codex, so the
    // second one is 'Walk away.' and not the option in the script.
    runtime.choose(1);

    expect(runtime.currentStep?.kind).toBe('say');
    expect(runtime.currentStep?.at).toBe('walk');
  });

  it('takes the codex option when it is on offer and it is picked', () => {
    const state: DialogueState = { ...createDialogueState(), unlockedCodex: ['syllogism'] };
    const runtime = new DialogueRuntime(SCRIPT, state);

    runtime.advance();
    runtime.choose(1);

    expect(runtime.currentStep?.kind).toBe('say');
    expect(runtime.currentStep?.at).toBe('cite');
  });

  it('keeps the entries it has read in its snapshot', () => {
    const state: DialogueState = { ...createDialogueState(), unlockedCodex: ['syllogism'] };
    const runtime = new DialogueRuntime(SCRIPT, state);

    expect(runtime.snapshot().unlockedCodex).toEqual(['syllogism']);
  });
});
