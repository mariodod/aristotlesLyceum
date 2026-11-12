import { describe, expect, it } from 'vitest';
import { DialogueRuntime } from '../../src/systems/dialogue/dialogue-runtime.ts';
import { createDialogueState } from '../../src/types/story.ts';
import type { StoryScript } from '../../src/types/story.ts';

const SCRIPT: StoryScript = {
  id: 'test',
  chapter: 'test',
  title: 'Test',
  backdrop: 'backdrop-bedroom',
  steps: [
    { at: 'start', kind: 'chapter', title: 'ACT I' },
    { at: 'a', kind: 'say', speaker: 'isaac', text: 'First line.' },
    { at: 'b', kind: 'say', speaker: 'narrator', text: 'Second line.' },
    {
      at: 'ask',
      kind: 'choice',
      speaker: 'aristotle',
      prompt: 'What now?',
      options: [
        { label: 'Left', goto: 'left', stat: { stat: 'reason', delta: 1 } },
        {
          label: 'Right',
          goto: 'right',
          stat: { stat: 'empathy', delta: 2 },
          setFlag: 'went-right',
        },
      ],
    },
    { at: 'left', kind: 'say', speaker: 'isaac', text: 'Went left.' },
    { at: 'left-end', kind: 'jump', to: 'unlock' },
    { at: 'right', kind: 'say', speaker: 'isaac', text: 'Went right.' },
    { at: 'right-end', kind: 'jump', to: 'unlock' },
    { at: 'unlock', kind: 'codex', entry: 'syllogism' },
    { at: 'finish', kind: 'end' },
  ],
};

function runtime() {
  return new DialogueRuntime(SCRIPT, createDialogueState());
}

describe('DialogueRuntime', () => {
  it('reports the chapter card before the first line', () => {
    const events = runtime().advance();

    expect(events[0]).toEqual({ type: 'chapter', title: 'ACT I' });
    expect(events[1]).toEqual({
      type: 'say',
      speaker: 'isaac',
      text: 'First line.',
      expression: 'neutral',
    });
  });

  it('advances one line at a time', () => {
    const state = runtime();
    state.advance();

    const events = state.advance();
    expect(events).toEqual([
      { type: 'say', speaker: 'narrator', text: 'Second line.', expression: 'neutral' },
    ]);
  });

  it('keeps the expression a script asks for', () => {
    const script: StoryScript = {
      ...SCRIPT,
      steps: [{ at: 'a', kind: 'say', speaker: 'isaac', text: 'Hi', expression: 'angry' }],
    };

    const events = new DialogueRuntime(script).advance();
    expect(events[0]).toMatchObject({ expression: 'angry' });
  });

  it('presents the choice and waits for the player', () => {
    const state = runtime();
    state.advance();
    state.advance();

    const events = state.advance();
    expect(events[0]).toMatchObject({
      type: 'choice',
      speaker: 'aristotle',
      prompt: 'What now?',
    });
    expect(state.currentStep?.kind).toBe('choice');
  });

  it('repeats the choice instead of skipping past it', () => {
    const state = runtime();
    state.advance();
    state.advance();
    state.advance();

    const events = state.advance();
    expect(events[0]).toMatchObject({ type: 'choice' });
  });

  it('applies the stat and flag of the chosen option', () => {
    const state = runtime();
    state.advance();
    state.advance();
    state.advance();

    const events = state.choose(1);

    expect(events).toEqual([
      { type: 'stat', stat: 'empathy', delta: 2, total: 2 },
      { type: 'flag', flag: 'went-right', value: true },
      { type: 'say', speaker: 'isaac', text: 'Went right.', expression: 'neutral' },
    ]);
    expect(state.getStat('empathy')).toBe(2);
    expect(state.getFlag('went-right')).toBe(true);
  });

  it('refuses a choice when nothing is pending', () => {
    expect(() => runtime().choose(0)).toThrow(/no choice/i);
  });

  it('rejects a choice index that does not exist', () => {
    const state = runtime();
    state.advance();
    state.advance();
    state.advance();

    expect(() => state.choose(9)).toThrow(/No choice option/);
  });

  it('emits codex unlocks in order', () => {
    const state = runtime();
    state.advance();
    state.advance();
    state.advance();
    state.choose(0);

    const events = state.advance();
    expect(events).toEqual([{ type: 'codex', entry: 'syllogism' }, { type: 'end' }]);
  });

  it('ends the script', () => {
    const state = runtime();
    state.advance();
    state.advance();
    state.advance();
    state.choose(0);
    state.advance();

    expect(state.finished).toBe(true);
  });

  it('rejects a script with duplicate labels', () => {
    const script: StoryScript = {
      ...SCRIPT,
      steps: [
        { at: 'same', kind: 'say', speaker: 'isaac', text: 'One' },
        { at: 'same', kind: 'say', speaker: 'isaac', text: 'Two' },
      ],
    };

    expect(() => new DialogueRuntime(script)).toThrow(/Duplicate script label/);
  });

  it('rejects a choice that jumps to a label that does not exist', () => {
    const script: StoryScript = {
      ...SCRIPT,
      steps: [
        {
          at: 'ask',
          kind: 'choice',
          speaker: 'isaac',
          prompt: 'Where?',
          options: [{ label: 'Nowhere', goto: 'missing' }],
        },
      ],
    };

    const state = new DialogueRuntime(script);
    state.advance();

    expect(() => state.choose(0)).toThrow(/unknown label/);
  });

  it('restores flags and stats from a previous session', () => {
    const state = createDialogueState();
    state.flags['went-right'] = true;
    state.stats.reason = 4;

    const restored = new DialogueRuntime(SCRIPT, state);
    expect(restored.getFlag('went-right')).toBe(true);
    expect(restored.getStat('reason')).toBe(4);
  });
});
