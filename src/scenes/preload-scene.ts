import Phaser from 'phaser';
import { ASSET_MANIFEST, assetUrl } from '../data/assets.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * Loads every asset listed in the generated manifest. Nothing in this file
 * names a specific texture, so adding art never means editing a scene.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    for (const image of ASSET_MANIFEST.images) {
      this.load.image(image.key, assetUrl(image.url));
    }

    for (const asset of ASSET_MANIFEST.spritesheets) {
      this.load.spritesheet(asset.key, assetUrl(asset.url), {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
      });
    }
  }

  create(): void {
    for (const asset of ASSET_MANIFEST.spritesheets) {
      for (const animation of asset.animations) {
        if (this.anims.exists(animation.key)) {
          continue;
        }

        this.anims.create({
          key: animation.key,
          frames: animation.frames.map((frame) => ({ key: asset.key, frame })),
          frameRate: animation.frameRate,
          repeat: animation.repeat,
        });
      }
    }

    setTestHook({ ready: true, scene: 'Preload' });

    this.scene.start('Title');
  }
}
