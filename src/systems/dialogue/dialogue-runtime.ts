import type {
  ChoiceOption,
  DialogueEvent,
  DialogueState,
  ExpressionId,
  StoryScript,
  StoryStep,
} from '../../types/story.ts';

/**
 * The dialogue runtime walks a script and reports what the scene should show.
 *
 * It is deliberately free of Phaser so the whole story layer can be tested in
 * a plain Node environment. The scene owns presentation and calls `advance()`
 * when the player confirms a line, or `choose()` when the player picks a menu
 * entry.
 */
export class DialogueRuntime {
  private readonly steps: StoryStep[];
  private readonly labels = new Map<string, number>();
  private readonly stepIndex = new Map<StoryStep, number>();
  private cursor = 0;
  private pending: StoryStep | undefined;
  private readonly flags = new Map<string, boolean>();
  private readonly stats: DialogueState['stats'];
  private readonly unlockedCodex = new Set<string>();

  constructor(
    script: StoryScript,
    state?: DialogueState,
    /** The label to start at, used when a chapter resumes after a battle. */
    startLabel?: string,
  ) {
    this.steps = script.steps;

    this.steps.forEach((step, index) => {
      if (this.labels.has(step.at)) {
        throw new Error(`Duplicate script label "${step.at}".`);
      }

      this.labels.set(step.at, index);
      this.stepIndex.set(step, index);
    });

    this.stats = { ...(state?.stats ?? { reason: 0, wisdom: 0, empathy: 0 }) };

    if (startLabel !== undefined) {
      const start = this.labels.get(startLabel);

      if (start === undefined) {
        throw new Error(`Cannot start at unknown label "${startLabel}".`);
      }

      this.cursor = start;
    }

    for (const [flag, value] of Object.entries(state?.flags ?? {})) {
      this.flags.set(flag, value);
    }

    for (const id of state?.unlockedCodex ?? []) {
      this.unlockedCodex.add(id);
    }
  }

  /** The step currently waiting for the player, if any. */
  get currentStep(): StoryStep | undefined {
    return this.pending;
  }

  /** True when the script has run to completion. */
  get finished(): boolean {
    return this.pending?.kind === 'end';
  }

  getFlag(flag: string): boolean {
    return this.flags.get(flag) ?? false;
  }

  getStat(stat: keyof DialogueState['stats']): number {
    return this.stats[stat];
  }

  snapshot(): DialogueState {
    return {
      flags: Object.fromEntries(this.flags),
      stats: { ...this.stats },
      unlockedCodex: [...this.unlockedCodex],
    };
  }

  /**
   * Moves past the acknowledged line and reports every event produced until
   * the script blocks again on a line, a choice, or the end.
   */
  advance(): DialogueEvent[] {
    if (this.pending) {
      if (this.pending.kind === 'choice') {
        // A choice only unblocks through `choose`. Repeating the prompt is
        // friendlier than throwing at the player.
        return [this.choiceEvent(this.pending)];
      }

      if (this.pending.kind === 'dialectic') {
        // The battle scene takes over the chapter, so the script cannot
        // run past the argument until it has been won.
        return [
          {
            type: 'dialectic',
            opponent: this.pending.opponent,
            returnTo: this.pending.returnTo,
          },
        ];
      }

      this.cursor = (this.stepIndex.get(this.pending) ?? this.cursor) + 1;
      this.pending = undefined;
    }

    return this.run();
  }

  /**
   * Applies the chosen option and resumes the script at its target label.
   */
  choose(optionIndex: number): DialogueEvent[] {
    if (!this.pending || this.pending.kind !== 'choice') {
      throw new Error('choose() was called while no choice was pending.');
    }

    const step = this.pending;
    const option = this.offeredOptions(step)[optionIndex];

    if (!option) {
      throw new Error(`No choice option at index ${optionIndex}.`);
    }

    const events: DialogueEvent[] = [];

    if (option.stat) {
      events.push(this.applyStat(option.stat.stat, option.stat.delta));
    }

    if (option.setFlag) {
      this.flags.set(option.setFlag, true);
      events.push({ type: 'flag', flag: option.setFlag, value: true });
    }

    const target = this.labels.get(option.goto);

    if (target === undefined) {
      throw new Error(`Choice "${option.label}" jumps to unknown label "${option.goto}".`);
    }

    this.cursor = target;
    this.pending = undefined;

    return [...events, ...this.run()];
  }

