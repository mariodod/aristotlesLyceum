import type { StoryScript } from '../../types/story.ts';

/**
 * Act I takes place in Isaac's bedroom the night before the exam. The whole
 * act is one continuous shot; it exists to establish the character, the
 * stakes, and the tone before the dream starts.
 */
export const ACT_ONE: StoryScript = {
  id: 'act-one',
  chapter: 'act-one',
  title: 'Act I — The Desk',
  backdrop: 'backdrop-bedroom',
  steps: [
    { at: 'open', kind: 'chapter', title: 'ACT I', subtitle: 'The Desk' },
    { at: 'stage-isaac', kind: 'stage', actors: [{ character: 'isaac', x: 190 }] },
    {
      at: 'open-line',
      kind: 'say',
      speaker: 'narrator',
      text: 'Tuesday. 11:47 PM. The exam is in nine hours and the only book open on the desk is Aristotle.',
    },
    {
      at: 'isaac-1',
      kind: 'say',
      speaker: 'isaac',
      text: 'Nine hours. Nine hours to become a person who understands metaphysics. That is not a thing a person can do.',
      expression: 'tired',
    },
    {
      at: 'isaac-2',
      kind: 'say',
      speaker: 'isaac',
      text: 'Philosophy is the one subject where you can read every page, understand every word, and still fail the exam. That is the whole subject.',
      expression: 'angry',
    },
    {
      at: 'isaac-3',
      kind: 'say',
      speaker: 'narrator',
      text: 'He turns the page anyway. The lamp is the only light left in the room.',
    },
    {
      at: 'isaac-4',
      kind: 'say',
      speaker: 'isaac',
      text: 'Page one hundred and twelve. "All men by nature desire to know." Page one hundred and thirteen. "Such is the object of education..."',
      expression: 'tired',
    },
    {
      at: 'isaac-5',
      kind: 'say',
      speaker: 'isaac',
      text: 'Sure. Blah blah. Knowledge. Very useful. Tell me, Aristotle, is this going to be on the test?',
      expression: 'angry',
    },
    {
      at: 'isaac-6',
      kind: 'say',
      speaker: 'narrator',
      text: 'He does not notice that the words on the page have started to move.',
    },
    {
      at: 'isaac-7',
      kind: 'say',
      speaker: 'isaac',
      text: 'Wait. That is not... the letters are not doing that.',
      expression: 'surprised',
    },
    {
      at: 'choice-1',
      kind: 'choice',
      speaker: 'isaac',
      prompt: 'What do you do?',
      options: [
        {
          label: 'Read the next line out loud.',
          goto: 'read-on',
          stat: { stat: 'reason', delta: 1 },
        },
        {
          label: 'Hold the page down and keep reading.',
          goto: 'hold-page',
          stat: { stat: 'wisdom', delta: 1 },
        },
        {
          label: 'Close the book. Go to bed.',
          goto: 'close-book',
          stat: { stat: 'empathy', delta: 1 },
        },
      ],
    },
    {
      at: 'read-on',
      kind: 'say',
      speaker: 'isaac',
      text: '"...for the sake of knowing, and to know what is good..." He hears his own voice, but it is not quite his own voice.',
      expression: 'surprised',
    },
    {
      at: 'hold-page',
      kind: 'say',
      speaker: 'isaac',
      text: 'He presses the page flat with his palm and reads on, and the ink keeps moving under his hand.',
      expression: 'determined',
    },
    {
      at: 'close-book',
      kind: 'say',
      speaker: 'isaac',
      text: 'He shuts the book. He stands up to turn off the lamp. He does not remember which of those two things he did first.',
      expression: 'tired',
    },
    {
      at: 'merge-1',
      kind: 'jump',
      to: 'merge-2',
    },
    {
      at: 'merge-2',
      kind: 'say',
      speaker: 'narrator',
      text: 'The room does not go dark. It goes somewhere else.',
    },
    {
      at: 'merge-3',
      kind: 'say',
      speaker: 'narrator',
      text: 'The floor under his feet is stone. The air smells of olive oil and dust. And there is a voice, patiently, the way a teacher waits for a slow student:',
    },
    {
      at: 'merge-4',
      kind: 'say',
      speaker: 'aristotle',
      text: 'You have been reading me for six hours, Isaac. Shall we stop reading and start arguing?',
      expression: 'happy',
    },
    {
      at: 'stage-aristotle',
      kind: 'stage',
      actors: [
        { character: 'isaac', x: 190 },
        { character: 'aristotle', x: 470 },
      ],
    },
    { at: 'unlock-logic', kind: 'codex', entry: 'syllogism' },
    { at: 'unlock-dialectic', kind: 'codex', entry: 'dialectic' },
    {
      at: 'merge-5',
      kind: 'say',
      speaker: 'narrator',
      text: 'Somewhere behind Isaac, a school wakes up.',
    },
    { at: 'act-one-end', kind: 'end' },
  ],
};
