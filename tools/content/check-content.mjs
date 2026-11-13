/**
 * Content linter.
 *
 * A narrative game is mostly data, and data rots quietly: a renamed codex id
 * leaves an entry that can never be unlocked, a deleted label strands a jump.
 * This script reads the real story files and reports every problem it finds,
 * so a broken script is caught by `npm run content:check` instead of by a
 * player.
 *
 * Usage: node tools/content/check-content.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS } from '../../src/data/script/registry.ts';
import { CODEX_ENTRIES } from '../../src/data/codex/index.ts';
import { PLANNED_CHAPTERS } from '../../src/data/codex/plan.ts';
import { CHARACTERS } from '../../src/data/characters.ts';
import { DIALECTIC_OPPONENTS } from '../../src/data/dialectic/opponents.ts';
import { EXPRESSION_ORDER } from '../../src/data/sprite-expressions.ts';
import { CHARACTER_IDS, EXPRESSION_IDS } from '../../src/types/story.ts';
import { findUnreachableSteps } from '../../src/systems/dialogue/reachability.ts';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, '..', '..');

const problems = [];
const MAX_LINE_LENGTH = 420;

const opponentIds = new Set(DIALECTIC_OPPONENTS.map((opponent) => opponent.id));

/**
 * The id of every codex entry, so a script can be checked against it.
 *
 * This comes before the chapters are read, because a choice may refer to a
 * codex entry and the reference has to be resolved.
 */
const codexIds = new Set(CODEX_ENTRIES.map((entry) => entry.id));

function report(where, message) {
  problems.push(`${where}: ${message}`);
}

const chapterIds = new Set();

for (const script of CHAPTERS) {
  const where = `chapter "${script.id}"`;

  if (chapterIds.has(script.id)) {
    report(where, 'duplicate chapter id');
  }
  chapterIds.add(script.id);

  if (!script.backdrop) {
    report(where, 'missing backdrop');
  }

  const labels = new Set();

  for (const step of script.steps) {
    if (labels.has(step.at)) {
      report(where, `duplicate label "${step.at}"`);
    }
    labels.add(step.at);
  }

  for (const step of script.steps) {
    if (step.kind === 'jump' && !labels.has(step.to)) {
      report(where, `jump at "${step.at}" targets unknown label "${step.to}"`);
    }

    if (step.kind === 'branch') {
      if (!labels.has(step.ifTrue)) {
        report(where, `branch at "${step.at}" targets unknown label "${step.ifTrue}"`);
      }

      if (!labels.has(step.ifFalse)) {
        report(where, `branch at "${step.at}" targets unknown label "${step.ifFalse}"`);
      }
    }

    if (step.kind === 'dialectic') {
      if (!opponentIds.has(step.opponent)) {
        report(
          where,
          `dialectic at "${step.at}" faces an opponent nobody has written ("${step.opponent}")`,
        );
      }

      if (!labels.has(step.returnTo)) {
        report(where, `dialectic at "${step.at}" returns to an unknown label ("${step.returnTo}")`);
      }
    }

    if (step.kind === 'chapterEnd' && step.title.trim().length === 0) {
      report(where, `chapter end at "${step.at}" has no title`);
    }

    if (step.kind === 'choice') {
      if (!CHARACTER_IDS.includes(step.speaker)) {
        report(where, `unknown speaker "${step.speaker}" at "${step.at}"`);
      }

      if (step.options.length < 2) {
        report(where, `choice "${step.at}" needs at least two options`);
      }

      const optionLabels = new Set();

      /**
       * Options that are always on offer, because they do not refer to a
       * Codex entry. A choice needs at least two of them, or the player can
       * be left with nothing to pick.
       */
      let alwaysOffered = 0;

      for (const option of step.options) {
        if (option.label.trim().length === 0) {
          report(where, `choice "${step.at}" has an empty option label`);
        }

        if (optionLabels.has(option.label)) {
          report(where, `choice "${step.at}" repeats the option "${option.label}"`);
        }
        optionLabels.add(option.label);

        if (!labels.has(option.goto)) {
          report(where, `choice "${step.at}" jumps to unknown label "${option.goto}"`);
        }

        if (option.codex === undefined) {
          alwaysOffered += 1;
          continue;
        }

        if (!codexIds.has(option.codex)) {
          report(
            where,
            `choice "${step.at}" refers to the codex entry "${option.codex}", which does not exist`,
          );
        }
      }

      if (alwaysOffered < 2) {
        report(
          where,
          `choice "${step.at}" leaves only ${alwaysOffered} option that is always on offer, so the player can be stranded`,
        );
      }
    }

    if (step.kind === 'say') {
      if (!CHARACTER_IDS.includes(step.speaker)) {
        report(where, `unknown speaker "${step.speaker}" at "${step.at}"`);
      }

      if (step.expression !== undefined && !EXPRESSION_IDS.includes(step.expression)) {
        report(where, `unknown expression "${step.expression}" at "${step.at}"`);
      }

      if (step.text.trim().length === 0) {
        report(where, `empty line at "${step.at}"`);
      }

      if (step.text.length > MAX_LINE_LENGTH) {
        report(
          where,
          `line "${step.at}" is ${step.text.length} characters, over the ${MAX_LINE_LENGTH} limit`,
        );
      }
    }

    if (step.kind === 'stage') {
      for (const actor of step.actors) {
        if (!CHARACTER_IDS.includes(actor.character)) {
          report(where, `unknown character "${actor.character}" at "${step.at}"`);
        }
      }
    }
  }

  const last = script.steps[script.steps.length - 1];

  if (last?.kind !== 'end') {
    report(where, 'the last step is not an end step');
  }

  for (const label of findUnreachableSteps(script)) {
    report(where, `step "${label}" can never be reached`);
  }
}

