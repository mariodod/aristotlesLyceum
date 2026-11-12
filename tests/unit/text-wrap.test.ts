import { describe, expect, it } from 'vitest';
import { countLines, wrapText } from '../../src/systems/dialogue/text-wrap.ts';

describe('wrapText', () => {
  it('keeps a short line as it is', () => {
    expect(wrapText('short line', 20)).toBe('short line');
  });

  it('wraps on word boundaries', () => {
    expect(wrapText('one two three four', 9)).toBe('one two\nthree\nfour');
  });

  it('never exceeds the column count', () => {
    const wrapped = wrapText('alpha beta gamma delta epsilon', 10);

    for (const line of wrapped.split('\n')) {
      expect(line.length).toBeLessThanOrEqual(10);
    }
  });

  it('keeps authored line breaks', () => {
    expect(wrapText('first\nsecond', 20)).toBe('first\nsecond');
  });

  it('breaks a word that is longer than the line', () => {
    const wrapped = wrapText('supercalifragilistic', 8);
    expect(wrapped.length).toBeLessThanOrEqual(8);
  });

  it('treats an empty paragraph as an empty line', () => {
    expect(wrapText('a\n\nb', 10)).toBe('a\n\nb');
  });

  it('counts the lines a wrapped text occupies', () => {
    expect(countLines(wrapText('one two three four', 9))).toBe(3);
  });
});
