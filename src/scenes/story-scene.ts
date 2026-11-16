import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { DEFAULT_TEXTBOX } from '../config/layout.ts';
import { STAGE_TUNING } from '../config/tuning.ts';
import { animationKey } from '../data/assets.ts';
import { CHARACTERS } from '../data/characters.ts';
import { codexEntry } from '../data/codex/index.ts';
import { chapterById } from '../data/script/registry.ts';
import { isNeutral } from '../data/sprite-expressions.ts';
import { centredText } from '../entities/centred-text.ts';
import { TextBox } from '../entities/textbox.ts';
import type { ChoiceLabel } from '../entities/textbox.ts';
import { metricsFor } from '../i18n/types.ts';
import type { LocaleService } from '../services/locale-service.ts';
import type { SaveService } from '../services/save-service.ts';
import { DialogueRuntime } from '../systems/dialogue/dialogue-runtime.ts';
import { collectScriptFlags } from '../systems/dialogue/script-flags.ts';
import type {
  CharacterId,
  DialogueEvent,
  DialogueState,
  ExpressionId,
  StoryScript,
} from '../types/story.ts';
import { setTestHook } from '../utils/test-hooks.ts';

interface StorySceneData {
  chapterId?: string;
  /** The label to continue at, used when a chapter resumes after a battle. */
  resumeAt?: string;
}

type StoryMode = 'line' | 'choice' | 'done';

/**
 * The scene every chapter plays in.
 *
 * It owns the stage, the dialogue box, and the input, and it does nothing
 * but translate runtime events into presentation. All story rules live in the
 * script data and the runtime.
 */
export class StoryScene extends Phaser.Scene {
  private runtime: DialogueRuntime | undefined;
  private textBox: TextBox | undefined;
  private backdrop: Phaser.GameObjects.Image | undefined;
  private card: Phaser.GameObjects.Container | undefined;
  private endCard: Phaser.GameObjects.Container | undefined;
  private toast: Phaser.GameObjects.BitmapText | undefined;
  private readonly actors = new Map<CharacterId, Phaser.GameObjects.Sprite>();
  /**
   * The shadow under each actor's feet.
   *
   * The shadow is a separate object, so it has to be moved with the actor.
   * Left behind, it marks where the character used to stand.
   */
  private readonly shadows = new Map<CharacterId, Phaser.GameObjects.Ellipse>();
  /**
   * Where the characters are standing, and which backdrop is up.
   *
   * A chapter that is handed to a battle is restarted from the label the
   * battle returns to, which is after the stage steps, so the scene would
   * come back to an empty stage. This is what it puts back.
   */
  private readonly stagePositions = new Map<CharacterId, number>();
  private stageBackdrop = '';
  private chapterId = 'act-one';
  private resumeAt = '';
  private mode: StoryMode = 'line';
  private cardActive = false;
  private speaker: CharacterId = 'narrator';
  private currentLine = '';
  private choicePrompt = '';
  private currentExpression: ExpressionId = 'neutral';
  private endingTitle = '';
  private endingSubtitle = '';
  private endingKey: string | undefined = undefined;
  private endingSubtitleKey: string | undefined = undefined;
  /** What the act card said, so the chapter-complete card can say it again. */
  private actTitle = '';
  private actName = '';
  private locale: LocaleService | undefined;

  constructor() {
    super('Story');
  }

  init(data: StorySceneData): void {
    this.chapterId = data.chapterId ?? 'act-one';
    this.resumeAt = data.resumeAt ?? '';

    // A chapter that starts from the top begins with an empty stage. A
    // chapter that resumes after a battle keeps the stage it had.
    if (this.resumeAt.length === 0) {
      this.stagePositions.clear();
      this.stageBackdrop = '';
    }
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Story', chapter: this.chapterId });

    this.locale = this.registry.get('localeService') as LocaleService;

    // The scene instance survives a restart, so the actors of the previous
    // chapter have to be dropped before the new ones are placed.
    this.actors.clear();
    this.shadows.clear();
    this.endCard = undefined;
    this.endingTitle = '';
    this.endingSubtitle = '';
    this.endingKey = undefined;
    this.endingSubtitleKey = undefined;
    this.currentLine = '';
    this.currentExpression = 'neutral';

    const script = chapterById(this.chapterId);

    if (!script) {
      this.scene.start('Title');
      return;
    }

    // A chapter that resumes after a battle comes back to the backdrop that
    // was up when the battle started, not to the one the chapter opened on.
    const backdrop = this.stageBackdrop.length > 0 ? this.stageBackdrop : script.backdrop;

    this.backdrop = this.add.image(0, 0, backdrop).setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.18).setOrigin(0).setDepth(1);

