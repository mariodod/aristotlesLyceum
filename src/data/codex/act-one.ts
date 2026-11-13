/**
 * Codex entries unlocked by Act I — The Desk.
 *
 * Every entry pairs what Aristotle actually wrote with the place the idea
 * still shows up today. The `sources` field is not decoration: the content
 * linter requires at least one reference per entry so a claim can never ship
 * without something to check it against.
 *
 * `author` names the character whose portrait appears beside the entry.
 */

import type { CodexEntry } from './types.ts';

export const ACT_ONE_CODEX: CodexEntry[] = [
  {
    id: 'syllogism',
    title: 'The Syllogism',
    titleKey: 'codex.syllogism.title',
    originKey: 'codex.syllogism.origin',
    modernKey: 'codex.syllogism.modern',
    sourcesKey: 'codex.syllogism.sources',
    author: 'aristotle',
    origin:
      'A conclusion follows necessarily when it is drawn from premises that are true, primary, and more evident than the conclusion. Aristotle wrote the first worked-out system of formal inference in Prior Analytics.',
    modern:
      'The skeleton of deductive reasoning. Rule-based inference still runs the engines of theorem provers, SAT solvers and the deductive reasoners inside language models.',
    sources: ['Aristotle, Prior Analytics', 'Aristotle, Topics'],
  },
  {
    id: 'dialectic',
    title: 'Dialectic',
    titleKey: 'codex.dialectic.title',
    originKey: 'codex.dialectic.origin',
    modernKey: 'codex.dialectic.modern',
    sourcesKey: 'codex.dialectic.sources',
    author: 'aristotle',
    origin:
      'Reasoning that starts from reputable opinions rather than certain first principles. The Topics is a manual for testing a claim by asking the questions that would break it.',
    modern:
      'Peer review, red teams and structured debate are all dialectic with paperwork. Aristotle invented the adversarial habit of asking what would falsify your position.',
    sources: ['Aristotle, Topics'],
  },
];
