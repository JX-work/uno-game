import styles from './SettingsPanel.module.css';
import { useLang } from '../i18n/index.jsx';
import { useSettingsStore } from '../store/settingsStore.js';
import { useUserStore } from '../store/userStore.js';
import Avatar, { AvatarPicker } from './Avatar.jsx';

export default function SettingsPanel({ onClose }) {
  const { t, lang, setLang } = useLang();
  const { soundEnabled, musicEnabled, setSoundEnabled, setMusicEnabled } = useSettingsStore();
  const { avatarIndex, setAvatarIndex } = useUserStore();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>⚙️ {t('settings')}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Audio section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('audioSettings')}</div>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>🔊 {t('sound')}</span>
            <button
              className={`${styles.toggle} ${soundEnabled ? styles.toggleOn : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-checked={soundEnabled}
              role="switch"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>🎵 {t('music')}</span>
            <button
              className={`${styles.toggle} ${musicEnabled ? styles.toggleOn : ''}`}
              onClick={() => setMusicEnabled(!musicEnabled)}
              aria-checked={musicEnabled}
              role="switch"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        </div>

        {/* Language section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('language')}</div>
          <div className={styles.langRow}>
            {['zh', 'en'].map(l => (
              <button
                key={l}
                className={`${styles.langBtn} ${lang === l ? styles.langActive : ''}`}
                onClick={() => setLang(l)}
              >
                {l === 'zh' ? '中文' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Avatar section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('chooseAvatar')}</div>
          <AvatarPicker selected={avatarIndex} onChange={setAvatarIndex} lang={lang} />
        </div>
      </div>
    </div>
  );
}
