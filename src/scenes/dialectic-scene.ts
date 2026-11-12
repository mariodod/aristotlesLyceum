import Phaser from 'phaser';
import { FONT_KEY } from '../config/constants.ts';
import { opponentById } from '../data/dialectic/opponents.ts';
import { TextBox } from '../entities/textbox.ts';
import type { TextBoxGeometry } from '../entities/textbox.ts';
import { SyllogismBuilder } from '../entities/syllogism-builder.ts';
import { metricsFor } from '../i18n/types.ts';
import type { LocaleService } from '../services/locale-service.ts';
import type { SaveService } from '../services/save-service.ts';
import { DialecticBattle } from '../systems/dialectic/battle.ts';
import type { BattleEvent, BattleOption, Proposition } from '../types/dialectic.ts';
import { setTestHook } from '../utils/test-hooks.ts';

export interface DialecticSceneData {
  opponentId?: string;
  /** The chapter to go back to when the argument is won. */
  chapterId?: string;
  /** The label in that chapter to continue at. */
  resumeAt?: string;
  /** Where the player goes when the argument is over. */
  returnToScene?: 'Story' | 'Title';
}

const BATTLE_BOX: TextBoxGeometry = {
  x: 16,
  y: 196,
  width: 296,
  height: 148,
  paddingX: 10,
  paddingY: 14,
  borderWidth: 2,
  advance: 7,
};

const MENU_X = 348;
const MENU_Y = 214;

/**
 * The dialectic.
 *
 * The opponent is not a person but an argument given a face: a shadow with
 * two eyes. The player has four moves, and only one of them is a syllogism.
 */
export class DialecticScene extends Phaser.Scene {
  private battle: DialecticBattle | undefined;
  private textBox: TextBox | undefined;
  private builder: SyllogismBuilder | undefined;
  private locale: LocaleService | undefined;
  private readonly menuItems: Phaser.GameObjects.BitmapText[] = [];
  private readonly listItems: Phaser.GameObjects.BitmapText[] = [];
  private heart!: Phaser.GameObjects.Image;
  private convictionBar!: Phaser.GameObjects.Graphics;
  private convictionLabel!: Phaser.GameObjects.BitmapText;
  private mode: 'menu' | 'list' | 'builder' = 'menu';
  private listPurpose: 'examine' | 'claim' = 'examine';
  private menuCursor = 0;
  private listCursor = 0;
  private opponentId = 'certainty';
  private chapterId = 'act-one';
  private resumeAt = '';
  private returnToScene: 'Story' | 'Title' = 'Story';
  private returning = false;

  constructor() {
    super('Dialectic');
  }

  init(data: DialecticSceneData): void {
    this.opponentId = data.opponentId ?? 'certainty';
    this.chapterId = data.chapterId ?? 'act-one';
    this.resumeAt = data.resumeAt ?? '';
    this.returnToScene = data.returnToScene ?? 'Story';
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Dialectic' });

    this.locale = this.registry.get('localeService') as LocaleService;

    const opponent = opponentById(this.opponentId);

    if (!opponent) {
      this.leave();
      return;
    }

    this.battle = new DialecticBattle(opponent);
    this.menuCursor = 0;
    this.listCursor = 0;
    this.mode = 'menu';
    this.buildPresence(opponent.color, this.tc(`ui.battle.opponent.${opponent.id}`, opponent.name));

    this.convictionBar = this.add.graphics();
    this.convictionBar.setDepth(120);

    this.convictionLabel = this.add.bitmapText(
      16,
      34,
      FONT_KEY,
      this.t('ui.battle.conviction', { n: 3 }),
    );
    this.convictionLabel.setDepth(120);
    this.convictionLabel.setAlpha(0.7);

    this.textBox = new TextBox(this, {
      ...BATTLE_BOX,
      advance: metricsFor(this.locale?.definition.fontKey ?? 'pixel-5x7').advance,
    });
    this.textBox.setVisible(false);

    this.heart = this.add.image(0, 0, 'ui-heart');
    this.heart.setOrigin(0.5, 0.5);
    this.heart.setDepth(120);

    this.buildMenu();

    this.installInput();

    const events = this.battle.open();
    this.applyEvents(events);
  }

  override update(_time: number, delta: number): void {
    this.textBox?.update(delta);
    this.publishHook();
  }

  private publishHook(): void {
    setTestHook({
      ready: true,
      scene: 'Dialectic',
      opponent: this.opponentId,
      conviction: this.battle?.state.conviction ?? 0,
      building: this.mode === 'builder',
    });
  }

  /**
   * Translates a key from the interface catalogue.
   */
  private t(key: string, params?: Record<string, string | number>): string {
    return this.locale?.t(key, params) ?? key;
  }

