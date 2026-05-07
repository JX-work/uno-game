import { useState, useMemo } from 'react';
import styles from './OpponentSetup.module.css';
import { useLang } from '../i18n/index.jsx';
import { useUserStore } from '../store/userStore.js';
import Avatar from './Avatar.jsx';
import AnimalAvatar from './AnimalAvatar.jsx';

const AI_SLOTS = [
  { avatarIndex: 6, names: { zh: '灰猫探长', en: 'Detective Cat'  }, animalType: 'grey-cat' },
  { avatarIndex: 7, names: { zh: '金毛冲冲', en: 'Goldie Rush'    }, animalType: 'golden'   },
  { avatarIndex: 8, names: { zh: '哈士奇二哈', en: 'Husky Chaos' }, animalType: 'husky'    },
];

export default function OpponentSetup({ onBack, onStart }) {
  const { t, lang } = useLang();
  const { nickname, avatarIndex, avatarColor } = useUserStore();
  const [aiCount, setAiCount] = useState(1);

  const selectedAI = AI_SLOTS.slice(0, aiCount);

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>← {t('back')}</button>

      <div className={styles.card}>
        <h2 className={styles.title}>{t('opponentSetup')}</h2>

        <div className={styles.countRow}>
          <span className={styles.countLabel}>{t('aiCount')}</span>
          <div className={styles.countBtns}>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                className={`${styles.countBtn} ${aiCount === n ? styles.countActive : ''}`}
                onClick={() => setAiCount(n)}
              >{n}</button>
            ))}
          </div>
        </div>

        <div className={styles.preview}>
          {/* Local player */}
          <div className={styles.playerSlot}>
            <div className={styles.slotAvatar}>
              <Avatar index={avatarIndex} size={52} />
            </div>
            <span className={styles.slotName}>{nickname}</span>
            <span className={styles.youTag}>{lang === 'zh' ? '你' : 'You'}</span>
          </div>

          {/* AI opponents */}
          {selectedAI.map((ai, i) => (
            <div key={i} className={`${styles.playerSlot} ${styles.aiSlot}`}>
              <div className={styles.slotAvatar}>
                <Avatar index={ai.avatarIndex} size={52} />
              </div>
              <span className={styles.slotName}>{ai.names[lang]}</span>
              <span className={styles.aiTag}>AI</span>
            </div>
          ))}
        </div>

        <button
          className={styles.startBtn}
          onClick={() => onStart(aiCount)}
        >
          🎮 {t('startVsAI')}
        </button>
      </div>
    </div>
  );
}
