import type Phaser from 'phaser';
import { assetUrl, AUDIO_MANIFEST } from '../data/assets.ts';
import type { SettingsService } from './settings-service.ts';

export interface AudioAsset {
  key: string;
  url: string;
  category: 'music' | 'sfx';
  seconds: number;
  volume: number;
}

export const AUDIO_ASSETS = AUDIO_MANIFEST.assets as AudioAsset[];

/**
 * The game's sound, kept apart from the scenes so a missing WebAudio
 * context or a refused autoplay policy degrades to silence instead of a
 * crash. The settings service owns the volumes; this service reads them
 * when a sound starts or when the player changes a setting.
 */
export class AudioService {
  private readonly scene: Phaser.Scene;
  private readonly settings: SettingsService;
  /** The one looping music sound, if any. */
  private music: Phaser.Sound.BaseSound | undefined;
  private currentTrack = '';
  private desiredTrack = '';
  private started = false;

  constructor(scene: Phaser.Scene, settings: SettingsService) {
    this.scene = scene;
    this.settings = settings;
  }

  /**
   * Loads audio after the game has started, in the background.
   *
   * Browsers without Web Audio use HTML5 <audio> elements, whose loader can
   * block the start of the game for a long time. Art has to be ready before
   * the first frame; sound does not, because every play call checks the
   * cache and silently skips a file that has not arrived yet.
   */
  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.scene.sound.setVolume(this.settings.volumes().master);

    let queued = false;

    for (const asset of AUDIO_ASSETS) {
      if (!this.scene.cache.audio.exists(asset.key)) {
        this.scene.load.audio(asset.key, assetUrl(asset.url));
        queued = true;
      }
    }

    if (queued) {
      this.scene.load.start();
    }
  }

  /** Re-reads the settings and updates the music that is playing now. */
  applyVolumes(): void {
    this.scene.sound.setVolume(this.settings.volumes().master);
    this.applyMusicVolume();
  }

  private applyMusicVolume(): void {
    if (!this.music || !this.currentTrack) {
      return;
    }

    const asset = AUDIO_ASSETS.find((item) => item.key === this.currentTrack);
    const sound = this.music as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;

    if (asset) {
      sound.setVolume(this.settings.volumes().music * asset.volume);
    }
  }

  /** Starts a mood, cross-fading from whatever was playing. */
  playMusic(key: string): void {
    if (this.desiredTrack === key) {
      return;
    }

    this.desiredTrack = key;
    const asset = AUDIO_ASSETS.find((item) => item.key === key && item.category === 'music');

    if (!asset || !this.scene.cache.audio.exists(key)) {
      return;
    }

    const previous = this.music;
    const sound = this.scene.sound.add(key, { loop: true, volume: 0 });
    sound.play();
    this.music = sound;
    this.currentTrack = key;
    this.applyMusicVolume();

    if (previous) {
      const old = previous as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
      this.scene.tweens.add({
        targets: old,
        volume: 0,
        duration: this.settings.snapshot.reducedMotion ? 0 : 600,
        onComplete: () => old.stop(),
      });
    }
  }

  /** Plays a one-shot effect. Unknown keys are ignored. */
  play(key: string): void {
    const asset = AUDIO_ASSETS.find((item) => item.key === key && item.category === 'sfx');

    if (!asset || !this.scene.cache.audio.exists(key)) {
      return;
    }

    const sound = this.scene.sound.add(key);
    sound.setVolume(this.settings.volumes().sfx * asset.volume);
    sound.play();
  }
}
