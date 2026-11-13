/**
 * Codex entries unlocked by Act II, Chapter 1 — Logic.
 *
 * Aristotle's logic is where the game stops being a story about a boy who
 * hates philosophy and becomes a story about the shape of an argument.
 */

import type { CodexEntry } from './types.ts';

export const ACT_TWO_LOGIC_CODEX: CodexEntry[] = [
  {
    id: 'mood-and-figure',
    title: 'Mood and Figure',
    titleKey: 'codex.mood-and-figure.title',
    originKey: 'codex.mood-and-figure.origin',
    modernKey: 'codex.mood-and-figure.modern',
    sourcesKey: 'codex.mood-and-figure.sources',
    author: 'aristotle',
    origin:
      'A syllogism is three propositions about three things. Where the middle thing sits decides the figure — Aristotle uses three of them — and the pattern of the three propositions decides the mood. The Prior Analytics is the table of which moods hold in which figure, and it is the shortest complete account of deductive validity ever written.',
    modern:
      'The table is still the shortest statement of what it means for a conclusion to follow. Proof theory re-derives the same constraints from different rules, and the figure still decides whether an argument holds together. A theorem prover and a first-year logic student are reading the same chart.',
    sources: ['Aristotle, Prior Analytics I', 'Aristotle, Prior Analytics II'],
  },
  {
    id: 'categories',
    title: 'The Categories',
    titleKey: 'codex.categories.title',
    originKey: 'codex.categories.origin',
    modernKey: 'codex.categories.modern',
    sourcesKey: 'codex.categories.sources',
    author: 'aristotle',
    origin:
      'Before asking what a thing is, Aristotle asks what can be said of it, and the answer is ten kinds of answer: what it is, how much, what sort, how it relates, where, when, in what position, what it has, what it does, and what happens to it. The ten are not kinds of thing. They are kinds of question.',
    modern:
      'Every data model is a list of kinds of answer: a column holds a quantity, a quality, or a relation to another row. This is the ancestor of the type hierarchy in every database and every programming language, and the warning that still matters is that the ten cannot be swapped for one another.',
    sources: ['Aristotle, Categories', 'Aristotle, Metaphysics V'],
  },
  {
    id: 'demonstration',
    title: 'Demonstration',
    titleKey: 'codex.demonstration.title',
    originKey: 'codex.demonstration.origin',
    modernKey: 'codex.demonstration.modern',
    sourcesKey: 'codex.demonstration.sources',
    author: 'aristotle',
    origin:
      'Reaching a true conclusion is not enough to make an argument into knowledge. A demonstration, Aristotle says, must begin from premises that are true, primary and more evident than the conclusion. Reasoning from what reputable people hold is dialectic; reasoning from first principles is demonstration. He draws the line and puts science on one side of it.',
    modern:
      "The modern version of the same line is the difference between a result and a claim that survived review. Replication, pre-registration and peer review are the paperwork of Aristotle's demand that the premises be more evident than the conclusion.",
    sources: ['Aristotle, Prior Analytics I', 'Aristotle, Topics I'],
  },
];
