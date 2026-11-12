# Content Bible — Aristotle's Lyceum

**Version:** 0.1
**Date:** 2026-11-12
**Status:** Act I specified. Act II and Act III outlined with sources.

This document is the outline of what the game teaches and what it claims. It
exists so that the writing can be checked against something before it is
written, and so that the Codex entries have a source before they are authored.

**Rule:** every concept below must end up as a Codex entry with at least one
Aristotelian source, and the modern side of the entry must name a specific
place the idea still does work — not a vague resemblance.

---

## 1. Act I — The Desk

**Where:** Isaac's bedroom, 11:47 PM.
**Shape:** one continuous shot. No branching until the single choice.

### Beats

1. The room, the clock, the exam in nine hours.
2. Isaac states that philosophy is the subject where reading every page still
   fails you.
3. He turns the page anyway. The page he is on is _Metaphysics_ I, "All men by
   nature desire to know."
4. He reads aloud and hears his own voice answer back.
5. **Choice:** read on / hold the page down / shut the book.
6. The room becomes somewhere else.

### Codex unlocked

| Id          | Idea                                                                                                       | Source                  | Modern echo                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `syllogism` | A conclusion follows necessarily from premises that are true, primary and more evident than the conclusion | _Prior Analytics_ I.1–2 | Rule-based inference in theorem provers, SAT solvers and deductive language models |
| `dialectic` | Reasoning from reputable opinions, testing a claim by asking what would break it                           | _Topics_ I              | Peer review, red teams, structured debate                                          |

---

## 2. Act II — The Lyceum

Seven chapters. Each is a conversation with Aristotle that ends in a small
dialectic. Each unlocks two Codex entries.

### Chapter 1 — Logic

**Work:** _Prior Analytics_, _Categories_
**The idea:** what can be concluded from what. Aristotle invents the
categorical syllogism: three terms, three propositions, one figure, several
moods. The whole of deductive logic for two thousand years is a commentary on
this book.

**The scene:** Isaac tries to win an argument by being clever and loses it
because he has not stated his terms. Aristotle walks him through a single
syllogism until he can build one himself.

**Dialectic:** _Certainty_, who insists on a conclusion and refuses the
premises. Refute it with a valid Barbara syllogism.

