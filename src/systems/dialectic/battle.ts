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
        label: 'EXAMINE',
        description: 'Interrogate the claim. It is free.',
        enabled: !over && claim !== undefined && !this.battleState.examined,
      },
      {
        id: 'refute',
        label: 'REFUTE',
        description: 'Build a syllogism that answers it.',
        enabled: !over && claim !== undefined,
      },
      {
        id: 'claim',
        label: 'CLAIM',
        description: 'Assert a conclusion on its own.',
        enabled: !over && claim !== undefined,
      },
      {
        id: 'embrace',
        label: 'EMBRACE',
        description: 'Let it stand. They will take that.',
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
          text: 'That is one of the premises you would need. It is not yet an answer.',
          expression: 'neutral',
        },
      ];
    }

    this.battleState.conviction = Math.max(0, this.battleState.conviction - 1);

    return [
      {
        type: 'dialogue',
        speaker: this.opponent.name,
        text: 'Yes. Yes, that is what I say, and you are right to say it. But you have asserted it, not shown it. I want the demonstration.',
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
        expression: 'happy',
      });
      events.push({ type: 'analysis', text: result.explanation, valid: false });
      return events;
    }

    if (conclusion.id !== claim.target) {
      events.push({
        type: 'dialogue',
        speaker: this.opponent.name,
        text: claim.relevance,
        expression: 'thinking',
      });
      events.push({ type: 'analysis', text: result.explanation, valid: true });
      return events;
    }

    this.battleState.conviction = 0;
    this.battleState.mode = 'won';

    events.push({
      type: 'dialogue',
      speaker: this.opponent.name,
      text: claim.concession,
      expression: 'sad',
    });
    events.push({ type: 'analysis', text: result.explanation, valid: true });
    events.push({ type: 'conviction', value: 0 });
    events.push({ type: 'won' });

    return events;
  }

  /**
   * The propositions the builder should offer, in the order they are shown.
   */
  propositions(): Proposition[] {
    return this.claim?.propositions ?? [];
  }
}
