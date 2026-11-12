import { describe, expect, it } from 'vitest';
import { collectScriptFlags } from '../../src/systems/dialogue/script-flags.ts';
import type { StoryScript } from '../../src/types/story.ts';

const SCRIPT: StoryScript = {
  id: 'flags',
  chapter: 'flags',
  title: 'Flags',
  backdrop: 'backdrop-bedroom',
  steps: [
    {
      at: 'ask',
      kind: 'choice',
      speaker: 'isaac',
      prompt: 'Which?',
      options: [{ label: 'Yes', goto: 'yes', setFlag: 'went-yes' }],
    },
    { at: 'yes', kind: 'say', speaker: 'isaac', text: 'Yes.' },
    { at: 'flag', kind: 'flag', flag: 'saw-the-sky', value: true },
    { at: 'route', kind: 'branch', flag: 'went-yes', ifTrue: 'a', ifFalse: 'b' },
    { at: 'a', kind: 'say', speaker: 'isaac', text: 'A.' },
    { at: 'b', kind: 'say', speaker: 'isaac', text: 'B.' },
    { at: 'done', kind: 'end' },
  ],
};

describe('collectScriptFlags', () => {
  it('finds the flags a script sets', () => {
    expect(collectScriptFlags(SCRIPT)).toEqual(['went-yes', 'saw-the-sky']);
  });

  it('does not claim a flag the script only reads', () => {
    const script: StoryScript = {
      ...SCRIPT,
      steps: [{ at: 'route', kind: 'branch', flag: 'set-elsewhere', ifTrue: 'a', ifFalse: 'b' }],
    };

    expect(collectScriptFlags(script)).toEqual([]);
  });

  it('reports each flag once', () => {
    const script: StoryScript = {
      ...SCRIPT,
      steps: [
        { at: 'one', kind: 'flag', flag: 'same', value: true },
        { at: 'two', kind: 'flag', flag: 'same', value: false },
      ],
    };

    expect(collectScriptFlags(script)).toEqual(['same']);
  });
});
