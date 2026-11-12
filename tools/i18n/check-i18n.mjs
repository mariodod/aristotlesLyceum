/**
 * The localisation linter.
 *
 * A catalogue is only as good as the check on it. This script proves, for
 * every language:
 *
 * - every key the game uses exists in the catalogue;
 * - the catalogue has no keys the game does not use;
 * - the placeholders in a translation match the placeholders in the English;
 * - every character in the catalogue can actually be drawn by the font.
 *
 * The last one matters more than it sounds: a bitmap font has no fallback, so
 * a single accented letter the atlas does not have turns into a blank box in
 * the middle of a sentence.
 *
 * Usage: node tools/i18n/check-i18n.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS } from '../../src/data/script/registry.ts';
import { CODEX_ENTRIES } from '../../src/data/codex/index.ts';
import { DIALECTIC_OPPONENTS } from '../../src/data/dialectic/opponents.ts';
import { LOCALES } from '../../src/i18n/locales.ts';
import { FONT_METRICS } from '../../src/i18n/types.ts';
import { placeholders } from '../../src/i18n/translate.ts';
import { GLYPHS } from '../assets/font.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, '..', '..');

const problems = [];

function report(where, message) {
  problems.push(`${where}: ${message}`);
}

/* Every key the story uses. */
const contentKeys = new Map();

for (const script of CHAPTERS) {
  for (const step of script.steps) {
    if (step.kind === 'say' && step.key) {
      contentKeys.set(step.key, step.text);
    }

    if (step.kind === 'choice' && step.key) {
      contentKeys.set(step.key, step.prompt);

      for (const option of step.options) {
        if (option.key) {
          contentKeys.set(option.key, option.label);
        }
      }
    }

    if (step.kind === 'chapterEnd' && step.key) {
      contentKeys.set(step.key, step.title);

      if (step.subtitleKey && step.subtitle) {
        contentKeys.set(step.subtitleKey, step.subtitle);
      }
    }
  }
}

for (const entry of CODEX_ENTRIES) {
  if (entry.titleKey && entry.title) {
    contentKeys.set(entry.titleKey, entry.title);
  }
  if (entry.originKey && entry.origin) {
    contentKeys.set(entry.originKey, entry.origin);
  }
  if (entry.modernKey && entry.modern) {
    contentKeys.set(entry.modernKey, entry.modern);
  }
  if (entry.sourcesKey && entry.sources.length > 0) {
    contentKeys.set(entry.sourcesKey, entry.sources.join('; '));
  }
}

for (const opponent of DIALECTIC_OPPONENTS) {
  const claim = opponent.claims[0];

  if (!claim) {
    continue;
  }

  contentKeys.set(`dialectic.${opponent.id}.claim`, claim.text);
  contentKeys.set(`dialectic.${opponent.id}.examination`, claim.examination);
  contentKeys.set(`dialectic.${opponent.id}.objection`, claim.objection);
  contentKeys.set(`dialectic.${opponent.id}.relevance`, claim.relevance);
  contentKeys.set(`dialectic.${opponent.id}.concession`, claim.concession);
  contentKeys.set(`dialectic.${opponent.id}.shrug`, claim.shrug);
  contentKeys.set(`dialectic.${opponent.id}.premise`, '');
  contentKeys.set(`dialectic.${opponent.id}.asserted`, '');

  for (const proposition of claim.propositions) {
    contentKeys.set(`dialectic.${proposition.id}`, proposition.text);
  }
}

/* Every key the interface uses, found by reading the source for the literal. */
const uiKeys = new Set();
const sourceFiles = collectFiles(join(projectRoot, 'src'));