  private applyStat(stat: keyof DialogueState['stats'], delta: number): DialogueEvent {
    const total = this.stats[stat] + delta;
    this.stats[stat] = total;
    return { type: 'stat', stat, delta, total };
  }

  private choiceEvent(step: StoryStep & { kind: 'choice' }): DialogueEvent {
    return {
      type: 'choice',
      speaker: step.speaker,
      prompt: step.prompt,
      key: step.key,
      options: this.offeredOptions(step),
    };
  }

  /**
   * The options the player is actually offered.
   *
   * An option that refers to a Codex entry is only on offer once the player
   * has read that entry, which is what makes the Codex a replay hook: what
   * you have learned opens new ways to argue. Every other option is always
   * on offer, so a choice can never be empty and the player is never stuck.
   */
  private offeredOptions(step: StoryStep & { kind: 'choice' }): ChoiceOption[] {
    return step.options.filter(
      (option) => option.codex === undefined || this.unlockedCodex.has(option.codex),
    );
  }

  /**
   * Consumes steps until one of them needs the player. Side-effect steps are
   * reported in order so the scene can react to each one.
   */
  private run(): DialogueEvent[] {
    const events: DialogueEvent[] = [];

    while (this.cursor < this.steps.length) {
      const step = this.steps[this.cursor];

      if (!step) {
        break;
      }

      switch (step.kind) {
        case 'say': {
          this.pending = step;
          events.push({
            type: 'say',
            speaker: step.speaker,
            text: step.text,
            key: step.key,
            expression: step.expression ?? 'neutral',
          });
          return events;
        }

        case 'choice': {
          this.pending = step;
          events.push(this.choiceEvent(step));
          return events;
        }

        case 'end': {
          this.pending = step;
          events.push({ type: 'end' });
          return events;
        }

        case 'codex': {
          // The entry is filed before the event goes out, so a later choice in
          // the same chapter can refer to something the player has just read.
          this.unlockedCodex.add(step.entry);
          events.push({ type: 'codex', entry: step.entry });
          this.cursor += 1;
          break;
        }

        case 'stat': {
          events.push(this.applyStat(step.stat, step.delta));
          this.cursor += 1;
          break;
        }

        case 'flag': {
          this.flags.set(step.flag, step.value);
          events.push({ type: 'flag', flag: step.flag, value: step.value });
          this.cursor += 1;
          break;
        }

        case 'jump': {
          const target = this.labels.get(step.to);

          if (target === undefined) {
            throw new Error(`Jump at "${step.at}" targets unknown label "${step.to}".`);
          }

          this.cursor = target;
          break;
        }

        case 'branch': {
          const label = this.flags.get(step.flag) === true ? step.ifTrue : step.ifFalse;
          const target = this.labels.get(label);

          if (target === undefined) {
            throw new Error(`Branch at "${step.at}" targets unknown label "${label}".`);
          }

          this.cursor = target;
          break;
        }

        case 'dialectic': {
          // The scene takes over from here and comes back when the
          // argument is won, so the script blocks until then.
          this.pending = step;
          events.push({ type: 'dialectic', opponent: step.opponent, returnTo: step.returnTo });
          return events;
        }

        case 'chapterEnd': {
          events.push({
            type: 'chapterEnd',
            title: step.title,
            subtitle: step.subtitle,
            key: step.key,
            subtitleKey: step.subtitleKey,
          });
          this.cursor += 1;
          break;
        }

        case 'chapter': {
          events.push({
            type: 'chapter',
            title: step.title,
            subtitle: step.subtitle,
            titleKey: step.titleKey,
            subtitleKey: step.subtitleKey,
          });
          this.cursor += 1;
          break;
        }

        case 'stage': {
          const stageEvent =
            step.backdrop === undefined
              ? { type: 'stage' as const, actors: step.actors }
              : { type: 'stage' as const, actors: step.actors, backdrop: step.backdrop };
          events.push(stageEvent);
          this.cursor += 1;
          break;
        }
      }
    }

    this.pending = this.steps[this.steps.length - 1];
    events.push({ type: 'end' });
    return events;
  }
}

/**
 * The expression a line uses when the script does not name one. Kept here so
 * the runtime and the scene agree on the default.
 */
export const DEFAULT_EXPRESSION: ExpressionId = 'neutral';
