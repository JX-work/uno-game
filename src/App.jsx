import { useState, useCallback, useRef, useEffect } from 'react';
import { LangProvider } from './i18n/index.jsx';
import { useGameStore } from './store/gameStore.js';
import { useUserStore } from './store/userStore.js';
import { useMultiplayer } from './hooks/useMultiplayer.js';
import { initGameState } from './game/rules.js';
import NicknameSetup from './components/NicknameSetup.jsx';
import MainMenu from './components/MainMenu.jsx';
import OpponentSetup from './components/OpponentSetup.jsx';
import Lobby from './components/Lobby.jsx';
import CreateRoom from './components/CreateRoom.jsx';
import JoinRoom from './components/JoinRoom.jsx';
import WaitingRoom from './components/WaitingRoom.jsx';
import GameBoard from './components/GameBoard.jsx';
import GameOver from './components/GameOver.jsx';

// Fields that are serialised into rooms.game_state (no client-specific data)
function extractGameState(s) {
  return {
    players:             s.players,
    deck:                s.deck,
    discardPile:         s.discardPile,
    currentPlayerIndex:  s.currentPlayerIndex,
    direction:           s.direction,
    currentColor:        s.currentColor,
    pendingDrawCount:    s.pendingDrawCount,
    pendingWildCard:     s.pendingWildCard,
    winner:              s.winner,
    lastAction:          s.lastAction,
    phase:               s.phase,
    unoCallable:         s.unoCallable,
    unoCatchable:        s.unoCatchable,
    lastEffect:          s.lastEffect,
    showUnoShout:        s.showUnoShout,
    isAnimating:         false,   // never sync host's animation lock — non-host manages locally
    toast:               s.toast,
    turnStartedAt:       s.turnStartedAt,
    roundCount:          s.roundCount,
  };
}

