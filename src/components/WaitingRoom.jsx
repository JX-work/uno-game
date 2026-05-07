import { useState } from 'react';
import styles from './WaitingRoom.module.css';
import { useLang } from '../i18n/index.jsx';
import { useGameStore } from '../store/gameStore.js';
import LanguageToggle from './LanguageToggle.jsx';
import Avatar from './Avatar.jsx';

export default function WaitingRoom({ roomCode, players, localPlayerId, isHost, onReady, onStart, onLeave, maxPlayers }) {
  const { t } = useLang();
  const [copyText, setCopyText] = useState(t('copyCode'));
  const [localReady, setLocalReady] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopyText(t('copied'));
      setTimeout(() => setCopyText(t('copyCode')), 2000);
    });
  }

  function handleReady() {
    const next = !localReady;
    setLocalReady(next);
    onReady?.(next);
  }

  const allReady = players.length >= 2 && players.every(p => p.is_ready || p.player_id === localPlayerId);
  const canStart = isHost && players.length >= 2 && players.every(p => p.is_ready);

  return (
    <div className={styles.screen}>
      <LanguageToggle />
      <button className={styles.backBtn} onClick={onLeave}>← {t('back')}</button>

      <div className={styles.card}>
        <h2 className={styles.title}>{t('waitingRoom')}</h2>

        <div className={styles.codeBox}>
          <span className={styles.codeLabel}>{t('roomCodeLabel')}:</span>
          <span className={styles.code}>{roomCode}</span>
          <button className={styles.copyBtn} onClick={handleCopy}>{copyText}</button>
        </div>

        <div className={styles.playerList}>
          {Array.from({ length: maxPlayers }).map((_, i) => {
            const p = players[i];
            if (!p) {
              return (
                <div key={i} className={styles.emptySlot}>
                  <div className={styles.emptyAvatar}>?</div>
                  <span className={styles.waiting}>{t('waiting')}</span>
                </div>
              );
            }
            const isLocal = p.player_id === localPlayerId;
            return (
              <div key={p.player_id} className={`${styles.playerRow} ${isLocal ? styles.local : ''}`}>
                <div className={styles.avatarWrap}>
                  <Avatar index={p.avatar_index ?? 0} size={38} />
                </div>
                <span className={styles.playerName}>
                  {p.player_name}
                  {isLocal && ' (You)'}
                  {p.player_id === players[0]?.player_id && ` 👑`}
                </span>
                <span className={`${styles.readyTag} ${p.is_ready ? styles.readyYes : styles.readyNo}`}>
                  {p.is_ready ? t('ready') : t('notReady')}
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          {!isHost && (
            <button
              className={`${styles.readyBtn} ${localReady ? styles.readyActive : ''}`}
              onClick={handleReady}
            >
              {localReady ? '✓ ' + t('ready') : t('ready')}
            </button>
          )}
          {isHost && (
            <button
              className={styles.startBtn}
              onClick={onStart}
              disabled={!canStart}
            >
              {t('startMatch')}
            </button>
          )}
          {!canStart && isHost && (
            <p className={styles.hint}>{t('needMorePlayers')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
