import styles from './Card.module.css';

const COLOR_GRAD = {
  red:    'linear-gradient(135deg, #FF4757 0%, #c0392b 100%)',
  yellow: 'linear-gradient(135deg, #FFD32A 0%, #f39c12 100%)',
  green:  'linear-gradient(135deg, #2ED573 0%, #27ae60 100%)',
  blue:   'linear-gradient(135deg, #1E90FF 0%, #2980b9 100%)',
  wild:   'linear-gradient(135deg, #9B59B6, #FF4757, #FFD32A, #2ED573, #1E90FF)',
};

const SYMBOL = {
  skip: '⊘',
  reverse: '↺',
  draw2: '+2',
  wild: '★',
  wild4: '+4',
};

function PawCardBack({ small }) {
  const w = small ? 52 : 72;
  const h = small ? 76 : 104;
  const cx = w / 2;
  const cy = h / 2;
  const scale = small ? 0.72 : 1;

  return (
    <div className={styles.faceDownInner} style={{ width: w, height: h }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <rect width={w} height={h} rx={small ? 9 : 12} fill="url(#cardBg)"/>
        <defs>
          <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e0840"/>
            <stop offset="100%" stopColor="#0d0428"/>
          </linearGradient>
        </defs>
        <rect x="3" y="3" width={w - 6} height={h - 6} rx={small ? 7 : 10}
          fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
        {/* Center paw print */}
        <g transform={`translate(${cx},${cy}) scale(${scale})`} opacity="0.85">
          <ellipse cx="0" cy="0" rx="9" ry="8" fill="#FF9EC8"/>
          <ellipse cx="-12" cy="-10" rx="5" ry="4" fill="#FF9EC8"/>
          <ellipse cx="12" cy="-10" rx="5" ry="4" fill="#FF9EC8"/>
          <ellipse cx="-18" cy="0" rx="4.5" ry="3.5" fill="#FF9EC8"/>
          <ellipse cx="18" cy="0" rx="4.5" ry="3.5" fill="#FF9EC8"/>
        </g>
        {/* Corner paws */}
        <g transform="translate(12,14) scale(0.35)" opacity="0.35">
          <ellipse cx="0" cy="0" rx="9" ry="8" fill="#FF9EC8"/>
          <ellipse cx="-12" cy="-10" rx="5" ry="4" fill="#FF9EC8"/>
          <ellipse cx="12" cy="-10" rx="5" ry="4" fill="#FF9EC8"/>
        </g>
        <g transform={`translate(${w - 12},${h - 14}) scale(0.35) rotate(180)`} opacity="0.35">
          <ellipse cx="0" cy="0" rx="9" ry="8" fill="#FF9EC8"/>
          <ellipse cx="-12" cy="-10" rx="5" ry="4" fill="#FF9EC8"/>
          <ellipse cx="12" cy="-10" rx="5" ry="4" fill="#FF9EC8"/>
        </g>
      </svg>
    </div>
  );
}

export default function Card({ card, onClick, disabled, selected, small, faceDown, highlight, flying, playable }) {
  if (faceDown) {
    return (
      <div
        className={`${styles.card} ${styles.faceDown} ${small ? styles.small : ''} ${onClick ? styles.clickable : ''}`}
        onClick={onClick}
      >
        <PawCardBack small={small} />
      </div>
    );
  }

  const center = card.type === 'number' ? String(card.value) : (SYMBOL[card.type] ?? '?');
  const corner = card.type === 'number' ? String(card.value) : (SYMBOL[card.type] ?? '');

  return (
    <div
      className={[
        styles.card,
        small ? styles.small : '',
        disabled ? styles.disabled : '',
        selected ? styles.selected : '',
        highlight ? styles.highlight : '',
        flying ? styles.flying : '',
        onClick && !disabled ? styles.clickable : '',
        playable ? styles.playable : '',
      ].filter(Boolean).join(' ')}
      style={{ background: COLOR_GRAD[card.color] || COLOR_GRAD.wild }}
      onClick={!disabled ? onClick : undefined}
      role={onClick ? 'button' : undefined}
    >
      <span className={styles.cornerTL}>{corner}</span>
      <span className={styles.center}>{center}</span>
      <span className={styles.cornerBR}>{corner}</span>
    </div>
  );
}
