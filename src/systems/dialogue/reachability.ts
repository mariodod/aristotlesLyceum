import type { StoryScript, StoryStep } from '../../types/story.ts';

/**
 * Finds the steps a script can never reach.
 *
 * A choice is the only step whose continuations are its options, so a branch
 * that forgets to jump back to the merge point quietly swallows the rest of
 * the chapter. That kind of mistake is invisible when reading the data and
 * obvious the moment it happens to a player, so it is checked instead.
 */
export function findUnreachableSteps(script: StoryScript): string[] {
  const labels = new Map<string, number>();

  script.steps.forEach((step, index) => {
    labels.set(step.at, index);
  });

  const visited = new Set<number>();
  const stack: number[] = [0];

  while (stack.length > 0) {
    const index = stack.pop();

    if (index === undefined || visited.has(index)) {
      continue;
    }

    visited.add(index);

    const step = script.steps[index];

    if (!step) {
      continue;
    }

    for (const target of continuations(step, index, labels)) {
      if (target !== undefined && target >= 0 && target < script.steps.length) {
        stack.push(target);
      }
    }
  }

  return script.steps
    .map((step, index) => ({ step, index }))
    .filter(({ index }) => !visited.has(index))
    .map(({ step }) => step.at);
}

/**
 * The steps that can follow a given step.
 */
function continuations(
  step: StoryStep,
  index: number,
  labels: Map<string, number>,
): (number | undefined)[] {
  switch (step.kind) {
    case 'jump':
      return [labels.get(step.to)];

    case 'branch':
      return [labels.get(step.ifTrue), labels.get(step.ifFalse)];

    case 'choice':
      return step.options.map((option) => labels.get(option.goto));

    case 'end':
      return [];

    default:
      // Everything else falls through to the next line of the script.
      return [index + 1];
  }
}
