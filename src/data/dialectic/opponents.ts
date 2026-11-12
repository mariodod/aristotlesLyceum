import type {
  DialecticOpponent,
  OpponentClaim,
  Proposition,
  PropositionForm,
  TermId,
  TermLabel,
} from '../../types/dialectic.ts';

/**
 * The cast of the dialectic.
 *
 * Every opponent is one argument. The player has to build a syllogism that
 * takes it apart, and the propositions they are given contain exactly one
 * valid arrangement. The decoys are the same content in the wrong form, so
 * the puzzle is about the shape of the argument and not about spotting the
 * odd one out.
 */

function proposition(
  id: string,
  form: PropositionForm,
  subject: TermId,
  predicate: TermId,
  text: string,
): Proposition {
  return { id, form, subject, predicate, text };
}

const CERTAINTY_TERMS: TermLabel[] = [
  { id: 'S', label: 'claims of this kind' },
  { id: 'M', label: 'opinions' },
  { id: 'P', label: 'certainly true' },
];

const CERTAINTY: OpponentClaim = {
  id: 'certainty-main',
  text: 'I do not merely believe it. I know it. A person who reasons properly can be certain of a thing, and anyone who tells you otherwise is only offering you a better-sounding opinion.',
  terms: CERTAINTY_TERMS,
  propositions: [
    proposition('certainty-opinion-all', 'A', 'S', 'M', 'All claims of this kind are opinions.'),
    proposition('certainty-opinion-some', 'I', 'S', 'M', 'Some claims of this kind are opinions.'),
    proposition('certainty-opinion-none', 'E', 'M', 'P', 'No opinion is certainly true.'),
    proposition('certainty-opinion-some-true', 'I', 'M', 'P', 'Some opinions are certainly true.'),
    proposition('certainty-opinion-all-true', 'A', 'M', 'P', 'All opinions are certainly true.'),
    proposition('certainty-some-true', 'I', 'S', 'P', 'Some claim of this kind is certainly true.'),
    proposition('certainty-none-true', 'E', 'S', 'P', 'No claim of this kind is certainly true.'),
  ],
  target: 'certainty-none-true',
  examination:
    'You want to know where I get my certainty from? From the subject matter. Certainty is not a mood, it is a result. Put the right argument in front of the right mind and the answer cannot wobble.',
  objection:
    'That does not follow. Certainty is not a mood, it is a result. Put the right argument in front of the right mind and the answer cannot wobble.',
  relevance:
    'That is a sound argument. It is about something else. I asked you about certainty and you have shown me that some opinions are well-founded.',
  concession:
    '...No. No, that is not quite it either. A belief can be well-founded and still be a belief. You have taken something away from me and I do not yet know how to get it back.',
  shrug: 'Then let it stand. I am not going to argue with a person who is only going to nod.',
};

const REDUCTIONISM_TERMS: TermLabel[] = [
  { id: 'S', label: 'living things' },
  { id: 'M', label: 'purposes' },
  { id: 'P', label: 'explained by matter alone' },
];

const REDUCTIONISM: OpponentClaim = {
  id: 'reductionism-main',
  text: 'Name the matter and you have named the thing. A body is made of stuff, and if you have accounted for the stuff you have accounted for the body. Everything else you are describing is a story you are telling about the stuff.',
  terms: REDUCTIONISM_TERMS,
  propositions: [
    proposition(
      'reduction-purpose-none',
      'E',
      'P',
      'M',
      'No thing explained by matter alone has a purpose.',
    ),
    proposition(
      'reduction-purpose-some',
      'I',
      'P',
      'M',
      'Some thing explained by matter alone has a purpose.',
    ),
    proposition(
      'reduction-purpose-all',
      'A',
      'P',
      'M',
      'Every thing explained by matter alone has a purpose.',
    ),
    proposition('reduction-living-purpose', 'A', 'S', 'M', 'Every living thing has a purpose.'),
    proposition('reduction-living-purpose-some', 'I', 'S', 'M', 'Some living thing has a purpose.'),
    proposition(
      'reduction-living-no-purpose',
      'O',
      'S',
      'M',
      'Some living thing does not have a purpose.',
    ),
    proposition(
      'reduction-some-matter',
      'O',
      'S',
      'P',
      'Some living thing is not explained by matter alone.',
    ),
    proposition(
      'reduction-none-matter',
      'E',
      'S',
      'P',
      'No living thing is explained by matter alone.',
    ),
  ],
  target: 'reduction-none-matter',
  examination:
    'You want to know what I leave out? I leave out stories. "It wants to survive." "It is trying to thrive." Those are not causes, they are moods you have written on the thing and called its nature.',
  objection:
    'You have not shown me that anything is missing. You have shown me a second story, and stories are cheap.',
  relevance:
    'That is a sound argument, and it is not about my claim. I said a body is accounted for by its matter. You have shown me that a second account is possible.',
  concession:
    'A second story. Hmm. If a thing is accounted for by its matter, and also by what it is for, then one of the two accounts is not doing any work. I do not have an answer for that.',
  shrug: 'Very well. It is all stuff. Go on.',
};

