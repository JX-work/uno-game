import { COLORS } from './deck.js';
import { canPlayCard } from './rules.js';

// Pick a random color weighted by how many of each color AI holds.
// Falls back to a fully random COLORS pick if hand is all wilds.
function randomColor(hand) {
  const colored = hand.filter(c => c.color !== 'wild').map(c => c.color);
  const pool = colored.length > 0 ? colored : COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Returns { cardIndex, chosenColor } or null (meaning AI must draw).
// AI picks randomly from all legal cards — no scoring, no cheating.
export function getAIMove(hand, topCard, currentColor, pendingDrawCount) {
  const valid = hand
    .map((card, idx) => ({ card, idx }))
    .filter(({ card }) => canPlayCard(card, topCard, currentColor, pendingDrawCount));

  if (valid.length === 0) return null;

  const chosen = valid[Math.floor(Math.random() * valid.length)];
  const chosenColor =
    chosen.card.color === 'wild' ? randomColor(hand) : chosen.card.color;

  return { cardIndex: chosen.idx, chosenColor };
}

// Decide if AI should call UNO (exactly 1 card left after playing).
export function shouldAICallUno(hand) {
  return hand.length === 1;
}
