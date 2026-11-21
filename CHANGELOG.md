# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-21

### Added

- **Real credits.** Six paged sections in both languages: the tools, the
  generated art and audio, the sources behind the Codex and the people
  depicted. The old placeholder is gone.
- **A licence audit.** `docs/licences.md` records the MIT licence of the game,
  the licences of all twelve dependencies and the origin of every file under
  `public/`. `npm run assets:check` hashes the pack, regenerates it and proves
  that all 52 files come back byte for byte, so a hand-placed third-party
  asset cannot slip in.
- **A full-playthrough test.** One browser test plays from the title through
  all 17 chapters, every choice and all eight arguments to the exam's ending,
  with no console errors.
- **A four-browser matrix.** Chrome, Edge, Firefox and Safari all boot and
  play: 60 tests pass with `BROWSER_MATRIX=1`.

### Fixed

- **Battle messages showed literal `{mood}` and `{figure}`.** The story
  lookup never passed its parameters to the interpolator when a key was
  found in a catalogue, so the battle readout in both English and Spanish
  showed placeholders instead of the mood and figure. The inline fallback
  happened to be correct, which is why the unit tests missed it; there is a
  catalogue-key test now.
- **The second and later battles never handed back.** The dialectic scene is
  reused by Phaser, and a flag set by the first win was never cleared, so the
  next win skipped the hand-off and the playthrough stalled. The full
  playthrough test catches the regression.
- **WebKit and Firefox could not boot while audio loaded.** Nine WAV files in
  the blocking preload stalled browsers without Web Audio. Audio now loads in
  the background after the first frame, and every play call skips a file that
  has not arrived.
- The favicon and the generated-pack README were hand-written files under
  `public/`; both are written by the asset generator now.

## [0.8.0] - 2026-11-21

### Added

- **Generated audio.** Four music moods — the desk, the Lyceum, the walk and
  the exam — and five effects for choices, journal unlocks and won arguments.
  A hand-rolled WAV writer generates them from committed scripts, like the
  art, so the pack is reproducible byte for byte and `npm run assets`
  rebuilds both packs together.
- **A real settings screen.** Ten rows cover language, text speed, three
  volumes, screen shake, reduced motion, hold-to-skip, colour-blind accents
  and mute. Every change is saved and survives a reload; a hand-edited store
  is clamped rather than trusted. The audio service applies volumes to the
  sounds that are playing, and turning the master down never forgets the
  saved levels.
- **Accessibility.** Instant text reveals a whole line at once, reduced
  motion removes the scene tweens, hold-to-skip reveals quickly while the
  confirm key is held, and the colour-blind accent set changes the interface
  highlights without touching the character art.
- **Music follows the act.** The desk opens the game, the Lyceum plays the
  dialogues, the walk follows the stations and the exam music covers the
  battles and the paper. Moods cross-fade.

### Fixed

- The bilingual UI catalogues had drifted: the four new opponent names were
  missing from English, and two old settings strings were still there with
  nothing using them. Both catalogues are in step again.

## [0.7.0] - 2026-11-20

### Added

- **Act III — The Long Walk.** Eight stations from Alexandria to Down House,
  each a person, a place and one thing done with Aristotle's work. Each
  files its own Codex entry, written and translated, so the journal now
  holds thirty-one sourced entries. Six city backdrops and a Kant sprite are
  generated from the committed art scripts.
- **The load-bearing choice comes due.** The flag written in Ethics is read
  at both ends of the walk: Isaac challenges the teaching in Alexandria and
  revisits the decision at Down House. An earlier act's choice finally
  changes what the player reads.
- **Act IV — The Exam.** Isaac wakes at the desk for six questions answered
  through the same choice menu, one unanswerable by honesty, and three
  endings. Marking is a pure system with its own tests; the score is never
  shown, and a flag names the ending the script displays. A new `exam` step
  kind carries the paper as data rather than a branch in a scene.
