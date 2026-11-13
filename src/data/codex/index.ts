import type { CodexEntry } from './types.ts';
import { ACT_ONE_CODEX } from './act-one.ts';
import { ACT_TWO_ETHICS_CODEX } from './act-two-ethics.ts';
import { ACT_TWO_LIFE_CODEX } from './act-two-life.ts';
import { ACT_TWO_LOGIC_CODEX } from './act-two-logic.ts';
import { ACT_TWO_METAPHYSICS_CODEX } from './act-two-metaphysics.ts';
import { ACT_TWO_PHYSICS_CODEX } from './act-two-physics.ts';
import { ACT_TWO_POETICS_CODEX } from './act-two-poetics.ts';
import { ACT_TWO_SOUL_CODEX } from './act-two-soul.ts';

export type { CodexEntry };
export { PLANNED_CHAPTERS } from './plan.ts';
export type { PlannedChapter } from './plan.ts';

/**
 * Every codex entry in the game. A chapter's entries live in a file named
 * after that chapter, so the content linter can prove that each entry is
 * actually unlocked somewhere and that no script points at a missing entry.
 */
export const CODEX_ENTRIES: CodexEntry[] = [
  ...ACT_ONE_CODEX,
  ...ACT_TWO_LOGIC_CODEX,
  ...ACT_TWO_PHYSICS_CODEX,
  ...ACT_TWO_METAPHYSICS_CODEX,
  ...ACT_TWO_SOUL_CODEX,
  ...ACT_TWO_ETHICS_CODEX,
  ...ACT_TWO_POETICS_CODEX,
  ...ACT_TWO_LIFE_CODEX,
];

export const CODEX_BY_ID = new Map(CODEX_ENTRIES.map((entry) => [entry.id, entry]));

export function codexEntry(id: string): CodexEntry | undefined {
  return CODEX_BY_ID.get(id);
}
