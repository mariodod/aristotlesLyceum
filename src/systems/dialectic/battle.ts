import type {
  BattleEvent,
  BattleOption,
  BattleState,
  DialecticOpponent,
  OpponentClaim,
  Proposition,
} from '../../types/dialectic.ts';
import { analyseSyllogism } from './syllogism.ts';

const STARTING_CONVICTION = 3;

/**
 * The two lines the opponent says when the player asserts a proposition.
 *
 * They are the same for every opponent, so they live here once rather than
 * being written out for each one. The localisation checker reads them to
 * prove that every translation is a whole line and not a placeholder.
 */
export const PREMISE_LINE = 'That is one of the premises you would need. It is not yet an answer.';
export const ASSERTED_LINE =
  'Yes. Yes, that is what I say, and you are right to say it. But you have asserted it, not shown it. I want the demonstration.';

/**
 * A dialectic, as a state machine.
 *
 * The opponent makes a claim. The player has four moves: interrogate it,
 * build a syllogism that takes it apart, assert a conclusion on its own, or
 * let the claim stand. Only one of them wins the argument, and the other
 * three exist to teach the player how the winning one works.
 */
export class DialecticBattle {
  private readonly opponent: DialecticOpponent;
  private readonly battleState: BattleState;

  constructor(opponent: DialecticOpponent, state?: BattleState) {
    this.opponent = opponent;
    this.battleState = state ?? {
      opponentId: opponent.id,
      claimIndex: 0,
      conviction: STARTING_CONVICTION,
      examined: false,
      attempted: false,
      mode: 'claiming',
    };
  }

  get state(): BattleState {
    return { ...this.battleState };
  }

  get finished(): boolean {
    return this.battleState.mode === 'won' || this.battleState.mode === 'done';
  }

  /** The claim on the table right now. */
  get claim(): OpponentClaim | undefined {
    return this.opponent.claims[this.battleState.claimIndex];
  }

  /** The four moves, in the order they are shown. */
  options(): BattleOption[] {
    const claim = this.claim;
    const over = this.finished;

    return [
      {
        id: 'examine',
        labelKey: 'ui.battle.examine',
        descriptionKey: 'ui.battle.examineHint',
        enabled: !over && claim !== undefined && !this.battleState.examined,
      },
      {
        id: 'refute',
        labelKey: 'ui.battle.refute',
        descriptionKey: 'ui.battle.refuteHint',
        enabled: !over && claim !== undefined,
      },
      {
        id: 'claim',
        labelKey: 'ui.battle.claim',
        descriptionKey: 'ui.battle.claimHint',
        enabled: !over && claim !== undefined,
      },
      {
        id: 'embrace',
        labelKey: 'ui.battle.embrace',
        descriptionKey: 'ui.battle.embraceHint',
        enabled: !over && claim !== undefined,
      },
    ];
  }

  /**
   * The opponent's opening line.
   */
  open(): BattleEvent[] {
    const claim = this.claim;

    if (!claim) {
      return [{ type: 'lost' }];
    }

    this.battleState.mode = 'claiming';

    return [
      { type: 'opened', claim },
      {
        type: 'dialogue',
        speaker: this.opponent.name,
        text: claim.text,
        key: this.claimKey('claim'),
        expression: 'determined',
      },
    ];
  }

  /**
   * Interrogates the claim. It costs nothing and it is the only way to see
   * the terms, so a stuck player is never stuck for long.
   */
  examine(): BattleEvent[] {
    const claim = this.claim;

    if (!claim) {
      return [];
    }

    this.battleState.examined = true;
    this.battleState.mode = 'examining';

    return [
      {
        type: 'dialogue',
        speaker: this.opponent.name,
        text: claim.examination,
        key: this.claimKey('examination'),
        expression: 'thinking',
      },
      { type: 'examine', options: claim.propositions },
    ];
  }

