import { describe, expect, it } from 'vitest';
import { accentsFor, COLOR_BLIND_ACCENTS, DEFAULT_ACCENTS } from '../../src/config/theme.ts';

describe('accents', () => {
  it('selects the right set', () => {
    expect(accentsFor(false)).toEqual(DEFAULT_ACCENTS);
    expect(accentsFor(true)).toEqual(COLOR_BLIND_ACCENTS);
  });

  it('keeps the two sets distinct', () => {
    expect(COLOR_BLIND_ACCENTS.highlight).not.toBe(DEFAULT_ACCENTS.highlight);
    expect(COLOR_BLIND_ACCENTS.error).not.toBe(DEFAULT_ACCENTS.error);
  });
});
