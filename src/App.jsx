import { useState, useCallback } from 'react';
import { LangProvider } from './i18n/index.jsx';
import { useGameStore } from './store/gameStore.js';
import { useUserStore } from './store/userStore.js';
import { useMultiplayer } from './hooks/useMultiplayer.js';
import { useSettingsStore } from './store/settingsStore.js';
import NicknameSetup from './components/NicknameSetup.jsx';
import MainMenu from './components/MainMenu.jsx';
import OpponentSetup from './components/OpponentSetup.jsx';
import Lobby from './components/Lobby.jsx';
import CreateRoom from './components/CreateRoom.jsx';
import JoinRoom from './components/JoinRoom.jsx';
import WaitingRoom from './components/WaitingRoom.jsx';
import GameBoard from './components/GameBoard.jsx';
import GameOver from './components/GameOver.jsx';

function AppInner() {
  const { phase, goToMenu, startSinglePlayer } = useGameStore();
  const { nickname, avatarIndex, avatarColor } = useUserStore();

  const [showOpponentSetup, setShowOpponentSetup] = useState(false);
  const [lobbyScreen, setLobbyScreen] = useState('main'); // 'main' | 'create' | 'join'
  const [roomData, setRoomData] = useState(null);
  const [stableId] = useState(() => nickname + '_' + Math.random().toString(36).slice(2, 7));

  const { createRoom, joinRoom, setReady, startRoom, leaveRoom, sendEmojiEmote, sendRestartInvite, isConfigured } = useMultiplayer({
    localPlayerId: stableId,
    playerName: nickname,
    avatarColor,
    onGameStateUpdate: (gameState, room) => {
      if (room?.status === 'playing' && gameState && Object.keys(gameState).length > 0) {
        useGameStore.setState({ ...gameState, phase: 'playing', localPlayerId: stableId });
      }
    },
    onRoomUpdate: (players) => {
      setRoomData(prev => prev ? { ...prev, players } : null);
    },
    onEmojiReceived: (playerId, emojiKey) => {
      useGameStore.getState().setEmojiEvent({ playerId, emojiKey });
    },
    onRestartReceived: () => {
      // Non-host clients: go back to waiting room when host triggers restart
      useGameStore.setState({ phase: 'waiting' });
    },
  });

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

    const humanPlayers = players.map(p => ({
      id: p.player_id,
      name: p.player_name,
      avatarColor: p.avatar_color,
      avatarIndex: p.avatar_index ?? 0,
      isAI: false,
    }));

    const aiSlots = allowAI ? maxPlayers - humanPlayers.length : 0;
    const AI_CONFIGS = [
      { avatarIndex: 6, name: '灰猫探长', color: '#8890A8' },
      { avatarIndex: 7, name: '金毛冲冲', color: '#F0B828' },
      { avatarIndex: 8, name: '哈士奇二哈', color: '#6B7B9E' },
    ];
    const aiPlayers = Array.from({ length: aiSlots }, (_, i) => ({
      id: `ai_${i}`,
      name: AI_CONFIGS[i % 3].name,
      avatarColor: AI_CONFIGS[i % 3].color,
      avatarIndex: AI_CONFIGS[i % 3].avatarIndex,
      isAI: true,
    }));

    const allPlayers = [...humanPlayers, ...aiPlayers];
    const localIdx = allPlayers.findIndex(p => p.id === stableId);
    const orderedPlayers = localIdx > 0
      ? [allPlayers[localIdx], ...allPlayers.filter((_, i) => i !== localIdx)]
      : allPlayers;

    useGameStore.getState().startSinglePlayer(
      { name: nickname, avatarColor, avatarIndex, id: stableId },
      allPlayers.length - 1,
    );
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
    // Host also goes back to waiting room
    useGameStore.setState({ phase: 'waiting' });
  }

  // Reset lobby screen when leaving lobby phase
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
        <CreateRoom
          onCreateRoom={handleCreateRoom}
          onBack={() => setLobbyScreen('main')}
        />
      )}
      {phase === 'lobby' && lobbyScreen === 'join' && (
        <JoinRoom
          onJoinRoom={handleJoinRoom}
          onBack={() => setLobbyScreen('main')}
        />
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
        />
      )}
      {phase === 'gameover' && (
        <>
          <GameBoard
            onSendEmoji={handleSendEmoji}
            onRestartInvite={handleRestartInvite}
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
