/**
 * The exam's marking rules, kept pure so they can be tested without a
 * scene. The score is never shown to the player; it only chooses which of
 * the three endings the chapter names.
 */

import type { ExamEnding } from '../../types/story.ts';

export interface ExamAnswer {
  correct: boolean;
  honest: boolean;
}

export interface ExamMark {
  ending: ExamEnding;
  correct: number;
  honest: number;
  total: number;
}

export function scoreExam(answers: ExamAnswer[]): ExamMark {
  const correct = answers.filter((answer) => answer.correct).length;
  const honest = answers.filter((answer) => answer.honest).length;
  const total = answers.length;

  if (total > 0 && correct === total) {
    return { ending: 'apostate', correct, honest, total };
  }

  // Few right and no wrong answers: every unanswered question was met with
  // an honest "I don't know", which is the point of that ending.
  if (total > 0 && honest > 0 && correct + honest === total && correct <= 2) {
    return { ending: 'honest', correct, honest, total };
  }

  return { ending: 'pass', correct, honest, total };
}

/** The flag the script branches on after the exam. */
export function endingFlag(ending: ExamEnding): string {
  return `exam-${ending}`;
}

/** Every ending flag, so a replay can start from a clean slate. */
export const EXAM_ENDING_FLAGS: string[] = ['exam-pass', 'exam-honest', 'exam-apostate'];
