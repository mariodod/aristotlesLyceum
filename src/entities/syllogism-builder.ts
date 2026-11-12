import Phaser from 'phaser';
import { FONT_KEY } from '../config/constants.ts';
import { analyseSyllogism, figureOf } from '../systems/dialectic/syllogism.ts';
import type { Proposition } from '../types/dialectic.ts';

const PANEL = { x: 8, y: 132, width: 624, height: 220 };

/** The builder is drawn over everything else on the screen. */
export const BUILDER_DEPTH = 900;

/**
 * Translates a catalogue key into the language the player chose.
 *
 * The fallback is the English the game already has, which is how the story
 * lines work: the script carries the English, and a translation replaces it.
 */
export type Translate = (
  key: string,
  fallback?: string,
  params?: Record<string, string | number>,
) => string;

/**
 * The syllogism builder.
 *
 * The player picks a major premise, a minor premise and a conclusion. The
 * panel tells them the figure as soon as they have the two premises, and the
 * mood as soon as they have all three, so the thing teaches itself: a
 * player who has never heard of a syllogism learns the shape of one by
 * watching the readout change.
 */
export class SyllogismBuilder extends Phaser.GameObjects.Container {
  private readonly propositions: Proposition[];
  private readonly slots: (Proposition | undefined)[] = [undefined, undefined, undefined];
  /** The ids of the propositions already in the argument. */
  private readonly picked = new Set<string>();
  private readonly slotTexts: Phaser.GameObjects.BitmapText[] = [];
  private readonly readout: Phaser.GameObjects.BitmapText;
  private readonly listTexts: Phaser.GameObjects.BitmapText[] = [];
  private readonly heart: Phaser.GameObjects.Image;
  private cursor = 0;
  private ready = false;
  private analysisKey = '';
  private analysisParams: Record<string, string | number> = {};
  private analysisValid = false;

  constructor(
    scene: Phaser.Scene,
    propositions: Proposition[],
    private readonly translate: Translate,
    private readonly onTest: (major: string, minor: string, conclusion: string) => void,
    private readonly onCancel: () => void,
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.propositions = propositions;

    // The builder covers the whole lower half of the screen, so it is drawn
    // above everything and it is opaque. Anything showing through would be
    // the battle menu behind it.
    scene.add
      .rectangle(PANEL.x, PANEL.y, PANEL.width, PANEL.height, 0x07070c, 1)
      .setOrigin(0, 0)
      .setDepth(BUILDER_DEPTH);

    const frame = scene.add.graphics();
    frame.lineStyle(2, 0xf2c14e, 0.8);
    frame.strokeRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
    frame.setDepth(BUILDER_DEPTH + 1);

    const header = scene.add.bitmapText(20, 140, FONT_KEY, this.translate('ui.battle.buildTitle'));
    header.setDepth(BUILDER_DEPTH + 1);
    header.setTint(0xf2c14e);

    for (let index = 0; index < 3; index += 1) {
      const text = scene.add.bitmapText(20, 160 + index * 14, FONT_KEY, '');
      text.setDepth(BUILDER_DEPTH + 1);
      this.slotTexts.push(text);
    }

    this.readout = scene.add.bitmapText(20, 206, FONT_KEY, '');
    this.readout.setDepth(BUILDER_DEPTH + 1);
    this.readout.setTint(0xbfb6a2);

    this.heart = scene.add.image(0, 0, 'ui-heart');
    this.heart.setOrigin(0.5, 0.5);
    this.heart.setDepth(BUILDER_DEPTH + 2);

    this.setDepth(BUILDER_DEPTH);
    this.refresh();
  }

  /** Moves the cursor through the list. */
  moveCursor(delta: number): void {
    const count = this.listTexts.length;

    if (count === 0) {
      return;
    }

    this.cursor = (this.cursor + delta + count) % count;
    this.refresh();
  }

  /**
   * Confirms the highlighted entry. In the picking stage it fills the next
   * slot; in the ready stage it tests the argument.
   */
  confirm(): void {
    if (this.ready) {
      const major = this.slots[0];
      const minor = this.slots[1];
      const conclusion = this.slots[2];

      if (major && minor && conclusion) {
        this.onTest(major.id, minor.id, conclusion.id);
      }

      return;
    }

    const proposition = this.propositions[this.cursor];

    if (!proposition) {
      return;
    }

    if (this.picked.has(proposition.id)) {
      this.analysisKey = 'ui.battle.duplicate';
      this.analysisParams = {};
      this.analysisValid = false;
      this.refresh();
      return;
    }

    const slot = this.slots.findIndex((item) => item === undefined);

    if (slot >= 0) {
      this.slots[slot] = proposition;
      this.picked.add(proposition.id);
    }

    this.ready = this.slots.every((item) => item !== undefined);
    this.cursor = 0;
    this.refresh();
  }

