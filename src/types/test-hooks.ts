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
  /** The opponent in a dialectic, once one is running. */
  opponent: string;
  /** How firmly the opponent holds its position. */
  conviction: number;
  /** True while the syllogism builder is open. */
  building: boolean;
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
  /** The prompt above the open choice menu. */
  choicePrompt: string;
  /** True when the choice labels are actually drawn on top of the panel. */
  choiceVisible: boolean;
  /** Title of the ending the player reached, once the chapter is over. */
  ending: string;
  /** True when the chapter-complete card is showing. */
  endCardVisible: boolean;
  /** Codex entry ids unlocked so far. */
  unlockedCodex: string[];
  /** Which journal view is showing: the list of entries, or one of them. */
  codexView: string;
  /** The id of the Codex entry the journal is on. */
  codexEntry: string;
  /** How many Codex entries have been unlocked. */
  codexEntryCount: number;
  /** Current value of each story stat. */
  stats: { reason: number; wisdom: number; empathy: number };
}

declare global {
  interface Window {
    __LYCEUM_TEST__?: LyceumTestHook;
  }
}
