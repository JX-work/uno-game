import { useState } from 'react';
import styles from './EmojiBubble.module.css';
import { useLang } from '../i18n/index.jsx';

export const EMOJI_LIST = [
  { key: 'laugh', zh: '哈哈哈！',   en: 'Hahaha!',      icon: '😂' },
  { key: 'cheer', zh: '加油！💪',  en: 'Go go! 💪',     icon: '💪' },
  { key: 'yawn',  zh: '好困哦～',   en: 'So sleepy~',    icon: '😴' },
  { key: 'wow',   zh: '好厉害！✨', en: 'Amazing! ✨',   icon: '✨' },
  { key: 'dead',  zh: '我完蛋了😭', en: "I'm done 😭",  icon: '😭' },
  { key: 'point', zh: '该你了👉',  en: 'Your turn 👉',   icon: '👉' },
];

/** Floating speech bubble shown above a player's area */
export function EmojiBubble({ emojiKey }) {
  const { lang } = useLang();
  const emoji = EMOJI_LIST.find(e => e.key === emojiKey);
  if (!emoji) return null;
  return (
    <div className={styles.bubble} key={emojiKey + Date.now()}>
      <span className={styles.bubbleIcon}>{emoji.icon}</span>
      <span className={styles.bubbleText}>{emoji[lang]}</span>
    </div>
  );
}

/** Panel for the local player to pick an emoji to send */
export function EmojiPanel({ onSelect, onClose }) {
  const { lang } = useLang();
  return (
    <div className={styles.panelOverlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        {EMOJI_LIST.map(e => (
          <button key={e.key} className={styles.emojiBtn} onClick={() => onSelect(e.key)}>
            <span className={styles.emojiIcon}>{e.icon}</span>
            <span className={styles.emojiLabel}>{e[lang]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