**Codex:** `syllogism` (extended), `categories` (the five predicables: genus,
species, property, accident, definition — the ancestor of the modern data
model's type hierarchy).

### Chapter 2 — Physics

**Work:** _Physics_ I–III, _On the Heavens_
**The idea:** "why" has four answers. Material (what it is made of), formal
(its structure), efficient (the mechanism), final (the purpose). The first
scientific attempt to ask systematically what an explanation has to contain.

**The scene:** a falling object. Isaac says "because of gravity"; Aristotle
says gravity is a modern word for the answer you already knew.

**Dialectic:** _Reductionism_, who insists that only the material cause is a
real cause.

**Codex:** `four-causes`, `hylomorphism`.

### Chapter 3 — Metaphysics

**Work:** _Metaphysics_ I–IX, _Lambda_
**The idea:** being and change. Matter is potential; form is actual. A thing
is what its form makes it. Teleology: the unmoved mover as the final cause
of every motion, the "thought that thinks itself".

**The scene:** the hour before dawn, the dream arguing with itself about
whether the world is one thing or many.

**Dialectic:** _Reism_, who says only names are real.

**Codex:** `unmoved-mover`, `potentiality` (the distinction between what a
thing can become and what it is; modern philosophy of science still uses it
to talk about counterfactuals and about the relation between a model and a
system).

### Chapter 4 — The Soul

**Work:** _De Anima_ I–III
**The idea:** the soul is the form of a body, not a second thing inside it.
Three capacities: nutrition (plants), sensation (animals), thought (humans).
Aristotle's account of memory and imagination as movements of the soul, and
the first serious treatment of the mind–body problem.

**The scene:** Isaac's body is in a chair in ancient Greece and his memory is
somewhere else. Neither of them is sure what that means.

**Dialectic:** _Cartesian Doubt_ — no, that is Descartes; in Act II the
opponent is _the Ghost_, the idea that the soul is a separate occupant.

**Codex:** `soul-as-form`, `soul-capacities`.

### Chapter 5 — Ethics

**Work:** _Nicomachean Ethics_ I–X
**The idea:** the highest human good is _eudaimonia_ — flourishing, activity
in accordance with virtue over a whole life. Virtue is a stable disposition
of the character, not a feeling. The mean is relative to us: courage lies
between cowardice and rashness, and the right amount depends on who you are.

**The scene:** Aristotle asks Isaac what he wants to be good at, and Isaac
cannot answer because he has never thought about it. The mood changes here:
the game gets quieter.

**Dialectic:** _Pluralism_, who insists there is no single good.

**Codex:** `eudaimonia`, `virtue-and-the-mean`.

### Chapter 6 — Poetics

**Work:** _Poetics_
**The idea:** art is _mimesis_ — an image or representation of action — and
tragedy works by producing pity and fear and purging them. Aristotle writes
the first theory of plot: beginning, middle, end, and the probability or
necessity that makes a story hang together.

**The scene:** Aristotle watches Isaac's life and tells him it is a bad
tragedy: no reversal, no recognition. Isaac has to decide whether to rewrite
himself.

**Dialectic:** _Imitation as Uselessness_, who says a copy teaches nothing.

**Codex:** `mimesis-and-catharsis`, `plot-structure`.

### Chapter 7 — Life

**Work:** _History of Animals_, _Parts of Animals_, _Generation of Animals_
**The idea:** Aristotle classifies animals by observation — roughly five
hundred species, with parts, habits and behaviour, compared across specimens.
A systematic natural history built by looking at things rather than reading
about them. He also gets the mechanism of generation wrong, in a way that
takes two thousand years to fix.

**The scene:** Aristotle dissects an animal in front of Isaac and asks him to
predict what happens. Isaac guesses wrong. Aristotle explains why the guess
was a good guess and still wrong.

**Dialectic:** _Authority_, who insists that if it is in the book, it is so.

**Codex:** `observation-and-taxonomy`, `history-of-animals` (the catalogue
that Darwin read and criticised, and that modern biodiversity science still
echoes).

---

## 3. Act III — The Long Walk

Twenty-four stations are planned; eight ship in v1.0. Each station is a
person, a place, a year, and one thing they did with Aristotle — kept,
corrected, or discarded.

### The eight that ship

| Station        | Person                      | Year      | What happened to Aristotle's idea                                                                                                                                |
| -------------- | --------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alexandria** | The Library's scholars      | c. 250 BC | Aristotle's works were edited, catalogued and translated; the Alexandrian method — collecting, comparing, annotating — grew out of them                          |
| **Baghdad**    | Avicenna, al-Farabi         | c. 1000   | Aristotle was read, criticised and absorbed into Arabic philosophy; Avicenna's "essence" and "accident" analysis is Aristotle's hylomorphism sharpened           |
| **Paris**      | Thomas Aquinas              | c. 1250   | Aristotle was reconciled with Christian theology, and Latin Europe adopted him as _the_ authority for two centuries                                              |
| **Padua**      | Cesalpino, Vesalius, Harvey | 1560–1620 | Aristotle's anatomy was corrected by dissection; Harvey's circulation replaced his account of the heart. **The method survived; the conclusions did not.**       |
| **London**     | Francis Bacon               | 1620      | _Novum Organum_ attacks Aristotle's reliance on authority and replaces it with experiment. The dialectic survives as the method that interrogates the experiment |
| **Utrecht**    | René Descartes              | 1637      | _Discourse on Method_ rejects the authority of Aristotle entirely and rebuilds knowledge from doubt. The _authority_ dies; the _questioning_ survives            |
| **Königsberg** | Immanuel Kant               | 1781      | The _Critique of Pure Reason_ answers Aristotle's categories and asks whether the mind can know the world at all                                                 |
| **Down House** | Charles Darwin              | 1859      | _On the Origin of Species_ replaces Aristotle's fixed species and final causes with descent and selection. The greatest correction in the history of the subject |

### The ones planned for later

Poincaré and the crisis in physics (1905) · Frege and Russell, and Aristotle's
logic becoming symbolic logic (1879–1910) · Turing and Shannon, and formal
inference becoming computation (1936–1948) · Popper and falsification
(1934) · Kuhn and paradigms (1962) · the present: neuroscience still arguing
about the soul, ecology still arguing about final causes, machine learning
still arguing about deduction.

### Codex unlocked per station

Each station unlocks one entry of the form: "Aristotle said X; here is the
person who did Y with it". The modern field of the entry is always named
specifically.

---

## 4. Act IV — The Exam

Isaac wakes at the desk. The exam is in ten minutes and it is the same exam
he was dreading.

The exam is playable: six questions drawn from the material, each multiple
choice, each with a "I actually know this" option. Questions Isaac has lived
through in the dream are answerable; questions about things he never learned
are not. The score is not shown — the ending depends on it.

### Endings

| Ending                | Condition                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **The Passing Grade** | Answers most questions right. Isaac does well and is annoyed that he has to admit why.                                                       |
| **The Honest One**    | Answers few questions right but picked the "I don't know" option on the rest. Isaac fails the exam and understands what he actually learned. |
| **The Apostate**      | Answers everything right. Isaac has become a person who finds philosophy interesting, which nobody in his life expected.                     |

---

## 5. Writing rules

1. **No lectures.** Every idea arrives through a person who wants something
   and a problem that will not go away. The Codex carries the exposition.
2. **Isaac argues.** He is a teenager with an opinion, not a student with a
   pencil. He should be wrong at least once per chapter.
3. **Modern scientists are not strawmen.** Bacon, Descartes and Darwin are
   right about the things they are right about. The game is about what
   survived, not about who won.
4. **Specificity beats drama.** "Aristotle's biology was wrong in about fifty
   specific ways" is more interesting than "Aristotle was wrong".
5. **The credits are a place for honesty.** Where the game simplifies, the
   Codex says so.

---

## 6. Source list

The works of Aristotle cited in the Codex:

- _Categories_
- _Topics_
- _Prior Analytics_
- _Physics_
- _On the Heavens_
- _Meteorologica_
- _De Anima_
- _Parva Naturalia_
- _History of Animals_
- _Parts of Animals_
- _Generation of Animals_
- _Nicomachean Ethics_
- _Politics_
- _Poetics_
- _Metaphysics_

Secondary reading used while writing the Codex:

- Jonathan Barnes (ed.), _The Complete Works of Aristotle: The Revised Oxford
  Translation_
- G.E.R. Lloyd, _Aristotle: The Growth of a Tradition_
- James Lennox, _Aristotle's Philosophy of Biology_
- Myles Burnyeat, _A Map of Metaphysics_
- Charles Taylor, _Sources of the Self_
- Alasdair MacIntyre, _After Virtue_
- Elizabeth Anscombe, _Intention_
- James Gleick, _The Information_ (for the logic-to-computation stations)
- Lorraine Daston (ed.), _The History of Science in the Nineteenth Century_
