import { create } from 'zustand';
import { initGameState, canPlayCard, nextPlayerIndex, drawCards, checkWinner } from '../game/rules.js';
import { COLORS } from '../game/deck.js';
import { getAIMove, shouldAICallUno } from '../game/ai.js';
import { saveRecord } from '../utils/historyManager.js';

const AI_THINK_MIN = 800;
const AI_THINK_MAX = 1500;
const UNO_CATCH_WINDOW = 3000; // ms window to catch UNO

export const useGameStore = create((set, get) => ({
  // Phase: 'setup' | 'menu' | 'lobby' | 'waiting' | 'playing' | 'colorPicker' | 'gameover'
  phase: 'setup',

  // Game state
  players: [],
  deck: [],
  discardPile: [],
  currentPlayerIndex: 0,
  direction: 1,
  currentColor: 'red',
  pendingDrawCount: 0,
  pendingWildCard: null,
  winner: null,
  lastAction: null,
  unoCallable: false,
  unoCatchable: null,

  // Animation / effect state
  lastEffect: null,     // { type, targetIdx, sourceIdx, currentColor } — triggers CardEffectOverlay
  showUnoShout: null,   // { name } — triggers UnoShout overlay
  isAnimating: false,   // lock player input during critical animations

  // Room / multiplayer
  isMultiplayer: false,
  isHost: false,
  roomCode: null,
  localPlayerId: null,

  // Game tracking for history
  gameStartTime: null,
  roundCount: 0,

  // Notification toast
  toast: null,

  // Emoji event from multiplayer broadcast
  pendingEmojiEvent: null,

  // Multiplayer turn timer — set by host when currentPlayerIndex changes
  turnStartedAt: null,

  // ── Phase transitions ──────────────────────────────────────────────
  goToSetup: () => set({ phase: 'setup' }),
  goToMenu: () => set({ phase: 'menu' }),
  goToLobby: () => set({ phase: 'lobby' }),

  // ── Multiplayer game start (host pushes pre-computed state; non-host receives via Realtime) ──
  startMultiplayer: (gameState, localPlayerId, isHost) => {
    set({
      ...gameState,
      phase: 'playing',
      isMultiplayer: true,
      isHost,
      localPlayerId,
      winner: null,
      toast: null,
      unoCallable: false,
      unoCatchable: null,
      lastEffect: null,
      showUnoShout: null,
      isAnimating: false,
      gameStartTime: Date.now(),
      roundCount: 0,
      turnStartedAt: Date.now(),
    });
    // Only host drives AI turns
    if (isHost && gameState.players[gameState.currentPlayerIndex]?.isAI) {
      get()._scheduleAITurn();
    }
  },

  // ── Non-host receives game state from Supabase Realtime ───────────────
  loadStateFromRemote: (gameState) => {
    set((prev) => {
      const localPlayer = gameState.players?.find(p => p.id === prev.localPlayerId);
      // Recompute unoCallable locally — host's value is based on host's localPlayerId
      const unoCallable = !!(localPlayer?.hand?.length === 2 && !localPlayer?.hasCalledUno);
      return {
        ...gameState,
        // Preserve client identity — never override these from remote
        localPlayerId: prev.localPlayerId,
        isMultiplayer: prev.isMultiplayer,
        isHost: prev.isHost,
        // Animation lock is host-local UI state — always clear on receive so non-host
        // is never blocked from playing when isMyTurn becomes true
        isAnimating: false,
        gameStartTime: prev.gameStartTime || (gameState.phase === 'playing' ? Date.now() : null),
        unoCallable,
      };
    });
  },

  // ── Single-player game start ───────────────────────────────────────
  startSinglePlayer: (localPlayer, numAI) => {
    // Indices 6-8 are AI-only avatars (GreyCat, GoldenRetriever, Husky)
    const AI_CONFIGS = [
      { avatarIndex: 6, name: '灰猫探长', color: '#8890A8' },
      { avatarIndex: 7, name: '金毛冲冲', color: '#F0B828' },
      { avatarIndex: 8, name: '哈士奇二哈', color: '#6B7B9E' },
    ];
    const aiPlayers = Array.from({ length: numAI }, (_, i) => ({
      id: `ai_${i}`,
      name: AI_CONFIGS[i].name,
      avatarColor: AI_CONFIGS[i].color,
      avatarIndex: AI_CONFIGS[i].avatarIndex,
      isAI: true,
    }));

    const players = [
      { ...localPlayer, id: localPlayer.id || 'local', isAI: false },
      ...aiPlayers,
    ];

    const state = initGameState(players);
    set({
      ...state,
      phase: 'playing',
      isMultiplayer: false,
      localPlayerId: localPlayer.id || 'local',
      winner: null,
      toast: null,
      unoCallable: false,
      unoCatchable: null,
      lastEffect: null, showUnoShout: null, isAnimating: false,
      gameStartTime: Date.now(),
      roundCount: 0,
    });

    // If first player is AI, trigger AI turn
    if (state.players[state.currentPlayerIndex].isAI) {
      get()._scheduleAITurn();
    }
  },

  // ── Play a card ────────────────────────────────────────────────────
  playCard: (playerId, cardIndex, chosenColor = null) => {
    const s = get();
    const playerIdx = s.players.findIndex(p => p.id === playerId);
    if (playerIdx !== s.currentPlayerIndex) return;

    const player = s.players[playerIdx];
    const card = player.hand[cardIndex];
    if (!canPlayCard(card, s.discardPile[s.discardPile.length - 1], s.currentColor, s.pendingDrawCount)) return;

    const newHand = player.hand.filter((_, i) => i !== cardIndex);
    const newPlayers = s.players.map((p, i) =>
      i === playerIdx ? { ...p, hand: newHand, hasCalledUno: newHand.length === 1 ? p.hasCalledUno : false } : p
    );
    const newDiscard = [...s.discardPile, card];

    // Wild card needs color selection (unless AI already provided chosenColor)
    if ((card.type === 'wild' || card.type === 'wild4') && !chosenColor && !player.isAI) {
      set({
        players: newPlayers,
        discardPile: newDiscard,
        pendingWildCard: { card, playerIdx, cardIndex },
        phase: 'colorPicker',
      });
      return;
    }

    get()._applyCardEffect(card, playerIdx, newPlayers, newDiscard, chosenColor);
  },

  // Called after color picker resolves
  resolveWildColor: (color) => {
    const s = get();
    const { pendingWildCard } = s;
    if (!pendingWildCard) return;
    set({ pendingWildCard: null, phase: 'playing' });
    get()._applyCardEffect(pendingWildCard.card, pendingWildCard.playerIdx, s.players, s.discardPile, color);
  },

  _applyCardEffect: (card, playerIdx, players, discardPile, chosenColor) => {
    const s = get();
    let { direction, currentColor, pendingDrawCount } = s;
    const numPlayers = players.length;

    let nextIdx = nextPlayerIndex(playerIdx, numPlayers, direction);
    let newPendingDraw = 0;
    let skipNext = false;
    let toast = null;

    // Determine new color
    currentColor = (card.color === 'wild') ? (chosenColor || 'red') : card.color;

    switch (card.type) {
      case 'skip':
        skipNext = true;
        toast = `${players[nextIdx].name} skipped`;
        break;
      case 'reverse':
        direction = direction * -1;
        if (numPlayers === 2) {
          // With 2 players, Reverse acts like Skip
          skipNext = true;
        } else {
          nextIdx = nextPlayerIndex(playerIdx, numPlayers, direction);
        }
        break;
      case 'draw2':
        newPendingDraw = pendingDrawCount + 2;
        break;
      case 'wild4':
        newPendingDraw = pendingDrawCount + 4;
        break;
      default:
        break;
    }

    // If a player with pending draw can't stack, they must draw
    let updatedPlayers = players;
    if (skipNext || (card.type !== 'draw2' && card.type !== 'wild4')) {
      // Nothing special, next player's turn
    }

    // Advance to next player (skipping if needed)
    const finalNextIdx = skipNext
      ? nextPlayerIndex(nextIdx, numPlayers, direction)
      : nextIdx;

    // Check if someone has won
    const winner = checkWinner(updatedPlayers);

    if (winner) {
      saveRecord({
        players: updatedPlayers,
        winner,
        localPlayerId: s.localPlayerId,
        gameStartTime: s.gameStartTime,
        roundCount: s.roundCount + 1,
      });
    }

    // UNO check: if player just played down to 1 card without calling UNO.
    // AI is also catchable when shouldAICallUno returned false (the 30% forget case).
    const justPlayedPlayer = updatedPlayers[playerIdx];
    let unoCatchable = null;
    if (justPlayedPlayer.hand.length === 1 && !justPlayedPlayer.hasCalledUno) {
      unoCatchable = justPlayedPlayer.id;
      // Auto-clear catch window after 3 seconds
      setTimeout(() => {
        if (get().unoCatchable === justPlayedPlayer.id) {
          set({ unoCatchable: null });
        }
      }, UNO_CATCH_WINDOW);
    }

    // Build effect for overlay (non-number cards)
    const effectTypes = ['skip', 'reverse', 'draw2', 'wild4', 'wild'];
    const newEffect = effectTypes.includes(card.type)
      ? { type: card.type, targetIdx: finalNextIdx, sourceIdx: playerIdx, currentColor }
      : null;

    if (newEffect) {
      set({ isAnimating: true });
      setTimeout(() => set({ lastEffect: null, isAnimating: false }), 1800);
    }

    set({
      players: updatedPlayers,
      discardPile,
      direction,
      currentColor,
      pendingDrawCount: newPendingDraw,
      currentPlayerIndex: winner ? playerIdx : finalNextIdx,
      winner: winner || null,
      phase: winner ? 'gameover' : 'playing',
      lastAction: card.id,
      toast,
      unoCallable: false,
      unoCatchable,
      lastEffect: newEffect,
      roundCount: s.roundCount + 1,
      turnStartedAt: winner ? null : Date.now(),
    });

    if (!winner) {
      const nextPlayer = updatedPlayers[finalNextIdx];
      // If next player is AI and draw is forced, resolve it
      if (nextPlayer.isAI) {
        get()._scheduleAITurn();
      } else if (newPendingDraw > 0) {
        // Human has pending draw — they can stack or must draw
        // unoCallable check
        get()._checkUnoCallable(finalNextIdx);
      } else {
        get()._checkUnoCallable(finalNextIdx);
      }
    }
  },

  // ── Draw card(s) ──────────────────────────────────────────────────
  drawCard: (playerId) => {
    const s = get();
    const playerIdx = s.players.findIndex(p => p.id === playerId);
    if (playerIdx !== s.currentPlayerIndex) return;

    const count = s.pendingDrawCount > 0 ? s.pendingDrawCount : 1;
    const { drawn, deck, discardPile } = drawCards(s.deck, s.discardPile, count);

    const updatedPlayers = s.players.map((p, i) =>
      i === playerIdx ? { ...p, hand: [...p.hand, ...drawn], hasCalledUno: false } : p
    );

    const numPlayers = s.players.length;
    const skipAfterDraw = s.pendingDrawCount > 0;

    let finalNextIdx;
    if (skipAfterDraw) {
      finalNextIdx = nextPlayerIndex(playerIdx, numPlayers, s.direction);
    } else {
      // Check if drawn card can be played immediately
      const drawnCard = drawn[0];
      const topCard = discardPile[discardPile.length - 1];
      const canPlay = drawnCard && canPlayCard(drawnCard, topCard, s.currentColor, 0);
      if (canPlay) {
        // Stay on same player to let them play it
        finalNextIdx = playerIdx;
      } else {
        finalNextIdx = nextPlayerIndex(playerIdx, numPlayers, s.direction);
      }
    }

    set({
      players: updatedPlayers,
      deck,
      discardPile,
      pendingDrawCount: 0,
      currentPlayerIndex: finalNextIdx,
      unoCallable: false,
      toast: null,
      turnStartedAt: Date.now(),
    });

    const nextPlayer = updatedPlayers[finalNextIdx];
    if (nextPlayer.isAI) get()._scheduleAITurn();
    else get()._checkUnoCallable(finalNextIdx);
  },

  // ── UNO actions ───────────────────────────────────────────────────
  callUno: (playerId) => {
    const s = get();
    const playerIdx = s.players.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return;
    const updatedPlayers = s.players.map((p, i) =>
      i === playerIdx ? { ...p, hasCalledUno: true } : p
    );
    const playerName = s.players[playerIdx]?.name;
    set({ players: updatedPlayers, unoCallable: false, unoCatchable: null,
      showUnoShout: { name: playerName } });
    setTimeout(() => set({ showUnoShout: null }), 2000);
  },

  catchUno: (caughtPlayerId) => {
    const s = get();
    if (s.unoCatchable !== caughtPlayerId) return;
    const playerIdx = s.players.findIndex(p => p.id === caughtPlayerId);
    const { drawn, deck, discardPile } = drawCards(s.deck, s.discardPile, 2);
    const updatedPlayers = s.players.map((p, i) =>
      i === playerIdx ? { ...p, hand: [...p.hand, ...drawn] } : p
    );
    set({ players: updatedPlayers, deck, discardPile, unoCatchable: null, toast: `${s.players[playerIdx].name} caught!` });
  },

  // ── Internals ─────────────────────────────────────────────────────
  _checkUnoCallable: (playerIdx) => {
    const s = get();
    const player = s.players[playerIdx];
    // Show UNO button when player is about to play their second-to-last card (hand = 2)
    if (player && player.id === s.localPlayerId && player.hand.length === 2 && !player.hasCalledUno) {
      set({ unoCallable: true });
    }
  },

  _scheduleAITurn: () => {
    const s = get();
    // In multiplayer only the host drives AI; non-hosts skip
    if (s.isMultiplayer && !s.isHost) return;
    const delay = AI_THINK_MIN + Math.random() * (AI_THINK_MAX - AI_THINK_MIN);
    setTimeout(() => get()._executeAITurn(), delay);
  },

  _executeAITurn: () => {
    const s = get();
    if (s.phase !== 'playing') return;
    const playerIdx = s.currentPlayerIndex;
    const player = s.players[playerIdx];
    if (!player || !player.isAI) return;

    const topCard = s.discardPile[s.discardPile.length - 1];
    const move = getAIMove(player.hand, topCard, s.currentColor, s.pendingDrawCount);

    if (move === null) {
      // Draw
      get().drawCard(player.id);
    } else {
      // Check if AI needs to call UNO before playing
      const newHand = player.hand.filter((_, i) => i !== move.cardIndex);
      if (shouldAICallUno(newHand)) {
        const updatedPlayers = s.players.map((p, i) =>
          i === playerIdx ? { ...p, hasCalledUno: true } : p
        );
        const playerName = s.players[playerIdx]?.name;
        set({ players: updatedPlayers, showUnoShout: { name: playerName } });
        setTimeout(() => set({ showUnoShout: null }), 2000);
      }
      get().playCard(player.id, move.cardIndex, move.chosenColor);
    }
  },

  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),

  setEmojiEvent: (event) => set({ pendingEmojiEvent: event }),
  clearEmojiEvent: () => set({ pendingEmojiEvent: null }),

  // Called when 3-minute game timer expires — settles by fewest cards
  endByTimeout: () => {
    const s = get();
    if (s.phase !== 'playing') return;
    const winnerPlayer = s.players.reduce((best, p) =>
      p.hand.length < best.hand.length ? p : best
    );
    saveRecord({
      players: s.players,
      winner: winnerPlayer,
      localPlayerId: s.localPlayerId,
      gameStartTime: s.gameStartTime,
      roundCount: s.roundCount,
    });
    set({
      winner: winnerPlayer,
      phase: 'gameover',
      toast: '⏰ 时间到！',
    });
  },

  resetGame: () => set({
    phase: 'menu',
    players: [], deck: [], discardPile: [],
    currentPlayerIndex: 0, direction: 1,
    currentColor: 'red', pendingDrawCount: 0,
    pendingWildCard: null, winner: null, lastAction: null,
    toast: null, unoCallable: false, unoCatchable: null,
    lastEffect: null, showUnoShout: null, isAnimating: false,
    gameStartTime: null, roundCount: 0, pendingEmojiEvent: null,
    isMultiplayer: false, isHost: false, turnStartedAt: null,
  }),

  restartGame: () => {
    const { players, localPlayerId } = get();
    const samePlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      avatarColor: p.avatarColor,
      avatarIndex: p.avatarIndex ?? 0,
      isAI: p.isAI,
    }));
    const state = initGameState(samePlayers);
    set({
      ...state,
      phase: 'playing',
      isMultiplayer: false,
      isHost: false,
      localPlayerId,
      winner: null,
      toast: null,
      unoCallable: false,
      unoCatchable: null,
      lastEffect: null,
      showUnoShout: null,
      isAnimating: false,
      gameStartTime: Date.now(),
      roundCount: 0,
    });
    if (state.players[state.currentPlayerIndex].isAI) {
      get()._scheduleAITurn();
    }
  },
}));