    this.textBox = new TextBox(this, {
      ...DEFAULT_TEXTBOX,
      advance: metricsFor(this.locale?.definition.fontKey ?? 'pixel-5x7').advance,
    });
    this.installInput();

    this.runtime = new DialogueRuntime(
      script,
      this.freshStateFor(script),
      this.resumeAt.length > 0 ? this.resumeAt : undefined,
    );
    this.applyEvents(this.runtime.advance());

    // The script resumes after the stage steps, so the stage is put back
    // here or the characters would be gone.
    if (this.resumeAt.length > 0) {
      this.restoreStage();
    }
  }

  /**
   * The saved state a chapter starts from.
   *
   * A chapter owns the flags it sets, so they are cleared before the chapter
   * runs. Otherwise replaying Act I would keep the flags of the previous run
   * and every ending would resolve the same way.
   *
   * A chapter that resumes after a battle is the same chapter, continued, so
   * its flags are the ones the player set before the battle and they stay.
   */
  private freshStateFor(script: StoryScript): DialogueState {
    const saveService = this.registry.get('saveService') as SaveService;
    const state = saveService.dialogueState;

    if (this.resumeAt.length === 0) {
      for (const flag of collectScriptFlags(script)) {
        delete state.flags[flag];
        saveService.clearFlag(flag);
      }
    }

    return state;
  }

  /**
   * Puts the characters back on the stage after a battle.
   */
  private restoreStage(): void {
    for (const [character, x] of this.stagePositions) {
      this.placeActor(character, x);
    }

    this.highlightSpeaker();
  }

  override update(_time: number, delta: number): void {
    this.textBox?.update(delta);
    this.publishHook();
  }

  private applyEvents(events: DialogueEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case 'say':
          this.showLine(event.speaker, event.text, event.key, event.expression, event.face);
          break;
        case 'choice':
          this.showChoices(
            this.tc(event.key, event.prompt),
            event.options.map((option) => ({
              text: this.tc(option.key, option.label),
              fromCodex: option.codex !== undefined,
            })),
          );
          break;
        case 'codex':
          this.unlockCodex(event.entry);
          break;
        case 'stat':
          this.persistStats();
          break;
        case 'flag':
          this.persistFlag(event.flag, event.value);
          break;
        case 'chapter':
          this.showChapterCard(event.title, event.subtitle, event.titleKey, event.subtitleKey);
          break;
        case 'dialectic':
          this.startDialectic(event.opponent, event.returnTo);
          break;

        case 'chapterEnd':
          this.endingTitle = event.title;
          this.endingSubtitle = event.subtitle ?? '';
          this.endingKey = event.key;
          this.endingSubtitleKey = event.subtitleKey;
          break;
        case 'stage':
          this.setStage(event.actors, event.backdrop);
          break;
        case 'end':
          this.endChapter();
          break;
      }
    }
  }

  private showLine(
    speaker: CharacterId,
    text: string,
    key: string | undefined,
    expression: ExpressionId,
    face?: CharacterId,
  ): void {
    const box = this.textBox;

    if (!box) {
      return;
    }

    this.speaker = speaker;
    this.currentExpression = expression;
    const character = CHARACTERS[speaker];
    const line = this.tc(key, text);
    this.currentLine = line;
    box.setSpeaker(this.tc(`ui.character.${speaker}`, character.name), character.color);
    box.showText(line);
    this.mode = 'line';
    this.highlightSpeaker();
    // A narrated line has nobody talking, but the person it is about can
    // still react.
    this.applyExpression(face ?? speaker, expression);
  }

  /**
   * Plays the expression on the speaker's sprite.
   *
   * The neutral expression goes back to the idle animation, so a character
   * blinks again once they have finished reacting.
   */
  private applyExpression(speaker: CharacterId, expression: ExpressionId): void {
    const sprite = this.actors.get(speaker);

    if (!sprite) {
      return;
    }

    const definition = CHARACTERS[speaker];
    const state = isNeutral(expression) ? 'idle' : expression;
    const key = animationKey(definition.spriteKey, state);

    if (this.anims.exists(key)) {
      sprite.play(key, true);
    }
  }

  private showChoices(prompt: string, options: ChoiceLabel[]): void {
    const box = this.textBox;

    if (!box) {
      return;
    }

    this.mode = 'choice';
    this.choicePrompt = prompt;
    box.openChoices(prompt, options);
    this.publishHook();
  }

  /**
   * The act card.
   *
   * The card is black from the first frame and only the words fade. Fading
   * the whole card used to fade the black with them, so the scene appeared
   * first, then blacked out with the title over it, then came back. The
   * words also used to spend most of their life half-transparent, which read
   * as a rendering fault rather than as a title.
   */
  private showChapterCard(
    title: string,
    subtitle?: string,
    titleKey?: string,
    subtitleKey?: string,
  ): void {
    this.cardActive = true;

    const overlay = this.add.container(0, 0).setDepth(200);
    overlay.add(this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 1).setOrigin(0));

    // The card's words are placed by their left edge, on whole pixels, so the
    // browser never splits a glyph across the colour channels.
    const titleText = centredText(this, GAME_HEIGHT / 2 - 25, this.tc(titleKey, title), {
      scale: 2,
    });
    titleText.setTint(0xf2c14e);
    titleText.setAlpha(0);
    overlay.add(titleText);

    const words: Phaser.GameObjects.BitmapText[] = [titleText];

    if (subtitle) {
      const subtitleText = centredText(this, GAME_HEIGHT / 2 + 8, this.tc(subtitleKey, subtitle));
      subtitleText.setAlpha(0);
      overlay.add(subtitleText);
      words.push(subtitleText);
    }

    // The card remembers what it said, so the chapter-complete card can
    // name the same act in the same language.
    this.actTitle = this.tc(titleKey, title);
    this.actName = subtitle ? this.tc(subtitleKey, subtitle) : '';

    this.card = overlay;

    this.tweens.add({
      targets: words,
      alpha: 1,
      duration: 420,
      onComplete: () => {
        this.tweens.add({
          targets: words,
          alpha: 0,
          delay: 620,
          duration: 420,
          onComplete: () => {
            overlay.destroy();
            this.card = undefined;
            this.cardActive = false;
            this.restartLine();
          },
        });
      },
    });
  }

  /**
   * Starts the current line again from the top.
   *
   * The act card is up while the first line is already typing behind it, so
   * without this the player arrives at a half-written sentence.
   */
  private restartLine(): void {
    if (this.mode !== 'line' || this.currentLine.length === 0) {
      return;
    }

    this.textBox?.showText(this.currentLine);
  }

  private setStage(actors: { character: CharacterId; x: number }[], backdrop?: string): void {
    for (const actor of actors) {
      this.stagePositions.set(actor.character, actor.x);
      this.placeActor(actor.character, actor.x);
    }

    if (backdrop && this.textures.exists(backdrop)) {
      this.stageBackdrop = backdrop;
      this.swapBackdrop(backdrop);
    }

    this.highlightSpeaker();
  }

  /**
   * Puts a character on the stage, or moves them if they are already there.
   *
   * The shadow under the feet is a separate object, so it has to be moved
   * with the sprite: left behind, it marks where the character used to be.
   */
  private placeActor(character: CharacterId, x: number): void {
    const existing = this.actors.get(character);

    if (existing) {
      existing.setX(x);
      this.shadows.get(character)?.setX(x);
      return;
    }

    const definition = CHARACTERS[character];

    if (!this.textures.exists(definition.spriteKey)) {
      return;
    }

    const sprite = this.add
      .sprite(x, STAGE_TUNING.groundY, definition.spriteKey)
      .setOrigin(0.5, 1)
      .setDepth(10);

    // A soft ellipse under the feet keeps the sprite from looking pasted on.
    const shadow = this.add.ellipse(x, STAGE_TUNING.groundY + 1, 28, 7, 0x000000, 0.28).setDepth(9);

    const idleKey = animationKey(definition.spriteKey, 'idle');

    if (this.anims.exists(idleKey)) {
      sprite.play(idleKey);
    }

    this.actors.set(character, sprite);
    this.shadows.set(character, shadow);
  }

  /**
   * Cross-fades to a new backdrop.
   *
   * A hard cut reads as a bug. The fade lets the narration and the picture
   * change together, which is how the dream gets from a bedroom in Ohio to a
   * path in Athens.
   */
  private swapBackdrop(key: string): void {
    const previous = this.backdrop;

    if (!previous || previous.texture.key === key) {
      return;
    }

    const next = this.add.image(0, 0, key).setOrigin(0).setDepth(0).setAlpha(0);
    this.backdrop = next;

    this.tweens.add({
      targets: next,
      alpha: 1,
      duration: STAGE_TUNING.fadeMs,
    });

    this.tweens.add({
      targets: previous,
      alpha: 0,
      duration: STAGE_TUNING.fadeMs,
      onComplete: () => previous.destroy(),
    });
  }

  private highlightSpeaker(): void {
    for (const [id, sprite] of this.actors) {
      const speaking = id === this.speaker;
      // The dim has to stay light: the backdrops are dark, and a character
      // that is merely "not talking" still has to be readable.
      sprite.setAlpha(speaking ? 1 : 0.88);
      sprite.setTint(speaking ? 0xffffff : 0xd8d4e0);
    }
  }

  private unlockCodex(id: string): void {
    const saveService = this.registry.get('saveService') as SaveService;

    if (!saveService.unlockCodex(id)) {
      return;
    }

    const entry = codexEntry(id);

    if (!entry) {
      return;
    }

    this.showToast(this.t('ui.codex.unlocked', { title: this.tc(entry.titleKey, entry.title) }));
  }

  private showToast(message: string): void {
    this.toast?.destroy();

    const toast = this.add
      .bitmapText(GAME_WIDTH - 12, 16, FONT_KEY, message)
      .setOrigin(1, 0)
      .setDepth(210)
      .setTint(0xffe6a0);
    this.toast = toast;

    this.tweens.add({
      targets: toast,
      alpha: 0,
      delay: 1600,
      duration: 600,
      onComplete: () => {
        toast.destroy();

        if (this.toast === toast) {
          this.toast = undefined;
        }
      },
    });
  }

  private persistStats(): void {
    const saveService = this.registry.get('saveService') as SaveService;
    const runtime = this.runtime;

    if (!runtime) {
      return;
    }

    saveService.setStats({
      reason: runtime.getStat('reason'),
      wisdom: runtime.getStat('wisdom'),
      empathy: runtime.getStat('empathy'),
    });
  }

  private persistFlag(flag: string, value: boolean): void {
    const saveService = this.registry.get('saveService') as SaveService;
    saveService.setFlag(flag, value);
  }

  private endChapter(): void {
    const saveService = this.registry.get('saveService') as SaveService;
    saveService.completeChapter(this.chapterId);

    this.mode = 'done';
    this.showEndCard();
  }

  /**
   * Hands the chapter over to a dialectic. The battle scene comes back
   * here when the argument is won.
   */
  private startDialectic(opponent: string, returnTo: string): void {
    this.scene.start('Dialectic', {
      opponentId: opponent,
      chapterId: this.chapterId,
      resumeAt: returnTo,
    });
  }

  /** Translates a key from the interface catalogue. */
  private t(key: string, params?: Record<string, string | number>): string {
    return this.locale?.t(key, params) ?? key;
  }

  /** Translates a key that comes with a count. */
  private tn(key: string, count: number): string {
    return this.locale?.tn(key, count) ?? key;
  }

  /** Translates a key from the story catalogue. */
  private tc(
    key: string | undefined,
    fallback: string,
    params?: Record<string, string | number>,
  ): string {
    return this.locale?.tc(key, fallback, params) ?? fallback;
  }

  /**
   * The card a chapter ends on: what the act was called, which ending the
   * player reached, what the stats are, and how much of the Dream Journal
   * has been filled in.
   */
  private showEndCard(): void {
    const saveService = this.registry.get('saveService') as SaveService;
    const runtime = this.runtime;
    const stats = runtime ? runtime.snapshot().stats : { reason: 0, wisdom: 0, empathy: 0 };
    const codexCount = saveService.snapshot.unlockedCodex.length;

    this.textBox?.setVisible(false);

    // A toast that is still fading would sit over the card and read as a
    // rendering fault.
    this.toast?.destroy();
    this.toast = undefined;

    const card = this.add.container(0, 0).setDepth(200);
    card.add(this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.97).setOrigin(0));

    // Every line on the card is placed by its left edge, on a whole pixel, so
    // the browser never splits a glyph across the colour channels.
    const actLabel = centredText(this, 48, this.actTitle);
    actLabel.setTint(0xf2c14e);
    card.add(actLabel);

    const actName = centredText(this, 64, this.actName.toUpperCase(), { scale: 2 });
    actName.setTint(0xf6f2e8);
    card.add(actName);

    if (this.endingTitle.length > 0) {
      const ending = centredText(this, 104, this.tc(this.endingKey, this.endingTitle));
      ending.setTint(0xffe6a0);
      card.add(ending);

      if (this.endingSubtitle.length > 0) {
        const subtitle = centredText(
          this,
          120,
          this.tc(this.endingSubtitleKey, this.endingSubtitle),
        );
        subtitle.setAlpha(0.65);
        card.add(subtitle);
      }
    }

    const statsLine = centredText(
      this,
      168,
      `${this.t('ui.story.reason')} ${stats.reason}    ${this.t('ui.story.wisdom')} ${stats.wisdom}    ${this.t('ui.story.empathy')} ${stats.empathy}`,
    );
    statsLine.setTint(0xbfb6a2);
    card.add(statsLine);

    const journal = centredText(this, 188, this.tn('ui.story.journal', codexCount));
    journal.setAlpha(0.7);
    card.add(journal);

    const back = centredText(this, 252, this.t('ui.story.backToTitle'));
    back.setTint(0xf6f2e8);
    card.add(back);

    const readJournal = centredText(this, 270, this.t('ui.story.readJournal'));
    readJournal.setAlpha(0.6);
    card.add(readJournal);

    card.setAlpha(0);
    this.endCard = card;

    this.tweens.add({
      targets: card,
      alpha: 1,
      duration: 400,
    });
  }

  private confirm(): void {
    if (this.cardActive) {
      this.skipCard();
      return;
    }

    if (this.mode === 'done') {
      this.scene.start('Title');
      return;
    }
    const box = this.textBox;
    const runtime = this.runtime;

    if (!box || !runtime) {
      return;
    }

    if (this.mode === 'choice') {
      const index = box.selectedChoice;
      box.closeChoices();
      this.applyEvents(runtime.choose(index));
      return;
    }

    if (box.isTyping) {
      box.revealAll();
      return;
    }

    this.applyEvents(runtime.advance());
  }

  private skipCard(): void {
    this.cardActive = false;

    if (!this.card) {
      return;
    }

    // The fade runs on the words rather than on the card, so it has to be
    // stopped explicitly or the words would keep fading over the scene.
    this.tweens.killTweensOf(this.card.list);
    this.card.destroy();
    this.card = undefined;

    this.restartLine();
  }

  private moveChoice(delta: number): void {
    if (this.mode !== 'choice') {
      return;
    }

    this.textBox?.moveChoice(delta);
    this.publishHook();
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-Z', () => this.confirm());
    keyboard.on('keydown-ENTER', () => this.confirm());
    keyboard.on('keydown-SPACE', () => this.confirm());
    keyboard.on('keydown-UP', () => this.moveChoice(-1));
    keyboard.on('keydown-DOWN', () => this.moveChoice(1));
    keyboard.on('keydown-C', () => this.openJournal());
  }

  /**
   * The Dream Journal is reachable from the chapter-complete card, so a
   * player can read what they unlocked without leaving the act.
   */
  private openJournal(): void {
    if (this.mode !== 'done') {
      return;
    }

    this.scene.start('Codex');
  }

  private publishHook(): void {
    const box = this.textBox;
    const saveService = this.registry.get('saveService') as SaveService;
    const runtime = this.runtime;

    setTestHook({
      ready: true,
      scene: 'Story',
      chapter: this.chapterId,
      lineText: box?.visibleText ?? '',
      lastLine: this.currentLine,
      expression: this.currentExpression,
      speaker: CHARACTERS[this.speaker].name,
      typing: box?.isTyping ?? false,
      choosing: this.mode === 'choice',
      choiceCount: box?.choiceCount ?? 0,
      choiceIndex: box?.selectedChoice ?? 0,
      choiceLabels: box?.choiceLabels ?? [],
      choicePrompt: this.choicePrompt,
      choiceVisible: box?.optionsRendered ?? false,
      ending: this.endingTitle,
      actTitle: this.actTitle,
      endCardVisible: this.endCard !== undefined,
      unlockedCodex: saveService.snapshot.unlockedCodex,
      stats: runtime
        ? {
            reason: runtime.getStat('reason'),
            wisdom: runtime.getStat('wisdom'),
            empathy: runtime.getStat('empathy'),
          }
        : { reason: 0, wisdom: 0, empathy: 0 },
    });
  }
}
