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
import { CHAPTERS } from '../../src/data/script/registry.ts';
import { CODEX_ENTRIES } from '../../src/data/codex/index.ts';
import { CHARACTER_IDS, EXPRESSION_IDS } from '../../src/types/story.ts';

const problems = [];
const MAX_LINE_LENGTH = 420;

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

    if (step.kind === 'choice') {
      if (!CHARACTER_IDS.includes(step.speaker)) {
        report(where, `unknown speaker "${step.speaker}" at "${step.at}"`);
      }

      if (step.options.length < 2) {
        report(where, `choice "${step.at}" needs at least two options`);
      }

      const optionLabels = new Set();

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
}

const unlocked = new Set();

for (const script of CHAPTERS) {
  for (const step of script.steps) {
    if (step.kind === 'codex') {
      unlocked.add(step.entry);
    }
  }
}

const codexIds = new Set();

for (const entry of CODEX_ENTRIES) {
  if (codexIds.has(entry.id)) {
    report(`codex "${entry.id}"`, 'duplicate id');
  }
  codexIds.add(entry.id);

  if (entry.origin.trim().length === 0) {
    report(`codex "${entry.id}"`, 'missing origin text');
  }

  if (entry.modern.trim().length === 0) {
    report(`codex "${entry.id}"`, 'missing modern text');
  }

  if (entry.sources.length === 0) {
    report(`codex "${entry.id}"`, 'has no sources');
  }

  if (!unlocked.has(entry.id)) {
    report(`codex "${entry.id}"`, 'is never unlocked by any chapter');
  }
}

for (const id of unlocked) {
  if (!codexIds.has(id)) {
    report(`codex "${id}"`, 'is unlocked by a script but does not exist');
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
