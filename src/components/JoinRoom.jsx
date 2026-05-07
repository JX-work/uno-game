import { useState } from 'react';
import styles from './JoinRoom.module.css';
import { useLang } from '../i18n/index.jsx';

export default function JoinRoom({ onJoinRoom, onBack }) {
  const { t } = useLang();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) return;
    setLoading(true);
    setError('');
    const result = await onJoinRoom(trimmed);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && code.trim().length >= 6) handleJoin();
  }

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>← {t('back')}</button>

      <div className={styles.card}>
        <h2 className={styles.title}>🚪 {t('joinRoom')}</h2>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('roomCode')}</label>
          <input
            className={styles.codeInput}
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            onKeyDown={handleKey}
            placeholder={t('enterRoomCode')}
            maxLength={6}
            autoFocus
          />
        </div>

        {error && (
          <div className={styles.error}>
            {error.includes('not found') || error.includes('不存在') ? `🔍 ${t('roomNotFound')}` :
             error.includes('full')     || error.includes('已满')   ? `🚫 ${t('roomFull')}` :
             error.includes('started')  || error.includes('已开始') ? `⏩ ${t('gameAlreadyStarted')}` :
             `⚠️ ${error}`}
          </div>
        )}

        <button
          className={styles.joinBtn}
          onClick={handleJoin}
          disabled={loading || code.trim().length < 6}
        >
          {loading ? '...' : `🚀 ${t('join')}`}
        </button>
      </div>
    </div>
  );
}
