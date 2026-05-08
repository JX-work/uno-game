-- ============================================================
-- UNO Game – Supabase Schema
-- 在 Supabase Dashboard → SQL Editor 中整段执行
-- 字段均来自 src/hooks/useMultiplayer.js 的实际查询
-- ============================================================

-- 1. 清理旧表（cascade 自动删除外键依赖）
drop table if exists room_players cascade;
drop table if exists rooms cascade;

-- 2. rooms 表
--    字段来源：
--      insert  → code, host_player_id, max_players, allow_ai, status, game_state
--      select  → id, code, status, max_players（joinRoom 判断满员/已开始）
--      update  → game_state, status（updateGameState / startRoom）
--      realtime payload.new → game_state, status
create table rooms (
  id             uuid        default gen_random_uuid() primary key,
  code           varchar(6)  not null unique,
  host_player_id text        not null,
  max_players    int         not null default 4,
  allow_ai       boolean     not null default true,
  status         text        not null default 'waiting',  -- 'waiting' | 'playing'
  game_state     jsonb       not null default '{}',
  created_at     timestamptz not null default now()
);

-- 3. room_players 表
--    字段来源：
--      insert/upsert → room_id, player_id, player_name, avatar_color, avatar_index, is_ready
--      select        → id（计人数）; select * → 所有字段（fetchRoomPlayers → WaitingRoom）
--      update        → is_ready（setReady）
--      delete WHERE  → room_id, player_id（leaveRoom）
--      unique constraint on conflict → room_id, player_id（upsert）
create table room_players (
  id           uuid        default gen_random_uuid() primary key,
  room_id      uuid        not null references rooms(id) on delete cascade,
  player_id    text        not null,
  player_name  text        not null,
  avatar_color text        not null,
  avatar_index int         not null default 0,
  is_ready     boolean     not null default false,
  joined_at    timestamptz not null default now(),
  unique(room_id, player_id)
);

-- 4. Replica identity — required for Realtime filtered subscriptions to work
--    (with DEFAULT identity, UPDATE events only include PK + changed cols in WAL,
--     so the filter `room_id=eq.X` can't be evaluated for room_players UPDATE events)
alter table rooms        replica identity full;
alter table room_players replica identity full;

-- 4b. Row Level Security
alter table rooms        enable row level security;
alter table room_players enable row level security;

create policy "allow_all_rooms"
  on rooms for all
  using (true) with check (true);

create policy "allow_all_players"
  on room_players for all
  using (true) with check (true);

-- 5. game_actions 表（非 host 玩家发送动作给 host）
--    字段来源：sendAction 写入 / onActionReceived 读取
drop table if exists game_actions cascade;
create table game_actions (
  id          uuid        default gen_random_uuid() primary key,
  room_id     uuid        not null references rooms(id) on delete cascade,
  player_id   text        not null,
  action_type text        not null,
  action_data jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);
alter table game_actions enable row level security;
create policy "allow_all_actions"
  on game_actions for all
  using (true) with check (true);

-- 6. Realtime（subscribeToRoom 监听三张表）
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_players;
alter publication supabase_realtime add table game_actions;
