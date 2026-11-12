import { CHAPTERS } from '../../src/data/script/registry.ts';
import { CODEX_ENTRIES } from '../../src/data/codex/index.ts';

const out = {};

for (const script of CHAPTERS) {
  for (const step of script.steps) {
    if (step.kind === 'say' && step.key) {
      out[step.key] = step.text;
    }
    if (step.kind === 'choice' && step.key) {
      out[step.key] = step.prompt;
      step.options.forEach((option) => {
        if (option.key) {
          out[option.key] = option.label;
        }
      });
    }
    if (step.kind === 'chapterEnd' && step.key) {
      out[step.key] = step.title;
      if (step.subtitleKey && step.subtitle) {
        out[step.subtitleKey] = step.subtitle;
      }
    }
  }
}

for (const entry of CODEX_ENTRIES) {
  out[`codex.${entry.id}.title`] = entry.title;
  out[`codex.${entry.id}.origin`] = entry.origin;
  out[`codex.${entry.id}.modern`] = entry.modern;
  out[`codex.${entry.id}.sources`] = entry.sources.join('; ');
}

console.log(JSON.stringify(out, null, 2));
