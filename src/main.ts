import './style.css';
import { createGame } from './game.ts';

const game = createGame();
const canvas = game.canvas;

canvas.setAttribute(
  'aria-label',
  "Aristotle's Lyceum game canvas. Press Z or Enter to confirm, and the up and down arrows to move between choices.",
);
canvas.setAttribute('role', 'application');
canvas.setAttribute('tabindex', '0');

canvas.focus();

document.querySelector('#boot-note')?.remove();

if (import.meta.env.DEV) {
  // A handle for the browser QA scripts. It never reaches a production build.
  (window as unknown as { __LYCEUM_GAME__?: typeof game }).__LYCEUM_GAME__ = game;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}
