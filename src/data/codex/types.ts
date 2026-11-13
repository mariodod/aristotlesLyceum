import type { CharacterId } from '../../types/story.ts';

/**
 * One entry in the Dream Journal.
 *
 * Every entry pairs what Aristotle actually wrote with the place the idea
 * still shows up today. The `sources` field is not decoration: the content
 * linter requires at least one reference per entry so a claim can never ship
 * without something to check it against.
 *
 * `author` names the character whose portrait appears beside the entry.
 */
export interface CodexEntry {
  id: string;
  /** Short label used in menus. */
  title: string;
  /** The idea as Aristotle stated it. */
  origin: string;
  /** Where the same structure of thinking shows up in today's science. */
  modern: string;
  /** Works of Aristotle this entry draws on. */
  sources: string[];
  /** The catalogue key for the title. */
  titleKey?: string;
  /** The catalogue key for the origin text. */
  originKey?: string;
  /** The catalogue key for the modern text. */
  modernKey?: string;
  /** The catalogue key for the sources. */
  sourcesKey?: string;
  /** Whose portrait is shown beside the entry. */
  author?: CharacterId;
}
