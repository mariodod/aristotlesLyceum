import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * Settings placeholder. The real options (text speed, volume, font size)
 * land with the audio milestone.
 */
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Settings' });

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.8).setOrigin(0).setDepth(1);

    this.add.bitmapText(24, 20, FONT_KEY, 'SETTINGS').setDepth(2).setTint(0xf2c14e);

    this.add
      .bitmapText(24, 56, FONT_KEY, 'Text speed, volume and accessibility options arrive in M8.')
      .setDepth(2)
      .setAlpha(0.75);

    this.add
      .bitmapText(GAME_WIDTH / 2, GAME_HEIGHT - 20, FONT_KEY, 'Z / ENTER to go back')
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0.6);

    const back = () => this.scene.start('Title');
    this.input.keyboard?.on('keydown-Z', back);
    this.input.keyboard?.on('keydown-ENTER', back);
    this.input.keyboard?.on('keydown-ESC', back);
  }
}
