import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { centredText } from '../entities/centred-text.ts';
import type { AudioService } from '../services/audio-service.ts';
import type { LocaleService } from '../services/locale-service.ts';
import type { SettingsService } from '../services/settings-service.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * The settings screen. One column of rows, each with its value on the
 * right. Up and down choose a row; left and right change it. The language
 * applies at once, and every other setting goes through the settings
 * service, which persists it.
 */
interface Row {
  labelKey: string;
  value: () => string;
  change: (delta: number) => void;
}

const ROW_TOP = 62;
const ROW_GAP = 20;
const VALUE_X = GAME_WIDTH - 24;

export class SettingsScene extends Phaser.Scene {
  private locale: LocaleService | undefined;
  private settings: SettingsService | undefined;
  private audio: AudioService | undefined;
  private rows: Row[] = [];
  private selected = 0;
  private labels: Phaser.GameObjects.BitmapText[] = [];
  private values: Phaser.GameObjects.BitmapText[] = [];

  constructor() {
    super('Settings');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Settings' });

    this.locale = this.registry.get('localeService') as LocaleService;
    this.settings = this.registry.get('settingsService') as SettingsService;
    this.audio = this.registry.get('audioService') as AudioService | undefined;

    this.labels = [];
    this.values = [];
    this.selected = 0;
    this.rows = this.buildRows();

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.86).setOrigin(0).setDepth(1);

    this.add
      .bitmapText(24, 18, FONT_KEY, this.t('ui.settings.title'))
      .setDepth(2)
      .setTint(0xf2c14e);

    for (const [index, row] of this.rows.entries()) {
      const y = ROW_TOP + index * ROW_GAP;
      const label = this.add.bitmapText(24, y, FONT_KEY, this.t(row.labelKey)).setDepth(2);
      const value = this.add
        .bitmapText(VALUE_X, y, FONT_KEY, row.value())
        .setOrigin(1, 0)
        .setDepth(2);
      this.labels.push(label);
      this.values.push(value);
    }

    const hint = centredText(this, GAME_HEIGHT - 20, this.t('ui.settings.hint'));
    hint.setDepth(2);
    hint.setAlpha(0.6);

    this.refresh();
    this.installInput();
    this.publish();
  }

  private buildRows(): Row[] {
    const settings = this.settings;
    const locale = this.locale;
    const onOff = (value: boolean) => this.t(value ? 'ui.settings.on' : 'ui.settings.off');
    const percent = (value: number) => `${Math.round(value * 100)}%`;

    const rows: Row[] = [
      {
        labelKey: 'ui.settings.language',
        value: () => locale?.available.find((l) => l.id === locale.id)?.name ?? locale?.id ?? '',
        change: (delta) => {
          if (!locale || locale.available.length === 0) {
            return;
          }

          const index = locale.available.findIndex((l) => l.id === locale.id);
          const next =
            locale.available[(index + delta + locale.available.length) % locale.available.length];

          if (next) {
            locale.setLocale(next.id);
          }
        },
      },
    ];

    if (!settings) {
      return rows;
    }

    const update = (patch: Parameters<SettingsService['set']>[0]) => {
      settings.set(patch);
      this.audio?.applyVolumes();
    };

    rows.push(
      {
        labelKey: 'ui.settings.textSpeed',
        value: () => {
          const speed = settings.snapshot.textSpeed;
          return this.t(
            speed === 0
              ? 'ui.settings.instant'
              : speed === 2
                ? 'ui.settings.fast'
                : 'ui.settings.normal',
          );
        },
        change: () => {
          settings.cycleTextSpeed();
        },
      },
      {
        labelKey: 'ui.settings.masterVolume',
        value: () => percent(settings.snapshot.masterVolume),
        change: (delta) => update({ masterVolume: settings.snapshot.masterVolume + delta * 0.1 }),
      },
      {
        labelKey: 'ui.settings.musicVolume',
        value: () => percent(settings.snapshot.musicVolume),
        change: (delta) => update({ musicVolume: settings.snapshot.musicVolume + delta * 0.1 }),
      },
      {
        labelKey: 'ui.settings.sfxVolume',
        value: () => percent(settings.snapshot.sfxVolume),
        change: (delta) => update({ sfxVolume: settings.snapshot.sfxVolume + delta * 0.1 }),
      },
      {
        labelKey: 'ui.settings.screenShake',
        value: () => onOff(settings.snapshot.screenShake),
        change: () => update({ screenShake: !settings.snapshot.screenShake }),
      },
      {
        labelKey: 'ui.settings.reducedMotion',
        value: () => onOff(settings.snapshot.reducedMotion),
        change: () => update({ reducedMotion: !settings.snapshot.reducedMotion }),
      },
      {
        labelKey: 'ui.settings.holdToSkip',
        value: () => onOff(settings.snapshot.holdToSkip),
        change: () => update({ holdToSkip: !settings.snapshot.holdToSkip }),
      },
      {
        labelKey: 'ui.settings.colorBlind',
        value: () => onOff(settings.snapshot.colorBlindSafe),
        change: () => update({ colorBlindSafe: !settings.snapshot.colorBlindSafe }),
      },
      {
        labelKey: 'ui.settings.mute',
        value: () => onOff(settings.snapshot.muted),
        change: () => update({ muted: !settings.snapshot.muted }),
      },
    );

    return rows;
  }

  private t(key: string): string {
    return this.locale?.t(key) ?? key;
  }

  private refresh(): void {
    for (const [index, row] of this.rows.entries()) {
      const label = this.labels[index];
      const value = this.values[index];

      if (label) {
        label.setText(this.t(row.labelKey));
        label.setTint(index === this.selected ? 0xffe6a0 : 0xbfb6a2);
      }

      if (value) {
        value.setText(row.value());
        value.setTint(index === this.selected ? 0xffe6a0 : 0xe8e2d0);
      }
    }
  }

  private move(delta: number): void {
    this.selected = (this.selected + delta + this.rows.length) % this.rows.length;
    this.refresh();
    this.publish();
  }

  private change(delta: number): void {
    this.rows[this.selected]?.change(delta);
    this.refresh();
    this.publish();

    // A language change redraws every row with the new catalogue.
    if (this.selected === 0) {
      this.scene.restart();
    }
  }

  private publish(): void {
    setTestHook({
      settingsRow: this.selected,
      settingsRowCount: this.rows.length,
      settingsValues: this.values.map((value) => value.text),
    });
  }

  private installInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-UP', () => this.move(-1));
    keyboard.on('keydown-DOWN', () => this.move(1));
    keyboard.on('keydown-LEFT', () => this.change(-1));
    keyboard.on('keydown-RIGHT', () => this.change(1));

    const back = () => this.scene.start('Title');
    keyboard.on('keydown-Z', back);
    keyboard.on('keydown-ENTER', back);
    keyboard.on('keydown-ESC', back);
  }
}
