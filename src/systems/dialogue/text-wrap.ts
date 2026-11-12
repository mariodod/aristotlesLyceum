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
    if (current.length === 0) {
      current = word.length > columns ? splitLongWord(word, columns) : word;

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
    current = word.length > columns ? splitLongWord(word, columns) : word;

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
 */
function splitLongWord(word: string, columns: number): string {
  return word.slice(0, columns);
}

/**
 * Counts the lines a wrapped text occupies.
 */
export function countLines(wrapped: string): number {
  return wrapped.split('\n').length;
}
