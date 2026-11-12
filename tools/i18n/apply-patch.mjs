#!/usr/bin/env node
/**
 * Applies a patch file.
 *
 * The format is deliberately dull so that long strings of code and prose can
 * be patched without any quoting:
 *
 *   === FILE: path
 *   --- FROM
 *   ...text...
 *   --- TO
 *   ...text...
 */
import { readFileSync, writeFileSync } from 'node:fs';

const patch = readFileSync(process.argv[2], 'utf8');
const blocks = patch.split(/^=== FILE: /m).slice(1);

let applied = 0;

for (const block of blocks) {
  const newline = block.indexOf('\n');
  const file = block.slice(0, newline).trim();
  const body = block.slice(newline + 1);

  const fromMarker = body.indexOf('--- FROM\n');
  const toMarker = body.indexOf('\n--- TO\n');

  if (fromMarker < 0 || toMarker < 0) {
    throw new Error(`${file}: malformed block`);
  }

  const from = body.slice(fromMarker + '--- FROM\n'.length, toMarker + 1);
  const to = body.slice(toMarker + '\n--- TO\n'.length);

  const source = readFileSync(file, 'utf8');

  if (!source.includes(from)) {
    throw new Error(`${file}: not found ->\n${from.slice(0, 200)}`);
  }

  writeFileSync(file, source.replace(from, to));
  applied += 1;
  console.log(`${file} patched`);
}

console.log('blocks applied:', applied);