- **Linter rules for the new steps.** The content check proves every exam
  question has one correct and one honest answer, the key collector covers
  exam text in both languages, and reachability follows the exam's `goto`.
  A browser test plays all three exam endings.

### Fixed

- **An earlier note in this project claimed that stopped scenes keep their
  keyboard listeners.** They do not. Phaser 4 gives each scene its own
  KeyboardPlugin and removes its listeners when the scene shuts down. Three
  round trips between the title and the journal leave one listener per key,
  the stopped journal has none, and it does not answer a key press. The
  journal test that first suggested otherwise had pressed down once on a
  title menu that had gained a CONTINUE entry; the test was wrong, not the
  engine. No code changed for this: the note is corrected so the next act is
  not built around a problem that does not exist.

- **The terms list in a dialectic ran off the right edge of the screen.**
  Propositions are whole sentences, but they were drawn single-line in a
  narrow column, so the ends of the longer ones - the Marking and Authority
  had the worst of them - were simply not on the screen. The list wraps each
  proposition into as many lines as it needs, and a browser test walks the
  scene graph to prove no text ends past the right edge.
- **Four new opponents said one word where their predecessors said a line.**
  Asserting a proposition against Reism, the Ghost, Imitation or Authority
  produced the bare word "premise" in Spanish. The localisation linter now
  compares the length of a translation with the English it replaces, so a
  placeholder like that is reported instead of shipped. The four lines are
  fixed, along with the article before "hilemorfismo" in the Physics chapter.
- **Asserting a conclusion could empty the conviction bar without winning.**
  The opponent then stood there with a zero bar and kept the floor, because
  only a demonstrated argument can end a dialectic. Conviction now stops at
  one when a conclusion is merely asserted.

### Changed

- The seven Act II chapter scripts no longer carry a `chapter` or `title`
  field that nothing read, and the `final-jump` step that simply stepped to
  the next step is gone from each of them. The browser suite's seven copies
  of the same chapter sequence are one helper now, which made a wrong
  expected ending visible and easier to fix.
- Unused exports were removed: `snapToWholePixel`, `isStatId`, `localeById`,
  and two re-exports of the Codex plan. The two lines the battle says when a
  proposition is asserted are constants now, so the linter can check their
  translations.
- The battle state had a `mode` that was written four times and read once:
  only "won" was ever checked, and "done" was never set at all. It is a
  single `won` flag now, which is all the scene and the tests ever asked of it.
- `tools/i18n/dump-content.mjs` printed an incomplete list of keys: the
  opponent lines and the act cards were missing. It shares the key collector
  with the linter now, so both see the same 518 keys and a new chapter or
  opponent appears in both without a second edit. The two translation tools
  are documented in the manual's "Adding a language" section.

## [0.6.0] - 2026-11-19

### Fixed

- **The mood and figure table had three errors in it.** Figure 3 was missing
  Ferison (EIO), figure 4 was missing Fresison (EIO) and instead listed EOO,
  which cannot hold because two negative premises prove nothing, and OAO was
  spelled "Bokaro" when the tradition calls it Bocardo. No shipped opponent
  could reach figure 3 or 4, so no battle played wrong, but the table is the
  thing the game teaches, and a player who built Ferison would have been told
  it was invalid. The table now has the nineteen moods the game teaches, and
  the test counts them and proves the two that were missing.
- **A line of dialogue could lose its tail.** The word wrapper, when it met a
  word longer than the line, kept the first chunk of the word and dropped the
  rest, so a long word in the middle of a sentence silently changed what the
  sentence said. A word that does not fit is now broken across as many lines
  as it takes, and every character of it reaches the screen.
- **A chapter that was handed to a battle came back to an empty stage.** The
  battle scene restarts the chapter at the label it returns to, which is after
  the stage steps, so the actors the player had just been watching were gone.
  The scene remembers where they were standing and which backdrop was up, and
  puts them back. A resumed chapter also keeps the flags it set, because it is
  the same chapter, continued, not a new run of it.
