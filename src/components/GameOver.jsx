import { useEffect, useRef, useState } from 'react';
import styles from './GameOver.module.css';
import { useLang } from '../i18n/index.jsx';
import { useGameStore } from '../store/gameStore.js';
import Avatar, { AVATAR_LIST } from './Avatar.jsx';
import { sounds, resumeAudio } from '../utils/soundManager.js';

const isMobile = () => window.innerWidth < 480;

function Particle({ x, y, size, shape, delay, color }) {
  return (
    <div
      className={styles.particle}
      style={{ left: `${x}%`, top: `${y}%`, fontSize: size,
        animationDelay: `${delay}s`, color }}
    >
      {shape}
    </div>
  );
}

export default function GameOver() {
  const { t } = useLang();
  const { winner, players, localPlayerId, resetGame, restartGame } = useGameStore();
  const [appeared, setAppeared] = useState(false);
  const [particles, setParticles] = useState([]);
  const didPlayRef = useRef(false);

  useEffect(() => {
    if (!winner || didPlayRef.current) return;
    didPlayRef.current = true;
    setAppeared(true);
    resumeAudio();
    setTimeout(() => sounds.victory(), 200);

    const count = isMobile() ? 12 : 28;
    const shapes = ['❤️','⭐','✨','💫','🌟','🐾','🎉','🎊'];
    const colors = ['#FF4757','#FFD32A','#2ED573','#1E90FF','#FF6B81'];
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90,
        size: 18 + Math.random() * 22,
        shape: shapes[i % shapes.length],
        delay: Math.random() * 0.8,
        color: colors[i % colors.length],
      }))
    );
  }, [winner]);

  if (!winner) return null;

  const isLocalWinner = winner.id === localPlayerId;
  const avatarIdx = winner.avatarIndex ?? 0;

  return (
    <div className={styles.overlay}>
      {/* Particle field */}
      {particles.map(p => <Particle key={p.id} {...p} />)}

      <div className={`${styles.modal} ${appeared ? styles.show : ''}`}>
        {/* Winner avatar — large */}
        <div className={styles.winnerAvatarWrap}>
          <div className={styles.winnerRing}>
            <Avatar
              index={avatarIdx}
              isAI={winner.isAI}
              aiIndex={parseInt(winner.id.replace(/\D/g, '')) || 0}
              size={80}
            />
          </div>
          <div className={styles.crownEmoji}>👑</div>
        </div>

        <div className={styles.winnerName}>{winner.name}</div>
        <div className={styles.winnerLabel}>{t('winner')}</div>

        {isLocalWinner
          ? <div className={styles.youWin}>{t('youWin')}</div>
          : <div className={styles.otherWin}>{winner.name}{t('aiWins')}</div>
        }

        {/* Scores */}
        <div className={styles.scores}>
          {players.map((p, i) => (
            <div key={p.id} className={`${styles.scoreRow} ${p.id === winner.id ? styles.winnerRow : ''}`}>
              <div className={styles.sAvatarWrap}>
                <Avatar
                  index={p.avatarIndex ?? i % 8}
                  isAI={p.isAI}
                  aiIndex={parseInt(p.id.replace(/\D/g, '')) || 0}
                  size={28}
                />
              </div>
              <span className={styles.sName}>{p.name}</span>
              <span className={styles.sCards}>{p.hand.length} {t('cards')}</span>
              {p.id === winner.id && <span className={styles.crown}>👑</span>}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={`${styles.primaryBtn} ${styles.bouncingBtn}`} onClick={() => { resumeAudio(); restartGame(); }}>
            🔄 {t('playAgain')}
          </button>
          <button className={styles.secondaryBtn} onClick={() => { resumeAudio(); resetGame(); }}>
            🏠 {t('backToMenu')}
          </button>
        </div>
      </div>
    </div>
  );
}
