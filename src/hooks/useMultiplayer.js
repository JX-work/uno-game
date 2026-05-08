/**
 * Supabase multiplayer hook.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * Run schema.sql in Supabase SQL Editor before use.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase as sb, isSupabaseConfigured } from '../lib/supabase.js';
import { useGameStore } from '../store/gameStore.js';

function genRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useMultiplayer({
  localPlayerId, playerName, avatarColor, avatarIndex = 0,
  onGameStateUpdate, onRoomUpdate, onEmojiReceived, onRestartReceived,
  onActionReceived,
}) {
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);
  const roomIdRef = useRef(null);

  // Always-fresh callback refs — avoids stale closure in realtime handlers
  const onRoomUpdateRef        = useRef(onRoomUpdate);
  const onGameStateUpdateRef   = useRef(onGameStateUpdate);
  const onEmojiReceivedRef     = useRef(onEmojiReceived);
  const onRestartReceivedRef   = useRef(onRestartReceived);
  const onActionReceivedRef    = useRef(onActionReceived);
  onRoomUpdateRef.current      = onRoomUpdate;
  onGameStateUpdateRef.current = onGameStateUpdate;
  onEmojiReceivedRef.current   = onEmojiReceived;
  onRestartReceivedRef.current = onRestartReceived;
  onActionReceivedRef.current  = onActionReceived;

  const isConfigured = isSupabaseConfigured;

  async function fetchRoomPlayers(roomId) {
    if (!sb) return;
    const { data, error } = await sb.from('room_players').select('*').eq('room_id', roomId);
    console.log('[fetchRoomPlayers] data:', data, 'error:', error);
    onRoomUpdateRef.current?.(data || []);
  }

  function subscribeToRoom(roomId) {
    if (!sb) return;
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const channel = sb.channel(`room:${roomId}`)
      // ── rooms: game_state sync ──────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          console.log('[room status]', payload.new?.status,
            '| game_state 字段数:', payload.new?.game_state ? Object.keys(payload.new.game_state).length : 0);
          if (payload.new) {
            onGameStateUpdateRef.current?.(payload.new.game_state, payload.new);
          }
        },
      )
      // ── room_players: waiting-room roster ─────────────────────────────
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => fetchRoomPlayers(roomId),
      )
      // ── game_actions: non-host → host ─────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_actions', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!payload.new) return;
          const { player_id, action_type, action_data } = payload.new;
          console.log('[action] 收到 game_action:', action_type, 'from', player_id);
          onActionReceivedRef.current?.(player_id, action_type, action_data ?? {});
        },
      )
      // ── broadcast: emoji / restart ────────────────────────────────────
      .on('broadcast', { event: 'emoji' }, ({ payload }) => {
        if (payload?.playerId !== localPlayerId) {
          onEmojiReceivedRef.current?.(payload.playerId, payload.emojiKey);
        }
      })
      .on('broadcast', { event: 'restart' }, ({ payload }) => {
        if (payload?.from !== localPlayerId) {
          onRestartReceivedRef.current?.();
        }
      })
      .subscribe((status) => {
        const ok = status === 'SUBSCRIBED';
        setConnected(ok);
        if (ok) fetchRoomPlayers(roomId);
      });

    channelRef.current = channel;
  }

  const createRoom = useCallback(async ({ maxPlayers = 4, allowAI = true } = {}) => {
    if (!sb) return { error: 'Supabase not configured' };

    const code = genRoomCode();
    const { data, error } = await sb.from('rooms').insert({
      code,
      host_player_id: localPlayerId,
      max_players: maxPlayers,
      allow_ai: allowAI,
      status: 'waiting',
      game_state: {},
    }).select().single();

    if (error) return { error: error.message };

    roomIdRef.current = data.id;
    await sb.from('room_players').insert({
      room_id: data.id,
      player_id: localPlayerId,
      player_name: playerName,
      avatar_color: avatarColor,
      avatar_index: avatarIndex,
      is_ready: true,
    });

    subscribeToRoom(data.id);
    return { roomCode: code, roomId: data.id };
  }, [localPlayerId, playerName, avatarColor, avatarIndex]);

  const joinRoom = useCallback(async (code) => {
    if (!sb) return { error: 'Supabase not configured' };

    console.log('[joinRoom] 1. 查询房间 code:', code.toUpperCase());
    const { data: room, error: roomErr } = await sb
      .from('rooms').select('*').eq('code', code.toUpperCase()).single();
    console.log('[joinRoom] 2. room:', room, '| 错误:', roomErr);

    if (roomErr || !room) return { error: 'Room not found' };
    if (room.status !== 'waiting') {
      console.log('[joinRoom] ❌ status:', room.status);
      return { error: 'Game already started' };
    }

    const { data: existing, error: playersErr } = await sb
      .from('room_players').select('id')
      .eq('room_id', room.id).neq('player_id', localPlayerId);
    const playerCount = existing ? existing.length : 0;
    console.log('[joinRoom] 3. 人数判断:', playerCount, '>=', room.max_players,
      '→', playerCount >= room.max_players, '| 错误:', playersErr);

    if (playerCount >= room.max_players) {
      console.log('[joinRoom] ❌ 房间已满');
      return { error: 'Room is full' };
    }

    const { error: upsertErr } = await sb.from('room_players').upsert({
      room_id: room.id,
      player_id: localPlayerId,
      player_name: playerName,
      avatar_color: avatarColor,
      avatar_index: avatarIndex,
      is_ready: true,
    }, { onConflict: 'room_id,player_id' });
    console.log('[joinRoom] 4. upsert 错误:', upsertErr);

    if (upsertErr) return { error: upsertErr.message };

    roomIdRef.current = room.id;
    subscribeToRoom(room.id);
    console.log('[joinRoom] ✅ 加入成功，等待 SUBSCRIBED 后拉取玩家列表');
    return { roomCode: room.code, roomId: room.id, room };
  }, [localPlayerId, playerName, avatarColor, avatarIndex]);

  const setReady = useCallback(async (ready) => {
    if (!sb || !roomIdRef.current) return;
    await sb.from('room_players')
      .update({ is_ready: ready })
      .eq('room_id', roomIdRef.current)
      .eq('player_id', localPlayerId);
  }, [localPlayerId]);

  // HOST calls this to push game state to all clients via Realtime
  const updateGameState = useCallback(async (gameState) => {
    console.log('[sync] 开始写入 Supabase, sb:', !!sb, 'roomId:', roomIdRef.current);
    if (!sb || !roomIdRef.current) {
      console.warn('[sync] ❌ 写入跳过: sb=', !!sb, 'roomId=', roomIdRef.current);
      return;
    }
    console.log('[sync] 写入 game_state, phase:', gameState?.phase,
      'idx:', gameState?.currentPlayerIndex, 'discardLen:', gameState?.discardPile?.length);
    const { error } = await sb.from('rooms')
      .update({ game_state: gameState, status: 'playing' })
      .eq('id', roomIdRef.current);
    if (error) console.error('[sync] ❌ 写入失败:', error);
    else console.log('[sync] ✅ 写入成功');
  }, []);

  // Non-host calls this to send an action to the host
  const sendAction = useCallback(async (actionType, actionData = {}) => {
    if (!sb || !roomIdRef.current) return;
    console.log('[action] 发送 game_action:', actionType, actionData);
    const { error } = await sb.from('game_actions').insert({
      room_id: roomIdRef.current,
      player_id: localPlayerId,
      action_type: actionType,
      action_data: actionData,
    });
    if (error) console.error('[action] 发送失败:', error);
  }, [localPlayerId]);

  const startRoom = useCallback(async () => {
    if (!sb || !roomIdRef.current) return;
    await sb.from('rooms').update({ status: 'playing' }).eq('id', roomIdRef.current);
  }, []);

  const sendEmojiEmote = useCallback((playerId, emojiKey) => {
    channelRef.current?.send({ type: 'broadcast', event: 'emoji', payload: { playerId, emojiKey } });
  }, []);

  const sendRestartInvite = useCallback(() => {
    channelRef.current?.send({ type: 'broadcast', event: 'restart', payload: { from: localPlayerId } });
  }, [localPlayerId]);

  const leaveRoom = useCallback(async () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (sb && roomIdRef.current) {
      await sb.from('room_players')
        .delete()
        .eq('room_id', roomIdRef.current)
        .eq('player_id', localPlayerId);
    }
    roomIdRef.current = null;
    setConnected(false);
  }, [localPlayerId]);

  // Polling fallback — only while in the waiting room.
  // Fetches both room status (to detect game start) and player list (to detect joins/ready changes).
  // Stops once the game phase leaves 'waiting', so it doesn't interfere with in-game Realtime flow.
  useEffect(() => {
    if (!connected) return;
    const id = setInterval(async () => {
      if (!sb || !roomIdRef.current) return;
      if (useGameStore.getState().phase !== 'waiting') return;
      const [{ data: roomRow }, { data: players }] = await Promise.all([
        sb.from('rooms').select('game_state, status').eq('id', roomIdRef.current).single(),
        sb.from('room_players').select('*').eq('room_id', roomIdRef.current),
      ]);
      console.log('[poll] room status:', roomRow?.status, '| players:', players?.length);
      if (roomRow) onGameStateUpdateRef.current?.(roomRow.game_state, roomRow);
      if (players) onRoomUpdateRef.current?.(players);
    }, 3000);
    return () => clearInterval(id);
  }, [connected]);

  useEffect(() => {
    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  return {
    createRoom, joinRoom, setReady, updateGameState, sendAction, startRoom,
    leaveRoom, sendEmojiEmote, sendRestartInvite, connected, isConfigured,
  };
}
