# UNO Online 🃏

可爱卡通风 UNO 卡牌游戏，支持单机 vs AI 和多人在线对战。

## 本地启动

```bash
cd uno-game
npm install
npm run dev
# 打开 http://localhost:5173
```

## 部署上线（Netlify + Supabase，零成本）

### 一、Supabase 配置（约 2 分钟）

1. 前往 [supabase.com](https://supabase.com) 免费注册，新建项目
2. 进入项目 → **Settings → API**，复制 **Project URL** 和 **anon public key**
3. 进入 **SQL Editor**，粘贴并执行下方建表 SQL
4. 复制 `.env.example` 为 `.env`，填入上面两个值

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

### 二、Netlify 部署（约 3 分钟）

1. 把代码推送到 GitHub
2. 前往 [netlify.com](https://netlify.com) 注册 → **Add new site → Import from Git** → 选择仓库
3. Build command 填 `npm run build`，Publish directory 填 `dist`
4. **Site settings → Environment variables** 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 点 **Deploy**，完成！把网址发给朋友就能一起玩了

> 也可以用 Vercel：`npm i -g vercel && vercel --prod`，在 Dashboard 里同样添加上述两个环境变量。

## 数据库 SQL

在 Supabase SQL Editor 中执行：

```sql
create table rooms (
  id uuid default gen_random_uuid() primary key,
  code varchar(6) unique not null,
  host_player_id text not null,
  max_players int default 4,
  allow_ai boolean default true,
  status text default 'waiting',
  game_state jsonb default '{}',
  created_at timestamptz default now()
);

create table room_players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade,
  player_id text not null,
  player_name text not null,
  avatar_color text not null,
  is_ready boolean default false,
  joined_at timestamptz default now(),
  unique(room_id, player_id)
);

alter table rooms enable row level security;
alter table room_players enable row level security;

create policy "allow_all_rooms" on rooms for all using (true) with check (true);
create policy "allow_all_players" on room_players for all using (true) with check (true);

alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_players;
```

## 游戏规则

### 基础
- 每人发 7 张牌
- 出牌需与顶牌**颜色**或**数字/类型**匹配
- 万能牌（换色/+4换色）随时可出

### 特殊牌
| 牌 | 效果 |
|---|---|
| 禁止 ⊘ | 下家跳过 |
| 反转 ↺ | 顺序反转（2人时等同禁止）|
| +2 | 下家摸2张并跳过 |
| 换色 ★ | 自选当前颜色 |
| +4换色 | 下家摸4张并跳过，自选颜色 |

### 叠加规则（+2）
下家如有 +2，可叠加转移，直到有人无法叠加为止，由该人摸全部累计张数。

### UNO 规则
手牌剩 **1 张**时必须点击「UNO」按钮，否则被其他玩家抓到要罚摸 2 张。

## 技术栈

- **前端**: React 18 + Vite 5
- **状态管理**: Zustand
- **多人联机**: Supabase Realtime
- **部署**: Netlify / Vercel
- **样式**: CSS Modules（无外部 UI 框架）

## 项目结构

```
src/
├── components/     # UI 组件（卡牌、游戏桌、菜单等）
├── game/           # 游戏逻辑（牌堆、规则、AI）
├── store/          # Zustand 状态管理
├── i18n/           # 中英文语言包
└── hooks/          # 自定义 hooks（多人联机）
```
