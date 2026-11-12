import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { CHARACTERS } from '../data/characters.ts';
import { CODEX_ENTRIES } from '../data/codex/index.ts';
import type { LocaleService } from '../services/locale-service.ts';
import type { SaveService } from '../services/save-service.ts';
import { wrapText } from '../systems/dialogue/text-wrap.ts';
import { setTestHook } from '../utils/test-hooks.ts';

const PORTRAIT_SIZE = 52;
const TEXT_X = 196;
const TEXT_COLUMNS = 58;

interface JournalEntry {
  id: string;
  title: string;
  origin: string;
  modern: string;
  sources: string[];
  titleKey?: string | undefined;
  originKey?: string | undefined;
  modernKey?: string | undefined;
  sourcesKey?: string | undefined;
  author?: string | undefined;
}

/**
 * The Dream Journal. Every entry Aristotle unlocks is filed here with the
 * idea he gave and the place it still shows up in today's science.
 */
export class CodexScene extends Phaser.Scene {
  private index = 0;
  private locale: LocaleService | undefined;
  private unlocked: JournalEntry[] = [];

  constructor() {
    super('Codex');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Codex' });

    this.locale = this.registry.get('localeService') as LocaleService;

    const saveService = this.registry.get('saveService') as SaveService;

    this.unlocked = CODEX_ENTRIES.filter((entry) => saveService.isCodexUnlocked(entry.id));

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.86).setOrigin(0).setDepth(1);

    this.add.bitmapText(24, 18, FONT_KEY, this.t('ui.codex.title')).setDepth(2).setTint(0xf2c14e);

    if (this.unlocked.length === 0) {
      this.add.bitmapText(24, 64, FONT_KEY, this.t('ui.codex.empty')).setDepth(2).setAlpha(0.7);
    } else {
      this.renderEntry();
    }

    this.add
      .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, this.t('ui.codex.back'))
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0.6);

    this.installInput();
  }

  /** Translates a key from the interface catalogue. */
  private t(key: string, params?: Record<string, string | number>): string {
    return this.locale?.t(key, params) ?? key;
  }

  /** Translates a key from the story catalogue. */
  private tc(
    key: string | undefined,
    fallback: string,
    params?: Record<string, string | number>,
  ): string {
    return this.locale?.tc(key, fallback, params) ?? fallback;
  }

  private renderEntry(): void {
    const entry = this.unlocked[this.index % this.unlocked.length];

    if (!entry) {
      return;
    }

    this.renderPortrait(entry.author);

    const header = this.add
      .bitmapText(TEXT_X, 44, FONT_KEY, this.tc(entry.titleKey, entry.title))
      .setDepth(2);
    header.setTint(0xffe6a0);

    this.add
      .bitmapText(TEXT_X, 62, FONT_KEY, this.t('ui.codex.whatHeSaid'))
      .setDepth(2)
      .setAlpha(0.6);
    this.add
      .bitmapText(
        TEXT_X,
        78,
        FONT_KEY,
        wrapText(this.tc(entry.originKey, entry.origin), TEXT_COLUMNS),
      )
      .setDepth(2)
      .setTint(0xe8e2d0);

    this.add
      .bitmapText(TEXT_X, 176, FONT_KEY, this.t('ui.codex.whereItRuns'))
      .setDepth(2)
      .setAlpha(0.6);
    this.add
      .bitmapText(
        TEXT_X,
        192,
        FONT_KEY,
        wrapText(this.tc(entry.modernKey, entry.modern), TEXT_COLUMNS),
      )
      .setDepth(2)
      .setTint(0xbfb6a2);

    this.add
      .bitmapText(TEXT_X, 262, FONT_KEY, this.t('ui.codex.whereHeWroteIt'))
      .setDepth(2)
      .setAlpha(0.6);
    this.add
      .bitmapText(
        TEXT_X,
        278,
        FONT_KEY,
        wrapText(this.tc(entry.sourcesKey, entry.sources.join('; ')), TEXT_COLUMNS),
      )
      .setDepth(2)
      .setTint(0x9a94a8);

    this.add
      .bitmapText(
        24,
        300,
        FONT_KEY,
        this.t('ui.codex.entry', { n: this.index + 1, m: this.unlocked.length }),
      )
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

    const name = this.tc(`ui.character.${authorId}`, definition.name);

    if (name.length > 0) {
      this.add
        .bitmapText(24, 60 + PORTRAIT_SIZE + 8, FONT_KEY, name.toUpperCase())
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
