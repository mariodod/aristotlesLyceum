import type { StoryScript } from '../../types/story.ts';

/**
 * The flags a script sets.
 *
 * A chapter owns the flags it writes, and it establishes them fresh every
 * time it runs. Without that rule, replaying a chapter would inherit the
 * flags of the previous run and the endings would always resolve the same
 * way no matter what the player chose.
 *
 * Flags that a script only reads are not owned by it: a chapter that branches
 * on a flag set by an earlier act must see that flag.
 */
export function collectScriptFlags(script: StoryScript): string[] {
  const flags = new Set<string>();

  for (const step of script.steps) {
    if (step.kind === 'flag') {
      flags.add(step.flag);
    }

    if (step.kind === 'choice') {
      for (const option of step.options) {
        if (option.setFlag) {
          flags.add(option.setFlag);
        }
      }
    }
  }

  return [...flags];
}
