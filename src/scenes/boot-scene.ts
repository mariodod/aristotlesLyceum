import Phaser from 'phaser';
import { ASSET_MANIFEST, assetUrl } from '../data/assets.ts';
import { SaveService } from '../services/save-service.ts';
import { setTestHook } from '../utils/test-hooks.ts';

/**
 * Services come up before the art pack loads, and the bitmap font is loaded
 * here so the loading screen can already be drawn with the real font.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    for (const font of ASSET_MANIFEST.bitmapFonts) {
      this.load.bitmapFont(font.key, assetUrl(font.textureUrl), assetUrl(font.dataUrl));
    }
  }

  create(): void {
    setTestHook({ ready: false, scene: 'Boot' });

    this.registry.set('saveService', new SaveService());

    this.scene.start('Preload');
  }
}
