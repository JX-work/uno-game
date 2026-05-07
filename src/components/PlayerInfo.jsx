import { useState } from 'react';
import styles from './PlayerInfo.module.css';
import bubbleStyles from './EmojiBubble.module.css';
import { useLang } from '../i18n/index.jsx';
import Avatar from './Avatar.jsx';
import { EmojiBubble, EmojiPanel } from './EmojiBubble.jsx';

export default function PlayerInfo({ player, isActive, position = 'bottom', emojiBubble, onEmoji, isLocal }) {
  const { t } = useLang();
  const [showPanel, setShowPanel] = useState(false);

  if (!player) return null;

  const avatarIndex = player.avatarIndex ?? 0;
  const aiIdx = player.isAI ? (parseInt(player.id.replace(/\D/g, '')) || 0) : 0;

  function handleSend(key) {
    onEmoji?.(key);
    setShowPanel(false);
  }

  return (
    <div className={`${styles.info} ${isActive ? styles.active : ''} ${styles[position]}`}>
      {/* Emoji bubble above avatar */}
      <div className={styles.bubbleAnchor}>
        {emojiBubble && <EmojiBubble emojiKey={emojiBubble} />}
      </div>

      <div className={styles.avatarWrap}>
        <div className={`${styles.avatarRing} ${isActive ? styles.activeRing : ''}`}>
          <Avatar
            index={avatarIndex}
            isAI={player.isAI}
            aiIndex={aiIdx}
            size={40}
          />
        </div>
        {isActive && <span className={styles.activeDot} />}
      </div>
      <div className={styles.details}>
        <span className={styles.name}>{player.name}</span>
        <span className={styles.cardCount}>{player.hand.length} {t('cards')}</span>
      </div>
      {player.hasCalledUno && player.hand.length === 1 && (
        <div className={styles.unoBadge}>UNO!</div>
      )}
      {isLocal && (
        <div style={{ position: 'relative' }}>
          <button
            className={bubbleStyles.sendBtn}
            onClick={() => setShowPanel(v => !v)}
            title="表情"
          >
            😄
          </button>
          {showPanel && (
            <EmojiPanel onSelect={handleSend} onClose={() => setShowPanel(false)} />
          )}
        </div>
      )}
    </div>
  );
}