  /**
   * Asserts one of the propositions on its own.
   *
   * Asserting the conclusion bare is worth something: the opponent concedes
   * the point and, in doing so, explains the claim in detail. Asserting one
   * of the premises is worth nothing, and the opponent says so.
   */
  assertProposition(propositionId: string): BattleEvent[] {
    const claim = this.claim;

    if (!claim) {
      return [];
    }

    const proposition = claim.propositions.find((item) => item.id === propositionId);

    if (!proposition) {
      return [];
    }

    if (propositionId !== claim.target) {
      return [
        {
          type: 'dialogue',
          speaker: this.opponent.name,
          text: PREMISE_LINE,
          key: this.claimKey('premise'),
          expression: 'neutral',
        },
      ];
    }

    // Asserting the conclusion weakens the opponent, but it never defeats
    // them: only a demonstrated argument can do that. Letting the bar reach
    // zero here would show a beaten opponent who is still holding the floor.
    this.battleState.conviction = Math.max(1, this.battleState.conviction - 1);

    return [
      {
        type: 'dialogue',
        speaker: this.opponent.name,
        text: ASSERTED_LINE,
        key: this.claimKey('asserted'),
        expression: 'surprised',
      },
      { type: 'conviction', value: this.battleState.conviction },
      { type: 'examine', options: claim.propositions },
    ];
  }

  /**
   * Lets the claim stand. The opponent reads silence as agreement.
   */
  embrace(): BattleEvent[] {
    const claim = this.claim;

    if (!claim) {
      return [];
    }

    this.battleState.conviction = Math.min(
      STARTING_CONVICTION + 2,
      this.battleState.conviction + 1,
    );

    return [
      {
        type: 'dialogue',
        speaker: this.opponent.name,
        text: claim.shrug,
        key: this.claimKey('shrug'),
        expression: 'happy',
      },
      { type: 'conviction', value: this.battleState.conviction },
    ];
  }

  /**
   * Builds the argument: a major premise, a minor premise and a conclusion.
   *
   * There are three ways to fail, and the game tells the player which one
   * happened. "That is not a syllogism", "that does not answer the claim" and
   * "that mood does not hold" are three different lessons.
   */
  refute(majorId: string, minorId: string, conclusionId: string): BattleEvent[] {
    const claim = this.claim;

    if (!claim) {
      return [];
    }

    this.battleState.attempted = true;
    this.battleState.mode = 'refuting';

    const major = claim.propositions.find((item) => item.id === majorId);
    const minor = claim.propositions.find((item) => item.id === minorId);
    const conclusion = claim.propositions.find((item) => item.id === conclusionId);

    if (!major || !minor || !conclusion) {
      return [];
    }

    const result = analyseSyllogism(major, minor, conclusion);
    const events: BattleEvent[] = [];

    if (!result.valid) {
      events.push({
        type: 'dialogue',
        speaker: this.opponent.name,
        text: claim.objection,
        key: this.claimKey('objection'),
        expression: 'happy',
      });
      events.push({ type: 'analysis', key: result.key, params: result.params, valid: false });
      return events;
    }

    if (conclusion.id !== claim.target) {
      events.push({
        type: 'dialogue',
        speaker: this.opponent.name,
        text: claim.relevance,
        key: this.claimKey('relevance'),
        expression: 'thinking',
      });
      events.push({
        type: 'analysis',
        key: result.key,
        params: result.params,
        valid: true,
      });
      return events;
    }

    this.battleState.conviction = 0;
    this.battleState.mode = 'won';

    events.push({
      type: 'dialogue',
      speaker: this.opponent.name,
      text: claim.concession,
      key: this.claimKey('concession'),
      expression: 'sad',
    });
    events.push({
      type: 'analysis',
      key: result.key,
      params: result.params,
      valid: true,
    });
    events.push({ type: 'conviction', value: 0 });
    events.push({ type: 'won' });

    return events;
  }

  /**
   * The catalogue key of one of the opponent's lines.
   */
  private claimKey(field: string): string {
    return `dialectic.${this.opponent.id}.${field}`;
  }

  /**
   * The propositions the builder should offer, in the order they are shown.
   */
  propositions(): Proposition[] {
    return this.claim?.propositions ?? [];
  }
}
