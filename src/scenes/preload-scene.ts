import Phaser from 'phaser';
import { ASSET_MANIFEST, assetUrl } from '../data/assets.ts';
import { AudioService } from '../services/audio-service.ts';
import type { SettingsService } from '../services/settings-service.ts';
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

    const settings = this.registry.get('settingsService') as SettingsService;
    const audioService = new AudioService(this, settings);
    this.registry.set('audioService', audioService);
    audioService.preload();
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

    const audioService = this.registry.get('audioService') as AudioService;
    audioService.start();

    setTestHook({ ready: true, scene: 'Preload' });

    this.scene.start('Title');
  }
}
