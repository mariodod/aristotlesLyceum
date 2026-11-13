/**
 * Codex entries unlocked by Act II, Chapter 5 — Ethics.
 *
 * The mood changes here: the game gets quieter, and the questions stop being
 * about winning.
 */

import type { CodexEntry } from './types.ts';

export const ACT_TWO_ETHICS_CODEX: CodexEntry[] = [
  {
    id: 'eudaimonia',
    title: 'Eudaimonia',
    titleKey: 'codex.eudaimonia.title',
    originKey: 'codex.eudaimonia.origin',
    modernKey: 'codex.eudaimonia.modern',
    sourcesKey: 'codex.eudaimonia.sources',
    author: 'aristotle',
    origin:
      'The highest human good is not a feeling and not a thing you get. It is an activity of the soul in accordance with virtue, over a whole life. Aristotle calls it eudaimonia, and the root of the word is a common one: a god, or a good fortune. It is what a person is for, not what a person acquires.',
    modern:
      'The oldest serious rival to the accounts that run on pleasure, on preference satisfaction, or on income. The live question in moral philosophy is still whether eudaimonia is a good of its own or a summary of the others.',
    sources: ['Aristotle, Nicomachean Ethics I', 'Aristotle, Nicomachean Ethics X'],
  },
  {
    id: 'virtue-and-the-mean',
    title: 'Virtue and the Mean',
    titleKey: 'codex.virtue-and-the-mean.title',
    originKey: 'codex.virtue-and-the-mean.origin',
    modernKey: 'codex.virtue-and-the-mean.modern',
    sourcesKey: 'codex.virtue-and-the-mean.sources',
    author: 'aristotle',
    origin:
      'Virtue is a state of the character that decides, and decides well. It is not a feeling and it is not a rule; it is a habit. And it is a mean: courage sits between cowardice and rashness, and where it sits depends on the person and on what they are afraid of. Aristotle is careful about this: the mean is relative to us.',
    modern:
      "Medicine talks about dose the same way. Too little and too much are different illnesses, the treatment is not the midpoint, and the right amount is the one that works on this patient. Aristotle's version of the therapeutic window.",
    sources: ['Aristotle, Nicomachean Ethics II', 'Aristotle, Nicomachean Ethics VI'],
  },
  {
    id: 'practical-wisdom',
    title: 'Practical Wisdom',
    titleKey: 'codex.practical-wisdom.title',
    originKey: 'codex.practical-wisdom.origin',
    modernKey: 'codex.practical-wisdom.modern',
    sourcesKey: 'codex.practical-wisdom.sources',
    author: 'aristotle',
    origin:
      "Knowing the general is not enough. To act well you need phronesis, the intellectual virtue of judging what is to be done here. Aristotle's own example is a general who has spoken, the drum has beaten, and the line is wavering: at that moment nobody has time to consult the definition of courage.",
    modern:
      "The professional judgement no rule can supply: a surgeon's feel for tissue, a teacher's reading of a room, an engineer's sense of a machine about to fail. Every profession that trains judgement is training this, and Michael Polanyi wrote the modern version as knowing more than can be told.",
    sources: ['Aristotle, Nicomachean Ethics V', 'Aristotle, Nicomachean Ethics VI'],
  },
];