- **The Dream Journal reopened on the entry the player last had selected.** A
  Phaser scene keeps its instance across restarts, so the journal's selection
  survived the trip back to the title. It now opens on the first entry, every
  time.
- **The battle menu kept the previous battle's labels.** The menu list was
  never emptied when the scene was restarted, so it grew by four every time
  the player went back to the title and came again, and the cursor read
  entries from a battle that was already over.
- **The layout rules were numbers nobody checked.** The dialogue box's
  character count and line count existed as constants, but no test used them,
  so nothing would have caught a line that overflowed the box it sat in. The
  panel geometries now live in one place, and the content linter proves, in
  every language, that every line of dialogue, every journal field and every
  battle line fits the panel that carries it.
- **The letters in the main menu were split across the colour channels.** The
  browser resamples the canvas, and a glyph that starts half a pixel off gets
  torn into red, green and blue. The menu entries whose text is an odd number
  of pixels wide started between two pixels, so the "I" in BEGIN THE DREAM,
  TRY A DIALECTIC and CREDITS came out as a smear, while SETTINGS, which
  started on a whole pixel, stayed crisp. Every piece of text in the game is
  now placed by its left edge, on a whole pixel, and the browser suite
  proves it.
- **The act card was a rendering fault.** The card faded in from nothing, so
  the scene appeared first, then blacked out with the title over it, then came
  back. The words also spent most of their life half-transparent, and the
  first line was already half-typed behind the card, so the player arrived at
  a sentence they had missed the start of. The card is now black from the
  first frame, only the words fade, and the line starts from the top.
- **It was not clear who was talking.** The narrator had no name plate, so a
  narrated line and a line spoken by the only person on the screen looked
  the same. The narrator has a name plate now, in the quiet grey it already
  had.
- **Nine lines were in the wrong voice.** They were written in the narrator's
  register - "He says it again", "He had wanted to know why" - but tagged with
  Isaac as the speaker, so the name plate said he said them. After the choice
  in Act I the player watched two narrated sentences with Isaac's name on
  them. The lines are the narrator's now, and the linter will not let it
  happen again.
- **The content linter now knows who is talking.** The narrator describes
  Isaac as "he" and a character names the people they are talking about, and
  a line that breaks that rule is reported. The rule is a heuristic and it is
  meant to be noisy: a false positive costs a writer one sentence, a false
  negative costs the player a name plate that lies.
- **A narrated line can still make somebody react.** A `face` field says whose
  sprite plays the expression, and only the narrator may name one, so the
  narration about Isaac can still make Isaac look tired.
- **The chapter-complete card threw the act number away.** It showed a bare
  "ACT" because it read the act label from the interface catalogue instead of
  from the card. It reads the same words the act card said, in the player's
  language.
- **The act title was not translated.** The act card and the chapter-complete
  card both showed the act's name in English, because the name came from the
  script. It is a catalogue key now.
- **A fading toast sat over the chapter-complete card**, which read as a
  rendering fault.
- **"You have been practising it for six hours."** Aristotle said Isaac had
  spent six hours practising, and the dream before it had been a
  conversation rather than an argument. He now counts the argument they had
  with him as the practice.
- **A story line could hold a character the font cannot draw.** The
  localisation check compared the catalogues against the font, but the English
  story lives inline in the scripts and never passes through a catalogue, so
  it was never checked. It is now, and it caught eleven typographic
  apostrophes that would have been blank boxes in the middle of a sentence.
- **The credits screen borrowed the journal's "go back" string**, so changing
  one changed the other. It has its own key now.
- **The "new entry" toast was hardcoded English**, and it showed the English
  title of the entry in every language. Both are keys now.
- **A browser test could not finish the chapter it was replaying three
  times**, because it had the default timeout. It was failing before this
  release.

### Added

- **Act II is written: seven chapters, from Logic to Life.** Each chapter is
  a conversation that ends in a dialectic and files three Codex entries. The
  chapters are in the registry in play order, and the save carries the player
  from one to the next: the title offers CONTINUE THE DREAM, and the
  chapter-complete card offers the next chapter while one remains.
