import type { LyceumTestHook } from '../types/test-hooks.ts';

/**
 * Exposes a tiny, read-only state snapshot for browser smoke tests. This
 * never exists in production builds.
 */
export function setTestHook(patch: Partial<LyceumTestHook>): void {
  if (!import.meta.env.DEV) {
    return;
  }

  const current = window.__LYCEUM_TEST__ ?? {
    ready: false,
    scene: 'Boot',
    version: __APP_VERSION__,
    chapter: '',
    lineText: '',
    speaker: '',
    typing: false,
    choosing: false,
    choiceCount: 0,
    choiceIndex: 0,
    choiceLabels: [],
    unlockedCodex: [],
    stats: { reason: 0, wisdom: 0, empathy: 0 },
    lastLine: '',
  };

  window.__LYCEUM_TEST__ = { ...current, ...patch };
}
