import styles from './WildColorPicker.module.css';
import { useLang } from '../i18n/index.jsx';
import { COLORS, COLOR_HEX } from '../game/deck.js';

export default function WildColorPicker({ onChoose }) {
  const { t } = useLang();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{t('chooseColor')}</h3>
        <div className={styles.colors}>
          {COLORS.map(color => (
            <button
              key={color}
              className={styles.colorBtn}
              style={{ background: COLOR_HEX[color] }}
              onClick={() => onChoose(color)}
              aria-label={t(color)}
            >
              <span className={styles.colorName}>{t(color)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
