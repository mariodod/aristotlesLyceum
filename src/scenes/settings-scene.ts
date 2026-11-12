import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import type { LocaleService } from '../services/locale-service.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * The settings screen.
 *
 * The language is the first thing here, because it is the one setting that
 * changes how everything else reads.
 */
export class SettingsScene extends Phaser.Scene {
  private locale: LocaleService | undefined;
  private languageIndex = 0;
  private available: { id: string; name: string }[] = [];

  constructor() {
    super('Settings');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Settings' });

    this.locale = this.registry.get('localeService') as LocaleService;
    this.available = this.locale?.available ?? [];
    this.languageIndex = this.currentIndex();

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.8).setOrigin(0).setDepth(1);

    this.add
      .bitmapText(24, 20, FONT_KEY, this.t('ui.settings.title'))
      .setDepth(2)
      .setTint(0xf2c14e);

    this.add.bitmapText(24, 56, FONT_KEY, this.t('ui.settings.note')).setDepth(2).setAlpha(0.75);

    this.add
      .bitmapText(24, 110, FONT_KEY, this.t('ui.settings.language'))
      .setDepth(2)
      .setTint(0xf6f2e8);

    this.add
      .bitmapText(GAME_WIDTH - 24, 110, FONT_KEY, this.currentLanguageName())
      .setOrigin(1, 0)
      .setDepth(2)
      .setTint(0xffe6a0);

    this.add
      .bitmapText(24, 130, FONT_KEY, this.t('ui.settings.languageHint'))
      .setDepth(2)
      .setAlpha(0.6);

    this.add
      .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, this.t('ui.settings.back'))
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0.6);

    this.installInput();
  }

  private t(key: string): string {
    return this.locale?.t(key) ?? key;
  }

  private currentLanguageName(): string {
    const current = this.available.find((locale) => locale.id === this.locale?.id);
    return current?.name ?? this.locale?.id ?? '';
  }

  /**
   * The index of the language that is current, so that the first press of the
   * arrow key moves away from where the player already is.
   */
  private currentIndex(): number {
    const index = this.available.findIndex((locale) => locale.id === this.locale?.id);
    return index < 0 ? 0 : index;
  }

  /**
   * Moves to the next language and applies it.
   *
   * The change is immediate: the player does not have to restart to see what
   * their choice looks like.
   */
  private moveLanguage(delta: number): void {
    if (this.available.length === 0 || !this.locale) {
      return;
    }

    this.languageIndex =
      (this.languageIndex + delta + this.available.length) % this.available.length;

    const next = this.available[this.languageIndex];

    if (!next) {
      return;
    }

    this.locale.setLocale(next.id);

    // The screen is drawn in the language that was current when it was
    // built, so it is rebuilt to show the choice the player just made.
    this.scene.restart();
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-UP', () => this.moveLanguage(-1));
    keyboard.on('keydown-DOWN', () => this.moveLanguage(1));
    keyboard.on('keydown-LEFT', () => this.moveLanguage(-1));
    keyboard.on('keydown-RIGHT', () => this.moveLanguage(1));

    const back = () => this.scene.start('Title');

    keyboard.on('keydown-Z', back);
    keyboard.on('keydown-ENTER', back);
    keyboard.on('keydown-ESC', back);
  }
}
