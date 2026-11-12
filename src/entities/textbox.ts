import Phaser from 'phaser';
import { FONT_KEY, TEXTBOX } from '../config/constants.ts';
import { DIALOGUE_TUNING } from '../config/tuning.ts';
import { Typewriter } from '../systems/dialogue/typewriter.ts';
import { wrapText } from '../systems/dialogue/text-wrap.ts';

const BORDER_COLOR = 0xf6f2e8;
const PANEL_COLOR = 0x07070c;

export interface TextBoxGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  borderWidth: number;
  /**
   * The width of one character in the font the player chose.
   *
   * The box works out how many characters fit from this, so a locale with a
   * wider font wraps differently without anything else changing.
   */
  advance: number;
}

/**
 * The geometry of the standard dialogue box. The battle uses a narrower one,
 * so the geometry is data rather than a constant.
 */
export const DEFAULT_TEXTBOX: TextBoxGeometry = {
  ...TEXTBOX,
  advance: 7,
};

/**
 * How many characters fit on a line of the box.
 */
export function columnsFor(geometry: TextBoxGeometry): number {
  const usable = geometry.width - geometry.paddingX * 2;

  return Math.max(8, Math.floor(usable / Math.max(1, geometry.advance)));
}

/**
 * The dialogue box: a black panel with a pale border, a name plate that
 * overlaps the top-left corner, and a typewriter reveal.
 *
 * It also owns the choice menu, because in this genre the choices live
 * inside the same box and share its rhythm.
 */
export class TextBox extends Phaser.GameObjects.Container {
  private readonly geometry: TextBoxGeometry;
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

  constructor(scene: Phaser.Scene, geometry: TextBoxGeometry = DEFAULT_TEXTBOX) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.geometry = geometry;

    // Phaser rectangles are centre-origin by default. These are laid out
    // against the top-left of the box, so the origin has to be moved.
    this.background = scene.add
      .rectangle(geometry.x, geometry.y, geometry.width, geometry.height, PANEL_COLOR, 1)
      .setOrigin(0, 0);

    this.border = scene.add.graphics();
    this.border.lineStyle(geometry.borderWidth, BORDER_COLOR, 1);
    this.border.strokeRect(geometry.x, geometry.y, geometry.width, geometry.height);

    // The plate straddles the top border of the box, and the name sits above
    // the border line so the rule never runs through the letters.
    this.namePlate = scene.add
      .rectangle(geometry.x + 8, geometry.y - 13, 10, 16, PANEL_COLOR, 1)
      .setOrigin(0, 0);
    this.namePlateBorder = scene.add.graphics();
    this.nameText = scene.add.bitmapText(geometry.x + 16, geometry.y - 11, FONT_KEY, '');
    this.nameText.setVisible(false);

    this.bodyText = scene.add.bitmapText(
      geometry.x + geometry.paddingX,
      geometry.y + geometry.paddingY,
      FONT_KEY,
      '',
    );
    this.bodyText.setVisible(false);

    this.indicator = scene.add.graphics();
    this.indicator.fillStyle(BORDER_COLOR, 1);
    this.indicator.fillTriangle(0, 0, 7, 0, 3, 5);
    this.indicator.setPosition(
      geometry.x + geometry.width - geometry.paddingX - 8,
      geometry.y + geometry.height - 14,
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
      this.namePlate.setVisible(false);
      return;
    }

    this.namePlate.setVisible(true);

    const width = this.nameText.width + 16;

    this.namePlate.setSize(width, 16);
    this.namePlate.setPosition(this.geometry.x + 8, this.geometry.y - 13);
    this.namePlateBorder.lineStyle(this.geometry.borderWidth, BORDER_COLOR, 1);
    this.namePlateBorder.strokeRect(this.geometry.x + 8, this.geometry.y - 13, width, 16);
  }

  /** Starts a typewriter reveal of the given line. */
  showText(text: string, charactersPerSecond = DIALOGUE_TUNING.charactersPerSecond): void {
    const wrapped = wrapText(text, columnsFor(this.geometry));
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
      this.geometry.x + this.geometry.paddingX,
      this.geometry.y + this.geometry.paddingY,
      FONT_KEY,
      prompt,
    );
    promptText.setTint(0xffe6a0);
    // The option has to become a child of this container. A text object left
    // in the scene's display list sits at depth zero and renders behind the
    // panel, which hides the whole menu.
    this.add(promptText);
    this.optionTexts.push(promptText);

    labels.forEach((label, index) => {
      const option = this.scene.add.bitmapText(
        this.geometry.x + this.geometry.paddingX + 16,
        this.geometry.y + this.geometry.paddingY + 16 + index * 12,
        FONT_KEY,
        label,
      );
      this.add(option);
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

  /**
   * True when every option label is actually a child of this container and
   * will therefore render on top of the panel.
   */
  get optionsRendered(): boolean {
    return this.optionTexts.every((text) => text.parentContainer === this);
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
