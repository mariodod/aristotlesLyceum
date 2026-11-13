/**
 * Codex entries unlocked by Act II, Chapter 4 — The Soul.
 *
 * Isaac's body is in a chair in ancient Greece and his memory is somewhere
 * else, and neither of them is sure what that means.
 */

import type { CodexEntry } from './types.ts';

export const ACT_TWO_SOUL_CODEX: CodexEntry[] = [
  {
    id: 'soul-as-form',
    title: 'The Soul as Form',
    titleKey: 'codex.soul-as-form.title',
    originKey: 'codex.soul-as-form.origin',
    modernKey: 'codex.soul-as-form.modern',
    sourcesKey: 'codex.soul-as-form.sources',
    author: 'aristotle',
    origin:
      'The soul is not a second thing inside the body, like a pilot inside a ship. It is the form of the body: what a living body is, and what it is for. Take the form out of the body and you have not found a ghost, you have found a corpse.',
    modern:
      'Still the sharpest question in philosophy of mind. If consciousness is the form of the brain, what is the form of a liver? Neuroscience has no answer it is happy with, and the argument that started here has not been settled by any instrument invented since.',
    sources: ['Aristotle, De Anima II.1', 'Aristotle, Metaphysics Z'],
  },
  {
    id: 'soul-capacities',
    title: 'The Capacities of the Soul',
    titleKey: 'codex.soul-capacities.title',
    originKey: 'codex.soul-capacities.origin',
    modernKey: 'codex.soul-capacities.modern',
    sourcesKey: 'codex.soul-capacities.sources',
    author: 'aristotle',
    origin:
      'Aristotle sorts living things by what their souls can do. Plants nourish and grow. Animals additionally sense, and move towards what is good for them. A human being adds thought, the capacity that works on the objects of thought without touching them. Each capacity adds a level; none of them knocks the levels below it out.',
    modern:
      'The same ladder under different names in psychology and machine learning: a thermostat is not a cat, a cat is not a person, and the difference is not a matter of degree. Cognitive science is still arguing about whether the rungs are really separate.',
    sources: ['Aristotle, De Anima II.2', 'Aristotle, De Anima III'],
  },
  {
    id: 'memory',
    title: 'Memory',
    titleKey: 'codex.memory.title',
    originKey: 'codex.memory.origin',
    modernKey: 'codex.memory.modern',
    sourcesKey: 'codex.memory.sources',
    author: 'aristotle',
    origin:
      'Memory is not a storehouse of pictures. It is a movement of the soul that leaves a trace, like a seal pressed into wax, and remembering is the activity of a part of the soul that is disposed to be moved the same way again. Aristotle notices that remembering needs a sense of time and knowing does not.',
    modern:
      'The trace model is out of fashion and the question is not. Experiments show that a memory is rebuilt each time it is recalled rather than played back, which is what Aristotle would have said if anyone had asked him how a seal in wax works.',
    sources: ['Aristotle, De Anima III.3', 'Aristotle, On Memory'],
  },
];
