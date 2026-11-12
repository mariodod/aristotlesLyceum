import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { CHARACTERS } from '../data/characters.ts';
import { CODEX_ENTRIES } from '../data/codex/index.ts';
import type { SaveService } from '../services/save-service.ts';
import { wrapText } from '../systems/dialogue/text-wrap.ts';
import { setTestHook } from '../utils/test-hooks.ts';

const PORTRAIT_SIZE = 52;

/**
 * The Dream Journal. Every entry Aristotle unlocks is filed here with the
 * idea he gave and the place it still shows up in today's science.
 */
export class CodexScene extends Phaser.Scene {
  private index = 0;
  private unlocked: {
    id: string;
    title: string;
    origin: string;
    modern: string;
    author?: string;
  }[] = [];

  constructor() {
    super('Codex');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Codex' });

    const saveService = this.registry.get('saveService') as SaveService;

    this.unlocked = CODEX_ENTRIES.filter((entry) => saveService.isCodexUnlocked(entry.id));

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.86).setOrigin(0).setDepth(1);

    this.add.bitmapText(24, 18, FONT_KEY, 'THE DREAM JOURNAL').setDepth(2).setTint(0xf2c14e);

    if (this.unlocked.length === 0) {
      this.add
        .bitmapText(24, 64, FONT_KEY, 'Nothing filed yet. Go back to the dream.')
        .setDepth(2)
        .setAlpha(0.7);
    } else {
      this.renderEntry();
    }

    this.add
      .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, 'Z / ENTER to go back')
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0.6);

    this.installInput();
  }

  private renderEntry(): void {
    const entry = this.unlocked[this.index % this.unlocked.length];

    if (!entry) {
      return;
    }

    this.renderPortrait(entry.author);

    const header = this.add.bitmapText(196, 44, FONT_KEY, entry.title).setDepth(2);
    header.setTint(0xffe6a0);

    this.add.bitmapText(196, 62, FONT_KEY, 'WHAT HE SAID').setDepth(2).setAlpha(0.6);
    this.add
      .bitmapText(196, 78, FONT_KEY, wrapText(entry.origin, 58))
      .setDepth(2)
      .setTint(0xe8e2d0);

    this.add.bitmapText(196, 176, FONT_KEY, 'WHERE IT RUNS NOW').setDepth(2).setAlpha(0.6);
    this.add
      .bitmapText(196, 192, FONT_KEY, wrapText(entry.modern, 58))
      .setDepth(2)
      .setTint(0xbfb6a2);

    this.add
      .bitmapText(24, 300, FONT_KEY, `Entry ${this.index + 1} of ${this.unlocked.length}`)
      .setDepth(2)
      .setAlpha(0.5);
  }

  /**
   * The portrait of whoever the entry is about. It is the head of the
   * character sprite, doubled up, so the journal and the stage always show
   * the same face.
   */
  private renderPortrait(authorId: string | undefined): void {
    if (!authorId) {
      return;
    }

    const definition = CHARACTERS[authorId as keyof typeof CHARACTERS];

    if (!definition) {
      return;
    }

    const key = `${definition.spriteKey}-portrait`;

    if (!this.textures.exists(key)) {
      return;
    }

    this.add
      .image(24, 60, key)
      .setOrigin(0, 0)
      .setDepth(2)
      .setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE);

    // A frame, so the portrait reads as a portrait and not as a stray image.
    const frame = this.add.graphics();
    frame.lineStyle(2, 0xf2c14e, 0.7);
    frame.strokeRect(24, 60, PORTRAIT_SIZE, PORTRAIT_SIZE);
    frame.setDepth(2);

    if (definition.name.length > 0) {
      this.add
        .bitmapText(24, 60 + PORTRAIT_SIZE + 8, FONT_KEY, definition.name.toUpperCase())
        .setDepth(2)
        .setTint(0xffe6a0);
    }
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