  /** Throws the argument away and starts again. */
  startOver(): void {
    this.slots[0] = undefined;
    this.slots[1] = undefined;
    this.slots[2] = undefined;
    this.picked.clear();
    this.ready = false;
    this.cursor = 0;
    this.analysisKey = '';
    this.refresh();
  }

  /** Leaves the builder without testing anything. */
  cancel(): void {
    this.onCancel();
  }

  /** Shows what the last test found. */
  showAnalysis(key: string, params: Record<string, string | number>, valid: boolean): void {
    this.analysisKey = key;
    this.analysisParams = params;
    this.analysisValid = valid;
    this.refresh();
  }

  private refresh(): void {
    for (const text of this.listTexts) {
      text.destroy();
    }
    this.listTexts.length = 0;

    const slotKeys = ['ui.battle.major', 'ui.battle.minor', 'ui.battle.conclusion'];

    for (let index = 0; index < this.slotTexts.length; index += 1) {
      const slot = this.slotTexts[index];
      const proposition = this.slots[index];
      const label = this.translate(slotKeys[index] ?? '');

      if (!slot) {
        continue;
      }

      slot.setText(`${label}  ${proposition ? this.propositionText(proposition) : '-'}`);
      slot.setTint(proposition ? 0xe8e2d0 : 0x6a6478);
    }

    this.readout.setText(this.readoutText());
    this.readout.setTint(
      this.analysisKey.length > 0 ? (this.analysisValid ? 0x9fe0b0 : 0xe89a8a) : 0xbfb6a2,
    );

    const entries: { label: string; id?: string }[] = this.ready
      ? [
          { label: this.translate('ui.battle.test') },
          { label: this.translate('ui.battle.startOver') },
        ]
      : [
          ...this.propositions.map((item) => ({
            label: this.propositionText(item),
            id: item.id,
          })),
          { label: this.translate('ui.battle.startOver') },
        ];

    entries.forEach((entry, index) => {
      const text = this.scene.add.bitmapText(36, 228 + index * 14, FONT_KEY, entry.label);
      text.setDepth(BUILDER_DEPTH + 1);
      text.setAlpha(this.ready || entry.id === undefined || !this.picked.has(entry.id) ? 1 : 0.45);
      this.listTexts.push(text);
    });

    const selected = this.listTexts[this.cursor];

    if (selected) {
      this.heart.setVisible(true);
      this.heart.setPosition(26, selected.y + 4);
    } else {
      this.heart.setVisible(false);
    }
  }

  /** The text of a proposition, in the language the player chose. */
  private propositionText(proposition: Proposition): string {
    return this.translate(`dialectic.${proposition.id}`, proposition.text);
  }

  private readoutText(): string {
    if (this.analysisKey.length > 0) {
      return this.translate(this.analysisKey, undefined, this.analysisParams);
    }

    const filled = this.slots.filter((slot) => slot !== undefined).length;

    if (filled === 0) {
      return this.translate('ui.battle.readout.parts');
    }

    if (filled === 1) {
      return this.translate('ui.battle.readout.minor');
    }

    if (filled === 2) {
      const major = this.slots[0];
      const minor = this.slots[1];

      if (!major || !minor) {
        return '';
      }

      const figure = figureOf(major, minor);

      if (figure === undefined) {
        return this.translate('ui.battle.readout.middleTerm');
      }

      return this.translate('ui.battle.readout.figure', undefined, {
        n: figure,
        description: this.translate(`ui.battle.readout.figure${figure}`),
      });
    }

    const major = this.slots[0];
    const minor = this.slots[1];
    const conclusion = this.slots[2];

    if (!major || !minor || !conclusion) {
      return '';
    }

    const result = analyseSyllogism(major, minor, conclusion);
    const name = this.translate(`ui.mood.${result.name ?? ''}`) || (result.name ?? '');

    return this.translate(result.key, undefined, { ...result.params, name });
  }
}