const unlocked = new Set();

for (const script of CHAPTERS) {
  for (const step of script.steps) {
    if (step.kind === 'codex') {
      unlocked.add(step.entry);
    }
  }
}

/*
 * The chapters that are planned but not written yet.
 *
 * An entry is spoken for if a shipped chapter unlocks it, or if a planned
 * chapter has claimed it. When a planned chapter ships, it has to unlock
 * everything it claimed, and the claim then comes out of the plan.
 */
const claimed = new Map();
const plannedIds = new Set();

for (const planned of PLANNED_CHAPTERS) {
  if (plannedIds.has(planned.id)) {
    report(`plan "${planned.id}"`, 'duplicate planned chapter id');
  }
  plannedIds.add(planned.id);

  for (const id of planned.codex) {
    const owner = claimed.get(id);

    if (owner !== undefined) {
      report(
        `plan "${planned.id}"`,
        `claims the codex entry "${id}", which the planned chapter "${owner}" already claims`,
      );
    }

    claimed.set(id, planned.id);
  }
}

for (const script of CHAPTERS) {
  const planned = PLANNED_CHAPTERS.find((chapter) => chapter.id === script.id);

  if (!planned) {
    continue;
  }

  const missing = planned.codex.filter((id) => !unlocked.has(id));

  if (missing.length > 0) {
    report(
      `chapter "${script.id}"`,
      `has shipped but does not unlock the entries it promised (${missing.join(', ')})`,
    );
  } else {
    report(
      `plan "${script.id}"`,
      'names a chapter that has shipped, so the claim should come out of the plan',
    );
  }
}

const seenCodexIds = new Set();

for (const entry of CODEX_ENTRIES) {
  if (seenCodexIds.has(entry.id)) {
    report(`codex "${entry.id}"`, 'duplicate id');
  }
  seenCodexIds.add(entry.id);

  if (entry.origin.trim().length === 0) {
    report(`codex "${entry.id}"`, 'missing origin text');
  }

  if (entry.modern.trim().length === 0) {
    report(`codex "${entry.id}"`, 'missing modern text');
  }

  if (entry.sources.length === 0) {
    report(`codex "${entry.id}"`, 'has no sources');
  }

  if (entry.author !== undefined && !(entry.author in CHARACTERS)) {
    report(`codex "${entry.id}"`, `names an author who is not in the cast ("${entry.author}")`);
  }

  if (!unlocked.has(entry.id) && !claimed.has(entry.id)) {
    report(
      `codex "${entry.id}"`,
      'is never unlocked by any chapter and no planned chapter has claimed it',
    );
  }
}

for (const id of unlocked) {
  if (!codexIds.has(id)) {
    report(`codex "${id}"`, 'is unlocked by a script but does not exist');
  }
}

for (const [id, chapter] of claimed) {
  if (!codexIds.has(id)) {
    report(`plan "${chapter}"`, `claims the codex entry "${id}", which does not exist`);
  }
}

/*
 * The art pack. Every character in the cast needs a sprite, and every sprite
 * needs a frame for every expression, or a line of dialogue will play on a
 * face that does not react.
 */

const manifest = JSON.parse(
  readFileSync(join(projectRoot, 'src', 'data', 'asset-manifest.json'), 'utf8'),
);

const imageKeys = new Set(manifest.images.map((image) => image.key));
const sheetKeys = new Set(manifest.spritesheets.map((sheet) => sheet.key));

for (const character of Object.values(CHARACTERS)) {
  if (character.id === 'narrator') {
    continue;
  }

  if (!imageKeys.has(character.spriteKey) && !sheetKeys.has(character.spriteKey)) {
    report(`character "${character.id}"`, `has no sprite named "${character.spriteKey}"`);
  }
}

for (const sheet of manifest.spritesheets) {
  for (const expression of EXPRESSION_ORDER) {
    const key = `${sheet.key}-${expression}`;

    if (!sheet.animations.some((animation) => animation.key === key)) {
      report(`sprite "${sheet.key}"`, `has no "${expression}" animation`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Content check failed with ${problems.length} problem(s):\n`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(
  `Content check passed: ${CHAPTERS.length} chapters, ${CODEX_ENTRIES.length} codex entries, ` +
    `${unlocked.size} unlocks.`,
);
