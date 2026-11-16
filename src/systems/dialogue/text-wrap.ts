/**
 * Word wrapping for the dialogue box.
 *
 * The bitmap font is monospaced, so a line holds a fixed number of columns.
 * Wrapping happens on word boundaries because a mid-word break reads as a
 * typo in a game that is mostly text.
 */
export function wrapText(text: string, columns: number): string {
  if (columns < 1) {
    return text;
  }

  return text
    .split('\n')
    .map((paragraph) => wrapParagraph(paragraph, columns))
    .join('\n');
}

function wrapParagraph(paragraph: string, columns: number): string {
  const words = paragraph.split(' ').filter((word) => word.length > 0);

  if (words.length === 0) {
    return '';
  }

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (word.length > columns) {
      // A word that cannot fit on a line of its own is broken across
      // several. The whole word is kept: a line that loses its tail says
      // something else, which is worse than a line that looks odd.
      if (current.length > 0) {
        lines.push(current);
        current = '';
      }

      for (const chunk of splitLongWord(word, columns)) {
        lines.push(chunk);
      }

      continue;
    }

    if (current.length === 0) {
      current = word;

      if (current.length === columns) {
        lines.push(current);
        current = '';
      }

      continue;
    }

    if (current.length + 1 + word.length <= columns) {
      current = `${current} ${word}`;
      continue;
    }

    lines.push(current);
    current = word;

    if (current.length === columns) {
      lines.push(current);
      current = '';
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.join('\n');
}

/**
 * A single word longer than the line is broken across lines rather than
 * allowed to overflow the box.
 *
 * Every character of the word ends up on the screen.
 */
function splitLongWord(word: string, columns: number): string[] {
  const chunks: string[] = [];

  for (let start = 0; start < word.length; start += columns) {
    chunks.push(word.slice(start, start + columns));
  }

  return chunks;
}

/**
 * Counts the lines a wrapped text occupies.
 */
export function countLines(wrapped: string): number {
  return wrapped.split('\n').length;
}
