/**
 * The vocabulary of the dialectic.
 *
 * A categorical syllogism is three propositions about three terms. The middle
 * term appears in both premises and not in the conclusion; the other two are
 * the subject and the predicate of the conclusion.
 */

export type TermId = 'S' | 'M' | 'P';

/**
 * The four forms of a categorical proposition.
 *
 * - `A` universal affirmative: all S are P.
 * - `E` universal negative: no S is P.
 * - `I` particular affirmative: some S is P.
 * - `O` particular negative: some S is not P.
 */
export type PropositionForm = 'A' | 'E' | 'I' | 'O';

/** The figure is the position of the middle term in the two premises. */
export type Figure = 1 | 2 | 3 | 4;

export interface Proposition {
  id: string;
  form: PropositionForm;
  /** The term the proposition is about. */
  subject: TermId;
  /** The term the proposition predicates of its subject. */
  predicate: TermId;
  /** The natural-language text, with the terms written out. */
  text: string;
}

/** A term the player can read: "opinions" and so on. */
export interface TermLabel {
  id: TermId;
  label: string;
}

/**
 * A claim the opponent makes. It carries the terms in play, the propositions
 * the player can use against it, and the syllogism that would refute it.
 */
export interface OpponentClaim {
  id: string;
  /** What the opponent says. */
  text: string;
  /** The terms in play, in the order the builder shows them. */
  terms: TermLabel[];
  /** Every proposition the player may use to answer this claim. */
  propositions: Proposition[];
  /** The id of the conclusion that answers the claim. */
  target: string;
  /** What the opponent says when the player interrogates the claim. */
  examination: string;
  /** What the opponent says when the argument does not hold up. */
  objection: string;
  /** What the opponent says when the argument holds but answers nothing. */
  relevance: string;
  /** What the opponent says when it does. */
  concession: string;
  /** What the opponent says when the player lets the claim stand. */
  shrug: string;
}

export interface DialecticOpponent {
  id: string;
  name: string;
  /** The claims they make, in the order they make them. */
  claims: OpponentClaim[];
  /** The colour of their name plate. */
  color: number;
  /** The sprite they stand behind, if they have one. */
  spriteKey?: string;
}

/** What the battle is doing right now. */
export type BattleMode = 'claiming' | 'examining' | 'refuting' | 'won' | 'done';

export interface BattleState {
  opponentId: string;
  /** The index of the claim currently on the table. */
  claimIndex: number;
  /** How firmly the opponent holds its position. */
  conviction: number;
  /** True once the claim has been interrogated. */
  examined: boolean;
  /** True once the refutation has been attempted. */
  attempted: boolean;
  mode: BattleMode;
}

/** The four things the player can do in a dialectic. */
export type BattleAction = 'examine' | 'refute' | 'claim' | 'embrace';

export interface BattleOption {
  id: BattleAction;
  label: string;
  /** The one-line explanation shown under the label. */
  description: string;
  enabled: boolean;
}

export type BattleEvent =
  | { type: 'dialogue'; speaker: string; text: string; expression: string }
  | { type: 'analysis'; text: string; valid: boolean }
  | { type: 'conviction'; value: number }
  | { type: 'opened'; claim: OpponentClaim }
  | { type: 'examine'; options: Proposition[] }
  | { type: 'refute'; options: Proposition[]; target: string }
  | { type: 'won' }
  | { type: 'lost' };
