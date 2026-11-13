import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { CHARACTERS } from '../data/characters.ts';
import { CODEX_ENTRIES } from '../data/codex/index.ts';
import type { CodexEntry } from '../data/codex/index.ts';
import type { LocaleService } from '../services/locale-service.ts';
import type { SaveService } from '../services/save-service.ts';
import { wrapText } from '../systems/dialogue/text-wrap.ts';
import { setTestHook } from '../utils/test-hooks.ts';

const PORTRAIT_SIZE = 52;
const TEXT_X = 196;
const TEXT_COLUMNS = 58;

/* The list of entries. */
const LIST_TOP = 44;
const LIST_ROW_HEIGHT = 12;
const LIST_TEXT_X = 40;
/**
 * How many entries fit above the counter.
 *
 * The journal grows as the game does, so the list scrolls once there are
 * more entries than this.
 */
const MAX_VISIBLE_ROWS = 20;

/**
 * The Dream Journal. Every entry Aristotle unlocks is filed here with the
 * idea he gave and the place it still shows up in today's science.
 *
 * The journal opens on the list of what has been filed, because a journal
 * you can only read one page of is not a journal. Choosing an entry opens it;
 * the arrows turn the page from there.
 */
export class CodexScene extends Phaser.Scene {
  private index = 0;
  private view: 'list' | 'detail' = 'list';
  private locale: LocaleService | undefined;
  private unlocked: CodexEntry[] = [];
  private root: Phaser.GameObjects.Container | undefined;
  private firstVisible = 0;

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

    // Everything the journal draws lives in this container, so switching
    // between the list and an entry is a matter of emptying it.
    this.root = this.add.container(0, 0).setDepth(2);

