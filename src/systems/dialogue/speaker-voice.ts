/**
 * Telling speech from narration.
 *
 * In this game the narrator describes Isaac as "he", and a character names
 * the people they are talking about. That difference in voice is the only
 * thing that says whether a line is spoken or narrated, so the content
 * linter uses it to catch a line that was tagged with the wrong speaker.
 *
 * The rules are heuristics, and they are meant to be noisy rather than
 * quiet: a false positive costs a writer one sentence, a false negative
 * costs the player a name plate that lies.
 */

/** A sentence that opens with a bare third-person subject. */
const THIRD_PERSON_SUBJECT = /^(he|she|they|his|her|their)\b/i;

/** The pronouns a character uses when they are talking to somebody. */
const SPEAKING_PRONOUN = /\b(i|me|my|mine|we|us|our|ours|you|your|yours)\b/i;

/** The pronouns the narrator never uses. */
const FIRST_PERSON = /\b(i|me|my|mine)\b/i;

/**
 * Removes the quoted spans.
 *
 * A quotation is somebody else's words. The narrator is allowed to report
 * what Isaac said, and that is not the narrator speaking in the first
 * person.
 */
function withoutQuotations(text: string): string {
  return text.replace(/"[^"]*"/g, ' ');
}

/** The sentences of a line, outside any quotation. */
function sentences(text: string): string[] {
  return withoutQuotations(text)
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/**
 * Whether a line reads like narration rather than like speech.
 *
 * A line that opens a sentence with a bare "he", "she" or "they", and that
 * never addresses anybody with an "I" or a "you", is the narrator talking
 * about somebody. It belongs on the narrator.
 */
export function readsLikeNarration(text: string): boolean {
  if (SPEAKING_PRONOUN.test(withoutQuotations(text))) {
    return false;
  }

  return sentences(text).some((sentence) => THIRD_PERSON_SUBJECT.test(sentence));
}

/**
 * Whether a line speaks in the first person, which the narrator never does.
 */
export function speaksInFirstPerson(text: string): boolean {
  return FIRST_PERSON.test(withoutQuotations(text));
}
