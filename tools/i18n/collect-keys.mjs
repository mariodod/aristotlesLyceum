/**
 * Every story key the game uses, with the English text it replaces.
 *
 * The linter and the translator's dump both need this list. Keeping it in
 * one place means a new kind of step or a new opponent only has to be
 * taught to the game once, and neither tool can fall behind the other.
 */
import { CHAPTERS } from '../../src/data/script/registry.ts';
import { CODEX_ENTRIES } from '../../src/data/codex/index.ts';
import { DIALECTIC_OPPONENTS } from '../../src/data/dialectic/opponents.ts';
import { ASSERTED_LINE, PREMISE_LINE } from '../../src/systems/dialectic/battle.ts';

export function collectContentKeys() {
  const keys = new Map();

  for (const script of CHAPTERS) {
    for (const step of script.steps) {
      if (step.kind === 'say' && step.key) {
        keys.set(step.key, step.text);
      }

      if (step.kind === 'choice' && step.key) {
        keys.set(step.key, step.prompt);

        for (const option of step.options) {
          if (option.key) {
            keys.set(option.key, option.label);
          }
        }
      }

      if (step.kind === 'exam') {
        if (step.headingKey) {
          keys.set(step.headingKey, step.heading);
        }

        for (const question of step.questions) {
          if (question.key) {
            keys.set(question.key, question.text);
          }

          for (const option of question.options) {
            if (option.key) {
              keys.set(option.key, option.label);
            }
          }
        }
      }

      if (step.kind === 'chapterEnd' && step.key) {
        keys.set(step.key, step.title);

        if (step.subtitleKey && step.subtitle) {
          keys.set(step.subtitleKey, step.subtitle);
        }
      }

      if (step.kind === 'chapter') {
        if (step.titleKey) {
          keys.set(step.titleKey, step.title);
        }

        if (step.subtitleKey && step.subtitle) {
          keys.set(step.subtitleKey, step.subtitle);
        }
      }
    }
  }

  for (const entry of CODEX_ENTRIES) {
    if (entry.titleKey && entry.title) {
      keys.set(entry.titleKey, entry.title);
    }
    if (entry.originKey && entry.origin) {
      keys.set(entry.originKey, entry.origin);
    }
    if (entry.modernKey && entry.modern) {
      keys.set(entry.modernKey, entry.modern);
    }
    if (entry.sourcesKey && entry.sources.length > 0) {
      keys.set(entry.sourcesKey, entry.sources.join('; '));
    }
  }

  for (const opponent of DIALECTIC_OPPONENTS) {
    const claim = opponent.claims[0];

    if (!claim) {
      continue;
    }

    keys.set(`dialectic.${opponent.id}.claim`, claim.text);
    keys.set(`dialectic.${opponent.id}.examination`, claim.examination);
    keys.set(`dialectic.${opponent.id}.objection`, claim.objection);
    keys.set(`dialectic.${opponent.id}.relevance`, claim.relevance);
    keys.set(`dialectic.${opponent.id}.concession`, claim.concession);
    keys.set(`dialectic.${opponent.id}.shrug`, claim.shrug);
    keys.set(`dialectic.${opponent.id}.premise`, PREMISE_LINE);
    keys.set(`dialectic.${opponent.id}.asserted`, ASSERTED_LINE);

    for (const proposition of claim.propositions) {
      keys.set(`dialectic.${proposition.id}`, proposition.text);
    }
  }

  return keys;
}
