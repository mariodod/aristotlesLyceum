/**
 * Feel constants for the parts of the game that are not rules.
 *
 * Every number here exists because a default would feel wrong, so the reason
 * is written next to it rather than left to be rediscovered.
 */
export const DIALOGUE_TUNING = {
  /**
   * Characters per second for the typewriter effect. Forty-five reads as
   * deliberate without making the player wait for long paragraphs.
   */
  charactersPerSecond: 45,
  /** Rate used while the confirm key is held down. */
  fastCharactersPerSecond: 140,
  /** Milliseconds the "continue" marker takes to fade in and out. */
  indicatorBlinkMs: 520,
  /** Padding between the name plate and the text body, in pixels. */
  namePlateGap: 8,
} as const;

export const STAGE_TUNING = {
  /** Vertical anchor of a character standing on the stage. */
  groundY: 238,
  /** Horizontal positions the two lead characters occupy. */
  leftX: 150,
  rightX: 490,
  /** Seconds a scene takes to cross-fade. */
  fadeMs: 320,
} as const;

export const TITLE_TUNING = {
  /** Seconds the title bob takes to complete one cycle. */
  bobMs: 2200,
} as const;
