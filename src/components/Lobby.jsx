import styles from './Lobby.module.css';
import { useLang } from '../i18n/index.jsx';

export default function Lobby({ onCreate, onJoin, onBack }) {
  const { t } = useLang();

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>← {t('back')}</button>

      {/* Decorative animals */}
      <div className={styles.deco} aria-hidden>
        <span className={styles.decoLeft}>🐱</span>
        <span className={styles.decoRight}>🐶</span>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>🌐 {t('multiPlayer')}</h2>
        <p className={styles.sub}>{t('multiplayerSub')}</p>

        <button className={styles.createBtn} onClick={onCreate}>
          🏠 {t('createRoom')}
        </button>
        <button className={styles.joinBtn} onClick={onJoin}>
          🚪 {t('joinRoom')}
        </button>
      </div>
    </div>
  );
}
