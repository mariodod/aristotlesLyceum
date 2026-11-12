import { describe, expect, it } from 'vitest';
import { Typewriter } from '../../src/systems/dialogue/typewriter.ts';

describe('Typewriter', () => {
  it('starts with nothing revealed', () => {
    const typewriter = new Typewriter('hello', 10);
    expect(typewriter.visibleText).toBe('');
    expect(typewriter.isComplete).toBe(false);
  });

  it('reveals characters as time passes', () => {
    const typewriter = new Typewriter('hello', 10);
    typewriter.update(500);
    expect(typewriter.visibleText).toBe('hello');
    expect(typewriter.isComplete).toBe(true);
  });

  it('reveals nothing before enough time has passed', () => {
    const typewriter = new Typewriter('hello', 10);
    typewriter.update(50);
    expect(typewriter.visibleText).toBe('');
  });

  it('reveals the whole line on demand', () => {
    const typewriter = new Typewriter('hello', 10);
    typewriter.revealAll();
    expect(typewriter.visibleText).toBe('hello');
    expect(typewriter.isComplete).toBe(true);
    expect(typewriter.remaining).toBe(0);
  });

  it('reports how much is left', () => {
    const typewriter = new Typewriter('hello', 10);
    typewriter.update(100);
    expect(typewriter.remaining).toBe(4);
  });

  it('does not run past the end of the text', () => {
    const typewriter = new Typewriter('hi', 10);
    typewriter.update(10_000);
    expect(typewriter.visibleText).toBe('hi');
  });
});
