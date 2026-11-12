import { describe, expect, it } from 'vitest';
import { LocaleService } from '../../src/services/locale-service.ts';
import { interpolate, lookup, placeholders } from '../../src/i18n/translate.ts';
import type { LocaleDefinition } from '../../src/i18n/types.ts';

const CATALOGUES: LocaleDefinition[] = [
  {
    id: 'en',
    name: 'English',
    fontKey: 'pixel-5x7',
    direction: 'ltr',
    ui: {
      'ui.greeting': 'Hello',
      'ui.count.one': '{n} entry',
      'ui.count.many': '{n} entries',
    },
    content: {},
  },
  {
    id: 'es',
    name: 'Español',
    fontKey: 'pixel-5x7',
    direction: 'ltr',
    ui: {
      'ui.greeting': 'Hola',
      'ui.count.one': '{n} entrada',
      'ui.count.many': '{n} entradas',
    },
    content: {
      'story.line': 'La frase en español.',
    },
  },
];

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

describe('interpolate', () => {
  it('fills the placeholders', () => {
    expect(interpolate('Entry {n} of {m}', { n: 2, m: 7 })).toBe('Entry 2 of 7');
  });

  it('leaves a missing placeholder alone', () => {
    expect(interpolate('Entry {n} of {m}', { n: 2 })).toBe('Entry 2 of {m}');
  });

  it('lists the placeholders in a string', () => {
    expect(placeholders('{n} of {m}, again {n}')).toEqual(['n', 'm', 'n']);
  });
});

describe('lookup', () => {
  it('finds a key', () => {
    expect(lookup({ a: 'A' }, 'a', 'fallback')).toBe('A');
  });

  it('falls back when the key is missing', () => {
    expect(lookup({}, 'a', 'fallback')).toBe('fallback');
  });

  it('falls back when there is no key at all', () => {
    expect(lookup({}, undefined, 'fallback')).toBe('fallback');
  });
});

describe('LocaleService', () => {
  it('starts in English', () => {
    const service = new LocaleService(CATALOGUES);
    expect(service.id).toBe('en');
  });

  it('falls back to the text the game already has', () => {
    const service = new LocaleService(CATALOGUES);

    // The English story lives inline in the scripts, so there is no English
    // content catalogue to find.
    expect(service.tc('story.line', 'The line in English.')).toBe('The line in English.');
  });

  it('uses a translation when there is one', () => {
    const service = new LocaleService(CATALOGUES, 'es');
    expect(service.tc('story.line', 'The line in English.')).toBe('La frase en español.');
  });

  it('falls back to the English text when a translation is missing', () => {
    const service = new LocaleService(CATALOGUES, 'es');
    expect(service.tc('story.untranslated', 'Still in English.')).toBe('Still in English.');
  });

  it('falls back to the English catalogue for the interface', () => {
    const service = new LocaleService(CATALOGUES, 'es');
    expect(service.t('ui.greeting')).toBe('Hola');
  });

  it('falls back to English for the interface when a key is missing', () => {
    const service = new LocaleService(CATALOGUES, 'es');
    expect(service.t('ui.missing')).toBe('ui.missing');
  });

  it('switches language', () => {
    const service = new LocaleService(CATALOGUES);
    expect(service.setLocale('es')).toBe(true);
    expect(service.id).toBe('es');
    expect(service.t('ui.greeting')).toBe('Hola');
  });

  it('refuses a language it does not have', () => {
    const service = new LocaleService(CATALOGUES);
    expect(service.setLocale('kl')).toBe(false);
    expect(service.id).toBe('en');
  });

  it('remembers the language', () => {
    const storage = new MemoryStorage();
    const service = new LocaleService(CATALOGUES, undefined, storage);
    service.setLocale('es', storage);

    const later = new LocaleService(CATALOGUES, undefined, storage);
    expect(later.id).toBe('es');
  });

  it('picks the singular or the plural', () => {
    const service = new LocaleService(CATALOGUES, 'es');
    expect(service.tn('ui.count', 1)).toBe('1 entrada');
    expect(service.tn('ui.count', 4)).toBe('4 entradas');
  });

  it('lists the languages on offer', () => {
    const service = new LocaleService(CATALOGUES);
    expect(service.available.map((locale) => locale.id)).toEqual(['en', 'es']);
  });
});
