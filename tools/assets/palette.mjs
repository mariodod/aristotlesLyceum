/**
 * Shared palette for the generated art pack.
 *
 * The game has two moods and one outline colour. Ancient Greece is warm stone
 * and olive; Isaac's bedroom is cold night blue and lamplight. Every sprite
 * uses the same near-black outline so characters read as one drawing system.
 */

export const COMMON = {
  ink: 0x14121a,
  inkSoft: 0x241f2b,
  white: 0xf6f2e8,
  cream: 0xe8e2d0,
  bone: 0xd8d0bc,
  shadow: 0x0d0b12,
};

export const SKIN = {
  base: 0xe8b48c,
  shade: 0xc98f6a,
  deep: 0xa26c4c,
};

export const ISAAC_PALETTE = {
  hair: 0x4a3b33,
  hairLight: 0x6b564a,
  skin: SKIN.base,
  skinShade: SKIN.shade,
  hoodie: 0x3f6f9e,
  hoodieLight: 0x5b93c4,
  hoodieDark: 0x2a4a6c,
  pants: 0x2b2f3a,
  pantsLight: 0x3d4350,
  shoes: 0x191b22,
  eye: 0x14121a,
};

export const ARISTOTLE_PALETTE = {
  hair: 0x6b4a2e,
  hairLight: 0x8a6340,
  skin: 0xd8b48c,
  skinShade: 0xb08e68,
  beard: 0x5e4028,
  beardLight: 0x7d5738,
  robe: 0xe8e2d0,
  robeShade: 0xc4bda6,
  eye: 0x14121a,
};

export const BEDROOM = {
  wallTop: 0x1b1d2e,
  wallBottom: 0x2a2740,
  windowGlow: 0x9fb6d8,
  windowFrame: 0x0e0f18,
  moon: 0xf4f0dc,
  desk: 0x6b4a2f,
  deskLight: 0x8a6340,
  deskDark: 0x4a3120,
  lamp: 0xffcf5a,
  lampGlow: 0xffe6a0,
  shelf: 0x3b2b20,
  book: 0x8c4a3a,
  bookAlt: 0x3f6f9e,
  floor: 0x231d2b,
  floorLight: 0x2e2739,
};

export const LYCEUM = {
  skyTop: 0x4a86c6,
  skyBottom: 0xa9d4e8,
  sun: 0xfff0b8,
  stoneLight: 0xe4dcc4,
  stone: 0xcdbf9e,
  stoneDark: 0xa89a78,
  ground: 0xbfae82,
  groundDark: 0x9c8c64,
  olive: 0x6f8f4a,
  oliveDark: 0x4f6b34,
  shadow: 0x3f4a35,
  sea: 0x2f6f9e,
};
