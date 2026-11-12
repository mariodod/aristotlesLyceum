import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../src/data/characters.ts';
import { EXPRESSION_ORDER, expressionFrame, isNeutral } from '../../src/data/sprite-expressions.ts';
import { EXPRESSION_IDS } from '../../src/types/story.ts';

interface Manifest {
  images: { key: string }[];
  spritesheets: {
    key: string;
    animations: { key: string }[];
  }[];
}

const manifest = JSON.parse(
  readFileSync(new URL('../../src/data/asset-manifest.json', import.meta.url), 'utf8'),
) as Manifest;

describe('expressions', () => {
  it('covers every expression the type allows', () => {
    expect([...EXPRESSION_ORDER].sort()).toEqual([...EXPRESSION_IDS].sort());
  });

  it('numbers the frames after the idle and the blink', () => {
    expect(expressionFrame('neutral')).toBe(2);
    expect(expressionFrame('happy')).toBe(3);
    expect(expressionFrame('determined')).toBe(9);
  });

  it('knows which expression is the idle one', () => {
    expect(isNeutral('neutral')).toBe(true);
    expect(isNeutral('tired')).toBe(false);
  });
});

describe('the art pack', () => {
  const sheetKeys = new Set(manifest.spritesheets.map((sheet) => sheet.key));
  const imageKeys = new Set(manifest.images.map((image) => image.key));

  it('has a sprite for every character in the cast', () => {
    for (const character of Object.values(CHARACTERS)) {
      if (character.id === 'narrator') {
        continue;
      }

      expect(sheetKeys.has(character.spriteKey) || imageKeys.has(character.spriteKey)).toBe(true);
    }
  });

  it('has a frame for every expression on every sprite', () => {
    for (const sheet of manifest.spritesheets) {
      for (const expression of EXPRESSION_ORDER) {
        expect(sheet.animations.map((animation) => animation.key)).toContain(
          `${sheet.key}-${expression}`,
        );
      }
    }
  });

  it('has a portrait for every character in the cast', () => {
    for (const character of Object.values(CHARACTERS)) {
      if (character.id === 'narrator') {
        continue;
      }

      expect(imageKeys.has(`${character.spriteKey}-portrait`)).toBe(true);
    }
  });
});
