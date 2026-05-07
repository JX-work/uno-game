import { useEffect, useState } from 'react';
import styles from './CardEffectOverlay.module.css';
import { sounds } from '../utils/soundManager.js';
import { COLOR_HEX } from '../game/deck.js';

// effect: { type, targetIdx, sourceIdx, currentColor }
// targetDirection: 'up' | 'down' | 'left' | 'right'
// targetName: string
export default function CardEffectOverlay({ effect, targetName, targetDirection = 'up', onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!effect) return;
    setVisible(true);

    // Play sound
    switch (effect.type) {
      case 'draw2':   sounds.plus2(); break;
      case 'wild4':   sounds.plus4(); break;
      case 'reverse': sounds.reverse(); break;
      case 'skip':    sounds.skip(); break;
      case 'wild':    sounds.wildColor(); break;
    }

    const dur = effect.type === 'wild' || effect.type === 'wild4' ? 1400 : 1200;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, dur);

    return () => clearTimeout(timer);
  }, [effect]);

  if (!effect) return null;

  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : styles.hidden}`}>
      {effect.type === 'draw2' && <DrawEffect count={2} targetName={targetName} direction={targetDirection} />}
      {effect.type === 'wild4' && <DrawEffect count={4} targetName={targetName} direction={targetDirection} withExplosion />}
      {effect.type === 'reverse' && <ReverseEffect />}
      {effect.type === 'skip' && <SkipEffect targetName={targetName} />}
      {(effect.type === 'wild' || effect.type === 'wildColor') && <WildEffect color={effect.currentColor} />}
    </div>
  );
}

const DIR_VARS = {
  up:    { '--dx': '0px',    '--dy': '-90px' },
  down:  { '--dx': '0px',    '--dy':  '90px' },
  left:  { '--dx': '-110px', '--dy': '-20px' },
  right: { '--dx':  '110px', '--dy': '-20px' },
};

function DrawEffect({ count, targetName, direction = 'up', withExplosion = false }) {
  const emoji = count === 2 ? '😿' : '🙀';
  const cards = Array.from({ length: count });
  const dirStyle = DIR_VARS[direction] ?? DIR_VARS.up;

  return (
    <div className={styles.center}>
      {withExplosion && <CornerStars />}
      <div className={styles.drawCards} style={dirStyle}>
        {cards.map((_, i) => (
          <div
            key={i}
            className={styles.flyingCard}
            style={{ '--i': i, '--total': count }}
          >
            <MiniCardBack />
          </div>
        ))}
      </div>
      <div className={styles.targetBubble}>
        <span className={styles.bigEmoji}>{emoji}</span>
        <div className={styles.bigText}>+{count}</div>
        {targetName && <div className={styles.targetName}>{targetName}</div>}
      </div>
    </div>
  );
}

function CornerStars() {
  const stars = ['⭐','🌟','✨','💫'];
  return (
    <div className={styles.cornerStars}>
      {stars.map((s, i) => (
        <div key={i} className={styles.cornerStar} style={{ '--corner': i }}>{s}</div>
      ))}
    </div>
  );
}

function ReverseEffect() {
  return (
    <div className={styles.center}>
      <div className={styles.reverseRing}>
        <svg viewBox="0 0 120 120" width="180" height="180" className={styles.reverseSvg}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF4757"/>
              <stop offset="50%" stopColor="#FFD32A"/>
              <stop offset="100%" stopColor="#1E90FF"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="50" fill="none" stroke="url(#revGrad)" strokeWidth="8"
            strokeDasharray="280" strokeDashoffset="60" strokeLinecap="round"/>
          {/* Arrowhead right */}
          <polygon points="108,52 120,60 108,68" fill="#FFD32A"/>
          {/* Arrowhead left */}
          <polygon points="12,52 0,60 12,68" fill="#FF4757"/>
        </svg>
      </div>
      <div className={styles.bigText} style={{ marginTop: 8 }}>↺ 反转 Reverse!</div>
    </div>
  );
}

function SkipEffect({ targetName }) {
  return (
    <div className={styles.center}>
      <div className={styles.skipX}>
        <span className={styles.xMark}>✕</span>
      </div>
      <div className={styles.bigText}>💤 跳过 Skip!</div>
      {targetName && <div className={styles.targetName}>{targetName}</div>}
    </div>
  );
}

function WildEffect({ color }) {
  const hexColor = COLOR_HEX[color] || '#9B59B6';
  return (
    <>
      <div className={styles.colorFlash} style={{ '--wc': hexColor }} />
      <div className={styles.wildOverlay} style={{ '--wc': hexColor }}>
        <div className={styles.wildBurst}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} className={styles.wildRay} style={{ '--r': i * 45 }} />
          ))}
        </div>
        <div className={styles.wildStar}>★</div>
        <div className={styles.bigText}>换色！Color Change!</div>
      </div>
    </>
  );
}

function MiniCardBack() {
  return (
    <div className={styles.miniCard}>
      <svg viewBox="0 0 36 52" width="36" height="52">
        <rect width="36" height="52" rx="5" fill="#2c1050"/>
        <rect x="2" y="2" width="32" height="48" rx="4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <g transform="translate(18,26)" opacity="0.75">
          <ellipse cx="0" cy="0" rx="5.5" ry="4.5" fill="rgba(255,150,200,0.8)"/>
          <ellipse cx="-7" cy="-5" rx="2.8" ry="2.3" fill="rgba(255,150,200,0.8)"/>
          <ellipse cx="7" cy="-5" rx="2.8" ry="2.3" fill="rgba(255,150,200,0.8)"/>
          <ellipse cx="-10.5" cy="0" rx="2.3" ry="2" fill="rgba(255,150,200,0.8)"/>
          <ellipse cx="10.5" cy="0" rx="2.3" ry="2" fill="rgba(255,150,200,0.8)"/>
        </g>
      </svg>
    </div>
  );
}
