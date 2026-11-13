import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../src/data/characters.ts';
import { CODEX_BY_ID, CODEX_ENTRIES } from '../../src/data/codex/index.ts';
import { PLANNED_CHAPTERS } from '../../src/data/codex/plan.ts';
import { CHAPTERS } from '../../src/data/script/registry.ts';
import {
  CHARACTER_IDS,
  EXPRESSION_IDS,
  isCharacterId,
  isExpressionId,
} from '../../src/types/story.ts';
import type { CharacterId, StoryScript } from '../../src/types/story.ts';

/**
 * These checks are the in-repo version of `npm run content:check`. They run
 * in the unit suite so a broken script fails CI even if the standalone
 * linter is skipped.
 */
describe('story data', () => {
  it('has at least one chapter', () => {
    expect(CHAPTERS.length).toBeGreaterThan(0);
  });

  it('uses unique chapter ids', () => {
    const ids = CHAPTERS.map((script) => script.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(CHAPTERS.map((script) => [script.id, script] as const))(
    '%s has unique labels',
    (_id, script) => {
      const labels = script.steps.map((step) => step.at);
      expect(new Set(labels).size).toBe(labels.length);
    },
  );

  it.each(CHAPTERS.map((script) => [script.id, script] as const))(
    '%s only jumps to labels it defines',
    (_id, script) => {
      const labels = new Set(script.steps.map((step) => step.at));

      for (const step of script.steps) {
        if (step.kind === 'jump') {
          expect(labels.has(step.to)).toBe(true);
        }

        if (step.kind === 'choice') {
          for (const option of step.options) {
            expect(labels.has(option.goto)).toBe(true);
          }
        }
      }
    },
  );

  it.each(CHAPTERS.map((script) => [script.id, script] as const))(
    '%s only names known speakers and expressions',
    (_id, script) => {
      for (const step of script.steps) {
        if (step.kind === 'say' || step.kind === 'choice') {
          expect(isCharacterId(step.speaker)).toBe(true);
        }

        if (step.kind === 'say' && step.expression !== undefined) {
          expect(isExpressionId(step.expression)).toBe(true);
        }
      }
    },
  );

  it.each(CHAPTERS.map((script) => [script.id, script] as const))(
    '%s only unlocks codex entries that exist',
    (_id, script) => {
      for (const step of script.steps) {
        if (step.kind === 'codex') {
          expect(CODEX_BY_ID.has(step.entry)).toBe(true);
        }
      }
    },
  );

  it.each(CHAPTERS.map((script) => [script.id, script] as const))(
    '%s ends with an end step',
    (_id, script) => {
      const last = script.steps[script.steps.length - 1];
      expect(last?.kind).toBe('end');
    },
  );

  it('registers every character in the cast', () => {
    for (const id of CHARACTER_IDS) {
      expect(CHARACTERS[id]).toBeDefined();
    }
  });

  it('gives every codex entry at least one source', () => {
    for (const entry of CODEX_ENTRIES) {
      expect(entry.sources.length).toBeGreaterThan(0);
    }
  });

  it('gives every codex entry a unique id', () => {
    const ids = CODEX_ENTRIES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every codex entry all four catalogue keys', () => {
    for (const entry of CODEX_ENTRIES) {
      expect(entry.titleKey).toBe(`codex.${entry.id}.title`);
      expect(entry.originKey).toBe(`codex.${entry.id}.origin`);
      expect(entry.modernKey).toBe(`codex.${entry.id}.modern`);
      expect(entry.sourcesKey).toBe(`codex.${entry.id}.sources`);
    }
  });

  it('gives every codex entry an author who is in the cast', () => {
    for (const entry of CODEX_ENTRIES) {
      expect(entry.author).toBeDefined();
      expect(CHARACTERS[entry.author as CharacterId]).toBeDefined();
    }
  });

  it('claims every planned codex entry exactly once', () => {
    const claimed = PLANNED_CHAPTERS.flatMap((chapter) => chapter.codex);

    expect(new Set(claimed).size).toBe(claimed.length);

    for (const id of claimed) {
      expect(CODEX_BY_ID.has(id)).toBe(true);
    }
  });

  it('speaks for every codex entry, either unlocked or claimed', () => {
    const claimed = new Set(PLANNED_CHAPTERS.flatMap((chapter) => chapter.codex));

    const unlocked = new Set(
      CHAPTERS.flatMap((script) =>
        script.steps.filter((step) => step.kind === 'codex').map((step) => step.entry),
      ),
    );

    for (const entry of CODEX_ENTRIES) {
      expect(unlocked.has(entry.id) || claimed.has(entry.id)).toBe(true);
    }
  });

  it('never names a planned chapter that has already shipped', () => {
    const shipped = new Set(CHAPTERS.map((script) => script.id));

    for (const chapter of PLANNED_CHAPTERS) {
      expect(shipped.has(chapter.id)).toBe(false);
    }
  });

  it('gives every character a name plate colour', () => {
    for (const id of CHARACTER_IDS) {
      expect(Number.isInteger(CHARACTERS[id].color)).toBe(true);
    }
  });

  it('keeps the expression list free of duplicates', () => {
    expect(new Set(EXPRESSION_IDS).size).toBe(EXPRESSION_IDS.length);
  });
});

describe('script authoring rules', () => {
  it('never leaves a chapter without a backdrop', () => {
    const scripts: StoryScript[] = CHAPTERS;
    for (const script of scripts) {
      expect(script.backdrop.length).toBeGreaterThan(0);
    }
  });
});
