import Phaser from 'phaser';
import { FONT_KEY, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * Credits placeholder. Filled in when the art and audio are final.
 */
export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('Credits');
  }

  create(): void {
    setTestHook({ ready: true, scene: 'Credits' });

    this.add.image(0, 0, 'backdrop-lyceum').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07070c, 0.8).setOrigin(0).setDepth(1);

    this.add.bitmapText(24, 20, FONT_KEY, 'CREDITS').setDepth(2).setTint(0xf2c14e);

    const lines = [
      'Written and built by Mario Dodado.',
      '',
      'All art and audio in this game are generated from code',
      'that lives in this repository.',
      '',
      'Aristotle is in the public domain. The people are not.',
    ];

    lines.forEach((line, index) => {
      this.add
        .bitmapText(24, 56 + index * 16, FONT_KEY, line)
        .setDepth(2)
        .setAlpha(index === 0 ? 0.9 : 0.7);
    });

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
