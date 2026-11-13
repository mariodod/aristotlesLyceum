/**
 * Codex entries unlocked by Act II, Chapter 7 — Life.
 *
 * Aristotle dissects an animal in front of Isaac and asks him to predict what
 * happens. Isaac guesses wrong, and Aristotle explains why the guess was a
 * good guess and still wrong.
 */

import type { CodexEntry } from './types.ts';

export const ACT_TWO_LIFE_CODEX: CodexEntry[] = [
  {
    id: 'observation-and-taxonomy',
    title: 'Observation and Taxonomy',
    titleKey: 'codex.observation-and-taxonomy.title',
    originKey: 'codex.observation-and-taxonomy.origin',
    modernKey: 'codex.observation-and-taxonomy.modern',
    sourcesKey: 'codex.observation-and-taxonomy.sources',
    author: 'aristotle',
    origin:
      'Aristotle collected about five hundred kinds of animal and wrote down their parts, habits, diet and behaviour, comparing specimens against each other and noting where the reports disagreed. The method is the point: collect, compare, and write down what the animals do, including the parts that have no obvious purpose.',
    modern:
      "Modern biodiversity science works the same way with better instruments. A species description is a comparison against specimens, and the databases that hold them are the direct descendants of Aristotle's notes, with the disagreements still recorded.",
    sources: ['Aristotle, History of Animals I', 'Aristotle, Parts of Animals I'],
  },
  {
    id: 'history-of-animals',
    title: 'The History of Animals',
    titleKey: 'codex.history-of-animals.title',
    originKey: 'codex.history-of-animals.origin',
    modernKey: 'codex.history-of-animals.modern',
    sourcesKey: 'codex.history-of-animals.sources',
    author: 'aristotle',
    origin:
      'The first systematic zoology in Europe, and a book that stayed in Greek and Arabic for centuries. Darwin took it to the Galapagos and read it on the voyage, and the first thing he did when he got home was to write notes criticising it. Aristotle also gets reproduction wrong in a way that takes two thousand years to fix.',
    modern:
      'Museum collections and biodiversity databases are the same habit at a larger scale. The book itself is still a source for historians of biology, and it is the clearest case in the whole story of a method that outlived its conclusions.',
    sources: ['Aristotle, History of Animals', 'Aristotle, Generation of Animals'],
  },
  {
    id: 'parts-and-whole',
    title: 'Parts and Whole',
    titleKey: 'codex.parts-and-whole.title',
    originKey: 'codex.parts-and-whole.origin',
    modernKey: 'codex.parts-and-whole.modern',
    sourcesKey: 'codex.parts-and-whole.sources',
    author: 'aristotle',
    origin:
      'The hand is for grasping, so the teeth must be of a kind that fits it. The eye is for seeing, so it must be shaped for seeing. Aristotle argues that the parts exist for the whole and not for themselves, and that this is why nature makes what it makes instead of assembling pieces at random.',
    modern:
      "The oldest argument in biology, and the one Darwin had to answer: if the eye was made for seeing, how did it come to be? The debate has not ended. Fine-tuning is the current name for Aristotle's question, and whether selection can build an eye is still argued in journals with the same heat.",
    sources: ['Aristotle, Parts of Animals I', 'Aristotle, Generation of Animals II'],
  },
];
