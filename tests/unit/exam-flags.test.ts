import { describe, expect, it } from 'vitest';
import { DialogueRuntime } from '../../src/systems/dialogue/dialogue-runtime.ts';
import { createDialogueState } from '../../src/types/story.ts';
import type { StoryScript } from '../../src/types/story.ts';

/** A two-question exam with the same shape as the real one. */
function examScript(): StoryScript {
  return {
    id: 'exam-test',
    backdrop: 'backdrop-classroom',
    steps: [
      {
        at: 'paper',
        kind: 'exam',
        goto: 'route',
        questions: [
          {
            text: 'One',
            options: [
              { label: 'right', correct: true },
              { label: 'honest', honest: true },
            ],
          },
          {
            text: 'Two',
            options: [
              { label: 'right', correct: true },
              { label: 'honest', honest: true },
            ],
          },
        ],
      },
      {
        at: 'route',
        kind: 'branch',
        flag: 'exam-apostate',
        ifTrue: 'apostate',
        ifFalse: 'honest-route',
      },
      {
        at: 'honest-route',
        kind: 'branch',
        flag: 'exam-honest',
        ifTrue: 'honest',
        ifFalse: 'pass',
      },
      { at: 'apostate', kind: 'say', speaker: 'narrator', text: 'Apostate.' },
      { at: 'honest', kind: 'say', speaker: 'narrator', text: 'Honest.' },
      { at: 'pass', kind: 'say', speaker: 'narrator', text: 'Pass.' },
      { at: 'end', kind: 'end' },
    ],
  };
}

describe('exam flags', () => {
  it('clears the previous ending when the paper starts again', () => {
    // A previous run reached the apostate ending and saved its flag.
    const state = createDialogueState();
    state.flags['exam-apostate'] = true;

    const runtime = new DialogueRuntime(examScript(), state);

    runtime.advance(); // reach the paper
    runtime.answer(1); // honest
    runtime.answer(1); // honest

    expect(runtime.getFlag('exam-apostate')).toBe(false);
    expect(runtime.getFlag('exam-honest')).toBe(true);
    expect(runtime.snapshot().flags['exam-honest']).toBe(true);
  });
});
