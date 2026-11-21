import type { StoryScript } from '../../types/story.ts';

/**
 * Act IV — The Exam.
 *
 * Isaac wakes at the desk with ten minutes and the same paper he was
 * dreading. Every question came out of the dream, and every one carries an
 * honest "I don't know" alongside the confident answers. The marking is
 * pure, the score is never shown, and the ending is named by a flag.
 */
export const ACT_FOUR_EXAM: StoryScript = {
  id: 'act-four-exam',
  backdrop: 'backdrop-classroom',
  steps: [
    {
      at: 'open',
      kind: 'chapter',
      title: 'ACT IV',
      subtitle: 'The Exam',
      titleKey: 'act-four-exam.chapter.title',
      subtitleKey: 'act-four-exam.chapter.subtitle',
    },
    {
      at: 'stage',
      kind: 'stage',
      actors: [
        { character: 'isaac', x: 230 },
        { character: 'examiner', x: 430 },
      ],
    },
    {
      at: 'wake-1',
      kind: 'say',
      speaker: 'narrator',
      key: 'act-four-exam.wake-1',
      text: 'The dream ends the way the night began: a desk, a lamp, a book open at page one hundred and twelve. The clock says ten minutes to the exam.',
    },
    {
      at: 'wake-2',
      kind: 'say',
      speaker: 'isaac',
      key: 'act-four-exam.wake-2',
      text: 'I fell asleep. I actually fell asleep, and I dreamed about Aristotle, and he kept asking me questions.',
      expression: 'surprised',
    },
    {
      at: 'wake-3',
      kind: 'say',
      speaker: 'narrator',
      key: 'act-four-exam.wake-3',
      text: 'The exam room is the same room, with the lights on and a clock that has never once been wrong.',
      face: 'isaac',
      expression: 'tired',
    },
    {
      at: 'examiner-1',
      kind: 'say',
      speaker: 'examiner',
      key: 'act-four-exam.examiner-1',
      text: 'You are here, Isaac. The paper is in front of you. You have ten minutes, and the questions are the ones you were afraid of last night.',
      expression: 'thinking',
    },
    {
      at: 'isaac-ready',
      kind: 'say',
      speaker: 'isaac',
      key: 'act-four-exam.isaac-ready',
      text: 'Some of them, anyway. I know where they came from now, which is more than I could have said at eleven forty-seven.',
      expression: 'determined',
    },
    {
      at: 'the-exam',
      kind: 'exam',
      goto: 'ending-route',
      questions: [
        {
          key: 'act-four-exam.q1',
          text: 'What does a demonstration require?',
          options: [
            { label: 'A true conclusion, whatever the premises.', key: 'act-four-exam.q1.a' },
            {
              label: 'True premises, primary and more evident than the conclusion.',
              key: 'act-four-exam.q1.b',
              correct: true,
            },
            { label: 'A majority vote among the students.', key: 'act-four-exam.q1.c' },
            { label: "I don't know.", key: 'act-four-exam.q1.d', honest: true },
          ],
        },
        {
          key: 'act-four-exam.q2',
          text: 'Why does the word "why" have four answers?',
          options: [
            { label: 'Because everything has four parts.', key: 'act-four-exam.q2.a' },
            {
              label: 'Because it asks after matter, form, mechanism and purpose.',
              key: 'act-four-exam.q2.b',
              correct: true,
            },
            { label: 'Because Aristotle liked the number four.', key: 'act-four-exam.q2.c' },
            { label: "I don't know.", key: 'act-four-exam.q2.d', honest: true },
          ],
        },
        {
          key: 'act-four-exam.q3',
          text: "What is the soul, on Aristotle's account?",
          options: [
            { label: 'A passenger inside the body.', key: 'act-four-exam.q3.a' },
            { label: 'The form of a living body.', key: 'act-four-exam.q3.b', correct: true },
            { label: 'A thin kind of breath.', key: 'act-four-exam.q3.c' },
            { label: "I don't know.", key: 'act-four-exam.q3.d', honest: true },
          ],
        },
        {
          key: 'act-four-exam.q4',
          text: 'What is a virtue?',
          options: [
            { label: 'A feeling of goodwill.', key: 'act-four-exam.q4.a' },
            {
              label: 'A habit of deciding well, a mean relative to us.',
              key: 'act-four-exam.q4.b',
              correct: true,
            },
            { label: 'Never breaking a rule.', key: 'act-four-exam.q4.c' },
            { label: "I don't know.", key: 'act-four-exam.q4.d', honest: true },
          ],
        },
        {
          key: 'act-four-exam.q5',
          text: "What did Darwin do with Aristotle's book?",
          options: [
            { label: 'He proved every word of it right.', key: 'act-four-exam.q5.a' },
            {
              label: 'He read it on the voyage and criticised it when he got home.',
              key: 'act-four-exam.q5.b',
              correct: true,
            },
            { label: 'He had never heard of it.', key: 'act-four-exam.q5.c' },
            { label: "I don't know.", key: 'act-four-exam.q5.d', honest: true },
          ],
        },
        {
          key: 'act-four-exam.q6',
          text: 'How many kinds of animal did Aristotle describe in his natural history?',
          options: [
            { label: 'About five hundred.', key: 'act-four-exam.q6.a', correct: true },
            { label: 'About fifty.', key: 'act-four-exam.q6.b' },
            { label: 'About five thousand.', key: 'act-four-exam.q6.c' },
            { label: "I don't know.", key: 'act-four-exam.q6.d', honest: true },
          ],
        },
      ],
    },
    {
      at: 'ending-route',
      kind: 'branch',
      flag: 'exam-apostate',
      ifTrue: 'apostate-route',
      ifFalse: 'ending-route-2',
    },
    {
      at: 'ending-route-2',
      kind: 'branch',
      flag: 'exam-honest',
      ifTrue: 'honest-route',
      ifFalse: 'pass-route',
    },
    { at: 'apostate-route', kind: 'jump', to: 'end-apostate' },
    { at: 'honest-route', kind: 'jump', to: 'end-honest' },
    { at: 'pass-route', kind: 'jump', to: 'end-pass' },
    {
      at: 'end-apostate',
      kind: 'chapterEnd',
      title: 'THE APOSTATE',
      subtitle: 'He got every answer right, and nobody in his life expected it.',
      key: 'act-four-exam.end-apostate.title',
      subtitleKey: 'act-four-exam.end-apostate.subtitle',
    },
    { at: 'apostate-jump', kind: 'jump', to: 'after-ending' },
    {
      at: 'end-honest',
      kind: 'chapterEnd',
      title: 'THE HONEST ONE',
      subtitle: 'He failed the exam and understood what he had learned.',
      key: 'act-four-exam.end-honest.title',
      subtitleKey: 'act-four-exam.end-honest.subtitle',
    },
    { at: 'honest-jump', kind: 'jump', to: 'after-ending' },
    {
      at: 'end-pass',
      kind: 'chapterEnd',
      title: 'THE PASSING GRADE',
      subtitle: 'He did well, and was annoyed that he had to admit why.',
      key: 'act-four-exam.end-pass.title',
      subtitleKey: 'act-four-exam.end-pass.subtitle',
    },
    { at: 'pass-jump', kind: 'jump', to: 'after-ending' },
    {
      at: 'after-ending',
      kind: 'say',
      speaker: 'narrator',
      key: 'act-four-exam.after-ending',
      text: 'The examiner did not show Isaac the mark. She had never shown anybody the mark, and the not knowing was the point.',
      face: 'isaac',
      expression: 'tired',
    },
    {
      at: 'final-1',
      kind: 'say',
      speaker: 'examiner',
      key: 'act-four-exam.final-1',
      text: 'You look as if you have been somewhere, Isaac. Next time, try to stay awake in class.',
      expression: 'happy',
    },
    {
      at: 'final-2',
      kind: 'say',
      speaker: 'isaac',
      key: 'act-four-exam.final-2',
      text: '...I brought the margin.',
      expression: 'determined',
    },
    { at: 'act-four-exam-end', kind: 'end' },
  ],
};
