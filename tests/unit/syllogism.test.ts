import { describe, expect, it } from 'vitest';
import { VALID_MOODS, analyseSyllogism, figureOf } from '../../src/systems/dialectic/syllogism.ts';
import { DIALECTIC_OPPONENTS } from '../../src/data/dialectic/opponents.ts';
import type { Proposition } from '../../src/types/dialectic.ts';

function proposition(
  id: string,
  form: Proposition['form'],
  subject: Proposition['subject'],
  predicate: Proposition['predicate'],
): Proposition {
  return { id, form, subject, predicate, text: id };
}

const BARBARA = {
  major: proposition('m', 'A', 'M', 'P'),
  minor: proposition('n', 'A', 'S', 'M'),
  conclusion: proposition('c', 'A', 'S', 'P'),
};

describe('analyseSyllogism', () => {
  it('accepts Barbara', () => {
    const result = analyseSyllogism(BARBARA.major, BARBARA.minor, BARBARA.conclusion);

    expect(result.valid).toBe(true);
    expect(result.figure).toBe(1);
    expect(result.mood).toBe('AAA');
    expect(result.name).toBe('Barbara');
  });

  it('accepts Celarent', () => {
    const result = analyseSyllogism(
      proposition('m', 'E', 'M', 'P'),
      proposition('n', 'A', 'S', 'M'),
      proposition('c', 'E', 'S', 'P'),
    );

    expect(result.valid).toBe(true);
    expect(result.name).toBe('Celarent');
  });

  it('accepts Darii', () => {
    const result = analyseSyllogism(
      proposition('m', 'A', 'M', 'P'),
      proposition('n', 'I', 'S', 'M'),
      proposition('c', 'I', 'S', 'P'),
    );

    expect(result.valid).toBe(true);
    expect(result.name).toBe('Darii');
  });

  it('accepts Camestres, which is Celarent in the second figure', () => {
    const result = analyseSyllogism(
      proposition('m', 'E', 'P', 'M'),
      proposition('n', 'A', 'S', 'M'),
      proposition('c', 'E', 'S', 'P'),
    );

    expect(result.valid).toBe(true);
    expect(result.figure).toBe(2);
    expect(result.name).toBe('Camestres');
  });

  it('rejects a mood that does not hold in its figure', () => {
    const result = analyseSyllogism(
      proposition('m', 'E', 'M', 'P'),
      proposition('n', 'E', 'S', 'M'),
      proposition('c', 'A', 'S', 'P'),
    );

    expect(result.valid).toBe(false);
    expect(result.problem).toBe('invalid-mood');
    expect(result.figure).toBe(1);
    expect(result.explanation).toContain('EEA');
  });

  it('rejects a major premise that does not carry the predicate', () => {
    const result = analyseSyllogism(
      proposition('m', 'A', 'S', 'M'),
      proposition('n', 'A', 'S', 'M'),
      proposition('c', 'A', 'S', 'P'),
    );

    expect(result.valid).toBe(false);
    expect(result.problem).toBe('terms-swapped');
  });

  it('rejects a conclusion that is not about the subject and the predicate', () => {
    const result = analyseSyllogism(
      proposition('m', 'A', 'M', 'P'),
      proposition('n', 'A', 'S', 'M'),
      proposition('c', 'A', 'P', 'S'),
    );

    expect(result.valid).toBe(false);
    expect(result.problem).toBe('conclusion-not-s-p');
  });

  it('rejects a premise that does not carry the right term', () => {
    const result = analyseSyllogism(
      proposition('m', 'A', 'S', 'M'),
      proposition('n', 'A', 'S', 'M'),
      proposition('c', 'A', 'S', 'P'),
    );

    expect(result.valid).toBe(false);
    expect(result.problem).toBe('terms-swapped');
  });
});

describe('figureOf', () => {
  it('reads the figure off the position of the middle term', () => {
    expect(figureOf(proposition('a', 'A', 'M', 'P'), proposition('b', 'A', 'S', 'M'))).toBe(1);
    expect(figureOf(proposition('a', 'A', 'P', 'M'), proposition('b', 'A', 'S', 'M'))).toBe(2);
    expect(figureOf(proposition('a', 'A', 'M', 'P'), proposition('b', 'A', 'M', 'S'))).toBe(3);
    expect(figureOf(proposition('a', 'A', 'P', 'M'), proposition('b', 'A', 'M', 'S'))).toBe(4);
  });

  it('has no figure when the middle term is missing', () => {
    expect(
      figureOf(proposition('a', 'A', 'S', 'P'), proposition('b', 'A', 'S', 'M')),
    ).toBeUndefined();
  });
});

describe('the mood table', () => {
  it('has the traditional eighteen moods', () => {
    const total = Object.values(VALID_MOODS).reduce((count, moods) => count + moods.length, 0);
    expect(total).toBe(18);
  });
});

describe('every opponent has exactly one way in', () => {
  for (const opponent of DIALECTIC_OPPONENTS) {
    it(`${opponent.name} can be refuted in exactly one way`, () => {
      for (const claim of opponent.claims) {
        const solutions: string[] = [];

        for (const major of claim.propositions) {
          for (const minor of claim.propositions) {
            for (const conclusion of claim.propositions) {
              if (
                major.id === minor.id ||
                minor.id === conclusion.id ||
                major.id === conclusion.id
              ) {
                continue;
              }

              const result = analyseSyllogism(major, minor, conclusion);

              if (result.valid && conclusion.id === claim.target) {
                solutions.push(`${major.id} + ${minor.id} + ${conclusion.id}`);
              }
            }
          }
        }

        expect(solutions).toHaveLength(1);
      }
    });

    it(`${opponent.name} has an argument that is sound but answers nothing`, () => {
      // A syllogism can be perfectly valid and still not be about the thing
      // the opponent said. The game has to be able to say so, so every
      // opponent has to be able to produce one.
      for (const claim of opponent.claims) {
        let found = false;

        for (const major of claim.propositions) {
          for (const minor of claim.propositions) {
            for (const conclusion of claim.propositions) {
              if (
                major.id === minor.id ||
                minor.id === conclusion.id ||
                major.id === conclusion.id
              ) {
                continue;
              }

              const result = analyseSyllogism(major, minor, conclusion);

              if (result.valid && conclusion.id !== claim.target) {
                found = true;
              }
            }
          }
        }

        expect(found).toBe(true);
      }
    });
  }
});