  /**
   * Translates a key from the story catalogue, falling back to the English
   * the game already has.
   */
  private tc(
    key: string | undefined,
    fallback: string,
    params?: Record<string, string | number>,
  ): string {
    return this.locale?.tc(key, fallback, params) ?? fallback;
  }

  /**
   * The opponent: a shadow with two eyes, and its name above it.
   */
  private buildPresence(color: number, name: string): void {
    this.add.ellipse(320, 96, 280, 170, color, 0.14).setDepth(1);

    const body = this.add.ellipse(320, 104, 200, 124, 0x0b0912, 0.96);
    body.setDepth(2);

    const rim = this.add.graphics();
    rim.lineStyle(2, color, 0.85);
    rim.strokeEllipse(320, 104, 200, 124);
    rim.setDepth(3);

    this.add.ellipse(286, 92, 32, 22, 0xf6f2e8).setDepth(4);
    this.add.ellipse(354, 92, 32, 22, 0xf6f2e8).setDepth(4);
    this.add.ellipse(286, 92, 15, 15, 0x14121a).setDepth(5);
    this.add.ellipse(354, 92, 15, 15, 0x14121a).setDepth(5);

    const label = this.add.bitmapText(320, 24, FONT_KEY, name);
    label.setOrigin(0.5, 0);
    label.setDepth(6);
    label.setTint(color);
    label.setScale(2);
  }

  private buildMenu(): void {
    const options = this.battle?.options() ?? [];

    options.forEach((option, index) => {
      const top = MENU_Y + index * 28;

      const label = this.add.bitmapText(MENU_X + 14, top, FONT_KEY, this.t(option.labelKey));
      label.setDepth(120);
      label.setTint(option.enabled ? 0xf6f2e8 : 0x6a6478);
      this.menuItems.push(label);

      const description = this.add.bitmapText(
        MENU_X + 14,
        top + 11,
        FONT_KEY,
        this.t(option.descriptionKey),
      );
      description.setDepth(120);
      description.setTint(option.enabled ? 0x9a94a8 : 0x4a4658);
      this.menuItems.push(description);
    });

    this.refreshMenuCursor();
  }

  /**
   * Shows or hides the four moves. The list and the builder take over the
   * same column, so only one of them is ever on screen.
   */
  private setMenuVisible(visible: boolean): void {
    for (const item of this.menuItems) {
      item.setVisible(visible);
    }

    if (visible) {
      this.refreshMenuCursor();
    } else {
      this.heart.setVisible(false);
    }
  }

  private refreshMenuCursor(): void {
    const label = this.menuItems[this.menuCursor * 2];

    if (!label) {
      this.heart.setVisible(false);
      return;
    }

    this.heart.setVisible(true);
    this.heart.setPosition(MENU_X + 4, label.y + 4);
  }

  private moveMenu(delta: number): void {
    const options = this.battle?.options() ?? [];

    if (options.length === 0) {
      return;
    }

    const count = options.length;
    this.menuCursor = (this.menuCursor + delta + count) % count;
    this.refreshMenuCursor();
  }

  /**
   * The list of propositions, used both for reading the opponent's argument
   * and for asserting a conclusion on its own.
   */
  private openList(purpose: 'examine' | 'claim'): void {
    this.listPurpose = purpose;
    this.mode = 'list';
    this.listCursor = 0;
    this.setMenuVisible(false);

    for (const item of this.listItems) {
      item.destroy();
    }
    this.listItems.length = 0;

    const header = this.add.bitmapText(
      MENU_X,
      MENU_Y - 16,
      FONT_KEY,
      this.t(purpose === 'claim' ? 'ui.battle.assertOne' : 'ui.battle.theirTerms'),
    );
    header.setDepth(120);
    header.setTint(0xffe6a0);
    this.listItems.push(header);

    const propositions = this.battle?.propositions() ?? [];

    for (const proposition of propositions) {
      const item = this.add.bitmapText(
        MENU_X + 12,
        MENU_Y + 4 + this.listItems.length * 14,
        FONT_KEY,
        `${proposition.form}  ${this.propositionText(proposition)}`,
      );
      item.setDepth(120);
      this.listItems.push(item);
    }

    this.refreshListCursor();
  }

  /** The text of a proposition, in the language the player chose. */
  private propositionText(proposition: Proposition): string {
    return this.tc(`dialectic.${proposition.id}`, proposition.text);
  }

  private refreshListCursor(): void {
    const item = this.listItems[this.listCursor + 1];

    if (!item) {
      this.heart.setVisible(false);
      return;
    }

    this.heart.setVisible(true);
    this.heart.setPosition(MENU_X, item.y + 4);
  }

  private closeList(): void {
    for (const item of this.listItems) {
      item.destroy();
    }
    this.listItems.length = 0;
    this.mode = 'menu';
    this.setMenuVisible(true);
  }

