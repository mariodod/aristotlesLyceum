import { SAVE_KEY } from '../config/constants.ts';
import { createDialogueState } from '../types/story.ts';
import type { DialogueState, StatRecord } from '../types/story.ts';

export interface SaveData {
  version: number;
  unlockedCodex: string[];
  stats: StatRecord;
  flags: Record<string, boolean>;
  completedChapters: string[];
  lastChapter: string;
}

const SAVE_VERSION = 1;

export function createSaveData(): SaveData {
  const state = createDialogueState();

  return {
    version: SAVE_VERSION,
    unlockedCodex: [],
    stats: state.stats,
    flags: {},
    completedChapters: [],
    lastChapter: '',
  };
}

/**
 * Persistent progress.
 *
 * The storage is injectable so tests can run against a plain object and so a
 * browser that refuses local storage degrades to an in-memory save instead of
 * throwing on the title screen.
 */
export class SaveService {
  private readonly storage: Storage | undefined;
  private data: SaveData;

  constructor(storage?: Storage) {
    this.storage = storage ?? readDefaultStorage();
    this.data = this.read();
  }

  get snapshot(): SaveData {
    return {
      ...this.data,
      unlockedCodex: [...this.data.unlockedCodex],
      stats: { ...this.data.stats },
      flags: { ...this.data.flags },
      completedChapters: [...this.data.completedChapters],
    };
  }

  get dialogueState(): DialogueState {
    return {
      flags: { ...this.data.flags },
      stats: { ...this.data.stats },
    };
  }

  isCodexUnlocked(id: string): boolean {
    return this.data.unlockedCodex.includes(id);
  }

  unlockCodex(id: string): boolean {
    if (this.data.unlockedCodex.includes(id)) {
      return false;
    }

    this.data.unlockedCodex.push(id);
    this.write();
    return true;
  }

  setStats(stats: StatRecord): void {
    this.data.stats = { ...stats };
    this.write();
  }

  setFlag(flag: string, value: boolean): void {
    this.data.flags[flag] = value;
    this.write();
  }

  /** Removes a flag entirely, used when a chapter re-establishes its own. */
  clearFlag(flag: string): void {
    if (!(flag in this.data.flags)) {
      return;
    }

    delete this.data.flags[flag];
    this.write();
  }

  completeChapter(id: string): void {
    if (!this.data.completedChapters.includes(id)) {
      this.data.completedChapters.push(id);
    }

    this.data.lastChapter = id;
    this.write();
  }

  reset(): void {
    this.data = createSaveData();
    this.write();
  }

  private read(): SaveData {
    if (!this.storage) {
      return createSaveData();
    }

    try {
      const raw = this.storage.getItem(SAVE_KEY);

      if (!raw) {
        return createSaveData();
      }

      const parsed = JSON.parse(raw) as Partial<SaveData>;

      if (parsed.version !== SAVE_VERSION) {
        return createSaveData();
      }

      const fallback = createSaveData();

      return {
        version: SAVE_VERSION,
        unlockedCodex: parsed.unlockedCodex ?? fallback.unlockedCodex,
        stats: { ...fallback.stats, ...parsed.stats },
        flags: parsed.flags ?? fallback.flags,
        completedChapters: parsed.completedChapters ?? fallback.completedChapters,
        lastChapter: parsed.lastChapter ?? fallback.lastChapter,
      };
    } catch {
      // A corrupted save must never block the game from starting.
      return createSaveData();
    }
  }

  private write(): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      // Quota or private-mode failures are not worth crashing over.
    }
  }
}

function readDefaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
