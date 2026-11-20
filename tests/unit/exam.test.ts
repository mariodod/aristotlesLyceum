import { describe, expect, it } from 'vitest';
import { endingFlag, scoreExam } from '../../src/systems/dialogue/exam.ts';
import type { ExamAnswer } from '../../src/systems/dialogue/exam.ts';

const answer = (correct: boolean, honest = false): ExamAnswer => ({ correct, honest });

describe('scoreExam', () => {
  it('gives the apostate ending when every answer is right', () => {
    const mark = scoreExam([answer(true), answer(true), answer(true)]);

    expect(mark.ending).toBe('apostate');
    expect(mark.correct).toBe(3);
  });

  it('gives the honest ending for few right answers and honest ones for the rest', () => {
    const mark = scoreExam([
      answer(true),
      answer(false, true),
      answer(false, true),
      answer(false, true),
    ]);

    expect(mark.ending).toBe('honest');
    expect(mark.honest).toBe(3);
  });

  it('gives the passing grade when enough answers are right', () => {
    const mark = scoreExam([
      answer(true),
      answer(true),
      answer(true),
      answer(false, true),
      answer(false, true),
    ]);

    expect(mark.ending).toBe('pass');
  });

  it('gives the passing grade for wrong answers rather than honest ones', () => {
    const mark = scoreExam([answer(true), answer(false), answer(false, true)]);

    expect(mark.ending).toBe('pass');
  });

  it('never calls an empty exam a success', () => {
    expect(scoreExam([]).ending).toBe('pass');
  });

  it('names the flag each ending sets', () => {
    expect(endingFlag('apostate')).toBe('exam-apostate');
    expect(endingFlag('honest')).toBe('exam-honest');
    expect(endingFlag('pass')).toBe('exam-pass');
  });
});
