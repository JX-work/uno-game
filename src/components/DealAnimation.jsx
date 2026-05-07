import { useEffect, useState, useRef } from 'react';
import styles from './DealAnimation.module.css';
import { sounds } from '../utils/soundManager.js';

// Target positions (relative to overlay center) for each player slot
const POSITIONS = [
  { x: 0,    y: 200  },  // bottom (local player)
  { x: 0,    y: -200 },  // top
  { x: -260, y: -30  },  // left
  { x: 260,  y: -30  },  // right
];

const CARDS_PER_PLAYER = 4; // visual only — show 4 cards per player for speed
const DEAL_INTERVAL = 70;   // ms between each card leaving pile
const CARD_FLIGHT_MS = 240;
const SHUFFLE_MS = 1400;
const FLIP_MS = 500;
const FADE_MS = 500;

export default function DealAnimation({ numPlayers = 2, onComplete }) {
  const [phase, setPhase] = useState('shuffle'); // shuffle | dealing | flip | fading | done
  const [shuffleFrame, setShuffleFrame] = useState(0);
  const [dealtCards, setDealtCards] = useState([]); // { id, playerIdx, flown }
  const [showStarter, setShowStarter] = useState(false);  // face-down
  const [starterFlipped, setStarterFlipped] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const timerRef = useRef([]);

  const clampedPlayers = Math.min(Math.max(numPlayers, 2), 4);

  function addTimer(fn, ms) {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
    return id;
  }

  useEffect(() => {
    sounds.shuffle();

    // Shuffle frames: wobble the pile 3 times
    let frame = 0;
    const shuffleTick = setInterval(() => {
      frame++;
      setShuffleFrame(frame);
      if (frame < 6) {
        if (frame % 2 === 0) sounds.shuffle();
      } else {
        clearInterval(shuffleTick);
        startDealing();
      }
    }, SHUFFLE_MS / 6);

    timerRef.current.push(shuffleTick);

    return () => {
      timerRef.current.forEach(clearTimeout);
      timerRef.current.forEach(clearInterval);
    };
  }, []);

  function startDealing() {
    setPhase('dealing');
    const totalCards = clampedPlayers * CARDS_PER_PLAYER;
    let cardId = 0;

    for (let i = 0; i < totalCards; i++) {
      const playerIdx = i % clampedPlayers;
      const delay = i * DEAL_INTERVAL;

      addTimer(() => {
        sounds.deal();
        setDealtCards(prev => [
          ...prev,
          { id: cardId++, playerIdx, flown: false },
        ]);
        // Mark as flown (start CSS transition) on next frame
        addTimer(() => {
          setDealtCards(prev =>
            prev.map((c, idx) => idx === prev.length - 1 ? { ...c, flown: true } : c)
          );
        }, 30);
      }, delay);
    }

    // After all cards dealt, show starter card then flip
    const afterDeal = totalCards * DEAL_INTERVAL + CARD_FLIGHT_MS + 200;
    addTimer(() => {
      setShowStarter(true);
      sounds.deal();
      addTimer(() => {
        setPhase('flip');
        sounds.flip();
        setStarterFlipped(true);
        // Fade out
        addTimer(() => {
          setPhase('fading');
          setOpacity(0);
          addTimer(() => {
            setPhase('done');
            onComplete?.();
          }, FADE_MS);
        }, FLIP_MS);
      }, 400);
    }, afterDeal);
  }

  if (phase === 'done') return null;

  const shuffleOffset = Math.sin(shuffleFrame * 1.2) * 18;

  return (
    <div
      className={styles.overlay}
      style={{ opacity, transition: phase === 'fading' ? `opacity ${FADE_MS}ms ease` : undefined }}
    >
      {/* Paw prints decoration */}
      <div className={styles.pawDecor}>
        {['🐾','🐾','🐾','🐾','🐾'].map((p, i) => (
          <span key={i} className={styles.paw} style={{ '--i': i }}>{p}</span>
        ))}
      </div>

      {/* Center pile */}
      <div className={styles.centerPile}>
        {/* Stack of face-down cards */}
        {[3, 2, 1, 0].map(i => (
          <div
            key={i}
            className={styles.pileCard}
            style={{
              transform: `translateX(${phase === 'shuffle' ? shuffleOffset * (i % 2 === 0 ? 1 : -1) * 0.4 : 0}px) rotate(${(i - 1.5) * 3}deg) translateY(${-i * 2}px)`,
              zIndex: i,
            }}
          >
            <PawCardBack />
          </div>
        ))}

        {/* Starter card that flips */}
        {showStarter && (
          <div className={`${styles.starterCard} ${starterFlipped ? styles.flipped : ''}`}>
            <div className={styles.starterInner}>
              <div className={styles.starterFront}><PawCardBack /></div>
              <div className={styles.starterBack}>
                <div className={styles.starterReveal}>★</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flying cards */}
      {dealtCards.map(card => {
        const pos = POSITIONS[card.playerIdx] || POSITIONS[0];
        return (
          <div
            key={card.id}
            className={styles.flyCard}
            style={{
              transform: card.flown
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(0.7) rotate(${(card.playerIdx * 33 + card.id * 7) % 20 - 10}deg)`
                : 'translate(-50%, -50%) scale(1)',
              transition: card.flown ? `transform ${CARD_FLIGHT_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` : 'none',
              opacity: card.flown ? 0 : 1,
            }}
          >
            <PawCardBack />
          </div>
        );
      })}

      {/* Label */}
      <div className={styles.label}>
        {phase === 'shuffle' ? '🃏 洗牌中... Shuffling...' : '🎴 发牌中... Dealing...'}
      </div>
    </div>
  );
}

function PawCardBack() {
  return (
    <div className={styles.cardBack}>
      <svg viewBox="0 0 54 78" width="54" height="78">
        <rect width="54" height="78" rx="8" fill="url(#bgGrad)"/>
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2c1050"/>
            <stop offset="100%" stopColor="#1a0840"/>
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="48" height="72" rx="6" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        {/* Center paw */}
        <g transform="translate(27,39)" opacity="0.8">
          <ellipse cx="0" cy="0" rx="8" ry="7" fill="rgba(255,150,200,0.7)"/>
          <ellipse cx="-10" cy="-8" rx="4" ry="3.5" fill="rgba(255,150,200,0.7)"/>
          <ellipse cx="10" cy="-8" rx="4" ry="3.5" fill="rgba(255,150,200,0.7)"/>
          <ellipse cx="-16" cy="0" rx="3.5" ry="3" fill="rgba(255,150,200,0.7)"/>
          <ellipse cx="16" cy="0" rx="3.5" ry="3" fill="rgba(255,150,200,0.7)"/>
        </g>
        {/* Small corner paws */}
        <g transform="translate(10,12) scale(0.4)" opacity="0.4">
          <ellipse cx="0" cy="0" rx="8" ry="7" fill="rgba(255,150,200,1)"/>
          <ellipse cx="-10" cy="-8" rx="4" ry="3.5" fill="rgba(255,150,200,1)"/>
          <ellipse cx="10" cy="-8" rx="4" ry="3.5" fill="rgba(255,150,200,1)"/>
          <ellipse cx="-16" cy="0" rx="3.5" ry="3" fill="rgba(255,150,200,1)"/>
          <ellipse cx="16" cy="0" rx="3.5" ry="3" fill="rgba(255,150,200,1)"/>
        </g>
        <g transform="translate(44,66) scale(0.4) rotate(180)" opacity="0.4">
          <ellipse cx="0" cy="0" rx="8" ry="7" fill="rgba(255,150,200,1)"/>
          <ellipse cx="-10" cy="-8" rx="4" ry="3.5" fill="rgba(255,150,200,1)"/>
          <ellipse cx="10" cy="-8" rx="4" ry="3.5" fill="rgba(255,150,200,1)"/>
          <ellipse cx="-16" cy="0" rx="3.5" ry="3" fill="rgba(255,150,200,1)"/>
          <ellipse cx="16" cy="0" rx="3.5" ry="3" fill="rgba(255,150,200,1)"/>
        </g>
      </svg>
    </div>
  );
}
