import type { CodexEntry } from './act-one.ts';
import { ACT_ONE_CODEX } from './act-one.ts';

export type { CodexEntry };

/**
 * Every codex entry in the game. A chapter's entries live in a file named
 * after that chapter, so the content linter can prove that each entry is
 * actually unlocked somewhere and that no script points at a missing entry.
 */
export const CODEX_ENTRIES: CodexEntry[] = [...ACT_ONE_CODEX];

export const CODEX_BY_ID = new Map(CODEX_ENTRIES.map((entry) => [entry.id, entry]));

export function codexEntry(id: string): CodexEntry | undefined {
  return CODEX_BY_ID.get(id);
}
