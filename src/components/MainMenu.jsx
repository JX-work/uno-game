import { useState } from 'react';
import styles from './MainMenu.module.css';
import { useLang } from '../i18n/index.jsx';
import { useUserStore } from '../store/userStore.js';
import { useGameStore } from '../store/gameStore.js';
import Avatar from './Avatar.jsx';
import HistoryModal from './HistoryModal.jsx';
import SettingsPanel from './SettingsPanel.jsx';

export default function MainMenu({ onSinglePlayer }) {
  const { t } = useLang();
  const { nickname, avatarIndex, avatarColor } = useUserStore();
  const { goToLobby } = useGameStore();
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={styles.screen}>
      <button className={styles.settingsBtn} onClick={() => setShowSettings(true)} title={t('settings')}>
        ⚙️
      </button>
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <div className={styles.logo}>UNO</div>
          <p className={styles.subtitle}>{t('gameTitle')}</p>
        </div>

        <div className={styles.playerTag}>
          <div className={styles.avatar}>
            <Avatar index={avatarIndex} size={36} />
          </div>
          <span className={styles.playerName}>{nickname}</span>
        </div>

        <div className={styles.menuCard}>
          <button className={styles.primaryBtn} onClick={onSinglePlayer}>
            🎮 {t('singlePlayer')}
          </button>

          <button className={styles.secondaryBtn} onClick={goToLobby}>
            🌐 {t('multiPlayer')}
          </button>

          <div className={styles.divider} />

          <button className={styles.historyBtn} onClick={() => setShowHistory(true)}>
            🏆 历史战绩
          </button>
        </div>
      </div>
    </div>
  );
}
