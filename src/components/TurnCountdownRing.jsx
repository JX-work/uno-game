import styles from './TurnCountdownRing.module.css';

const RADIUS = 28;
const STROKE = 5;
const SIZE = (RADIUS + STROKE) * 2 + 4; // 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CX = SIZE / 2;

export default function TurnCountdownRing({ timeLeft, total = 30 }) {
  if (timeLeft === null) return null;

  const progress = Math.max(0, timeLeft) / total;
  const offset = CIRCUMFERENCE * (1 - progress);
  const color = timeLeft > 15 ? '#4CAF50' : timeLeft > 5 ? '#FFD32A' : '#FF4757';
  const urgent = timeLeft <= 5;

  return (
    <div className={`${styles.ring} ${urgent ? styles.urgent : ''}`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={CX} cy={CX} r={RADIUS}
          fill="rgba(0,0,0,0.4)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={STROKE}
        />
        <circle
          cx={CX} cy={CX} r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CX})`}
          style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s ease' }}
        />
      </svg>
      <span className={`${styles.number} ${urgent ? styles.urgentNumber : ''}`}>
        {timeLeft}
      </span>
    </div>
  );
}
