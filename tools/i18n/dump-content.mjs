#!/usr/bin/env node
/**
 * Prints every story key the game uses with its English text.
 *
 * A translator takes this JSON, translates the values into a new
 * `src/i18n/content/<locale>.json`, and `npm run i18n:check` proves the
 * catalogue is complete. The keys come from the same collector the linter
 * uses, so a new chapter, codex entry or opponent shows up here
 * automatically.
 */
import { collectContentKeys } from './collect-keys.mjs';

const keys = collectContentKeys();
const out = {};

for (const [key, text] of [...keys].sort(([a], [b]) => a.localeCompare(b))) {
  out[key] = text;
}

console.log(JSON.stringify(out, null, 2));
