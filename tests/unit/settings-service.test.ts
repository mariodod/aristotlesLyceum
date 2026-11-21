import { describe, expect, it } from 'vitest';
import {
  createSettingsData,
  normalizeSettings,
  SettingsService,
} from '../../src/services/settings-service.ts';

/** A minimal in-memory Storage, matching the browser's API. */
function memoryStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => map.delete(key),
    setItem: (key, value) => map.set(key, value),
  };
}

describe('settings data', () => {
  it('starts with readable defaults', () => {
    const data = createSettingsData();

    expect(data.textSpeed).toBe(1);
    expect(data.muted).toBe(false);
    expect(data.reducedMotion).toBe(false);
    expect(data.holdToSkip).toBe(false);
  });

  it('clamps hand-edited volumes and rejects unknown speeds', () => {
    const data = normalizeSettings({
      masterVolume: 4,
      musicVolume: -2,
      textSpeed: 99,
      sfxVolume: Number.NaN,
    });

    expect(data.masterVolume).toBe(1);
    expect(data.musicVolume).toBe(0);
    expect(data.textSpeed).toBe(1);
    expect(data.sfxVolume).toBe(0.7);
  });
});

describe('SettingsService', () => {
  it('persists a change across instances', () => {
    const storage = memoryStorage();
    const first = new SettingsService(storage);
    first.set({ musicVolume: 0.2 });

    const second = new SettingsService(storage);
    expect(second.snapshot.musicVolume).toBe(0.2);
  });

  it('cycles through normal, fast and instant text', () => {
    const service = new SettingsService(memoryStorage());

    expect(service.snapshot.textSpeed).toBe(1);
    service.cycleTextSpeed();
    expect(service.snapshot.textSpeed).toBe(2);
    service.cycleTextSpeed();
    expect(service.snapshot.textSpeed).toBe(0);
    service.cycleTextSpeed();
    expect(service.snapshot.textSpeed).toBe(1);
  });

  it('maps instant text to an infinite reveal rate', () => {
    const service = new SettingsService(memoryStorage());

    expect(service.charactersPerSecond(45)).toBe(45);
    service.set({ textSpeed: 0 });
    expect(service.charactersPerSecond(45)).toBe(Number.POSITIVE_INFINITY);
  });

  it('scales music and effects by the master volume', () => {
    const service = new SettingsService(memoryStorage());
    service.set({ masterVolume: 0.5, musicVolume: 0.8, sfxVolume: 0.5 });

    expect(service.volumes()).toEqual({ master: 0.5, music: 0.4, sfx: 0.25 });
  });

  it('mutes everything without losing the saved levels', () => {
    const service = new SettingsService(memoryStorage());
    service.set({ musicVolume: 0.8 });
    service.set({ muted: true });

    expect(service.volumes()).toEqual({ master: 0, music: 0, sfx: 0 });
    expect(service.snapshot.musicVolume).toBe(0.8);
  });

  it('survives a broken store', () => {
    const storage = memoryStorage();
    storage.setItem('aristotles-lyceum.settings.v1', '{broken');

    expect(new SettingsService(storage).snapshot).toEqual(createSettingsData());
  });
});
