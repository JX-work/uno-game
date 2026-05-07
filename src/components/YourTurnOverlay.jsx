import { useEffect, useState } from 'react';
import styles from './YourTurnOverlay.module.css';
import { useLang } from '../i18n/index.jsx';

export default function YourTurnOverlay({ trigger }) {
  const { t } = useLang();
  const [anim, setAnim] = useState('hidden');

  useEffect(() => {
    if (!trigger) return;
    setAnim('in');
    const t1 = setTimeout(() => setAnim('hold'), 350);
    const t2 = setTimeout(() => setAnim('out'), 1550);
    const t3 = setTimeout(() => setAnim('hidden'), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [trigger]);

  if (anim === 'hidden') return null;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${styles[anim]}`}>
        <svg className={styles.cat} viewBox="0 0 80 80" width="76" height="76" fill="none">
          {/* body */}
          <ellipse cx="40" cy="54" rx="19" ry="17" fill="#F4A060" />
          {/* head */}
          <circle cx="40" cy="28" r="16" fill="#F4A060" />
          {/* left ear */}
          <polygon points="24,16 20,4 32,14" fill="#F4A060" />
          <polygon points="25,15 22,7 30,14" fill="#FFB8A0" />
          {/* right ear */}
          <polygon points="56,16 60,4 48,14" fill="#F4A060" />
          <polygon points="55,15 58,7 50,14" fill="#FFB8A0" />
          {/* eyes */}
          <circle cx="34" cy="26" r="3" fill="#222" />
          <circle cx="46" cy="26" r="3" fill="#222" />
          <circle cx="35" cy="25" r="1" fill="#fff" />
          <circle cx="47" cy="25" r="1" fill="#fff" />
          {/* nose */}
          <ellipse cx="40" cy="31" rx="2.5" ry="1.5" fill="#FF9090" />
          {/* mouth */}
          <path d="M37 33 Q40 36 43 33" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* whiskers */}
          <line x1="20" y1="30" x2="35" y2="32" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="20" y1="34" x2="35" y2="34" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="60" y1="30" x2="45" y2="32" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="60" y1="34" x2="45" y2="34" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          {/* left arm (down) */}
          <ellipse cx="24" cy="58" rx="5" ry="8" fill="#F4A060" transform="rotate(-10 24 58)" />
          {/* right arm (raised) */}
          <ellipse cx="58" cy="46" rx="5" ry="9" fill="#F4A060" transform="rotate(-55 58 46)" />
          {/* raised paw */}
          <circle cx="65" cy="39" r="5" fill="#F4A060" />
          <circle cx="62.5" cy="34.5" r="2.5" fill="#F4A060" />
          <circle cx="67" cy="34" r="2.5" fill="#F4A060" />
          <circle cx="70" cy="37" r="2" fill="#F4A060" />
          {/* tail */}
          <path d="M57 68 Q72 60 66 48" stroke="#F4A060" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
        <div className={styles.label}>{t('yourTurn')}!</div>
      </div>
    </div>
  );
}