- **Eight opponents for the table.** Certainty, Reductionism, Pluralism and
  the Marking were already here. Reism, the Ghost, Imitation as Uselessness
  and Authority join them, each with one valid refutation, one sound argument
  that answers nothing, and decoys that are the same content in the wrong
  form. The table test enumerates every arrangement for every opponent.
- **The load-bearing choice.** Ethics asks Isaac whether he will question
  what he was told or keep it. The answer is written to the save, where Act
  III will read it, and replaying that chapter starts the decision fresh.
- **A browser test for every chapter.** Each plays from the title screen to
  its end card, wins the argument, and checks that the chapter's three
  entries are on the journal shelf.
- **A helper for text in the middle of the screen**, which places it by its
  left edge on a whole pixel, and a browser test that proves every piece of
  text in the game lands on one.
- **The Dream Journal has a list.** It opened on a single entry and could
  never show the second, so a journal with more than one thing in it was
  unreadable. It now lists everything that has been filed, the arrows move
  through the list, `Z` opens an entry, and the arrows turn the page inside
  it.
- **Twenty-one Codex entries for Act II**, three per chapter, each naming the
  Aristotelian work it comes from and a modern field where the idea still does
  work. All of them are translated into Spanish.
- **Codex-driven choices.** An option can name the Codex entry it refers to,
  and the game only offers it once the player has read that entry, which is
  what makes the journal a replay hook. The menu marks those options with a
  small book, drawn from the same generator as the heart.
- **A plan for the chapters that are coming.** `src/data/codex/plan.ts` names
  the chapters that are still to be written and the entries each of them will
  unlock, so an entry can be written down before the chapter that files it.
- **The generator can read a PNG.** It could only write them, which meant a
  sprite drawn outside the repository could not be brought into the art pack.
- **A tool to bring an outside sprite into the character grid**, which finds
  the figure in an image, scales it down and prints the pixel map.
- **A preview of the cast, large**, so a sprite can be judged without
  playing the game.

## [0.5.0] - 2026-11-12

### Added

- **Localisation.** The game can be played in Spanish, and the system is
  built so the next language is a folder of catalogues.
- **The English story stays in the scripts.** A line of dialogue carries both
  the English text and a key, so a writer reads and edits the English where it
  is written and a translator gets one file per language.
- **A language switch** in the settings. It applies immediately and it is
  remembered.
- **A font per language.** The dialogue box works out its wrapping from the
  font's advance, so a locale with a wider font wraps differently without
  anything else changing.
- **A localisation linter.** `npm run i18n:check` proves that every
  catalogue is complete, has no stale keys, has the same placeholders as the
  English, and uses only characters the font can actually draw. The last check
  matters most: a bitmap font has no fallback, so one accented letter the
  atlas does not have becomes a blank box in the middle of a sentence.
- **A Spanish translation** of the whole of Act I, the Dream Journal, the
  dialectic and the interface.

### Fixed

- **Scenes kept their state across a restart.** A Phaser scene reuses its
  instance, so the title menu came back with the cursor still on the entry that
  was chosen last time, and the settings screen came back with the wrong
  language selected.
- **The chosen language was never remembered.** The service was built without
  the browser's storage, so the setting did not survive a reload.

## [0.4.0] - 2026-11-12

### Added

- **M4: the dialectic.** A battle system where the opponent is an
  argument given a face, and the only way to win it is to build a
  syllogism that takes it apart.
- **A real syllogism engine.** The classical mood and figure table, so a
  categorical syllogism is valid exactly when its mood is in the list for
  its figure. It names the mood it found: Celarent, Darii, Camestres.
- **The four moves.** Examine, refute, claim, embrace. Only one of them
  wins the argument; the other three exist to teach how.
- **A builder that teaches.** It names the figure as soon as the two
  premises are chosen and the mood as soon as the conclusion is, so a
  player who has never heard of a syllogism learns the shape of one by
  watching the readout.
