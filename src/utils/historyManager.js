const HISTORY_KEY = 'uno_history';
const MAX_RECORDS = 50;

function genId() {
  try { return crypto.randomUUID(); } catch { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
}

function formatDate(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

export function saveRecord({ players, winner, localPlayerId, gameStartTime, roundCount }) {
  const history = loadHistory();
  const duration = gameStartTime ? Date.now() - gameStartTime : 0;
  const localPlayer = players.find(p => p.id === localPlayerId);
  const isWin = !!(winner && localPlayer && winner.id === localPlayerId);

  const record = {
    id: genId(),
    date: formatDate(Date.now()),
    players: players.map(p => p.name),
    winner: winner ? winner.name : '?',
    duration: formatDuration(duration),
    totalRounds: roundCount || 0,
    myCardsLeft: localPlayer ? localPlayer.hand.length : 0,
    result: isWin ? 'win' : 'lose',
  };

  history.unshift(record);
  if (history.length > MAX_RECORDS) history.splice(MAX_RECORDS);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
  return record;
}

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

export function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
}

export function getStats(history) {
  if (!history.length) return { total: 0, wins: 0, winRate: 0, streak: 0 };
  const wins = history.filter(r => r.result === 'win').length;
  let streak = 0;
  for (const r of history) {
    if (r.result === 'win') streak++;
    else break;
  }
  return { total: history.length, wins, winRate: Math.round((wins / history.length) * 100), streak };
}
