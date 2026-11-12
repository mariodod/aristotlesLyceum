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
  /** Label of the step to continue from when this option is taken. */
  goto: string;
  /** Optional stat adjustment applied when the option is chosen. */
  stat?: { stat: StatId; delta: number };
  /** Optional flag set when the option is chosen. */
  setFlag?: string;
}

interface BaseStep {
  /** Unique label used as a jump target. */
  at: string;
}

export interface SayStep extends BaseStep {
  kind: 'say';
  speaker: CharacterId;
  text: string;
  expression?: ExpressionId;
}

export interface ChoiceStep extends BaseStep {
  kind: 'choice';
  speaker: CharacterId;
  prompt: string;
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
}

export interface ChapterStep extends BaseStep {
  kind: 'chapter';
  title: string;
  subtitle?: string;
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
  | { type: 'say'; speaker: CharacterId; text: string; expression: ExpressionId }
  | { type: 'choice'; speaker: CharacterId; prompt: string; options: ChoiceOption[] }
  | { type: 'codex'; entry: string }
  | { type: 'stat'; stat: StatId; delta: number; total: number }
  | { type: 'flag'; flag: string; value: boolean }
  | { type: 'chapter'; title: string; subtitle?: string }
  | { type: 'chapterEnd'; title: string; subtitle?: string }
  | { type: 'stage'; actors: { character: CharacterId; x: number }[]; backdrop?: string }
  | { type: 'end' };

export interface DialogueState {
  flags: Record<string, boolean>;
  stats: StatRecord;
}

export function createDialogueState(): DialogueState {
  return {
    flags: {},
    stats: { reason: 0, wisdom: 0, empathy: 0 },
  };
}