    if (this.unlocked.length === 0) {
      this.root.add(this.add.bitmapText(24, 64, FONT_KEY, this.t('ui.codex.empty')).setAlpha(0.7));
      this.root.add(
        this.add
          .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, this.t('ui.codex.hintEmpty'))
          .setOrigin(0.5, 0)
          .setAlpha(0.6),
      );
    } else {
      this.showList();
    }

    this.installInput();
    this.publish();
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

  private showList(): void {
    this.view = 'list';
    this.clearRoot();
    this.ensureVisible(this.index);

    const last = Math.min(this.unlocked.length, this.firstVisible + MAX_VISIBLE_ROWS);

    for (let position = this.firstVisible; position < last; position += 1) {
      const entry = this.unlocked[position];

      if (!entry) {
        continue;
      }

      const y = LIST_TOP + (position - this.firstVisible) * LIST_ROW_HEIGHT;
      const label = this.add.bitmapText(
        LIST_TEXT_X,
        y,
        FONT_KEY,
        this.tc(entry.titleKey, entry.title),
      );

      label.setTint(position === this.index ? 0xffe6a0 : 0xbfb6a2);
      this.root?.add(label);
    }

    const selected = this.unlocked[this.index];

    if (selected) {
      const y = LIST_TOP + (this.index - this.firstVisible) * LIST_ROW_HEIGHT;

      this.root?.add(this.add.image(LIST_TEXT_X - 12, y + 4, 'ui-heart'));
    }

    this.root?.add(
      this.add
        .bitmapText(
          24,
          300,
          FONT_KEY,
          this.t('ui.codex.entry', { n: this.index + 1, m: this.unlocked.length }),
        )
        .setAlpha(0.5),
    );
    this.root?.add(
      this.add
        .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, this.t('ui.codex.hintList'))
        .setOrigin(0.5, 0)
        .setAlpha(0.6),
    );

    this.publish();
  }

  private showDetail(): void {
    this.view = 'detail';
    this.clearRoot();

    const entry = this.unlocked[this.index];

    if (!entry) {
      this.showList();
      return;
    }

    this.renderPortrait(entry.author);

    const header = this.add
      .bitmapText(TEXT_X, 44, FONT_KEY, this.tc(entry.titleKey, entry.title))
      .setDepth(2);
    header.setTint(0xffe6a0);
    this.root?.add(header);

    this.root?.add(
      this.add.bitmapText(TEXT_X, 62, FONT_KEY, this.t('ui.codex.whatHeSaid')).setAlpha(0.6),
    );
    this.root?.add(
      this.add
        .bitmapText(
          TEXT_X,
          78,
          FONT_KEY,
          wrapText(this.tc(entry.originKey, entry.origin), TEXT_COLUMNS),
        )
        .setTint(0xe8e2d0),
    );

    this.root?.add(
      this.add.bitmapText(TEXT_X, 176, FONT_KEY, this.t('ui.codex.whereItRuns')).setAlpha(0.6),
    );
    this.root?.add(
      this.add
        .bitmapText(
          TEXT_X,
          192,
          FONT_KEY,
          wrapText(this.tc(entry.modernKey, entry.modern), TEXT_COLUMNS),
        )
        .setTint(0xbfb6a2),
    );

    this.root?.add(
      this.add.bitmapText(TEXT_X, 262, FONT_KEY, this.t('ui.codex.whereHeWroteIt')).setAlpha(0.6),
    );
    this.root?.add(
      this.add
        .bitmapText(
          TEXT_X,
          278,
          FONT_KEY,
          wrapText(this.tc(entry.sourcesKey, entry.sources.join('; ')), TEXT_COLUMNS),
        )
        .setTint(0x9a94a8),
    );

    this.root?.add(
      this.add
        .bitmapText(
          24,
          300,
          FONT_KEY,
          this.t('ui.codex.entry', { n: this.index + 1, m: this.unlocked.length }),
        )
        .setAlpha(0.5),
    );
    this.root?.add(
      this.add
        .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, this.t('ui.codex.hintDetail'))
        .setOrigin(0.5, 0)
        .setAlpha(0.6),
    );

    this.publish();
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

    this.root?.add(
      this.add.image(24, 60, key).setOrigin(0, 0).setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE),
    );

    // A frame, so the portrait reads as a portrait and not as a stray image.
    const frame = this.add.graphics();
    frame.lineStyle(2, 0xf2c14e, 0.7);
    frame.strokeRect(24, 60, PORTRAIT_SIZE, PORTRAIT_SIZE);
    this.root?.add(frame);

    const name = this.tc(`ui.character.${authorId}`, definition.name);

    if (name.length > 0) {
      this.root?.add(
        this.add
          .bitmapText(24, 60 + PORTRAIT_SIZE + 8, FONT_KEY, name.toUpperCase())
          .setTint(0xffe6a0),
      );
    }
  }

  private clearRoot(): void {
    this.root?.removeAll(true);
  }

  /**
   * Keeps the selected entry inside the visible window.
   *
   * The journal grows as the game does, so the list cannot assume that
   * everything fits on one screen.
   */
  private ensureVisible(index: number): void {
    if (index < this.firstVisible) {
      this.firstVisible = index;
    }

    if (index >= this.firstVisible + MAX_VISIBLE_ROWS) {
      this.firstVisible = index - MAX_VISIBLE_ROWS + 1;
    }

    const last = Math.max(0, this.unlocked.length - MAX_VISIBLE_ROWS);

    this.firstVisible = Math.max(0, Math.min(this.firstVisible, last));
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-UP', () => this.move(-1));
    keyboard.on('keydown-DOWN', () => this.move(1));
    keyboard.on('keydown-LEFT', () => this.turn(-1));
    keyboard.on('keydown-RIGHT', () => this.turn(1));
    keyboard.on('keydown-Z', () => this.confirm());
    keyboard.on('keydown-ENTER', () => this.confirm());
    keyboard.on('keydown-SPACE', () => this.confirm());
    keyboard.on('keydown-ESC', () => this.leave());
  }

  /** Moves the selection in the list. */
  private move(delta: number): void {
    if (this.view !== 'list' || this.unlocked.length === 0) {
      return;
    }

    const count = this.unlocked.length;

    this.index = (this.index + delta + count) % count;
    this.showList();
  }

  /** Turns the page in the detail view. */
  private turn(delta: number): void {
    if (this.view !== 'detail' || this.unlocked.length === 0) {
      return;
    }

    const count = this.unlocked.length;

    this.index = (this.index + delta + count) % count;
    this.showDetail();
  }

  private confirm(): void {
    if (this.unlocked.length === 0) {
      this.scene.start('Title');
      return;
    }

    if (this.view === 'list') {
      this.showDetail();
      return;
    }

    this.showList();
  }

  private leave(): void {
    if (this.view === 'detail') {
      this.showList();
      return;
    }

    this.scene.start('Title');
  }

  private publish(): void {
    const entry = this.unlocked[this.index];

    setTestHook({
      codexView: this.view,
      codexEntry: entry?.id ?? '',
      codexEntryCount: this.unlocked.length,
    });
  }
}
