import type { CharacterId, ExpressionId } from '../types/story.ts';

export interface CharacterDefinition {
  id: CharacterId;
  /** Name shown on the dialogue name plate. */
  name: string;
  /** Tint applied to the character sprite. */
  color: number;
  /** Sprite key used by the scene to place the character on stage. */
  spriteKey: string;
  /** Per-character expression overrides; anything not listed falls back. */
  expressions: Partial<Record<ExpressionId, string>>;
}

/**
 * The cast. Sprite keys point at frames produced by `npm run assets`; a
 * missing key is caught by the content linter rather than at runtime.
 */
export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  narrator: {
    id: 'narrator',
    name: '',
    color: 0xbfb6a2,
    spriteKey: 'char-narrator',
    expressions: {},
  },
  isaac: {
    id: 'isaac',
    name: 'Isaac',
    color: 0xe8b48c,
    spriteKey: 'char-isaac',
    expressions: {},
  },
  aristotle: {
    id: 'aristotle',
    name: 'Aristotle',
    color: 0xd8c9a0,
    spriteKey: 'char-aristotle',
    expressions: {},
  },
  examiner: {
    id: 'examiner',
    name: 'Mrs. Okonkwo',
    color: 0xc98f6a,
    spriteKey: 'char-examiner',
    expressions: {},
  },
  'alexandria-scribe': {
    id: 'alexandria-scribe',
    name: 'Scribe of Alexandria',
    color: 0xcfd6de,
    spriteKey: 'char-alexandria-scribe',
    expressions: {},
  },
  avicenna: {
    id: 'avicenna',
    name: 'Avicenna',
    color: 0x9fd0c0,
    spriteKey: 'char-avicenna',
    expressions: {},
  },
  aquinas: {
    id: 'aquinas',
    name: 'Thomas Aquinas',
    color: 0xe4dcc8,
    spriteKey: 'char-aquinas',
    expressions: {},
  },
  harvey: {
    id: 'harvey',
    name: 'William Harvey',
    color: 0xbfa88c,
    spriteKey: 'char-harvey',
    expressions: {},
  },
  bacon: {
    id: 'bacon',
    name: 'Francis Bacon',
    color: 0xa9b6c4,
    spriteKey: 'char-bacon',
    expressions: {},
  },
  descartes: {
    id: 'descartes',
    name: 'René Descartes',
    color: 0x8fa8c8,
    spriteKey: 'char-descartes',
    expressions: {},
  },
  hume: {
    id: 'hume',
    name: 'David Hume',
    color: 0xd6c7a8,
    spriteKey: 'char-hume',
    expressions: {},
  },
  darwin: {
    id: 'darwin',
    name: 'Charles Darwin',
    color: 0xc4b49a,
    spriteKey: 'char-darwin',
    expressions: {},
  },
  turing: {
    id: 'turing',
    name: 'Alan Turing',
    color: 0xa4b8c6,
    spriteKey: 'char-turing',
    expressions: {},
  },
};

export function characterName(id: CharacterId): string {
  return CHARACTERS[id].name;
}
