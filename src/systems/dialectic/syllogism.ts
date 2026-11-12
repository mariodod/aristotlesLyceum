import type { Figure, Proposition, PropositionForm, TermId } from '../../types/dialectic.ts';

/**
 * The valid moods of the four figures.
 *
 * This is the classical table from the first century of the common era, and
 * it is the complete criterion: a categorical syllogism is valid if and only
 * if its mood is in the list for its figure. Every other rule about the
 * middle term is already folded into the table.
 */
export const VALID_MOODS: Record<Figure, readonly string[]> = {
  1: ['AAA', 'EAE', 'AII', 'EIO'],
  2: ['AEE', 'EAE', 'EIO', 'AOO'],
  3: ['AAI', 'IAI', 'AII', 'EAO', 'OAO'],
  4: ['AAI', 'EAI', 'IAI', 'EAO', 'EOO'],
};

export const MOOD_NAMES: Record<string, string> = {
  'AAA-1': 'Barbara',
  'EAE-1': 'Celarent',
  'AII-1': 'Darii',
  'EIO-1': 'Ferio',
  'AEE-2': 'Cesare',
  'EAE-2': 'Camestres',
  'EIO-2': 'Festino',
  'AOO-2': 'Baroco',
  'AAI-3': 'Darapti',
  'IAI-3': 'Disamis',
  'AII-3': 'Datisi',
  'EAO-3': 'Felapton',
  'OAO-3': 'Bokaro',
  'AAI-4': 'Bramantip',
  'EAI-4': 'Camenes',
  'IAI-4': 'Dimaris',
  'EAO-4': 'Fesapo',
  'EOO-4': 'Fresison',
};

/**
 * What is wrong with an argument, if anything.
 */
export type SyllogismProblem =
  | 'not-a-syllogism'
  | 'middle-term-missing'
  | 'conclusion-not-s-p'
  | 'terms-swapped'
  | 'invalid-mood';

export interface SyllogismResult {
  valid: boolean;
  /** The figure, when the three propositions could be read as a syllogism. */
  figure: Figure | undefined;
  /** The three letters, when they could be read as a syllogism. */
  mood: string | undefined;
  /** The traditional name of the mood, when the mood is valid. */
  name: string | undefined;
  /** Why it failed, when it did. */
  problem: SyllogismProblem | undefined;
  /** A sentence the game can show the player. */
  explanation: string;
}

function termsOf(proposition: Proposition): TermId[] {
  return [proposition.subject, proposition.predicate];
}

/**
 * The figure, read off the position of the middle term in the two premises.
 *
 * - Figure 1: the major is M-P and the minor is S-M.
 * - Figure 2: the major is P-M and the minor is S-M.
 * - Figure 3: the major is M-P and the minor is M-S.
 * - Figure 4: the major is P-M and the minor is M-S.
 */
export function figureOf(major: Proposition, minor: Proposition): Figure | undefined {
  const majorTerms = termsOf(major);
  const minorTerms = termsOf(minor);

  if (!majorTerms.includes('M') || !minorTerms.includes('M')) {
    return undefined;
  }

  const majorMiddleIsSubject = major.subject === 'M';
  const minorMiddleIsSubject = minor.subject === 'M';

  if (majorMiddleIsSubject && !minorMiddleIsSubject) {
    return 1;
  }

  if (!majorMiddleIsSubject && !minorMiddleIsSubject) {
    return 2;
  }

  if (majorMiddleIsSubject && minorMiddleIsSubject) {
    return 3;
  }

  return 4;
}

/**
 * Checks a set of three propositions as a syllogism.
 *
 * The result distinguishes three failures that a player needs to tell apart:
 * the three propositions are not a syllogism at all, they are a syllogism
 * with the wrong terms, or they are a syllogism whose mood does not hold.
 */
export function analyseSyllogism(
  major: Proposition,
  minor: Proposition,
  conclusion: Proposition,
): SyllogismResult {
  const majorTerms = termsOf(major);
  const minorTerms = termsOf(minor);
  const conclusionTerms = termsOf(conclusion);

  const has = (list: TermId[], term: TermId) => list.includes(term);

  if (!has(majorTerms, 'M') || !has(minorTerms, 'M') || has(conclusionTerms, 'M')) {
    return {
      valid: false,
      figure: undefined,
      mood: undefined,
      name: undefined,
      problem: 'not-a-syllogism',
      explanation:
        'That is not a syllogism. The middle term has to turn up in both premises and nowhere in the conclusion.',
    };
  }

  if (conclusion.subject !== 'S' || conclusion.predicate !== 'P') {
    return {
      valid: false,
      figure: undefined,
      mood: undefined,
      name: undefined,
      problem: 'conclusion-not-s-p',
      explanation:
        'The conclusion has to be about the subject and the predicate of the whole argument, and nothing else.',
    };
  }

  const majorHasP = has(majorTerms, 'P');
  const minorHasS = has(minorTerms, 'S');

  if (!majorHasP || !minorHasS) {
    return {
      valid: false,
      figure: undefined,
      mood: undefined,
      name: undefined,
      problem: 'terms-swapped',
      explanation:
        'The premises do not line up. The major premise is about the middle term and the predicate, and the minor premise is about the subject and the middle term.',
    };
  }

  const figure = figureOf(major, minor);

  if (figure === undefined) {
    return {
      valid: false,
      figure: undefined,
      mood: undefined,
      name: undefined,
      problem: 'terms-swapped',
      explanation: 'The middle term is in the wrong place for a figure.',
    };
  }

  const mood = `${major.form}${minor.form}${conclusion.form}` as string;
  const valid = VALID_MOODS[figure].includes(mood);

  if (!valid) {
    return {
      valid: false,
      figure,
      mood,
      name: undefined,
      problem: 'invalid-mood',
      explanation: `That is ${mood} in figure ${figure}, and that mood does not hold.`,
    };
  }

  return {
    valid: true,
    figure,
    mood,
    name: MOOD_NAMES[`${mood}-${figure}`],
    problem: undefined,
    explanation: `That is ${mood} in figure ${figure}: ${MOOD_NAMES[`${mood}-${figure}`]}. It holds.`,
  };
}

/**
 * The name of a form, for the builder's labels.
 */
export const FORM_NAMES: Record<PropositionForm, string> = {
  A: 'all of',
  E: 'none of',
  I: 'some of',
  O: 'some not of',
};
