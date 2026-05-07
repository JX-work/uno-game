import { useState } from 'react';
import styles from './NicknameSetup.module.css';
import { useLang } from '../i18n/index.jsx';
import { useUserStore } from '../store/userStore.js';
import { useGameStore } from '../store/gameStore.js';
import { AvatarPicker } from './Avatar.jsx';

export default function NicknameSetup() {
  const { t, lang } = useLang();
  const { nickname, avatarIndex, setNickname, setAvatarIndex } = useUserStore();
  const { goToMenu } = useGameStore();
  const [name, setName] = useState(nickname);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setNickname(trimmed);
    goToMenu();
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.logo}>UNO</div>
        <p className={styles.tagline}>🐱 猫狗大战 · Cat &amp; Dog Edition 🐶</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>{t('enterNickname')}</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('nicknamePlaceholder')}
            maxLength={20}
            autoFocus
          />

          <label className={styles.label}>{t('chooseAvatar')}</label>
          <AvatarPicker
            selected={avatarIndex}
            onChange={setAvatarIndex}
            lang={lang}
          />

          <button
            type="submit"
            className={styles.startBtn}
            disabled={!name.trim()}
          >
            {t('startGame')} →
          </button>
        </form>
      </div>
    </div>
  );
}
