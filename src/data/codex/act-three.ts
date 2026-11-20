/**
 * Codex entries unlocked by Act III — The Long Walk.
 *
 * Each station answers the same question in a different place: what did
 * somebody do with Aristotle's idea? The origin names the work, the modern
 * field names where the argument still runs.
 */

import type { CodexEntry } from './types.ts';

export const ACT_THREE_CODEX: CodexEntry[] = [
  {
    id: 'alexandrian-method',
    title: 'The Alexandrian Method',
    titleKey: 'codex.alexandrian-method.title',
    originKey: 'codex.alexandrian-method.origin',
    modernKey: 'codex.alexandrian-method.modern',
    sourcesKey: 'codex.alexandrian-method.sources',
    author: 'alexandria-scribe',
    origin:
      'The scholars of the Library did not merely copy Aristotle. They collected the works, compared the manuscripts, noted the disagreements and assembled a catalogue. The habit of editing a text from more than one witness begins with them, and it is why the corpus survived at all.',
    modern:
      'Textual criticism and library science still work the same way: gather the witnesses, compare them, and record where they disagree. Every critical edition of Aristotle is a descendant of the shelves in Alexandria.',
    sources: ['Aristotle, Corpus', 'G.E.R. Lloyd, Aristotle: The Growth of a Tradition'],
  },
  {
    id: 'avicennan-essence',
    title: 'Essence and Existence',
    titleKey: 'codex.avicennan-essence.title',
    originKey: 'codex.avicennan-essence.origin',
    modernKey: 'codex.avicennan-essence.modern',
    sourcesKey: 'codex.avicennan-essence.sources',
    author: 'avicenna',
    origin:
      'Avicenna read Aristotle in Arabic and sharpened the distinction between what a thing is and that it is. Essence and accident became a tool for asking which features make a thing the kind of thing it is, and which merely happen to it. He kept the hierarchy and made it finer.',
    modern:
      'Ontologies in computer science ask the same question: which properties define a class and which are incidental? An entity-relationship diagram is Avicenna with a different vocabulary.',
    sources: ['Avicenna, The Book of Healing', 'Aristotle, Metaphysics Z'],
  },
  {
    id: 'aquinean-synthesis',
    title: 'Reason and Doctrine',
    titleKey: 'codex.aquinean-synthesis.title',
    originKey: 'codex.aquinean-synthesis.origin',
    modernKey: 'codex.aquinean-synthesis.modern',
    sourcesKey: 'codex.aquinean-synthesis.sources',
    author: 'aquinas',
    origin:
      'Aquinas argued that reason and revealed doctrine cannot finally contradict one another, because both come from the same source. He put Aristotle at the centre of Latin teaching, and for two centuries Aristotle was the authority rather than a question.',
    modern:
      'The argument about whether a tradition can be revised from inside is still live in religious thought and in law, where natural-law reasoning descends directly from this synthesis.',
    sources: ['Thomas Aquinas, Summa Theologiae', 'Aristotle, Nicomachean Ethics'],
  },
  {
    id: 'harveyan-correction',
    title: 'The Method Survives',
    titleKey: 'codex.harveyan-correction.title',
    originKey: 'codex.harveyan-correction.origin',
    modernKey: 'codex.harveyan-correction.modern',
    sourcesKey: 'codex.harveyan-correction.sources',
    author: 'harvey',
    origin:
      'Vesalius and Harvey corrected Aristotle by doing what he had told them to do: look. Dissection replaced the book as the authority on the body, and Harvey showed that the heart moves blood in a circuit. The conclusions were overturned; the habit of comparing a claim with a specimen was not.',
    modern:
      "Evidence-based medicine and experimental physiology are Aristotle's method turned against his anatomy. The lesson of Padua is that a method can outlive every conclusion it first produced.",
    sources: ['William Harvey, De Motu Cordis', 'Aristotle, Parts of Animals'],
  },
  {
    id: 'baconian-method',
    title: 'The New Organon',
    titleKey: 'codex.baconian-method.title',
    originKey: 'codex.baconian-method.origin',
    modernKey: 'codex.baconian-method.modern',
    sourcesKey: 'codex.baconian-method.sources',
    author: 'bacon',
    origin:
      'Bacon attacked the habit of treating an ancient book as the last word. His Novum Organum replaced appeal to authority with controlled experiment, and kept the adversarial structure of dialectic as a way of interrogating nature instead of an opponent.',
    modern:
      'The experimental method, preregistration and adversarial collaboration are this programme with instruments. Bacon was right about the method and often wrong about the details, which is exactly the point the dream is making.',
    sources: ['Francis Bacon, Novum Organum', 'Aristotle, Prior Analytics'],
  },
  {
    id: 'cartesian-doubt',
    title: 'The Method of Doubt',
    titleKey: 'codex.cartesian-doubt.title',
    originKey: 'codex.cartesian-doubt.origin',
    modernKey: 'codex.cartesian-doubt.modern',
    sourcesKey: 'codex.cartesian-doubt.sources',
    author: 'descartes',
    origin:
      'Descartes refused the authority of Aristotle entirely and rebuilt knowledge from what could not be doubted. Where Aristotle had asked what a thing is, Descartes asked what a mind can know. The authority died; the habit of taking a claim apart survived.',
    modern:
      "Foundational questions in epistemology and the use of radical doubt as a test are still Descartes' inheritance. His error about animals does not cancel the method any more than Aristotle's biology does.",
    sources: ['René Descartes, Discourse on Method', 'Aristotle, Metaphysics I'],
  },
  {
    id: 'kantian-categories',
    title: 'The Conditions of Experience',
    titleKey: 'codex.kantian-categories.title',
    originKey: 'codex.kantian-categories.origin',
    modernKey: 'codex.kantian-categories.modern',
    sourcesKey: 'codex.kantian-categories.sources',
    author: 'kant',
    origin:
      'Kant asked whether the categories Aristotle had listed are read off the world or contributed by the mind. His Critique of Pure Reason answers that experience is possible only because the mind brings its own structure to what it encounters, and that the thing in itself is not available to knowledge.',
    modern:
      'Cognitive science still asks how much of perception is supplied by the perceiver. The argument moved from philosophy into the study of attention, memory and the structures the brain brings to a scene.',
    sources: ['Immanuel Kant, Critique of Pure Reason', 'Aristotle, Categories'],
  },
  {
    id: 'darwinian-descent',
    title: 'Descent, Not Purpose',
    titleKey: 'codex.darwinian-descent.title',
    originKey: 'codex.darwinian-descent.origin',
    modernKey: 'codex.darwinian-descent.modern',
    sourcesKey: 'codex.darwinian-descent.sources',
    author: 'darwin',
    origin:
      "Darwin read Aristotle's natural history on the voyage and criticised it when he came home. Fixed species and final causes were replaced by descent with modification and selection. The greatest correction in the history of the subject was made with the same habit Aristotle had taught: collect specimens, compare them, write down what they do.",
    modern:
      "Evolutionary biology, biodiversity databases and the tree of life are the descendants of both men. Darwin kept Aristotle's question and changed the answer, which is the only way a tradition stays alive.",
    sources: ['Charles Darwin, On the Origin of Species', 'Aristotle, History of Animals'],
  },
];
