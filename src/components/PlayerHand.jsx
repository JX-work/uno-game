import { useRef, useEffect } from 'react';
import Card from './Card.jsx';
import { canPlayCard } from '../game/rules.js';
import styles from './PlayerHand.module.css';

export default function PlayerHand({ player, isActive, currentColor, topCard, pendingDrawCount, onPlayCard, compact }) {
  const scrollRef = useRef(null);

  // Scroll to center on becoming active
  useEffect(() => {
    if (isActive && scrollRef.current) {
      scrollRef.current.scrollLeft = (scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / 2;
    }
  }, [isActive]);

  if (!player) return null;

  const isAI = player.isAI;

  if (isAI) {
    return (
      <div className={`${styles.aiHand} ${isActive ? styles.active : ''}`}>
        {player.hand.map((_, i) => (
          <Card key={i} card={{ color: 'wild', type: 'number', value: 0 }} faceDown small />
        ))}
        {isActive && <div className={styles.thinkingBubble}>💭</div>}
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${isActive ? styles.active : ''}`} ref={scrollRef}>
      <div className={styles.hand}>
        {player.hand.map((card, i) => {
          const playable = isActive && canPlayCard(card, topCard, currentColor, pendingDrawCount);
          return (
            <Card
              key={card.id}
              card={card}
              onClick={playable ? () => onPlayCard(i) : undefined}
              disabled={isActive && !playable}
              playable={playable}
              small={compact}
            />
          );
        })}
      </div>
    </div>
  );
}
