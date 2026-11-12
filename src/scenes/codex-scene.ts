import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { CODEX_ENTRIES } from '../data/codex/index.ts';
import type { SaveService } from '../services/save-service.ts';
import { wrapText } from '../systems/dialogue/text-wrap.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * The Dream Journal. Every entry Aristotle unlocks is filed here with the
 * idea he gave and the place it still shows up in today's science.
 */
export class CodexScene extends Phaser.Scene {
  private index = 0;

  constructor() {
    super('Codex');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Codex' });

    const saveService = this.registry.get('saveService') as SaveService;
    const unlocked = CODEX_ENTRIES.filter((entry) => saveService.isCodexUnlocked(entry.id));

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.78).setOrigin(0).setDepth(1);

    this.add.bitmapText(24, 20, FONT_KEY, 'THE DREAM JOURNAL').setDepth(2).setTint(0xf2c14e);

    if (unlocked.length === 0) {
      this.add
        .bitmapText(24, 64, FONT_KEY, 'Nothing filed yet. Go back to the dream.')
        .setDepth(2)
        .setAlpha(0.7);
    } else {
      this.renderEntry(unlocked);
    }

    this.add
      .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, 'Z / ENTER to go back')
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0.6);

    this.installInput();
  }

  private renderEntry(
    unlocked: { id: string; title: string; origin: string; modern: string }[],
  ): void {
    const entry = unlocked[this.index % unlocked.length];

    if (!entry) {
      return;
    }

    const header = this.add.bitmapText(24, 48, FONT_KEY, entry.title).setDepth(2);
    header.setTint(0xffe6a0);

    this.add.bitmapText(24, 70, FONT_KEY, 'WHAT HE SAID').setDepth(2).setAlpha(0.6);
    this.add.bitmapText(24, 86, FONT_KEY, wrapText(entry.origin, 82)).setDepth(2).setTint(0xe8e2d0);

    this.add.bitmapText(24, 190, FONT_KEY, 'WHERE IT RUNS NOW').setDepth(2).setAlpha(0.6);
    this.add
      .bitmapText(24, 206, FONT_KEY, wrapText(entry.modern, 82))
      .setDepth(2)
      .setTint(0xbfb6a2);

    this.add
      .bitmapText(24, 300, FONT_KEY, `Entry ${this.index + 1} of ${unlocked.length}`)
      .setDepth(2)
      .setAlpha(0.5);
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    const back = () => this.scene.start('Title');

    keyboard.on('keydown-Z', back);
    keyboard.on('keydown-ENTER', back);
    keyboard.on('keydown-ESC', back);
  }
}
