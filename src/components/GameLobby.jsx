import { useState } from 'react';
import styles from './GameLobby.module.css';
import { useLang } from '../i18n/index.jsx';
import { useGameStore } from '../store/gameStore.js';
import { useUserStore } from '../store/userStore.js';
import LanguageToggle from './LanguageToggle.jsx';

export default function GameLobby({ onCreateRoom, onJoinRoom }) {
  const { t } = useLang();
  const { goToMenu } = useGameStore();
  const [tab, setTab] = useState('create');
  const [code, setCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [allowAI, setAllowAI] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError('');
    const result = await onCreateRoom({ maxPlayers, allowAI });
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  async function handleJoin() {
    if (code.length < 6) return;
    setLoading(true);
    setError('');
    const result = await onJoinRoom(code.trim().toUpperCase());
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  return (
    <div className={styles.screen}>
      <LanguageToggle />
      <button className={styles.backBtn} onClick={goToMenu}>← {t('back')}</button>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'create' ? styles.active : ''}`} onClick={() => setTab('create')}>
            {t('createRoom')}
          </button>
          <button className={`${styles.tab} ${tab === 'join' ? styles.active : ''}`} onClick={() => setTab('join')}>
            {t('joinRoom')}
          </button>
        </div>

        {tab === 'create' && (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label>{t('maxPlayers')}</label>
              <div className={styles.numSelector}>
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    className={`${styles.numBtn} ${maxPlayers === n ? styles.selected : ''}`}
                    onClick={() => setMaxPlayers(n)}
                  >{n}</button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={allowAI} onChange={e => setAllowAI(e.target.checked)} />
                <span>{t('allowAI')}</span>
              </label>
            </div>

            <button className={styles.primaryBtn} onClick={handleCreate} disabled={loading}>
              {loading ? '...' : `🏠 ${t('createRoom')}`}
            </button>
          </div>
        )}

        {tab === 'join' && (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label>{t('roomCode')}</label>
              <input
                className={styles.codeInput}
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder={t('enterRoomCode')}
                maxLength={6}
              />
            </div>

            <button className={styles.primaryBtn} onClick={handleJoin} disabled={loading || code.length < 6}>
              {loading ? '...' : `🚀 ${t('join')}`}
            </button>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
