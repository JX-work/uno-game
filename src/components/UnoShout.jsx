import { useEffect, useState } from 'react';
import styles from './UnoShout.module.css';
import { sounds } from '../utils/soundManager.js';

// isMobile: reduce particles on mobile
const isMobile = () => window.innerWidth < 480;

export default function UnoShout({ playerName, onDone }) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setVisible(true);
    sounds.uno();

    const count = isMobile() ? 8 : 18;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 16 + Math.random() * 20,
        delay: Math.random() * 0.4,
        shape: ['🐾', '⭐', '✨', '💫', '🌟'][i % 5],
      }))
    );

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 1600);

    return () => clearTimeout(hideTimer);
  }, []);

  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : styles.hidden}`}>
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.shape}
        </div>
      ))}

      {/* Main UNO text */}
      <div className={styles.shout}>
        <div className={styles.unoText}>UNO!</div>
        {playerName && <div className={styles.playerTag}>{playerName}</div>}
        <div className={styles.catPaws}>🐾🐾🐾</div>
      </div>
    </div>
  );
}
