export interface GlyphCell {
  rows: string[];
  width: number;
  advance: number;
}

export function glyphCell(character: string): GlyphCell | undefined;
