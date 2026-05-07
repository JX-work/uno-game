import { useState, useCallback } from 'react';
import styles from './CreateRoom.module.css';
import { useLang } from '../i18n/index.jsx';

const genCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function CreateRoom({ onCreateRoom, onBack }) {
  const { t } = useLang();
  const [roomCode] = useState(genCode);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [allowAI, setAllowAI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCreate() {
    setLoading(true);
    setError('');
    const result = await onCreateRoom({ maxPlayers, allowAI, roomCode });
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>← {t('back')}</button>

      <div className={styles.card}>
        <h2 className={styles.title}>🏠 {t('createRoom')}</h2>

        <div className={styles.codeBlock}>
          <div className={styles.codeLabel}>{t('roomCodeLabel')}</div>
          <div className={styles.code}>{roomCode}</div>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? `✓ ${t('copied')}` : `📋 ${t('copyCode')}`}
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('maxPlayers')}</label>
          <div className={styles.numRow}>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`${styles.numBtn} ${maxPlayers === n ? styles.numActive : ''}`}
                onClick={() => setMaxPlayers(n)}
              >{n}</button>
            ))}
          </div>
        </div>

        <label className={styles.checkLabel}>
          <input type="checkbox" checked={allowAI} onChange={e => setAllowAI(e.target.checked)} />
          <span>{t('allowAI')}</span>
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.startBtn} onClick={handleCreate} disabled={loading}>
          {loading ? '...' : `🚀 ${t('startMatch')}`}
        </button>
      </div>
    </div>
  );
}
