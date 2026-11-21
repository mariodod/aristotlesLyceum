/**
 * The two accent sets. The default uses the gold/purple pair the game was
 * drawn with; the colour-blind set swaps the purple for a blue that is
 * distinguishable from the gold at every brightness, and the red tint used
 * for errors for an orange. Only interface accents change, never the
 * character art.
 */
export interface Accents {
  gold: number;
  highlight: number;
  error: number;
  success: number;
}

export const DEFAULT_ACCENTS: Accents = {
  gold: 0xf2c14e,
  highlight: 0xb0a8e0,
  error: 0xe89a8a,
  success: 0x9fe0b0,
};

import type Phaser from 'phaser';
import type { SettingsService } from '../services/settings-service.ts';

export const COLOR_BLIND_ACCENTS: Accents = {
  gold: 0xffd24a,
  highlight: 0x6cb8ff,
  error: 0xffa14a,
  success: 0x7ad4c8,
};

export function accentsFor(colorBlindSafe: boolean): Accents {
  return colorBlindSafe ? COLOR_BLIND_ACCENTS : DEFAULT_ACCENTS;
}

/**
 * The accent a scene should use now, read from the settings service.
 *
 * Keeping the lookup here means a scene never hardcodes a highlight colour
 * and the colour-blind option covers every screen, not just the title.
 */
export function uiAccent(scene: Phaser.Scene, key: keyof Accents): number {
  const settings = scene.registry.get('settingsService') as SettingsService | undefined;

  return accentsFor(settings?.snapshot.colorBlindSafe ?? false)[key];
}
