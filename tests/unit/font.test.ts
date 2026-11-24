import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { glyphCell } from '../../tools/assets/font.mjs';

/**
 * Accents used to be painted over the top two rows of the letter. Lowercase
 * letters had spare rows there, but capitals did not: Á, É and the rest lost
 * the top of their letter and came out shorter than the alphabet around them.
 * The mark now lives in two extra rows above the cell, so the base glyph is
 * untouched. These checks pin both halves of that fix.
 */
const ACCENTED: ReadonlyArray<readonly [string, string]> = [
  ['á', 'a'],
  ['é', 'e'],
  ['í', 'i'],
  ['ó', 'o'],
  ['ú', 'u'],
  ['ñ', 'n'],
  ['ü', 'u'],
  ['Á', 'A'],
  ['É', 'E'],
  ['Í', 'I'],
  ['Ó', 'O'],
  ['Ú', 'U'],
  ['Ñ', 'N'],
  ['Ü', 'U'],
];

/** A narrow base letter and its wider accented cell must still compare. */
const trim = (rows: string[]): string[] => rows.map((row) => row.replace(/\.+$/, ''));

describe('the bitmap font', () => {
  it('keeps every base letter whole underneath its accent', () => {
    for (const [accented, base] of ACCENTED) {
      const mark = glyphCell(accented);
      const plain = glyphCell(base);

      expect(mark, accented).toBeDefined();
      expect(plain, base).toBeDefined();

      if (!mark || !plain) {
        continue;
      }

      expect(
        trim(mark.rows.slice(0, 2)).some((row) => row !== ''),
        accented,
      ).toBe(true);
      expect(trim(mark.rows.slice(2)), accented).toEqual(trim(plain.rows.slice(2)));
    }
  });

  it('draws the acute rising to the right, not falling like a grave', () => {
    const rows = glyphCell('á')?.rows ?? [];

    expect(rows[0]?.indexOf('#')).toBeGreaterThan(rows[1]?.indexOf('#') ?? -1);
  });

  it('lifts the accent rows without changing the line metrics', () => {
    const xml = readFileSync(
      new URL('../../public/assets/fonts/pixel-5x7.xml', import.meta.url),
      'utf8',
    );

    expect(xml).toContain('lineHeight="10"');
    expect(xml).toContain('base="7"');
    expect(xml).toContain('yoffset="-2"');
  });
});