function AppInner() {
  const { phase, goToMenu, startSinglePlayer, isMultiplayer, isHost } = useGameStore();
  const { nickname, avatarIndex, avatarColor } = useUserStore();

  const [showOpponentSetup, setShowOpponentSetup] = useState(false);
  const [lobbyScreen, setLobbyScreen] = useState('main');
  const [roomData, setRoomData] = useState(null);
  const [stableId] = useState(() => nickname + '_' + Math.random().toString(36).slice(2, 7));

  // Ref so onActionReceived can call updateGameState without circular dep
  const updateGameStateRef = useRef(null);

  const {
    createRoom, joinRoom, setReady, updateGameState, sendAction,
    leaveRoom, sendEmojiEmote, sendRestartInvite, isConfigured,
  } = useMultiplayer({
    localPlayerId: stableId,
    playerName: nickname,
    avatarColor,
    avatarIndex,

    // HOST receives non-host player actions from game_actions table
    onActionReceived: (playerId, actionType, actionData) => {
      if (!useGameStore.getState().isHost) return;
      const store = useGameStore.getState();
      console.log('[host] 处理 action:', actionType, 'from', playerId, actionData);
      switch (actionType) {
        case 'play_card':
          store.playCard(playerId, actionData.cardIndex, actionData.chosenColor ?? null);
          break;
        case 'draw_card':
          store.drawCard(playerId);
          break;
        case 'call_uno':
          store.callUno(playerId);
          break;
        case 'catch_uno':
          store.catchUno(actionData.targetId);
          break;
        default:
          console.warn('[host] 未知 action:', actionType);
      }
      // Push updated state to all clients (also covered by Zustand subscription below,
      // but calling explicitly here gives the fastest possible round-trip)
      console.log('[host] action 处理完毕，触发写入');
      updateGameStateRef.current?.();
    },

    onGameStateUpdate: (gameState, room) => {
      if (room?.status !== 'playing' || !gameState || !Object.keys(gameState).length) return;
      // Host ignores its own Realtime bounce-back
      if (roomData?.isHost) return;
      const store = useGameStore.getState();
      if (!store.isMultiplayer) {
        console.log('[client] 首次进入游戏，stableId:', stableId);
        store.startMultiplayer(gameState, stableId, false);
      } else {
        console.log('[client] 收到新状态，更新本地, phase:', gameState.phase,
          'idx:', gameState.currentPlayerIndex, 'discardLen:', gameState.discardPile?.length);
        store.loadStateFromRemote(gameState);
      }
    },

    onRoomUpdate: (players) => {
      setRoomData(prev => prev ? { ...prev, players } : null);
    },

    onEmojiReceived: (playerId, emojiKey) => {
      useGameStore.getState().setEmojiEvent({ playerId, emojiKey });
    },

    onRestartReceived: () => {
      useGameStore.setState({ phase: 'waiting' });
    },
  });

  // Sync host's current game state to Supabase → triggers Realtime for all clients.
  // useCallback keeps the reference stable so the Zustand subscription below doesn't re-register.
  const syncGameState = useCallback(() => {
    const s = useGameStore.getState();
    updateGameState(extractGameState(s));
  }, [updateGameState]);
  // Keep the ref current so onActionReceived (above) can always call the latest version
  updateGameStateRef.current = syncGameState;

  // Broad auto-sync: fires on ANY Zustand state change while host is in multiplayer.
  // 50 ms debounce batches rapid synchronous set() calls (e.g. isAnimating:true then
  // the full card-play update) into one Supabase write.
  // Covers: card played, card drawn, AI turns, UNO shout, game over, color picker —
  // everything, without needing onAfterAction prop drilling.
  useEffect(() => {
    if (!isMultiplayer || !isHost) return;
    let syncTimeout = null;
    const unsubscribe = useGameStore.subscribe(() => {
      const s = useGameStore.getState();
      if (s.phase !== 'playing' && s.phase !== 'colorPicker' && s.phase !== 'gameover') return;
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        console.log('[sync] 触发写入, phase:', s.phase, 'idx:', s.currentPlayerIndex,
          'discardLen:', s.discardPile?.length);
        syncGameState();
      }, 50);
    });
    return () => { unsubscribe(); clearTimeout(syncTimeout); };
  }, [isMultiplayer, isHost, syncGameState]);

  // ── Room handlers ────────────────────────────────────────────────────

  async function handleCreateRoom(opts) {
    if (!isConfigured) {
      const code = opts.roomCode || Math.random().toString(36).substring(2, 8).toUpperCase();
      setRoomData({
        roomCode: code, roomId: 'local', isHost: true, maxPlayers: opts.maxPlayers,
        players: [{ player_id: stableId, player_name: nickname, avatar_color: avatarColor, avatar_index: avatarIndex, is_ready: true }],
        allowAI: opts.allowAI,
      });
      useGameStore.setState({ phase: 'waiting' });
      return {};
    }
    const result = await createRoom(opts);
    if (!result.error) {
      setRoomData({
        roomCode: result.roomCode, roomId: result.roomId, isHost: true, maxPlayers: opts.maxPlayers,
        players: [{ player_id: stableId, player_name: nickname, avatar_color: avatarColor, avatar_index: avatarIndex, is_ready: true }],
        allowAI: opts.allowAI,
      });
      useGameStore.setState({ phase: 'waiting' });
    }
    return result;
  }

  async function handleJoinRoom(code) {
    if (!isConfigured) {
      return { error: 'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable multiplayer.' };
    }
    const result = await joinRoom(code);
    if (!result.error) {
      const maxPlayers = result.room?.max_players || 4;
      setRoomData({
        roomCode: result.roomCode, roomId: result.roomId, isHost: false, maxPlayers,
        players: [],
      });
      useGameStore.setState({ phase: 'waiting' });
    }
    return result;
  }

  async function handleStartRoom() {
    if (!roomData) return;
    const { players, maxPlayers, allowAI } = roomData;

    // Real human players from room_players (Supabase data)
    const humanPlayers = players.map(p => ({
      id: p.player_id,
      name: p.player_name,
      avatarColor: p.avatar_color,
      avatarIndex: p.avatar_index ?? 0,
      isAI: false,
    }));

    // AI fills empty slots only when the room allows it
    const AI_CONFIGS = [
      { avatarIndex: 6, name: '灰猫探长', color: '#8890A8' },
      { avatarIndex: 7, name: '金毛冲冲', color: '#F0B828' },
      { avatarIndex: 8, name: '哈士奇二哈', color: '#6B7B9E' },
    ];
    const aiCount = allowAI ? Math.max(0, maxPlayers - humanPlayers.length) : 0;
    const aiPlayers = Array.from({ length: aiCount }, (_, i) => ({
      id: `ai_${i}`,
      name: AI_CONFIGS[i % 3].name,
      avatarColor: AI_CONFIGS[i % 3].color,
      avatarIndex: AI_CONFIGS[i % 3].avatarIndex,
      isAI: true,
    }));

    // Put local player first for best UX
    const allPlayers = [...humanPlayers, ...aiPlayers];
    const localIdx = allPlayers.findIndex(p => p.id === stableId);
    const orderedPlayers = localIdx > 0
      ? [allPlayers[localIdx], ...allPlayers.filter((_, i) => i !== localIdx)]
      : allPlayers;

    const gameState = initGameState(orderedPlayers);

    // Apply locally for host immediately
    useGameStore.getState().startMultiplayer(gameState, stableId, true);

    // Push to Supabase → triggers Realtime for all non-host clients
    await updateGameState(extractGameState(useGameStore.getState()));
  }

  async function handleLeaveRoom() {
    await leaveRoom();
    setRoomData(null);
    setLobbyScreen('main');
    goToMenu();
  }

  function handleSinglePlayer(numAI) {
    startSinglePlayer({ name: nickname, avatarColor, avatarIndex }, numAI);
    setShowOpponentSetup(false);
  }

  function handleSendEmoji(playerId, emojiKey) {
    sendEmojiEmote(playerId, emojiKey);
  }

  function handleRestartInvite() {
    sendRestartInvite();
    useGameStore.setState({ phase: 'waiting' });
  }

  const handleGoToMenu = useCallback(() => {
    setLobbyScreen('main');
    goToMenu();
  }, [goToMenu]);

  return (
    <div className="app-root">
      {phase === 'setup' && <NicknameSetup />}

      {phase === 'menu' && !showOpponentSetup && (
        <MainMenu onSinglePlayer={() => setShowOpponentSetup(true)} />
      )}
      {phase === 'menu' && showOpponentSetup && (
        <OpponentSetup
          onBack={() => setShowOpponentSetup(false)}
          onStart={handleSinglePlayer}
        />
      )}

      {phase === 'lobby' && lobbyScreen === 'main' && (
        <Lobby
          onCreate={() => setLobbyScreen('create')}
          onJoin={() => setLobbyScreen('join')}
          onBack={handleGoToMenu}
        />
      )}
      {phase === 'lobby' && lobbyScreen === 'create' && (
        <CreateRoom onCreateRoom={handleCreateRoom} onBack={() => setLobbyScreen('main')} />
      )}
      {phase === 'lobby' && lobbyScreen === 'join' && (
        <JoinRoom onJoinRoom={handleJoinRoom} onBack={() => setLobbyScreen('main')} />
      )}

      {phase === 'waiting' && roomData && (
        <WaitingRoom
          roomCode={roomData.roomCode}
          players={roomData.players}
          localPlayerId={stableId}
          isHost={roomData.isHost}
          maxPlayers={roomData.maxPlayers}
          onReady={(ready) => setReady(ready)}
          onStart={handleStartRoom}
          onLeave={handleLeaveRoom}
        />
      )}

      {(phase === 'playing' || phase === 'colorPicker') && (
        <GameBoard
          onSendEmoji={handleSendEmoji}
          onRestartInvite={handleRestartInvite}
          // Host: callback after local action → syncs state to Supabase
          onAfterAction={isMultiplayer && isHost ? syncGameState : undefined}
          // Non-host: callback to send action → host processes it
          onSendAction={isMultiplayer && !isHost ? sendAction : undefined}
        />
      )}

      {phase === 'gameover' && (
        <>
          <GameBoard
            onSendEmoji={handleSendEmoji}
            onRestartInvite={handleRestartInvite}
            onAfterAction={isMultiplayer && isHost ? syncGameState : undefined}
            onSendAction={isMultiplayer && !isHost ? sendAction : undefined}
          />
          <GameOver />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}
