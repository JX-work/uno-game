/**
 * Supabase multiplayer hook.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 *
 * SQL schema (run in Supabase SQL editor):
 *
 * create table rooms (
 *   id uuid default gen_random_uuid() primary key,
 *   code varchar(6) unique not null,
 *   host_player_id text not null,
 *   max_players int default 4,
 *   allow_ai boolean default true,
 *   status text default 'waiting',
 *   game_state jsonb default '{}',
 *   created_at timestamptz default now()
 * );
 *
 * create table room_players (
 *   id uuid default gen_random_uuid() primary key,
 *   room_id uuid references rooms(id) on delete cascade,
 *   player_id text not null,
 *   player_name text not null,
 *   avatar_color text not null,
 *   is_ready boolean default false,
 *   joined_at timestamptz default now(),
 *   unique(room_id, player_id)
 * );
 *
 * alter table rooms enable row level security;
 * alter table room_players enable row level security;
 * create policy "allow_all_rooms" on rooms for all using (true) with check (true);
 * create policy "allow_all_players" on room_players for all using (true) with check (true);
 * alter publication supabase_realtime add table rooms;
 * alter publication supabase_realtime add table room_players;
 */

import { useEffect, useRef, useState, useCallback } from 'react';

let supabase = null;

function getSupabase() {
  if (supabase) return supabase;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // Lazy import to avoid error when not configured
  import('@supabase/supabase-js').then(({ createClient }) => {
    supabase = createClient(url, key);
  });
  return null;
}

function genRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useMultiplayer({ localPlayerId, playerName, avatarColor, onGameStateUpdate, onRoomUpdate, onEmojiReceived, onRestartReceived }) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);
  const roomIdRef = useRef(null);

  const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL);

  const createRoom = useCallback(async ({ maxPlayers = 4, allowAI = true } = {}) => {
    const sb = getSupabase();
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
      is_ready: false,
    });

    subscribeToRoom(data.id);
    return { roomCode: code, roomId: data.id };
  }, [localPlayerId, playerName, avatarColor]);

  const joinRoom = useCallback(async (code) => {
    const sb = getSupabase();
    if (!sb) return { error: 'Supabase not configured' };

    const { data: room, error: roomErr } = await sb
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (roomErr || !room) return { error: 'Room not found' };
    if (room.status !== 'waiting') return { error: 'Game already started' };

    const { data: existing } = await sb
      .from('room_players')
      .select('id')
      .eq('room_id', room.id)
      .neq('player_id', localPlayerId);

    if (existing && existing.length >= room.max_players - 1) return { error: 'Room is full' };

    await sb.from('room_players').upsert({
      room_id: room.id,
      player_id: localPlayerId,
      player_name: playerName,
      avatar_color: avatarColor,
      is_ready: false,
    }, { onConflict: 'room_id,player_id' });

    roomIdRef.current = room.id;
    subscribeToRoom(room.id);
    return { roomCode: room.code, roomId: room.id, room };
  }, [localPlayerId, playerName, avatarColor]);

  const setReady = useCallback(async (ready) => {
    const sb = getSupabase();
    if (!sb || !roomIdRef.current) return;
    await sb.from('room_players')
      .update({ is_ready: ready })
      .eq('room_id', roomIdRef.current)
      .eq('player_id', localPlayerId);
  }, [localPlayerId]);

  const updateGameState = useCallback(async (gameState) => {
    const sb = getSupabase();
    if (!sb || !roomIdRef.current) return;
    await sb.from('rooms').update({ game_state: gameState, status: 'playing' }).eq('id', roomIdRef.current);
  }, []);

  const startRoom = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !roomIdRef.current) return;
    await sb.from('rooms').update({ status: 'playing' }).eq('id', roomIdRef.current);
  }, []);

  const sendEmojiEmote = useCallback((playerId, emojiKey) => {
    if (channelRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'emoji', payload: { playerId, emojiKey } });
    }
  }, []);

  const sendRestartInvite = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'restart', payload: { from: localPlayerId } });
    }
  }, [localPlayerId]);

  const leaveRoom = useCallback(async () => {
    const sb = getSupabase();
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

  function subscribeToRoom(roomId) {
    const sb = getSupabase();
    if (!sb) return;

    const channel = sb.channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.new) onGameStateUpdate?.(payload.new.game_state, payload.new);
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => fetchRoomPlayers(roomId))
      .on('broadcast', { event: 'emoji' }, ({ payload }) => {
        if (payload?.playerId !== localPlayerId) {
          onEmojiReceived?.(payload.playerId, payload.emojiKey);
        }
      })
      .on('broadcast', { event: 'restart' }, ({ payload }) => {
        if (payload?.from !== localPlayerId) {
          onRestartReceived?.();
        }
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;
  }

  async function fetchRoomPlayers(roomId) {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.from('room_players').select('*').eq('room_id', roomId);
    onRoomUpdate?.(data || []);
  }

  useEffect(() => {
    getSupabase();
    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, []);

  return { createRoom, joinRoom, setReady, updateGameState, startRoom, leaveRoom, sendEmojiEmote, sendRestartInvite, connected, error, isConfigured };
}
