import Phaser from 'phaser';
import { FONT_KEY, TEXTBOX, TEXT_COLUMNS } from '../config/constants.ts';
import { DIALOGUE_TUNING } from '../config/tuning.ts';
import { Typewriter } from '../systems/dialogue/typewriter.ts';
import { wrapText } from '../systems/dialogue/text-wrap.ts';

const BORDER_COLOR = 0xf6f2e8;
const PANEL_COLOR = 0x07070c;

/**
 * The dialogue box: a black panel with a pale border, a name plate that
 * overlaps the top-left corner, and a typewriter reveal.
 *
 * It also owns the choice menu, because in this genre the choices live
 * inside the same box and share its rhythm.
 */
export class TextBox extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly border: Phaser.GameObjects.Graphics;
  private readonly namePlate: Phaser.GameObjects.Rectangle;
  private readonly namePlateBorder: Phaser.GameObjects.Graphics;
  private readonly nameText: Phaser.GameObjects.BitmapText;
  private readonly bodyText: Phaser.GameObjects.BitmapText;
  private readonly indicator: Phaser.GameObjects.Graphics;
  private readonly heart: Phaser.GameObjects.Image;
  private readonly optionTexts: Phaser.GameObjects.BitmapText[] = [];

  private typewriter: Typewriter | undefined;
  private blinkTimer = 0;
  private choiceOptions: string[] = [];
  private choiceIndex = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    // Phaser rectangles are centre-origin by default. These are laid out
    // against the top-left of the box, so the origin has to be moved.
    this.background = scene.add
      .rectangle(TEXTBOX.x, TEXTBOX.y, TEXTBOX.width, TEXTBOX.height, PANEL_COLOR, 1)
      .setOrigin(0, 0);

    this.border = scene.add.graphics();
    this.border.lineStyle(TEXTBOX.borderWidth, BORDER_COLOR, 1);
    this.border.strokeRect(TEXTBOX.x, TEXTBOX.y, TEXTBOX.width, TEXTBOX.height);

    // The plate straddles the top border of the box, and the name sits above
    // the border line so the rule never runs through the letters.
    this.namePlate = scene.add
      .rectangle(TEXTBOX.x + 8, TEXTBOX.y - 13, 10, 16, PANEL_COLOR, 1)
      .setOrigin(0, 0);
    this.namePlateBorder = scene.add.graphics();
    this.nameText = scene.add.bitmapText(TEXTBOX.x + 16, TEXTBOX.y - 11, FONT_KEY, '');
    this.nameText.setVisible(false);

    this.bodyText = scene.add.bitmapText(
      TEXTBOX.x + TEXTBOX.paddingX,
      TEXTBOX.y + TEXTBOX.paddingY,
      FONT_KEY,
      '',
    );
    this.bodyText.setVisible(false);

    this.indicator = scene.add.graphics();
    this.indicator.fillStyle(BORDER_COLOR, 1);
    this.indicator.fillTriangle(0, 0, 7, 0, 3, 5);
    this.indicator.setPosition(
      TEXTBOX.x + TEXTBOX.width - TEXTBOX.paddingX - 8,
      TEXTBOX.y + TEXTBOX.height - 14,
    );
    this.indicator.setVisible(false);

    this.heart = scene.add.image(0, 0, 'ui-heart');
    this.heart.setOrigin(0.5, 0.5);
    this.heart.setVisible(false);

    this.add([
      this.background,
      this.border,
      this.namePlate,
      this.namePlateBorder,
      this.nameText,
      this.bodyText,
      ...this.optionTexts,
      this.heart,
      this.indicator,
    ]);

    this.setDepth(100);
  }

  /** Sets the name plate. An empty name hides the plate entirely. */
  setSpeaker(name: string, color = BORDER_COLOR): void {
    this.nameText.setText(name);
    this.nameText.setTint(color);
    this.nameText.setVisible(name.length > 0);

    this.namePlateBorder.clear();

    if (name.length === 0) {
      this.namePlate.setSize(1, 1);
      this.namePlate.setPosition(TEXTBOX.x + 8, TEXTBOX.y - 13);
      return;
    }

    const width = this.nameText.width + 16;

    this.namePlate.setSize(width, 16);
    this.namePlate.setPosition(TEXTBOX.x + 8, TEXTBOX.y - 13);
    this.namePlateBorder.lineStyle(TEXTBOX.borderWidth, BORDER_COLOR, 1);
    this.namePlateBorder.strokeRect(TEXTBOX.x + 8, TEXTBOX.y - 13, width, 16);
  }

  /** Starts a typewriter reveal of the given line. */
  showText(text: string, charactersPerSecond = DIALOGUE_TUNING.charactersPerSecond): void {
    const wrapped = wrapText(text, TEXT_COLUMNS);
    this.typewriter = new Typewriter(wrapped, charactersPerSecond);
    this.bodyText.setText('');
    this.bodyText.setVisible(true);
    this.indicator.setVisible(false);
  }

  /** Shows a line with no animation, used for the final line of a scene. */
  showTextInstant(text: string): void {
    this.showText(text);
    this.revealAll();
  }

  override update(delta: number): void {
    if (this.typewriter) {
      this.typewriter.update(delta);
      this.bodyText.setText(this.typewriter.visibleText);
    }

    if (this.typewriter?.isComplete === true && this.choiceOptions.length === 0) {
      this.blinkTimer += delta;
      const visible = Math.floor(this.blinkTimer / DIALOGUE_TUNING.indicatorBlinkMs) % 2 === 0;
      this.indicator.setVisible(visible);
    } else {
      this.indicator.setVisible(false);
    }
  }

  get isTyping(): boolean {
    return this.typewriter !== undefined && !this.typewriter.isComplete;
  }

  get isComplete(): boolean {
    return this.typewriter?.isComplete === true;
  }

  get visibleText(): string {
    return this.bodyText.text;
  }

  /** Completes the current reveal. */
  revealAll(): void {
    this.typewriter?.revealAll();

    if (this.typewriter) {
      this.bodyText.setText(this.typewriter.visibleText);
    }
  }

  /**
   * Opens the choice menu inside the box. The prompt sits above the options so
   * a question can be asked and answered in the same panel.
   */
  openChoices(prompt: string, labels: string[]): void {
    this.choiceOptions = labels;
    this.choiceIndex = 0;
    this.bodyText.setVisible(false);
    this.typewriter = undefined;

    for (const text of this.optionTexts) {
      text.destroy();
    }

    this.optionTexts.length = 0;

    const promptText = this.scene.add.bitmapText(
      TEXTBOX.x + TEXTBOX.paddingX,
      TEXTBOX.y + TEXTBOX.paddingY,
      FONT_KEY,
      prompt,
    );
    promptText.setTint(0xffe6a0);
    this.optionTexts.push(promptText);

    labels.forEach((label, index) => {
      const option = this.scene.add.bitmapText(
        TEXTBOX.x + TEXTBOX.paddingX + 16,
        TEXTBOX.y + TEXTBOX.paddingY + 16 + index * 12,
        FONT_KEY,
        label,
      );
      this.optionTexts.push(option);
    });

    this.heart.setVisible(labels.length > 0);
    this.refreshChoiceCursor();
  }

  closeChoices(): void {
    this.choiceOptions = [];
    this.choiceIndex = 0;

    for (const text of this.optionTexts) {
      text.destroy();
    }

    this.optionTexts.length = 0;
    this.heart.setVisible(false);
  }

  moveChoice(delta: number): void {
    if (this.choiceOptions.length === 0) {
      return;
    }

    const count = this.choiceOptions.length;
    this.choiceIndex = (this.choiceIndex + delta + count) % count;
    this.refreshChoiceCursor();
  }

  get selectedChoice(): number {
    return this.choiceIndex;
  }

  get choiceCount(): number {
    return this.choiceOptions.length;
  }

  get choiceLabels(): string[] {
    return this.choiceOptions;
  }

  private refreshChoiceCursor(): void {
    // Index zero of the option list is the prompt; the selectable options
    // start at one.
    const option = this.optionTexts[this.choiceIndex + 1];

    if (!option) {
      this.heart.setVisible(false);
      return;
    }

    this.heart.setVisible(true);
    this.heart.setPosition(option.x - 9, option.y + 4);
  }
}
