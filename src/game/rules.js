import { COLORS, createDeck, shuffleDeck } from './deck.js';

// Whether a card can be played given the top of the discard pile and current active color.
// If pendingDrawCount > 0, only draw-stacking cards are legal.
export function canPlayCard(card, topCard, currentColor, pendingDrawCount) {
  if (pendingDrawCount > 0) {
    // Stacking mode: only same-type draw card allowed
    if (topCard.type === 'draw2') return card.type === 'draw2';
    if (topCard.type === 'wild4') return card.type === 'wild4';
    return false;
  }
  if (card.type === 'wild' || card.type === 'wild4') return true;
  if (card.color === currentColor) return true;
  if (card.type !== 'number' && card.type === topCard.type) return true;
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;
  return false;
}

// Returns player index after applying direction and skip logic.
export function nextPlayerIndex(current, numPlayers, direction, skip = 0) {
  let idx = current;
  for (let i = 0; i <= skip; i++) {
    idx = ((idx + direction) % numPlayers + numPlayers) % numPlayers;
  }
  return idx;
}

// Deal initial hands (7 cards each), return { hands, deck }.
export function dealCards(deck, numPlayers) {
  const mutableDeck = [...deck];
  const hands = Array.from({ length: numPlayers }, () => []);
  for (let i = 0; i < 7; i++) {
    for (let p = 0; p < numPlayers; p++) {
      hands[p].push(mutableDeck.pop());
    }
  }
  return { hands, deck: mutableDeck };
}

// Draw `count` cards from deck, recycling discard pile if needed.
export function drawCards(deck, discardPile, count) {
  let mDeck = [...deck];
  let mDiscard = [...discardPile];
  const drawn = [];

  for (let i = 0; i < count; i++) {
    if (mDeck.length === 0) {
      if (mDiscard.length <= 1) break; // nothing left
      const topCard = mDiscard[mDiscard.length - 1];
      const reshuffled = shuffleDeck(mDiscard.slice(0, mDiscard.length - 1));
      mDeck = reshuffled;
      mDiscard = [topCard];
    }
    drawn.push(mDeck.pop());
  }

  return { drawn, deck: mDeck, discardPile: mDiscard };
}

// Returns the initial discard card (redraws if the first flip is a wild).
export function getStartCard(deck) {
  const mDeck = [...deck];
  let startCard;
  do {
    startCard = mDeck.pop();
  } while ((startCard.type === 'wild' || startCard.type === 'wild4') && mDeck.length > 0);
  return { startCard, deck: mDeck };
}

// Initialize a fresh game state for `players` array (each has id, name, avatarColor, isAI).
export function initGameState(players) {
  const fullDeck = createDeck();
  const { hands, deck: deckAfterDeal } = dealCards(fullDeck, players.length);
  const { startCard, deck } = getStartCard(deckAfterDeal);

  const gamePlayers = players.map((p, i) => ({
    ...p,
    hand: hands[i],
    hasCalledUno: false,
  }));

  // If the start card is a Reverse with 2 players it acts like a Skip
  let direction = 1;
  let currentPlayerIndex = 0;
  let pendingDrawCount = 0;
  let skipFirst = false;

  if (startCard.type === 'reverse') {
    direction = -1;
    if (players.length === 2) skipFirst = true;
  } else if (startCard.type === 'skip') {
    skipFirst = true;
  } else if (startCard.type === 'draw2') {
    pendingDrawCount = 2;
    skipFirst = true;
  }

  if (skipFirst) {
    currentPlayerIndex = nextPlayerIndex(0, players.length, direction, 0);
    // Apply pending draw to skipped player
    if (pendingDrawCount > 0) {
      const { drawn, deck: d2, discardPile: dp2 } = drawCards(deck, [startCard], pendingDrawCount);
      gamePlayers[0].hand.push(...drawn);
      return {
        players: gamePlayers,
        deck: d2,
        discardPile: dp2.length ? dp2 : [startCard],
        currentPlayerIndex,
        direction,
        currentColor: startCard.color,
        pendingDrawCount: 0,
        pendingWildCard: null,
        winner: null,
        lastAction: null,
      };
    }
  }

  return {
    players: gamePlayers,
    deck,
    discardPile: [startCard],
    currentPlayerIndex,
    direction,
    currentColor: startCard.color,
    pendingDrawCount,
    pendingWildCard: null,
    winner: null,
    lastAction: null,
  };
}

// Check if a player has won (empty hand).
export function checkWinner(players) {
  return players.find(p => p.hand.length === 0) || null;
}
