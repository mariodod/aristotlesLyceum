/**
 * Codex entries unlocked by Act II, Chapter 3 — Metaphysics.
 *
 * The hour before dawn, when the dream argues with itself about whether the
 * world is one thing or many.
 */

import type { CodexEntry } from './types.ts';

export const ACT_TWO_METAPHYSICS_CODEX: CodexEntry[] = [
  {
    id: 'unmoved-mover',
    title: 'The Unmoved Mover',
    titleKey: 'codex.unmoved-mover.title',
    originKey: 'codex.unmoved-mover.origin',
    modernKey: 'codex.unmoved-mover.modern',
    sourcesKey: 'codex.unmoved-mover.sources',
    author: 'aristotle',
    origin:
      'Some things move and are moved; something has to move them, or motion stops. Whatever moves everything without being moved itself is the unmoved mover. In the Lambda he says it moves the way an object of desire moves — it does not push, it is loved — and that it is the thought thinking itself.',
    modern:
      "The first two of Kant's Critiques exist to destroy this, and the question has not gone away: cosmology still asks what it would mean for the universe to have a reason that is not one of its parts, and physics still declines to answer.",
    sources: ['Aristotle, Metaphysics Lambda', 'Aristotle, Metaphysics I'],
  },
  {
    id: 'potentiality',
    title: 'Potentiality',
    titleKey: 'codex.potentiality.title',
    originKey: 'codex.potentiality.origin',
    modernKey: 'codex.potentiality.modern',
    sourcesKey: 'codex.potentiality.sources',
    author: 'aristotle',
    origin:
      'A thing can be what it is not yet. The acorn is potentially an oak, the lump of bronze potentially a statue, the seed potentially a tree. Aristotle separates what a thing is in act from what it is in potential, and the whole of his metaphysics is the claim that reality is both of those at once.',
    modern:
      'Counterfactual reasoning still leans on the distinction: a model and the system it models, a seed and the tree. "It could have been otherwise" is a claim about potentiality, and Aristotle wrote the first systematic account of when such a claim is true.',
    sources: ['Aristotle, Metaphysics IX', 'Aristotle, Physics II.3'],
  },
  {
    id: 'species',
    title: 'Species',
    titleKey: 'codex.species.title',
    originKey: 'codex.species.origin',
    modernKey: 'codex.species.modern',
    sourcesKey: 'codex.species.sources',
    author: 'aristotle',
    origin:
      'Things are not piles of matter. They fall into kinds, and a kind is what a thing is in itself, not the accidents that happen to be attached to it. The chain runs from the most general kind down to the individual, and Aristotle thinks being itself is organised as that hierarchy.',
    modern:
      "Taxonomy, and the three corrections to it. Linnaeus kept the hierarchy and dropped the essence; Darwin kept the hierarchy and dropped the fixity; the tree of life is still Aristotle's shape, minus the part where a species has a defining essence that makes it one thing.",
    sources: ['Aristotle, Metaphysics Z', 'Aristotle, History of Animals I'],
  },
];
