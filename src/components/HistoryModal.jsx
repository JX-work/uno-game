import { useState } from 'react';
import styles from './HistoryModal.module.css';
import { loadHistory, clearHistory, getStats } from '../utils/historyManager.js';

function ConfusedCatSVG() {
  return (
    <svg viewBox="0 0 80 80" width="88" height="88">
      <polygon points="11,32 21,7 31,28" fill="#8890A8"/>
      <polygon points="49,28 59,7 69,32" fill="#8890A8"/>
      <polygon points="15,30 21,11 26,28" fill="#FFCABB"/>
      <polygon points="54,28 59,11 64,30" fill="#FFCABB"/>
      <circle cx="40" cy="44" r="26" fill="#8890A8"/>
      <text x="28" y="46" fontSize="14" textAnchor="middle" fill="#1A0E08" fontWeight="bold">?</text>
      <text x="52" y="46" fontSize="14" textAnchor="middle" fill="#1A0E08" fontWeight="bold">?</text>
      <ellipse cx="40" cy="52" rx="3.5" ry="2.5" fill="#FF8BAA"/>
      <path d="M35,57 Q40,61 45,57" stroke="#C06080" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <text x="65" y="22" fontSize="16" fill="#FFD32A" opacity="0.8">?</text>
      <ellipse cx="17" cy="51" rx="6" ry="4" fill="#AAB8CC" opacity="0.4"/>
      <ellipse cx="63" cy="51" rx="6" ry="4" fill="#AAB8CC" opacity="0.4"/>
    </svg>
  );
}

export default function HistoryModal({ onClose }) {
  const [filter, setFilter] = useState('all');
  const [history, setHistory] = useState(() => loadHistory());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const stats = getStats(history);
  const filtered = filter === 'all' ? history : history.filter(r => r.result === filter);

  function doClear() {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>🏆 历史战绩</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {[
            { label: '总对局', value: stats.total },
            { label: '胜利',   value: stats.wins },
            { label: '连胜',   value: stats.streak },
          ].map(s => (
            <div key={s.label} className={styles.statItem}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Win rate with progress bar */}
        <div className={styles.winRateRow}>
          <span className={styles.winRateLabel}>胜率</span>
          <div className={styles.winRateBar}>
            <div className={styles.winRateFill} style={{ width: `${stats.winRate}%` }} />
          </div>
          <span className={styles.winRateValue}>{stats.winRate}%</span>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {[
            { key: 'all',  label: '全部' },
            { key: 'win',  label: '✅ 胜利' },
            { key: 'lose', label: '❌ 失败' },
          ].map(f => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <button className={styles.clearBtn} onClick={() => setShowClearConfirm(true)}>
            🗑️ 清空
          </button>
        </div>

        {/* Records */}
        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <ConfusedCatSVG />
              <p className={styles.emptyText}>
                {history.length === 0 ? '还没有对局记录哦～' : '没有符合条件的记录'}
              </p>
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className={`${styles.record} ${r.result === 'win' ? styles.win : styles.lose}`}>
                <div className={`${styles.badge} ${r.result === 'win' ? styles.winBadge : styles.loseBadge}`}>
                  {r.result === 'win' ? 'WIN' : 'LOSE'}
                </div>
                <div className={styles.info}>
                  <div className={styles.date}>{r.date}</div>
                  <div className={styles.opponents}>
                    vs {r.players.slice(1).join(' · ')}
                  </div>
                </div>
                <div className={styles.meta}>
                  <span>{r.duration}</span>
                  <span>{r.totalRounds} 回合</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear confirm */}
        {showClearConfirm && (
          <div className={styles.clearConfirm}>
            <p>确定清空所有 {history.length} 条记录？</p>
            <div className={styles.clearActions}>
              <button className={styles.doClearBtn} onClick={doClear}>确定清空</button>
              <button className={styles.cancelClear} onClick={() => setShowClearConfirm(false)}>取消</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
