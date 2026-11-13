/**
 * Codex entries unlocked by Act II, Chapter 6 — Poetics.
 *
 * Aristotle watches Isaac's life and tells him it is a bad tragedy: no
 * reversal, no recognition.
 */

import type { CodexEntry } from './types.ts';

export const ACT_TWO_POETICS_CODEX: CodexEntry[] = [
  {
    id: 'mimesis-and-catharsis',
    title: 'Mimesis and Catharsis',
    titleKey: 'codex.mimesis-and-catharsis.title',
    originKey: 'codex.mimesis-and-catharsis.origin',
    modernKey: 'codex.mimesis-and-catharsis.modern',
    sourcesKey: 'codex.mimesis-and-catharsis.sources',
    author: 'aristotle',
    origin:
      'Art is not a copy of a copy. Tragedy is the imitation of an action that is serious and complete, and it does its work by arousing pity and fear and then purging them. Aristotle does not say what the purging is, and everyone since has had to decide for him.',
    modern:
      'The argument is still open in theatre studies and in the psychology of emotion, where the best supported account of catharsis is regulation rather than release. Aristotle set the question; the measuring is still going on.',
    sources: ['Aristotle, Poetics 1', 'Aristotle, Poetics 6'],
  },
  {
    id: 'plot-structure',
    title: 'Plot Structure',
    titleKey: 'codex.plot-structure.title',
    originKey: 'codex.plot-structure.origin',
    modernKey: 'codex.plot-structure.modern',
    sourcesKey: 'codex.plot-structure.sources',
    author: 'aristotle',
    origin:
      'A plot is one action that is complete. It has a beginning, a middle and an end, and the parts are joined so that the end follows from the beginning by probability or necessity. Aristotle is unusually concrete about it: long enough for the change to happen, short enough for an audience to hold the whole thing in memory.',
    modern:
      "Screenwriting manuals have rediscovered the constraints and renamed them: the three-act structure, the rule of three, the sequel. What they usually leave out is Aristotle's condition, that the parts have to be necessary and not merely in that order.",
    sources: ['Aristotle, Poetics 7', 'Aristotle, Poetics 16'],
  },
  {
    id: 'hamartia',
    title: 'Hamartia',
    titleKey: 'codex.hamartia.title',
    originKey: 'codex.hamartia.origin',
    modernKey: 'codex.hamartia.modern',
    sourcesKey: 'codex.hamartia.sources',
    author: 'aristotle',
    origin:
      "The tragic mistake is a judgement, not a flaw in the character. Oedipus is not a bad man; he reasons well from premises he has never checked, and the play is about a man whose intelligence is the problem. Aristotle's word for the mistake is hamartia, and the modern sense of it, a flaw, is a drift.",
    modern:
      'The modern sense has taken over in criticism and in engineering, where the human error is still the last line of most accident reports. Post-mortems are where the Aristotelian reading survives: the question is what was decided wrongly, not who was a bad person.',
    sources: ['Aristotle, Poetics 13', 'Aristotle, Poetics 14'],
  },
];
