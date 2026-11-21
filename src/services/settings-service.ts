import { SETTINGS_KEY } from '../config/constants.ts';

/**
 * The player's settings.
 *
 * Text speed is a multiplier on the typewriter so both the default and the
 * instant setting use the same reveal path. Reduced motion turns off the
 * tweens that move things; hold-to-skip only reveals a line while the
 * confirm key is held, so a fast reader can skim without the game running
 * ahead on a single tap.
 */
export interface SettingsData {
  /** 1 is the authored speed, 2 is fast, 0 means reveal instantly. */
  textSpeed: number;
  /** 0..1 */
  masterVolume: number;
  /** 0..1 */
  musicVolume: number;
  /** 0..1 */
  sfxVolume: number;
  screenShake: boolean;
  reducedMotion: boolean;
  holdToSkip: boolean;
  /** Colour-blind safe accents instead of the default palette. */
  colorBlindSafe: boolean;
  muted: boolean;
}

export function createSettingsData(): SettingsData {
  return {
    textSpeed: 1,
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    screenShake: true,
    reducedMotion: false,
    holdToSkip: false,
    colorBlindSafe: false,
    muted: false,
  };
}

/** Clamps a saved value so a hand-edited store cannot break the game. */
function clamp(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;
}

const SPEEDS = [0, 1, 2];

export function normalizeSettings(raw: Partial<SettingsData> | undefined): SettingsData {
  const fallback = createSettingsData();

  if (!raw) {
    return fallback;
  }

  return {
    textSpeed: SPEEDS.includes(raw.textSpeed ?? -1)
      ? (raw.textSpeed as number)
      : fallback.textSpeed,
    masterVolume: clamp(raw.masterVolume, fallback.masterVolume),
    musicVolume: clamp(raw.musicVolume, fallback.musicVolume),
    sfxVolume: clamp(raw.sfxVolume, fallback.sfxVolume),
    screenShake: typeof raw.screenShake === 'boolean' ? raw.screenShake : fallback.screenShake,
    reducedMotion:
      typeof raw.reducedMotion === 'boolean' ? raw.reducedMotion : fallback.reducedMotion,
    holdToSkip: typeof raw.holdToSkip === 'boolean' ? raw.holdToSkip : fallback.holdToSkip,
    colorBlindSafe:
      typeof raw.colorBlindSafe === 'boolean' ? raw.colorBlindSafe : fallback.colorBlindSafe,
    muted: typeof raw.muted === 'boolean' ? raw.muted : fallback.muted,
  };
}

/**
 * Settings that outlive a scene. The storage is injectable, as in the save
 * service, so a browser that refuses local storage still gets in-memory
 * settings for the session.
 */
export class SettingsService {
  private readonly storage: Storage | undefined;
  private data: SettingsData;

  constructor(storage?: Storage) {
    this.storage = storage ?? defaultStorage();
    this.data = this.read();
  }

  get snapshot(): SettingsData {
    return { ...this.data };
  }

  set(patch: Partial<SettingsData>): void {
    this.data = normalizeSettings({ ...this.data, ...patch });
    this.write();
  }

  /** Moves through the three text speeds, wrapping at the end. */
  cycleTextSpeed(): void {
    const index = SPEEDS.indexOf(this.data.textSpeed);
    const next = SPEEDS[(index + 1) % SPEEDS.length];

    if (next !== undefined) {
      this.set({ textSpeed: next });
    }
  }

  /** The characters per second the typewriter should use now. */
  charactersPerSecond(base: number): number {
    if (this.data.textSpeed === 0) {
      return Number.POSITIVE_INFINITY;
    }

    return base * this.data.textSpeed;
  }

  /** Effective volumes: a muted player hears nothing. */
  volumes(): { master: number; music: number; sfx: number } {
    if (this.data.muted) {
      return { master: 0, music: 0, sfx: 0 };
    }

    return {
      master: this.data.masterVolume,
      music: this.data.masterVolume * this.data.musicVolume,
      sfx: this.data.masterVolume * this.data.sfxVolume,
    };
  }

  private read(): SettingsData {
    if (!this.storage) {
      return createSettingsData();
    }

    try {
      const raw = this.storage.getItem(SETTINGS_KEY);

      return normalizeSettings(raw ? (JSON.parse(raw) as Partial<SettingsData>) : undefined);
    } catch {
      return createSettingsData();
    }
  }

  private write(): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(SETTINGS_KEY, JSON.stringify(this.data));
    } catch {
      // A full or private store must never break the settings screen.
    }
  }
}

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
