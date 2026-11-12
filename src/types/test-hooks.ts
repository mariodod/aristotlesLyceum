/**
 * A read-only snapshot of the running game, published for browser tests.
 *
 * The shape is intentionally small and flat: a test should be able to assert
 * "the line changed" without knowing anything about the scene graph.
 */
export interface LyceumTestHook {
  ready: boolean;
  scene: string;
  version: string;
  /** Id of the chapter currently playing. */
  chapter: string;
  /** Text currently shown in the dialogue box. */
  lineText: string;
  /** Full text of the current line, revealed or not. */
  lastLine: string;
  /** Expression the speaker is currently making. */
  expression: string;
  /** Name on the dialogue name plate. */
  speaker: string;
  /** True while the typewriter is still revealing characters. */
  typing: boolean;
  /** True while a choice menu is open. */
  choosing: boolean;
  /** Number of options in the open choice menu. */
  choiceCount: number;
  /** Index of the highlighted choice. */
  choiceIndex: number;
  /** Labels of the open choice menu. */
  choiceLabels: string[];
  /** True when the choice labels are actually drawn on top of the panel. */
  choiceVisible: boolean;
  /** Title of the ending the player reached, once the chapter is over. */
  ending: string;
  /** True when the chapter-complete card is showing. */
  endCardVisible: boolean;
  /** Codex entry ids unlocked so far. */
  unlockedCodex: string[];
  /** Current value of each story stat. */
  stats: { reason: number; wisdom: number; empathy: number };
}

declare global {
  interface Window {
    __LYCEUM_TEST__?: LyceumTestHook;
  }
}
