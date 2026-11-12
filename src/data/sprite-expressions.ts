import type { ExpressionId } from '../types/story.ts';

/**
 * The expressions every character can make, in sprite-sheet order.
 *
 * The sheet of a character is: frame 0 and 1 are the neutral idle and its
 * blink, then one frame per expression in this order. The generator and the
 * game both read this list, so they cannot drift apart.
 */
export const EXPRESSION_ORDER: readonly ExpressionId[] = [
  'neutral',
  'happy',
  'sad',
  'surprised',
  'thinking',
  'angry',
  'tired',
  'determined',
];

/** Number of frames before the expression frames start. */
export const EXPRESSION_FRAME_OFFSET = 2;

/** The sheet index of an expression frame. */
export function expressionFrame(expression: ExpressionId): number {
  const index = EXPRESSION_ORDER.indexOf(expression);

  if (index < 0) {
    return EXPRESSION_FRAME_OFFSET;
  }

  return EXPRESSION_FRAME_OFFSET + index;
}

/** True when the expression is the neutral one, which is played as an animation. */
export function isNeutral(expression: ExpressionId): boolean {
  return expression === 'neutral';
}
