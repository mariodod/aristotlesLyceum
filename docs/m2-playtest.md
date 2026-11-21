# M2 Playtest — Act I, The Desk

**Version:** 0.1
**Date:** 2026-11-12
**Status:** Act I is written, wired and machine-verified. The human playtest below is the last open item.

Act I is finished as far as the code is concerned: the chapter plays from the
title screen to a chapter-complete card, the three choices lead to three
different endings, and the endings are named on the card. What is left is
whether it _lands_ on somebody who has never heard of Aristotle.

This document is the protocol for that test. It is written so a tester needs
nothing but the link and ten minutes.

---

## 1. What the test is for

**The question:** can a person who has never heard of Aristotle describe what
the game is about afterwards, without being told?

If they can, the premise works. If they cannot, the opening is failing, and
the fix is in the writing of Act I, not in the rest of the game.

### Secondary questions

| Question                                              | What it tells us                         |
| ----------------------------------------------------- | ---------------------------------------- |
| Do they press confirm without being told?             | Is the input discoverable?               |
| Do they find the choice menu?                         | Is the heart cursor legible?             |
| Do they understand Isaac is bored rather than stupid? | Is the character voice landing?          |
| Do they remember Aristotle said something?            | Is the dialogue memorable, or wallpaper? |
| Do they open the Dream Journal?                       | Is the Codex pulling its weight?         |
| When do they stop paying attention?                   | Where does the act lose them?            |

---

## 2. Who to ask

Ten people, and try to vary this:

- **3** who play games regularly (RPGs, visual novels, _Undertale_).
- **3** who do not play games much.
- **2** who like philosophy or history.
- **2** who do not, and who are not in the subject.

Nobody who has seen the build before. Nobody who has read the plan.

### The one hard rule

**Do not explain the game.** Not the premise, not the controls, not that it is
about Aristotle. The link and "try this, it's about five minutes" is the
entire script. Everything you say before they press a key is a variable you
have contaminated.

If they ask "what do I do?", say "whatever looks pressable". If they ask "what
is this about?", say "it's a game, you'll see".

---

## 3. How to run it

1. Open the deployed build: <https://mariodod.github.io/aristotlesLyceum/>
2. Watch. Do not talk.
3. Let them finish or stop on their own. Do not tell them it ends.
4. When they are done, ask the questions in §5. Ask them before you tell them
   anything.
5. Fill in one row of the table in §6 per person.

### Things worth writing down while it happens

- **Time to first input.** How long before they press anything?
- **Where they get stuck.** The exact moment, not "it got confusing".
- **Did they reach the choice?** If not, why not?
- **Did they reach the end card?** If not, where did they stop?
- **Did they press `C` on the end card?** Did they even notice it was there?
- **Anything they said out loud.** Especially "huh?", "wait", "no way", "oh".

---

## 4. The build under test

|          |                                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| URL      | <https://mariodod.github.io/aristotlesLyceum/>                                                                                      |
| Length   | About four to five minutes                                                                                                          |
| Controls | `Z` / `Enter` / `Space` to confirm, `Up` / `Down` to move a choice                                                                  |
| Save     | Progress is stored in the browser. A second run in the same browser starts from the same save; use a private window for a clean run |

---

## 5. Questions, in this order

Ask the first one before you say anything else about the game.

1. **"In your own words, what do you think this game is about?"**
2. **"Did anything in it actually stick with you?"**
3. **"What was he reading on the desk?"**
4. **"What did the guy in the robe want?"**
5. **"Did you notice there were different endings?"**
6. **"Did you open the journal at the end? What was in it?"**
7. **"What would you want to happen next?"**

Question 1 is the pass/fail. Question 7 is the most useful for writing Act
II: it tells you what hook the player is holding onto.

### Do not ask

- "Do you know who Aristotle was?" — you want to know whether the _game_
  taught them, not whether they already knew.
- "Was it good?" — everyone says yes. Question 1 is the real measurement.

---

## 6. Results table

Copy one row per tester.

| #   | Background | First input | Reached choice | Reached end card | Ending seen | Q1 in one sentence | Sticks with them | Confusing moment |
| --- | ---------- | ----------- | -------------- | ---------------- | ----------- | ------------------ | ---------------- | ---------------- |
| 1   |            |             |                |                  |             |                    |                  |                  |
| 2   |            |             |                |                  |             |                    |                  |                  |
| 3   |            |             |                |                  |             |                    |                  |                  |
| 4   |            |             |                |                  |             |                    |                  |                  |
| 5   |            |             |                |                  |             |                    |                  |                  |
| 6   |            |             |                |                  |             |                    |                  |                  |
| 7   |            |             |                |                  |             |                    |                  |                  |
| 8   |            |             |                |                  |             |                    |                  |                  |
| 9   |            |             |                |                  |             |                    |                  |
| 10  |            |             |                |                  |             |                    |                  |                  |

---

## 7. What counts as a pass

| Result      | Threshold                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Pass**    | At least 7 of 10 describe the premise in their own words and mention that a person who has been dead a long time is talking to the player |
| **Partial** | 4 to 6 describe it; the rest were lost somewhere specific                                                                                 |
| **Fail**    | Fewer than 4 can say what the game is about                                                                                               |

A partial pass almost always points at one of three things, in this order:

1. **The choice comes too late.** If people are bored before the choice, the
   room needs to be shorter or the choice earlier.
2. **Isaac reads as flat.** If people say he is "bored" rather than "bored
   and funny", the voice needs more specificity.
3. **The dream transition is unclear.** If people cannot say that the place
   changed, the narration needs to say it more plainly.

---

## 8. Known issues to watch for

These are known and are not yet fixed. Note how many people hit them, but do
not mention them to the testers.

| Issue                                               | What the tester will do                                | Severity |
| --------------------------------------------------- | ------------------------------------------------------ | -------- |
| The `C` key is not advertised until the end card    | They will not open the Journal                         | Low      |
| The three endings are only visible on the card      | A player may replay the chapter hunting for the others | Low      |
| There is no indication that the text can be skipped | Long lines take four seconds each                      | Medium   |
| Isaac's sprite is small at 640x360                  | Readable, but not expressive                           | Medium   |
| The second act does not exist                       | The ending promises a school waking up and then stops  | **High** |

The last one is expected. Act I is the whole game today. A tester who asks
"can I keep playing?" has told you the act does its job.

---

## 9. After the test

1. Fill in the table.
2. Write up the three strongest answers to question 1, quoted.
3. List the confusing moments by frequency.
4. Write the findings into `docs/m2-playtest.md` under a "Findings" heading.
5. Fix what the findings point at, and update the roadmap.

The findings section is the deliverable. The table is the evidence.
