import Phaser from 'phaser';
import { FONT_KEY } from '../config/constants.ts';
import { analyseSyllogism, figureOf } from '../systems/dialectic/syllogism.ts';
import type { Proposition } from '../types/dialectic.ts';

const PANEL = { x: 8, y: 132, width: 624, height: 220 };

/** The builder is drawn over everything else on the screen. */
export const BUILDER_DEPTH = 900;

const SLOT_LABELS = ['MAJOR PREMISE', 'MINOR PREMISE', 'CONCLUSION'];

const FIGURE_NAMES: Record<number, string> = {
  1: 'the middle term is the subject of the major and the predicate of the minor',
  2: 'the middle term is the predicate in both premises',
  3: 'the middle term is the subject in both premises',
  4: 'the middle term is the predicate of the major and the subject of the minor',
};

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
  private readonly slotTexts: Phaser.GameObjects.BitmapText[] = [];
  private readonly readout: Phaser.GameObjects.BitmapText;
  private readonly listTexts: Phaser.GameObjects.BitmapText[] = [];
  private readonly heart: Phaser.GameObjects.Image;
  private cursor = 0;
  private ready = false;
  private analysisText = '';
  private analysisValid = false;

  constructor(
    scene: Phaser.Scene,
    propositions: Proposition[],
    private readonly onTest: (major: string, minor: string, conclusion: string) => void,
    private readonly onCancel: () => void,
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.propositions = propositions;

    // The builder covers the whole lower half of the screen, so it is
    // drawn above everything and it is opaque. Anything showing through
    // would be the battle menu behind it.
    scene.add
      .rectangle(PANEL.x, PANEL.y, PANEL.width, PANEL.height, 0x07070c, 1)
      .setOrigin(0, 0)
      .setDepth(BUILDER_DEPTH);

    const frame = scene.add.graphics();
    frame.lineStyle(2, 0xf2c14e, 0.8);
    frame.strokeRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
    frame.setDepth(BUILDER_DEPTH + 1);

    const header = scene.add.bitmapText(20, 140, FONT_KEY, 'BUILD THE ARGUMENT');
    header.setDepth(BUILDER_DEPTH + 1);
    header.setTint(0xf2c14e);

    for (let index = 0; index < SLOT_LABELS.length; index += 1) {
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

    if (this.slots.some((item) => item?.id === proposition.id)) {
      this.analysisText = 'You already have that one in the argument.';
      this.analysisValid = false;
      this.refresh();
      return;
    }

    const slot = this.slots.findIndex((item) => item === undefined);

    if (slot >= 0) {
      this.slots[slot] = proposition;
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
    this.ready = false;
    this.cursor = 0;
    this.analysisText = '';
    this.refresh();
  }

  /** Leaves the builder without testing anything. */
  cancel(): void {
    this.onCancel();
  }

  /** Shows what the last test found. */
  showAnalysis(text: string, valid: boolean): void {
    this.analysisText = text;
    this.analysisValid = valid;
    this.refresh();
  }

  private refresh(): void {
    for (const text of this.listTexts) {
      text.destroy();
    }
    this.listTexts.length = 0;

    for (let index = 0; index < this.slotTexts.length; index += 1) {
      const slot = this.slotTexts[index];
      const proposition = this.slots[index];

      if (!slot) {
        continue;
      }

      slot.setText(`${SLOT_LABELS[index]}  ${proposition ? proposition.text : '-'}`);
      slot.setTint(proposition ? 0xe8e2d0 : 0x6a6478);
    }

    this.readout.setText(this.readoutText());
    this.readout.setTint(
      this.analysisText.length > 0 ? (this.analysisValid ? 0x9fe0b0 : 0xe89a8a) : 0xbfb6a2,
    );

    const entries = this.ready
      ? ['TEST THE ARGUMENT', 'START OVER']
      : [...this.propositions.map((item) => item.text), 'START OVER'];

    entries.forEach((entry, index) => {
      const text = this.scene.add.bitmapText(36, 228 + index * 14, FONT_KEY, entry);
      text.setDepth(BUILDER_DEPTH + 1);
      text.setAlpha(this.ready || !this.isPicked(entry) ? 1 : 0.45);
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

  private isPicked(text: string): boolean {
    return this.slots.some((proposition) => proposition?.text === text);
  }

  private readoutText(): string {
    if (this.analysisText.length > 0) {
      return this.analysisText;
    }

    const filled = this.slots.filter((slot) => slot !== undefined).length;

    if (filled === 0) {
      return 'A syllogism has three parts: a major premise, a minor premise, a conclusion.';
    }

    if (filled === 1) {
      return 'Now the minor premise. It must carry the middle term and the subject of the conclusion.';
    }

    if (filled === 2) {
      const major = this.slots[0];
      const minor = this.slots[1];

      if (!major || !minor) {
        return '';
      }

      const figure = figureOf(major, minor);

      if (figure === undefined) {
        return 'The middle term has to turn up in both premises and nowhere in the conclusion.';
      }

      return `Figure ${figure}: ${FIGURE_NAMES[figure]}.`;
    }

    const major = this.slots[0];
    const minor = this.slots[1];
    const conclusion = this.slots[2];

    if (!major || !minor || !conclusion) {
      return '';
    }

    return analyseSyllogism(major, minor, conclusion).explanation;
  }
}