for (const file of sourceFiles) {
  if (!file.endsWith('.ts')) {
    continue;
  }

  const source = readFileSync(file, 'utf8');

  for (const match of source.matchAll(/'(ui\.[a-zA-Z0-9_.]+)'/g)) {
    const key = match[1];

    if (key) {
      uiKeys.add(key);
    }
  }

  // Keys built from a template, such as `ui.character.${id}`. The static
  // part is the prefix, and the catalogue holds the specific forms.
  for (const match of source.matchAll(/`(ui\.[a-zA-Z0-9_.]*)\$\{/g)) {
    const key = match[1];

    if (key) {
      uiKeys.add(key.replace(/\.$/, ''));
    }
  }
}

/* The catalogues. */
const english = LOCALES.find((locale) => locale.id === 'en');

if (!english) {
  report('locales', 'there is no English locale to check against');
}

for (const locale of LOCALES) {
  const catalogue = { ...locale.ui, ...locale.content };

  for (const key of uiKeys) {
    if (hasEntry(catalogue, key)) {
      continue;
    }

    report(`locale "${locale.id}"`, `has no entry for the interface key "${key}"`);
  }

  for (const [key, englishText] of contentKeys) {
    const text = catalogue[key];

    if (text === undefined) {
      // The English story lives inline in the scripts, so the English content
      // catalogue is empty on purpose.
      if (locale.id !== 'en') {
        report(`locale "${locale.id}"`, `has no entry for the story key "${key}"`);
      }
      continue;
    }

    if (english && locale.id !== 'en' && englishText.length > 0) {
      const expected = placeholders(englishText).sort().join(',');
      const found = placeholders(text).sort().join(',');

      if (expected !== found) {
        report(
          `locale "${locale.id}"`,
          `the translation of "${key}" has the placeholders [${found}] but the English has [${expected}]`,
        );
      }
    }
  }

  for (const key of Object.keys(catalogue)) {
    if (key.startsWith('ui.')) {
      if (!isUsed(key, uiKeys)) {
        report(`locale "${locale.id}"`, `has the unused interface key "${key}"`);
      }
      continue;
    }

    if (!contentKeys.has(key)) {
      report(`locale "${locale.id}"`, `has the unused story key "${key}"`);
    }
  }
}

/* The font has to be able to draw every character in every catalogue. */
const glyphs = new Set(Object.keys(GLYPHS));

for (const locale of LOCALES) {
  const catalogue = { ...locale.ui, ...locale.content };
  const metrics = FONT_METRICS[locale.fontKey];

  if (!metrics) {
    report(`locale "${locale.id}"`, `uses the font "${locale.fontKey}", which has no metrics`);
    continue;
  }

  for (const [key, text] of Object.entries(catalogue)) {
    for (const character of text) {
      if (character === '\n' || character === '\t') {
        continue;
      }

      if (!glyphs.has(character)) {
        report(
          `locale "${locale.id}"`,
          `the translation of "${key}" uses "${character}", which the font "${locale.fontKey}" cannot draw`,
        );
      }
    }
  }
}

/* The declared advance has to match the font. */
for (const [fontKey, metrics] of Object.entries(FONT_METRICS)) {
  const xmlPath = join(projectRoot, 'public', 'assets', 'fonts', `${fontKey}.xml`);

  try {
    const xml = readFileSync(xmlPath, 'utf8');
    const advances = [...xml.matchAll(/xadvance="(\d+)"/g)].map((match) => Number(match[1]));
    const common = mostCommon(advances);

    if (common !== undefined && common !== metrics.advance) {
      report(
        `font "${fontKey}"`,
        `the declared advance is ${metrics.advance} but the atlas says ${common}`,
      );
    }
  } catch {
    report(`font "${fontKey}"`, `has no atlas at ${xmlPath}`);
  }
}

if (problems.length > 0) {
  console.error(`Localisation check failed with ${problems.length} problem(s):\n`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(
  `Localisation check passed: ${LOCALES.length} locales, ${uiKeys.size} interface keys, ` +
    `${contentKeys.size} story keys.`,
);

/**
 * Whether the catalogue has an entry for a key.
 *
 * A key can be satisfied by the exact entry, by the two forms of a counted
 * key, or by a more specific entry built from a template.
 */
function hasEntry(catalogue, key) {
  if (catalogue[key] !== undefined) {
    return true;
  }

  if (catalogue[`${key}.one`] !== undefined && catalogue[`${key}.many`] !== undefined) {
    return true;
  }

  // A key built from a template can be followed by anything, so the prefix
  // is matched without insisting on a full stop.
  return Object.keys(catalogue).some((entry) => entry.startsWith(key));
}

/**
 * Whether a catalogue entry is one the game actually asks for.
 */
function isUsed(entry, uiKeys) {
  if (uiKeys.has(entry)) {
    return true;
  }

  for (const key of uiKeys) {
    if (entry.startsWith(key)) {
      return true;
    }
  }

  return false;
}

function collectFiles(dir) {
  const out = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      out.push(...collectFiles(full));
    } else {
      out.push(full);
    }
  }

  return out;
}

function mostCommon(values) {
  const counts = new Map();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let best;
  let bestCount = 0;

  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }

  return best;
}