  private openBuilder(): void {
    this.mode = 'builder';
    this.setMenuVisible(false);
    this.textBox?.setVisible(false);

    this.builder = new SyllogismBuilder(
      this,
      this.battle?.propositions() ?? [],
      (key, fallback, params) => this.tc(key, fallback ?? key, params),
      (major, minor, conclusion) => this.testArgument(major, minor, conclusion),
      () => this.closeBuilder(),
    );

    this.builder.setVisible(true);
  }

  private closeBuilder(): void {
    this.builder?.destroy();
    this.builder = undefined;
    this.mode = 'menu';
    this.setMenuVisible(true);
    this.textBox?.setVisible(true);
  }

  private testArgument(major: string, minor: string, conclusion: string): void {
    if (!this.battle) {
      return;
    }

    const events = this.battle.refute(major, minor, conclusion);
    const analysis = events.find((event) => event.type === 'analysis');

    if (analysis?.type === 'analysis') {
      this.builder?.showAnalysis(analysis.key, analysis.params, analysis.valid);
    }

    this.applyEvents(events);
  }

  private applyEvents(events: BattleEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case 'dialogue':
          this.textBox?.setVisible(true);
          this.textBox?.showText(this.tc(event.key, event.text));
          break;

        case 'analysis':
          this.builder?.showAnalysis(event.key, event.params, event.valid);
          break;

        case 'conviction':
          this.drawConviction(event.value);
          break;

        case 'examine':
          this.openList('examine');
          break;

        case 'won':
          this.win();
          break;

        default:
          break;
      }
    }
  }

  private drawConviction(value: number): void {
    this.convictionBar.clear();
    this.convictionBar.fillStyle(0x1a1826, 1);
    this.convictionBar.fillRect(16, 20, 120, 10);
    this.convictionBar.fillStyle(0xb0a8e0, 1);
    this.convictionBar.fillRect(16, 20, 120 * Math.max(0, Math.min(1, value / 3)), 10);
    this.convictionBar.lineStyle(1, 0x6a6478, 1);
    this.convictionBar.strokeRect(16, 20, 120, 10);

    this.convictionLabel.setText(this.t('ui.battle.conviction', { n: value }));
  }

  private win(): void {
    if (this.returning) {
      return;
    }

    this.returning = true;

    const saveService = this.registry.get('saveService') as SaveService;
    saveService.setFlag('dialectic-won', true);

    this.time.delayedCall(1400, () => this.leave());
  }

  private leave(): void {
    if (this.returnToScene === 'Title') {
      this.scene.start('Title');
      return;
    }

    this.scene.start('Story', { chapterId: this.chapterId, resumeAt: this.resumeAt });
  }

  private confirm(): void {
    if (this.mode === 'builder') {
      this.builder?.confirm();
      return;
    }

    if (this.mode === 'list') {
      this.pickFromList();
      return;
    }

    const options = this.battle?.options() ?? [];
    const option: BattleOption | undefined = options[this.menuCursor];

    if (!option || !option.enabled) {
      return;
    }

    switch (option.id) {
      case 'examine':
        this.applyEvents(this.battle?.examine() ?? []);
        break;
      case 'refute':
        this.openBuilder();
        break;
      case 'claim':
        this.openList('claim');
        break;
      case 'embrace':
        this.applyEvents(this.battle?.embrace() ?? []);
        break;
    }
  }

  private pickFromList(): void {
    const propositions = this.battle?.propositions() ?? [];
    const proposition = propositions[this.listCursor];

    if (!proposition) {
      this.closeList();
      return;
    }

    if (this.listPurpose === 'claim') {
      const events = this.battle?.assertProposition(proposition.id) ?? [];
      this.closeList();
      this.applyEvents(events);
      return;
    }

    // In the reading mode a pick simply closes the list.
    this.closeList();
  }

  private back(): void {
    if (this.mode === 'builder') {
      this.closeBuilder();
      return;
    }

    if (this.mode === 'list') {
      this.closeList();
    }
  }

  private moveList(delta: number): void {
    if (this.mode === 'builder') {
      this.builder?.moveCursor(delta);
      return;
    }

    if (this.mode === 'list') {
      const count = this.listItems.length - 1;

      if (count <= 0) {
        return;
      }

      this.listCursor = (this.listCursor + delta + count) % count;
      this.refreshListCursor();
      return;
    }

    this.moveMenu(delta);
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-Z', () => this.confirm());
    keyboard.on('keydown-ENTER', () => this.confirm());
    keyboard.on('keydown-SPACE', () => this.confirm());
    keyboard.on('keydown-X', () => this.back());
    keyboard.on('keydown-ESC', () => this.back());
    keyboard.on('keydown-UP', () => this.moveList(-1));
    keyboard.on('keydown-DOWN', () => this.moveList(1));
  }
}