- **Four opponents.** Certainty, Reductionism, Pluralism and the Marking.
  Every one has exactly one refutation, and exactly one sound argument
  that answers nothing, so the game can say "that is a valid argument, and
  it is not an answer to me".
- **A `dialectic` step kind**, so a chapter can hand over to a battle and
  pick up again at a label when the argument is won.
- **A development entry on the title screen** so the battle can be reached
  before Act II exists.

### Fixed

- **The builder would take the same premise twice.** Two copies of one
  premise is not a syllogism, and the readout had nothing useful to say
  about it.

## [0.3.0] - 2026-11-12

### Added

- **M3: the art pass.** Twelve characters, a shared face block, eight
  expressions each, portraits for the Dream Journal, and three new
  backdrops.
- **A shared face block.** Every character has the same head geometry, so an
  expression is authored once and painted over the face of the whole cast.
  Adding a character now gets every expression for free.
- **Expressions in the game.** A line of dialogue can name an expression, and
  the speaker plays it. Isaac complains with an angry face.
- **Portraits in the Dream Journal.** Each entry shows the portrait of whoever
  taught the idea, cropped and doubled from the sprite.
- **Three new backdrops.** The Library of Alexandria, Down House, and the
  classroom Isaac has to sit in at the end.
- **Garment builders.** Robes, coats and frock coats are described by the width
  of each row rather than transcribed twenty-six times.
- **Art checks in the content linter.** Every character needs a sprite, every
  sprite needs a frame for every expression, and every character needs a
  portrait.

### Fixed

- **Faces no longer have holes.** A blank in an expression patch was being
  painted as transparency rather than as skin, so every character had a hole
  in the middle of the face.

## [0.2.0] - 2026-11-12

### Added

- **M2: Act I is a finished chapter.** Sixty-four steps and about five
  minutes, rewritten from a placeholder into a room with a clock in it, a
  book that moves, and a voice that has been waiting six hours.
- **Three endings.** Each choice leads to its own branch and its own named
  ending: _The Argument_, _The Repetition_, _The Message_.
- **The chapter-complete card.** The act, the ending and its subtitle, the
  stats, the number of journal entries, and a prompt for the journal.
- **A dream transition.** The bedroom cross-fades into the Lyceum while the
  narration says the room goes somewhere else.
- **The `branch` and `chapterEnd` step kinds**, so a chapter can route to a
  different ending and name it.
- **A reachability check.** `npm run content:check` now proves that every
  step of every chapter can actually be reached. It caught eight broken
  labels the first time it ran.
- **A playtest protocol.** `docs/m2-playtest.md` — who to ask, what to watch
  for, what to ask afterwards, and how to read the results.

### Fixed

- **Flags no longer leak between runs.** A chapter owns the flags it sets and
  clears them when it starts, so replaying Act I resolves the ending the
  player just chose instead of the one the last run chose.

## [0.1.0] - 2026-11-12

### Added

- **M0: the repository.** Toolchain, CI, Pages deployment, and `AGENTS.md`.
- **Dialogue runtime.** A typed script interpreter with labelled steps,
  choices, jumps, codex unlocks, stats and flags. Pure TypeScript, fully
  unit tested.
- **Dialogue box.** Typewriter reveal, name plate, speaker highlighting, and a
  heart-cursed choice menu.
- **Art pipeline.** A dependency-free pixel canvas and PNG encoder, a
  generated 5x7 bitmap font with Latin-1 accents, authored character sprites,
  and dithered backdrops for the bedroom and the Lyceum.
- **Content linter.** `npm run content:check` validates every script, codex
  reference and source list, and reports every problem at once.
- **Act I — The Desk.** The opening chapter, playable end to end.
- **Dream Journal.** A codex screen listing the ideas unlocked so far.
- **Save service.** Progress, unlocked codex entries and stats, with a
  corrupted or unavailable store degrading gracefully.
- **Verification.** 45 unit tests, 7 browser tests, and a screenshot harness
  for visual review.
