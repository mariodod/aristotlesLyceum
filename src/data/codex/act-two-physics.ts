/**
 * Codex entries unlocked by Act II, Chapter 2 — Physics.
 *
 * The chapter where Isaac says "because of gravity" and Aristotle tells him
 * that gravity is a modern word for the answer he already had.
 */

import type { CodexEntry } from './types.ts';

export const ACT_TWO_PHYSICS_CODEX: CodexEntry[] = [
  {
    id: 'four-causes',
    title: 'The Four Causes',
    titleKey: 'codex.four-causes.title',
    originKey: 'codex.four-causes.origin',
    modernKey: 'codex.four-causes.modern',
    sourcesKey: 'codex.four-causes.sources',
    author: 'aristotle',
    origin:
      '"Why is this so?" has four answers, not one. The material cause is what it is made of, the formal cause is the shape it has, the efficient cause is what moved it, and the final cause is what it is for. Aristotle insists that an explanation of an artefact names all four, and that the fourth is the one everybody forgets.',
    modern:
      'Engineering failure analysis still asks the four questions in order: what was it made of, what shape was it, what caused it, and what was it for. The first three fill in a report. The fourth is the one that stops the same thing happening again.',
    sources: ['Aristotle, Physics I.6-8', 'Aristotle, Metaphysics I.5'],
  },
  {
    id: 'hylomorphism',
    title: 'Matter and Form',
    titleKey: 'codex.hylomorphism.title',
    originKey: 'codex.hylomorphism.origin',
    modernKey: 'codex.hylomorphism.modern',
    sourcesKey: 'codex.hylomorphism.sources',
    author: 'aristotle',
    origin:
      "A thing is not one substance made of another. It is one thing that is matter and form: the material there to be shaped, and the shape that makes it what it is. The statue is not bronze plus a statue; it is one object with two true accounts of it. Aristotle's word for the position, hylomorphism, is still the word.",
    modern:
      'The argument is alive in two places: philosophy of mind, where the mind is either the form of the brain or something else entirely, and philosophy of biology, where a living thing is an organised material system whose form is its organisation.',
    sources: ['Aristotle, Metaphysics VII', 'Aristotle, De Anima II.1'],
  },
  {
    id: 'the-four-elements',
    title: 'The Four Elements',
    titleKey: 'codex.the-four-elements.title',
    originKey: 'codex.the-four-elements.origin',
    modernKey: 'codex.the-four-elements.modern',
    sourcesKey: 'codex.the-four-elements.sources',
    author: 'aristotle',
    origin:
      'Everything in the world around us is a mixture of earth, water, air and fire. Each has a natural place it moves towards: earth down, fire up, and the two circling between. Aristotle takes the four elements from Empedocles and gives them a physics — a body moves when something pulls it away from where it wants to be.',
    modern:
      'The word element survived the contents. Modern chemistry has a hundred and eighteen elements and none of them is fire; the four-element scheme was right that the world is made of a few kinds of stuff and completely wrong about which, which is why the history of chemistry opens by throwing the list away.',
    sources: ['Aristotle, On the Heavens I', 'Aristotle, Physics IV'],
  },
];
