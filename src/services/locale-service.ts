import { LOCALES, DEFAULT_LOCALE } from '../i18n/locales.ts';
import { interpolate, lookup } from '../i18n/translate.ts';
import type { LocaleDefinition, LocaleId, MessageCatalog } from '../i18n/types.ts';

const STORAGE_KEY = 'aristotles-lyceum.locale.v1';

/**
 * The language the game is being played in.
 *
 * The English story lives inline in the scripts, so the English content
 * catalogue is empty and the scripts themselves are the fallback. Every other
 * language ships a content catalogue with the same keys, and the linter
 * proves it has all of them.
 */
export class LocaleService {
  private readonly definitions: LocaleDefinition[];
  private readonly english: LocaleDefinition;
  private readonly storage: Storage | undefined;
  private current: LocaleDefinition;

  constructor(
    definitions: LocaleDefinition[] = LOCALES,
    initial?: LocaleId,
    storage: Storage | undefined = defaultStorage(),
  ) {
    this.definitions = definitions;

    const english = definitions.find((locale) => locale.id === DEFAULT_LOCALE) ?? definitions.at(0);

    if (!english) {
      throw new Error('There are no locales to choose from.');
    }

    this.english = english;
    this.storage = storage;

    const stored = initial ?? readStoredLocale(storage);
    this.current = definitions.find((locale) => locale.id === stored) ?? this.english;
  }

  get id(): LocaleId {
    return this.current.id;
  }

  get definition(): LocaleDefinition {
    return this.current;
  }

  /** The languages on offer, in the order they are shown. */
  get available(): { id: LocaleId; name: string }[] {
    return this.definitions.map((locale) => ({ id: locale.id, name: locale.name }));
  }

  /**
   * Translates a key.
   *
   * The English catalogue is the fallback, so a key that has not been
   * translated yet shows the English rather than a raw key.
   */
  t(key: string, params?: Record<string, string | number>): string {
    const found = lookup(this.catalogue(this.current), key, '', params);

    if (found.length > 0) {
      return found;
    }

    const fallback = lookup(this.catalogue(this.english), key, '', params);

    return fallback.length > 0 ? fallback : key;
  }

  /**
   * Translates a key that comes with a count.
   *
   * The singular and the plural are separate keys, so a language that needs
   * more than two forms can add them without touching the game.
   */
  tn(key: string, count: number, params?: Record<string, string | number>): string {
    const suffix = count === 1 ? '.one' : '.many';

    return this.t(`${key}${suffix}`, { ...params, n: count });
  }

  /**
   * Translates a key, falling back to the English text the game already has.
   *
   * This is the form the story uses: the script carries the English line, and
   * a translation replaces it when there is one.
   */
  tc(key: string | undefined, fallback: string, params?: Record<string, string | number>): string {
    if (key === undefined) {
      return interpolate(fallback, params);
    }

    const found = lookup(this.catalogue(this.current), key, '');

    if (found.length > 0) {
      return found;
    }

    return interpolate(fallback, params);
  }

  /** Switches language. Returns false when the language is not available. */
  setLocale(id: LocaleId, storage?: Storage): boolean {
    const found = this.definitions.find((locale) => locale.id === id);

    if (!found) {
      return false;
    }

    this.current = found;
    writeStoredLocale(storage ?? this.storage, id);
    return true;
  }

  /**
   * The interface and the story catalogues live in one namespace, so a single
   * lookup finds either.
   */
  private catalogue(locale: LocaleDefinition): MessageCatalog {
    return { ...locale.ui, ...locale.content };
  }
}

/**
 * The browser's storage, when there is one. A test can pass its own.
 */
function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

function readStoredLocale(storage?: Storage): LocaleId | undefined {
  if (!storage) {
    return undefined;
  }

  try {
    return storage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeStoredLocale(storage: Storage | undefined, id: LocaleId): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, id);
  } catch {
    // A browser that refuses storage still gets the language, just not the
    // memory of it.
  }
}