const PLURALISM_TERMS: TermLabel[] = [
  { id: 'S', label: 'goods' },
  { id: 'M', label: 'ends' },
  { id: 'P', label: 'good for one person only' },
];

const PLURALISM: OpponentClaim = {
  id: 'pluralism-main',
  text: 'There is no single good. There is what is good for this person, and what is good for that one, and a person who says otherwise is smuggling their own preferences in under the word "good".',
  terms: PLURALISM_TERMS,
  propositions: [
    proposition(
      'pluralism-end-falls-short',
      'A',
      'P',
      'M',
      'Every good for one person only falls short of being an end.',
    ),
    proposition('pluralism-end-some', 'I', 'P', 'M', 'Some good for one person only is an end.'),
    proposition('pluralism-no-good-end', 'E', 'S', 'M', 'No good is an end.'),
    proposition('pluralism-good-end', 'A', 'S', 'M', 'Every good is an end.'),
    proposition('pluralism-good-not-end', 'O', 'S', 'M', 'Some good is not an end.'),
    proposition(
      'pluralism-some-not-one',
      'O',
      'S',
      'P',
      'Some good is not good for one person only.',
    ),
    proposition('pluralism-none-one', 'E', 'S', 'P', 'No good is good for one person only.'),
    proposition('pluralism-some-one', 'I', 'S', 'P', 'Some good is good for one person only.'),
  ],
  target: 'pluralism-none-one',
  examination:
    'You think there is a good that is good for everybody. Then tell me what it is, and tell me what happens to a person who gets it and is still miserable. That is the whole difficulty, and it does not go away because you say "end".',
  objection:
    'That is a definition, not a refutation. You have renamed my position and told me it is wrong.',
  relevance:
    'That is a sound argument, but it answers a question I did not ask. I did not say there are no ends. I said there is no end that is good for everybody.',
  concession:
    'Ends. Ends and goods. If a thing is good, it is the end of something, and if it were the end of one man alone it would not be the end of a life. I concede the shape of it. I am not sure I concede the content.',
  shrug: 'Then we will never agree, and that is a way of being alive too.',
};

const MARKING_TERMS: TermLabel[] = [
  { id: 'S', label: 'questions on this paper' },
  { id: 'M', label: 'questions with a definite answer' },
  { id: 'P', label: 'tests of knowledge' },
];

const MARKING: OpponentClaim = {
  id: 'marking-main',
  text: 'This paper measures what you know. Mark one means you did not know it. There is no reading of this sheet in which a partial answer counts, and there is no advice I can give you about it.',
  terms: MARKING_TERMS,
  propositions: [
    proposition(
      'marking-answer-none',
      'E',
      'M',
      'P',
      'No question with a definite answer is a test of knowledge.',
    ),
    proposition(
      'marking-answer-some',
      'I',
      'M',
      'P',
      'Some question with a definite answer is a test of knowledge.',
    ),
    proposition(
      'marking-answer-all',
      'A',
      'M',
      'P',
      'Every question with a definite answer is a test of knowledge.',
    ),
    proposition(
      'marking-paper-answer',
      'A',
      'S',
      'M',
      'Every question on this paper is a question with a definite answer.',
    ),
    proposition(
      'marking-paper-answer-some',
      'I',
      'S',
      'M',
      'Some question on this paper is a question with a definite answer.',
    ),
    proposition(
      'marking-some-test',
      'I',
      'S',
      'P',
      'Some question on this paper is a test of knowledge.',
    ),
    proposition(
      'marking-none-test',
      'E',
      'S',
      'P',
      'No question on this paper is a test of knowledge.',
    ),
  ],
  target: 'marking-none-test',
  examination:
    'You want to know what is being measured? Everything, and nothing in particular. Mark one for what you did not know. That is the whole of the arrangement.',
  objection:
    'That does not follow. Mark one is a mark one. It does not measure anything that was not already there.',
  relevance:
    'That is a sound argument and it is beside the point. I am not asking whether the paper is a test of knowledge. I am telling you what it will do with your answers.',
  concession:
    'Hmm. A question with a definite answer is not a test of anything. It is a lookup. And a lookup cannot tell me what you know, only what you have seen before.',
  shrug: 'Then you have a problem with the paper, and the paper is not going to change.',
};

export const DIALECTIC_OPPONENTS: DialecticOpponent[] = [
  {
    id: 'certainty',
    name: 'Certainty',
    color: 0xb0a8e0,
    claims: [CERTAINTY],
  },
  {
    id: 'reductionism',
    name: 'Reductionism',
    color: 0xd88a6a,
    claims: [REDUCTIONISM],
  },
  {
    id: 'pluralism',
    name: 'Pluralism',
    color: 0x7ac0a0,
    claims: [PLURALISM],
  },
  {
    id: 'marking',
    name: 'The Marking',
    color: 0xd0d0c0,
    claims: [MARKING],
  },
];

export const OPPONENTS_BY_ID = new Map(
  DIALECTIC_OPPONENTS.map((opponent) => [opponent.id, opponent]),
);

export function opponentById(id: string): DialecticOpponent | undefined {
  return OPPONENTS_BY_ID.get(id);
}
