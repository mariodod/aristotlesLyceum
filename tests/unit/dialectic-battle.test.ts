import { describe, expect, it } from 'vitest';
import { DialecticBattle } from '../../src/systems/dialectic/battle.ts';
import { DIALECTIC_OPPONENTS, opponentById } from '../../src/data/dialectic/opponents.ts';
import type { BattleEvent } from '../../src/types/dialectic.ts';

const CERTAINTY = opponentById('certainty');

function battle() {
  if (!CERTAINTY) {
    throw new Error('the Certainty opponent is missing');
  }

  return new DialecticBattle(CERTAINTY);
}

/** The arrangement that takes Certainty apart: Celarent, EAE in figure 1. */
const REFUTATION = {
  major: 'certainty-opinion-none',
  minor: 'certainty-opinion-all',
  conclusion: 'certainty-none-true',
};

function dialogueText(events: BattleEvent[]): string {
  return events
    .filter(
      (event): event is Extract<BattleEvent, { type: 'dialogue' }> => event.type === 'dialogue',
    )
    .map((event) => event.text)
    .join(' ');
}

describe('DialecticBattle', () => {
  it('opens with the opponent making their claim', () => {
    const events = battle().open();

    expect(events[0]).toMatchObject({ type: 'opened' });
    expect(events[1]).toMatchObject({ type: 'dialogue', speaker: 'Certainty' });
  });

  it('offers four moves', () => {
    const options = battle().options();

    expect(options.map((option) => option.id)).toEqual(['examine', 'refute', 'claim', 'embrace']);
  });

  it('lets the player examine the claim exactly once', () => {
    const state = battle();

    expect(state.options()[0]?.enabled).toBe(true);

    state.examine();

    expect(state.options()[0]?.enabled).toBe(false);
    expect(state.state.examined).toBe(true);
  });

  it('reveals the propositions when the claim is examined', () => {
    const events = battle().examine();

    const examine = events.find((event) => event.type === 'examine');
    expect(examine).toBeDefined();
    expect(examine?.type === 'examine' && examine.options.length).toBeGreaterThan(3);
  });

  it('wins when the syllogism holds and answers the claim', () => {
    const state = battle();
    const events = state.refute(REFUTATION.major, REFUTATION.minor, REFUTATION.conclusion);

    expect(events.at(-1)).toEqual({ type: 'won' });
    expect(state.finished).toBe(true);
    expect(dialogueText(events)).toContain('do not yet know how to get it back');
  });

  it('explains an argument that does not follow', () => {
    const state = battle();
    const events = state.refute(
      'certainty-opinion-some-true',
      'certainty-opinion-all',
      'certainty-none-true',
    );

    const analysis = events.find((event) => event.type === 'analysis');
    expect(analysis).toBeDefined();
    expect(analysis?.type === 'analysis' && analysis.valid).toBe(false);
    expect(events.some((event) => event.type === 'won')).toBe(false);
  });

  it('says so when the argument is sound but answers nothing', () => {
    const state = battle();
    const events = state.refute(
      'certainty-opinion-all-true',
      'certainty-opinion-some',
      'certainty-some-true',
    );

    expect(dialogueText(events)).toContain('sound argument');
    expect(events.some((event) => event.type === 'won')).toBe(false);
  });

  it('loses conviction when the conclusion is asserted on its own', () => {
    const state = battle();
    const before = state.state.conviction;
    const events = state.assertProposition('certainty-none-true');

    expect(state.state.conviction).toBe(before - 1);
    expect(dialogueText(events)).toContain('you have asserted it, not shown it');
  });

  it('gains nothing for asserting one of the premises', () => {
    const state = battle();
    const before = state.state.conviction;
    const events = state.assertProposition('certainty-opinion-all');

    expect(state.state.conviction).toBe(before);
    expect(dialogueText(events)).toContain('one of the premises');
  });

  it('makes the opponent more certain when the claim is embraced', () => {
    const state = battle();
    const before = state.state.conviction;
    state.embrace();

    expect(state.state.conviction).toBe(before + 1);
  });

  it('keeps every opponent refutable', () => {
    for (const opponent of DIALECTIC_OPPONENTS) {
      const state = new DialecticBattle(opponent);
      const claim = state.claim;

      if (!claim) {
        throw new Error(`${opponent.name} has no claim`);
      }

      const target = claim.propositions.find((proposition) => proposition.id === claim.target);

      if (!target) {
        throw new Error(`${opponent.name} has no target conclusion`);
      }

      expect(target.subject).toBe('S');
      expect(target.predicate).toBe('P');
    }
  });
});
