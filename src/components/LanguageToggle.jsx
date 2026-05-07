import styles from './LanguageToggle.module.css';
import { useLang } from '../i18n/index.jsx';

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.btn} ${lang === 'zh' ? styles.active : ''}`}
        onClick={() => setLang('zh')}
      >
        中
      </button>
      <button
        className={`${styles.btn} ${lang === 'en' ? styles.active : ''}`}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}
