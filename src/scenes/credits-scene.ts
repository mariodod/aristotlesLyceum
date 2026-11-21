import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { centredText } from '../entities/centred-text.ts';
import { uiAccent } from '../config/theme.ts';
import type { LocaleService } from '../services/locale-service.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * The credits. Six pages rather than a scrolling wall, so every line lands
 * above the dialogue area and the reader can turn a page at their own pace.
 */
interface CreditsPage {
  titleKey: string;
  lineKeys: string[];
}

const PAGES: CreditsPage[] = [
  {
    titleKey: 'ui.credits.p1.title',
    lineKeys: ['ui.credits.p1.l1', 'ui.credits.p1.l2', 'ui.credits.p1.l3'],
  },
  {
    titleKey: 'ui.credits.p2.title',
    lineKeys: ['ui.credits.p2.l1', 'ui.credits.p2.l2', 'ui.credits.p2.l3'],
  },
  {
    titleKey: 'ui.credits.p3.title',
    lineKeys: ['ui.credits.p3.l1', 'ui.credits.p3.l2', 'ui.credits.p3.l3'],
  },
  {
    titleKey: 'ui.credits.p4.title',
    lineKeys: ['ui.credits.p4.l1', 'ui.credits.p4.l2', 'ui.credits.p4.l3'],
  },
  {
    titleKey: 'ui.credits.p5.title',
    lineKeys: ['ui.credits.p5.l1', 'ui.credits.p5.l2', 'ui.credits.p5.l3'],
  },
  {
    titleKey: 'ui.credits.p6.title',
    lineKeys: ['ui.credits.p6.l1', 'ui.credits.p6.l2', 'ui.credits.p6.l3'],
  },
];

const BODY_TOP = 66;
const LINE_GAP = 18;

export class CreditsScene extends Phaser.Scene {
  private locale: LocaleService | undefined;
  private index = 0;
  private body: Phaser.GameObjects.BitmapText[] = [];
  private heading: Phaser.GameObjects.BitmapText | undefined;
  private counter: Phaser.GameObjects.BitmapText | undefined;

  constructor() {
    super('Credits');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Credits' });

    this.locale = this.registry.get('localeService') as LocaleService;
    this.index = 0;
    this.body = [];

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.88).setOrigin(0).setDepth(1);

    this.add
      .bitmapText(24, 20, FONT_KEY, this.t('ui.credits.title'))
      .setDepth(2)
      .setTint(uiAccent(this, 'gold'));

    this.heading = this.add.bitmapText(24, 42, FONT_KEY, '').setDepth(2).setTint(0xffe6a0);

    for (let index = 0; index < 3; index += 1) {
      this.body.push(
        this.add
          .bitmapText(24, BODY_TOP + index * LINE_GAP, FONT_KEY, '')
          .setDepth(2)
          .setAlpha(0.85),
      );
    }

    this.counter = this.add
      .bitmapText(GAME_WIDTH - 24, 20, FONT_KEY, '')
      .setOrigin(1, 0)
      .setDepth(2)
      .setAlpha(0.6);

    const hint = centredText(this, GAME_HEIGHT - 20, this.t('ui.credits.hint'));
    hint.setDepth(2);
    hint.setAlpha(0.6);

    this.showPage();
    this.installInput();
  }

  private t(key: string): string {
    return this.locale?.t(key) ?? key;
  }

  private showPage(): void {
    const page = PAGES[this.index];

    if (!page) {
      return;
    }

    this.heading?.setText(this.t(page.titleKey));

    for (const [index, key] of page.lineKeys.entries()) {
      this.body[index]?.setText(this.t(key));
    }

    this.counter?.setText(`${this.index + 1} / ${PAGES.length}`);
    this.publish();
  }

  private turn(delta: number): void {
    this.index = (this.index + delta + PAGES.length) % PAGES.length;
    this.showPage();
  }

  private publish(): void {
    setTestHook({ creditsPage: this.index, creditsPageCount: PAGES.length });
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-LEFT', () => this.turn(-1));
    keyboard.on('keydown-RIGHT', () => this.turn(1));

    const back = () => this.scene.start('Title');
    keyboard.on('keydown-Z', back);
    keyboard.on('keydown-ENTER', back);
    keyboard.on('keydown-ESC', back);
  }
}
