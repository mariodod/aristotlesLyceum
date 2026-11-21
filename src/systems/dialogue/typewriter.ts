/**
 * Reveals a string one character at a time.
 *
 * The reveal is driven by elapsed milliseconds rather than frames so the text
 * lands at the same speed on a 60 Hz and a 144 Hz display.
 */
export class Typewriter {
  private readonly text: string;
  private charactersPerSecond: number;
  private elapsed = 0;
  private revealed = 0;

  constructor(text: string, charactersPerSecond = 45) {
    this.text = text;
    this.charactersPerSecond = Math.max(1, charactersPerSecond);
  }

  update(deltaMs: number): void {
    if (this.revealed >= this.text.length) {
      return;
    }

    this.elapsed += deltaMs;
    const target = Math.min(
      this.text.length,
      Math.floor((this.elapsed * this.charactersPerSecond) / 1000),
    );

    this.revealed = target;
  }

  /** The part of the text that has been revealed so far. */
  /** Changes the reveal rate, keeping the characters already shown. */
  setSpeed(charactersPerSecond: number): void {
    this.charactersPerSecond = Math.max(1, charactersPerSecond);
    // Recompute the elapsed time so the next update reveals at the new rate
    // from the current position rather than jumping ahead.
    this.elapsed = (this.revealed / this.charactersPerSecond) * 1000;
  }

  get visibleText(): string {
    return this.text.slice(0, this.revealed);
  }

  get isComplete(): boolean {
    return this.revealed >= this.text.length;
  }

  /** Characters still hidden. */
  get remaining(): number {
    return Math.max(0, this.text.length - this.revealed);
  }

  /** Shows the whole line at once, which is what a confirm press should do. */
  revealAll(): void {
    this.revealed = this.text.length;
    this.elapsed = (this.text.length / this.charactersPerSecond) * 1000;
  }
}
