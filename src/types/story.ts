/**
 * Story vocabulary shared by every script, the runtime, and the content
 * linter. Keeping the ids as literal unions means a typo in a script is a
 * compile error instead of a silently missing portrait at runtime.
 */

export const CHARACTER_IDS = [
  'narrator',
  'isaac',
  'aristotle',
  'examiner',
  'alexandria-scribe',
  'avicenna',
  'aquinas',
  'harvey',
  'bacon',
  'descartes',
  'hume',
  'darwin',
  'turing',
] as const;

export type CharacterId = (typeof CHARACTER_IDS)[number];

export const EXPRESSION_IDS = [
  'neutral',
  'happy',
  'sad',
  'surprised',
  'thinking',
  'angry',
  'tired',
  'determined',
] as const;

export type ExpressionId = (typeof EXPRESSION_IDS)[number];

export const STAT_IDS = ['reason', 'wisdom', 'empathy'] as const;

/**
 * The three character stats replace the attack/defence pair of a conventional
 * RPG. They gate dialogue options and the ending, never the player's health.
 */
export type StatId = (typeof STAT_IDS)[number];

export type StatRecord = Record<StatId, number>;

export function isCharacterId(value: string): value is CharacterId {
  return (CHARACTER_IDS as readonly string[]).includes(value);
}

export function isExpressionId(value: string): value is ExpressionId {
  return (EXPRESSION_IDS as readonly string[]).includes(value);
}

export function isStatId(value: string): value is StatId {
  return (STAT_IDS as readonly string[]).includes(value);
}

export interface ChoiceOption {
  /** Text shown in the choice menu. */
  label: string;
  /** The catalogue key for the label, when it has been translated. */
  key?: string | undefined;
  /** Label of the step to continue from when this option is taken. */
  goto: string;
  /** Optional stat adjustment applied when the option is chosen. */
  stat?: { stat: StatId; delta: number };
  /** Optional flag set when the option is chosen. */
  setFlag?: string;
  /**
   * A Codex entry this option refers to.
   *
   * The option is only offered when the player has read the entry, which is
   * what makes the Codex a replay hook: what you have learned opens new ways
   * to argue. An option without a reference is always on offer.
   */
  codex?: string | undefined;
}

interface BaseStep {
  /** Unique label used as a jump target. */
  at: string;
}

export interface SayStep extends BaseStep {
  kind: 'say';
  speaker: CharacterId;
  text: string;
  /** The catalogue key for the line, when it has been translated. */
  key?: string | undefined;
  expression?: ExpressionId;
}

export interface ChoiceStep extends BaseStep {
  kind: 'choice';
  speaker: CharacterId;
  prompt: string;
  /** The catalogue key for the prompt, when it has been translated. */
  key?: string | undefined;
  options: ChoiceOption[];
}

export interface CodexStep extends BaseStep {
  kind: 'codex';
  entry: string;
}

export interface StatStep extends BaseStep {
  kind: 'stat';
  stat: StatId;
  delta: number;
}

export interface FlagStep extends BaseStep {
  kind: 'flag';
  flag: string;
  value: boolean;
}

export interface JumpStep extends BaseStep {
  kind: 'jump';
  to: string;
}

/**
 * Branches on a flag. This is how a chapter reaches a different ending
 * depending on what the player chose.
 */
export interface BranchStep extends BaseStep {
  kind: 'branch';
  /** The flag to test. */
  flag: string;
  /** Label to jump to when the flag is set. */
  ifTrue: string;
  /** Label to jump to when the flag is not set. */
  ifFalse: string;
}

/**
 * Names the ending the player reached. The scene shows it on the
 * chapter-complete card.
 */
export interface ChapterEndStep extends BaseStep {
  kind: 'chapterEnd';
  title: string;
  subtitle?: string;
  /** The catalogue keys for the ending, when it has been translated. */
  key?: string | undefined;
  subtitleKey?: string | undefined;
}

/**
 * Hands the chapter over to a dialectic. The scene runs the argument and
 * comes back to the label in `returnTo` when it is won.
 */
export interface DialecticStep extends BaseStep {
  kind: 'dialectic';
  /** The opponent to face. */
  opponent: string;
  /** The label to continue at when the argument is won. */
  returnTo: string;
}

export interface ChapterStep extends BaseStep {
  kind: 'chapter';
  title: string;
  subtitle?: string;
  /** The catalogue keys for the title and subtitle, when they are translated. */
  titleKey?: string;
  subtitleKey?: string;
}

export interface StageStep extends BaseStep {
  kind: 'stage';
  /** Who is on stage, and where. */
  actors: { character: CharacterId; x: number }[];
  /** Backdrop to switch to. */
  backdrop?: string;
}

export interface EndStep extends BaseStep {
  kind: 'end';
}

export type StoryStep =
  | SayStep
  | ChoiceStep
  | CodexStep
  | StatStep
  | FlagStep
  | JumpStep
  | BranchStep
  | ChapterEndStep
  | DialecticStep
  | ChapterStep
  | StageStep
  | EndStep;

export interface StoryScript {
  id: string;
  /** Chapter this script belongs to, used by the chapter registry. */
  chapter: string;
  title: string;
  /** Backdrop asset key the chapter opens on. */
  backdrop: string;
  steps: StoryStep[];
}

/**
 * What the runtime emits. The scene renders `say` and `choice` and applies
 * the rest as side effects.
 */
export type DialogueEvent =
  | {
      type: 'say';
      speaker: CharacterId;
      text: string;
      key?: string | undefined;
      expression: ExpressionId;
    }
  | {
      type: 'choice';
      speaker: CharacterId;
      prompt: string;
      key?: string | undefined;
      options: ChoiceOption[];
    }
  | { type: 'codex'; entry: string }
  | { type: 'stat'; stat: StatId; delta: number; total: number }
  | { type: 'flag'; flag: string; value: boolean }
  | {
      type: 'chapter';
      title: string;
      subtitle?: string | undefined;
      titleKey?: string | undefined;
      subtitleKey?: string | undefined;
    }
  | {
      type: 'chapterEnd';
      title: string;
      subtitle?: string | undefined;
      key?: string | undefined;
      subtitleKey?: string | undefined;
    }
  | { type: 'dialectic'; opponent: string; returnTo: string }
  | { type: 'stage'; actors: { character: CharacterId; x: number }[]; backdrop?: string }
  | { type: 'end' };

export interface DialogueState {
  flags: Record<string, boolean>;
  stats: StatRecord;
  /** The Codex entries the player has read. */
  unlockedCodex: string[];
}

export function createDialogueState(): DialogueState {
  return {
    flags: {},
    stats: { reason: 0, wisdom: 0, empathy: 0 },
    unlockedCodex: [],
  };
}
