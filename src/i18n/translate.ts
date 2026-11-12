import type { MessageCatalog } from './types.ts';

/**
 * Fills the placeholders in a translated string.
 *
 * A missing placeholder leaves the template alone rather than printing
 * `undefined`, because a half-translated string is still better than a
 * broken one.
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];

    return value === undefined ? match : String(value);
  });
}

/**
 * Looks a key up in a catalogue.
 *
 * The fallback is the English text the game already has, so a missing
 * translation degrades to the original wording rather than to a blank.
 */
export function lookup(
  catalog: MessageCatalog,
  key: string | undefined,
  fallback: string,
  params?: Record<string, string | number>,
): string {
  if (key === undefined) {
    return interpolate(fallback, params);
  }

  const found = catalog[key];

  if (found === undefined) {
    return interpolate(fallback, params);
  }

  return interpolate(found, params);
}

/**
 * The placeholders in a string, in the order they appear.
 *
 * The linter uses this to prove that a translation has the same placeholders
 * as the text it translates.
 */
export function placeholders(template: string): string[] {
  return [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '');
}
