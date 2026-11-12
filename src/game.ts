import Phaser from 'phaser';
import { APP_VERSION, GAME_HEIGHT, GAME_TITLE, GAME_WIDTH } from './config/constants.ts';
import { BootScene } from './scenes/boot-scene.ts';
import { CodexScene } from './scenes/codex-scene.ts';
import { CreditsScene } from './scenes/credits-scene.ts';
import { DialecticScene } from './scenes/dialectic-scene.ts';
import { PreloadScene } from './scenes/preload-scene.ts';
import { SettingsScene } from './scenes/settings-scene.ts';
import { StoryScene } from './scenes/story-scene.ts';
import { TitleScene } from './scenes/title-scene.ts';

export function createGame(): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#07070c',
    title: GAME_TITLE,
    version: APP_VERSION,
    pixelArt: true,
    roundPixels: true,
    fullscreenTarget: 'game',
    scale: {
      // The canvas is sized by hand to whole device-pixel multiples so text
      // and tiles never land on fractional screen pixels.
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      zoom: displayZoom(),
    },
    scene: [
      BootScene,
      PreloadScene,
      TitleScene,
      StoryScene,
      DialecticScene,
      CodexScene,
      SettingsScene,
      CreditsScene,
    ],
  };

  const game = new Phaser.Game(config);

  window.addEventListener('resize', () => {
    game.scale.setZoom(displayZoom());
  });

  return game;
}

/**
 * Largest zoom that maps one 640x360 game pixel onto a whole number of
 * physical screen pixels. Fractional multiples are what make bitmap fonts
 * look soft.
 */
function displayZoom(): number {
  const dpr = window.devicePixelRatio || 1;
  const deviceScale = Math.min(
    (window.innerWidth * dpr) / GAME_WIDTH,
    (window.innerHeight * dpr) / GAME_HEIGHT,
  );

  if (deviceScale < 1) {
    return Math.max(deviceScale, 0.1);
  }

  return Math.floor(deviceScale) / dpr;
}
