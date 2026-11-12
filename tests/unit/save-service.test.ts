import { beforeEach, describe, expect, it } from 'vitest';
import { SAVE_KEY } from '../../src/config/constants.ts';
import { SaveService, createSaveData } from '../../src/services/save-service.ts';

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('SaveService', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('starts empty', () => {
    const save = new SaveService(storage);

    expect(save.snapshot.unlockedCodex).toEqual([]);
    expect(save.snapshot.stats).toEqual({ reason: 0, wisdom: 0, empathy: 0 });
  });

  it('unlocks a codex entry once', () => {
    const save = new SaveService(storage);

    expect(save.unlockCodex('syllogism')).toBe(true);
    expect(save.unlockCodex('syllogism')).toBe(false);
    expect(save.snapshot.unlockedCodex).toEqual(['syllogism']);
  });

  it('persists progress across instances', () => {
    const save = new SaveService(storage);
    save.unlockCodex('dialectic');
    save.setStats({ reason: 2, wisdom: 1, empathy: 0 });
    save.completeChapter('act-one');

    const reloaded = new SaveService(storage);
    expect(reloaded.snapshot.unlockedCodex).toEqual(['dialectic']);
    expect(reloaded.snapshot.stats.reason).toBe(2);
    expect(reloaded.snapshot.completedChapters).toEqual(['act-one']);
  });

  it('survives a corrupted save', () => {
    storage.setItem(SAVE_KEY, '{not json');

    const save = new SaveService(storage);
    expect(save.snapshot).toEqual(createSaveData());
  });

  it('discards a save from a different version', () => {
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 99, unlockedCodex: ['syllogism'] }));

    const save = new SaveService(storage);
    expect(save.snapshot.unlockedCodex).toEqual([]);
  });

  it('works without any storage at all', () => {
    const save = new SaveService(undefined);
    save.unlockCodex('syllogism');
    expect(save.snapshot.unlockedCodex).toEqual(['syllogism']);
  });
});
