import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { TITLE_TUNING } from '../config/tuning.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * The title screen. A backdrop, the name of the game, and a short menu.
 */
export class TitleScene extends Phaser.Scene {
  private readonly labels: Phaser.GameObjects.BitmapText[] = [];
  private heart!: Phaser.GameObjects.Image;
  private entries: { label: string; action: () => void }[] = [];
  private selected = 0;
  private bobTimer = 0;

  constructor() {
    super('Title');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Title' });

    // A scene keeps its instance when it is restarted, so the lists from the
    // previous run have to be cleared before anything is added to them.
    this.labels.length = 0;

    this.entries = [
      {
        label: 'BEGIN THE DREAM',
        action: () => this.scene.start('Story', { chapterId: 'act-one' }),
      },
      { label: 'CODEX', action: () => this.scene.start('Codex') },
      { label: 'SETTINGS', action: () => this.scene.start('Settings') },
      { label: 'CREDITS', action: () => this.scene.start('Credits') },
    ];

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0b0c10, 0.45).setOrigin(0).setDepth(1);

    const title = this.add
      .bitmapText(GAME_WIDTH / 2, 96, FONT_KEY, "ARISTOTLE'S LYCEUM")
      .setOrigin(0.5, 0)
      .setDepth(2);
    title.setScale(2);
    title.setTint(0xf2c14e);

    this.add
      .bitmapText(GAME_WIDTH / 2, 124, FONT_KEY, 'a dream about why philosophy is still running')
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0.75);

    this.entries.forEach((entry, index) => {
      const label = this.add
        .bitmapText(GAME_WIDTH / 2, 190 + index * 22, FONT_KEY, entry.label)
        .setOrigin(0.5, 0)
        .setDepth(2);
      this.labels.push(label);
    });

    this.heart = this.add.image(0, 0, 'ui-heart').setOrigin(0.5, 0.5).setDepth(2);
    this.refreshCursor();

    this.add
      .bitmapText(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 24,
        FONT_KEY,
        'Z / ENTER to confirm   UP + DOWN to move',
      )
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0.6);

    this.installInput();
  }

  override update(_time: number, delta: number): void {
    this.bobTimer += delta;
    const bob = Math.sin(this.bobTimer / TITLE_TUNING.bobMs);
    this.heart.setScale(1 + bob * 0.12);
  }

  private refreshCursor(): void {
    const label = this.labels[this.selected];

    if (!label) {
      return;
    }

    this.heart.setPosition(label.x - label.width / 2 - 14, label.y + 5);
  }

  private move(delta: number): void {
    this.selected = (this.selected + delta + this.entries.length) % this.entries.length;
    this.refreshCursor();
  }

  private confirm(): void {
    this.entries[this.selected]?.action();
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-UP', () => this.move(-1));
    keyboard.on('keydown-DOWN', () => this.move(1));
    keyboard.on('keydown-Z', () => this.confirm());
    keyboard.on('keydown-ENTER', () => this.confirm());
    keyboard.on('keydown-SPACE', () => this.confirm());
  }
}
