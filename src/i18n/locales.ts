import enUi from './ui/en.json' with { type: 'json' };
import esUi from './ui/es.json' with { type: 'json' };
import esContent from './content/es.json' with { type: 'json' };
import type { LocaleDefinition } from './types.ts';

/**
 * Every language the game can be played in.
 *
 * Adding a language is three steps: a folder of catalogues under `ui/` and
 * `content/`, an entry in this list, and a font if the language needs one
 * that the game does not already have.
 */
export const LOCALES: LocaleDefinition[] = [
  {
    id: 'en',
    name: 'English',
    fontKey: 'pixel-5x7',
    direction: 'ltr',
    ui: enUi,
    // The English story lives inline in the scripts, so there is nothing to
    // translate: the scripts themselves are the fallback.
    content: {},
  },
  {
    id: 'es',
    name: 'Español',
    fontKey: 'pixel-5x7',
    direction: 'ltr',
    ui: esUi,
    content: esContent,
  },
];

export const DEFAULT_LOCALE = 'en';

export function localeById(id: string): LocaleDefinition | undefined {
  return LOCALES.find((locale) => locale.id === id);
}
