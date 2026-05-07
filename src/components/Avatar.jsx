import styles from './Avatar.module.css';

// Indices 0-5 are shown in the avatar picker (player-selectable)
// Indices 6-8 are reserved for AI opponents
export const AVATAR_LIST = [
  { id: 'orange-cat', zh: '橘猫',   en: 'Orange Cat', color: '#FF8C42' },
  { id: 'black-cat',  zh: '黑猫',   en: 'Black Cat',  color: '#3D3565' },
  { id: 'white-cat',  zh: '白猫',   en: 'White Cat',  color: '#C8D8E8' },
  { id: 'shiba',      zh: '柴犬',   en: 'Shiba Inu',  color: '#E87040' },
  { id: 'bulldog',    zh: '斗牛犬', en: 'Bulldog',    color: '#A07860' },
  { id: 'rabbit',     zh: '兔子',   en: 'Rabbit',     color: '#F0A0C8' },
];

export const AI_AVATARS = [
  { id: 'ai-cat',  zh: 'AI猫', en: 'AI Cat',   color: '#A55EEA' },
  { id: 'ai-dog',  zh: 'AI狗', en: 'AI Dog',   color: '#FF6348' },
  { id: 'ai-kitty',zh: 'AI橙', en: 'AI Orange',color: '#2ED573' },
];

/* ── SVG avatar renderers ──────────────────────────────────────────── */

function OrangeCat({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <polygon points="12,32 22,7 32,28" fill="#E87028"/>
      <polygon points="48,28 58,7 68,32" fill="#E87028"/>
      <polygon points="16,30 22,11 27,28" fill="#FFCABB"/>
      <polygon points="53,28 58,11 64,30" fill="#FFCABB"/>
      <circle cx="40" cy="44" r="27" fill="#FF8C42"/>
      <path d="M33,24 Q37,30 40,24 Q43,30 47,24" stroke="#C06010" strokeWidth="2" fill="none" opacity="0.7"/>
      <circle cx="27" cy="40" r="7.5" fill="#1A0E08"/>
      <circle cx="53" cy="40" r="7.5" fill="#1A0E08"/>
      <circle cx="29" cy="37" r="2.8" fill="white"/>
      <circle cx="55" cy="37" r="2.8" fill="white"/>
      <ellipse cx="40" cy="50" rx="4" ry="3" fill="#FF6B8A"/>
      <path d="M35,54 Q40,59 45,54" stroke="#C04060" strokeWidth="1.8" fill="none"/>
      <ellipse cx="16" cy="50" rx="7" ry="4.5" fill="#FFB8A0" opacity="0.55"/>
      <ellipse cx="64" cy="50" rx="7" ry="4.5" fill="#FFB8A0" opacity="0.55"/>
    </svg>
  );
}

function BlackCat({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <polygon points="10,32 20,5 30,28" fill="#1A1830"/>
      <polygon points="50,28 60,5 70,32" fill="#1A1830"/>
      <polygon points="14,30 20,9 25,28" fill="#6B3080"/>
      <polygon points="55,28 60,9 66,30" fill="#6B3080"/>
      <circle cx="40" cy="44" r="27" fill="#2A2445"/>
      <circle cx="27" cy="39" r="8" fill="#A8D800"/>
      <circle cx="53" cy="39" r="8" fill="#A8D800"/>
      <ellipse cx="27" cy="39" rx="4" ry="7" fill="#111"/>
      <ellipse cx="53" cy="39" rx="4" ry="7" fill="#111"/>
      <circle cx="29" cy="36" r="2" fill="white"/>
      <circle cx="55" cy="36" r="2" fill="white"/>
      <ellipse cx="40" cy="50" rx="4" ry="3" fill="#FF6B8A"/>
      <path d="M36,54 Q40,58 44,54" stroke="#C04060" strokeWidth="1.8" fill="none"/>
      <ellipse cx="15" cy="50" rx="6" ry="4" fill="#7B50A0" opacity="0.45"/>
      <ellipse cx="65" cy="50" rx="6" ry="4" fill="#7B50A0" opacity="0.45"/>
      <ellipse cx="40" cy="62" rx="10" ry="5" fill="white" opacity="0.3"/>
    </svg>
  );
}

function WhiteCat({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <polygon points="11,32 21,6 31,28" fill="#D0E0F0"/>
      <polygon points="49,28 59,6 69,32" fill="#D0E0F0"/>
      <polygon points="15,30 21,10 26,28" fill="#FFCABB"/>
      <polygon points="54,28 59,10 64,30" fill="#FFCABB"/>
      <circle cx="40" cy="44" r="27" fill="#EEF4FC"/>
      <circle cx="27" cy="40" r="7.5" fill="#6688CC"/>
      <circle cx="53" cy="40" r="7.5" fill="#6688CC"/>
      <ellipse cx="27" cy="40" rx="4" ry="6.5" fill="#111"/>
      <ellipse cx="53" cy="40" rx="4" ry="6.5" fill="#111"/>
      <circle cx="29" cy="37" r="2.5" fill="white"/>
      <circle cx="55" cy="37" r="2.5" fill="white"/>
      <ellipse cx="40" cy="50" rx="3.5" ry="2.5" fill="#FF8BAA"/>
      <path d="M36,54 Q40,58 44,54" stroke="#D06080" strokeWidth="1.8" fill="none"/>
      <ellipse cx="16" cy="50" rx="7" ry="4.5" fill="#FFAABB" opacity="0.45"/>
      <ellipse cx="64" cy="50" rx="7" ry="4.5" fill="#FFAABB" opacity="0.45"/>
    </svg>
  );
}

function GreyCat({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <polygon points="11,32 21,7 31,28" fill="#707898"/>
      <polygon points="49,28 59,7 69,32" fill="#707898"/>
      <polygon points="15,30 21,11 26,28" fill="#FFCABB"/>
      <polygon points="54,28 59,11 64,30" fill="#FFCABB"/>
      <circle cx="40" cy="44" r="27" fill="#8890A8"/>
      <circle cx="27" cy="40" r="7.5" fill="#1A1E2A"/>
      <circle cx="53" cy="40" r="7.5" fill="#1A1E2A"/>
      <circle cx="29" cy="37" r="2.5" fill="white"/>
      <circle cx="55" cy="37" r="2.5" fill="white"/>
      <ellipse cx="40" cy="50" rx="4" ry="3" fill="#FF8BAA"/>
      <path d="M36,54 Q40,58 44,54" stroke="#C06080" strokeWidth="1.8" fill="none"/>
      <ellipse cx="16" cy="50" rx="7" ry="4" fill="#FFAABB" opacity="0.4"/>
      <ellipse cx="64" cy="50" rx="7" ry="4" fill="#FFAABB" opacity="0.4"/>
      <path d="M34,46 Q36,47 40,46 Q44,47 46,46" stroke="#607088" strokeWidth="1.2" fill="none" opacity="0.6"/>
    </svg>
  );
}

function ShibaInu({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <polygon points="13,34 22,8 32,30" fill="#C06020"/>
      <polygon points="48,30 58,8 67,34" fill="#C06020"/>
      <polygon points="17,32 22,12 28,30" fill="#F0D0A0"/>
      <polygon points="52,30 58,12 63,32" fill="#F0D0A0"/>
      <circle cx="40" cy="44" r="27" fill="#E87040"/>
      {/* White muzzle patch */}
      <ellipse cx="40" cy="53" rx="16" ry="12" fill="#F5E8D0"/>
      {/* Eyes - happy squint */}
      <path d="M21,38 Q27,33 33,38" stroke="#1A0E08" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M47,38 Q53,33 59,38" stroke="#1A0E08" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Big nose */}
      <ellipse cx="40" cy="48" rx="7" ry="5" fill="#1A0E08"/>
      <ellipse cx="38" cy="46.5" rx="2.5" ry="1.5" fill="white" opacity="0.6"/>
      {/* Mouth */}
      <path d="M33,55 Q40,61 47,55" stroke="#A06030" strokeWidth="1.8" fill="none"/>
      {/* Cheeks */}
      <ellipse cx="17" cy="52" rx="8" ry="5" fill="#FFAA80" opacity="0.5"/>
      <ellipse cx="63" cy="52" rx="8" ry="5" fill="#FFAA80" opacity="0.5"/>
    </svg>
  );
}

function Bulldog({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      {/* Floppy ears */}
      <ellipse cx="14" cy="38" rx="10" ry="15" fill="#906850" transform="rotate(-15,14,38)"/>
      <ellipse cx="66" cy="38" rx="10" ry="15" fill="#906850" transform="rotate(15,66,38)"/>
      <circle cx="40" cy="44" r="27" fill="#B09070"/>
      {/* Wrinkles */}
      <path d="M30,34 Q35,30 40,34" stroke="#907050" strokeWidth="1.5" fill="none"/>
      <path d="M40,34 Q45,30 50,34" stroke="#907050" strokeWidth="1.5" fill="none"/>
      <path d="M26,42 Q30,38 34,42" stroke="#907050" strokeWidth="1.2" fill="none"/>
      <path d="M46,42 Q50,38 54,42" stroke="#907050" strokeWidth="1.2" fill="none"/>
      {/* Eyes - small, kind */}
      <circle cx="28" cy="38" r="6" fill="#1A0E08"/>
      <circle cx="52" cy="38" r="6" fill="#1A0E08"/>
      <circle cx="30" cy="35.5" r="2" fill="white"/>
      <circle cx="54" cy="35.5" r="2" fill="white"/>
      {/* Wide flat nose */}
      <ellipse cx="40" cy="50" rx="9" ry="6" fill="#2A1810"/>
      <ellipse cx="37" cy="48" rx="3" ry="2" fill="white" opacity="0.4"/>
      {/* Underbite tongue */}
      <ellipse cx="40" cy="60" rx="8" ry="5" fill="#E84060"/>
      <path d="M32,58 Q40,64 48,58" fill="#E84060"/>
    </svg>
  );
}

function GoldenRetriever({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      {/* Floppy ears - fluffy */}
      <ellipse cx="14" cy="42" rx="11" ry="18" fill="#D4A020" transform="rotate(-10,14,42)"/>
      <ellipse cx="66" cy="42" rx="11" ry="18" fill="#D4A020" transform="rotate(10,66,42)"/>
      <circle cx="40" cy="44" r="27" fill="#F0B828"/>
      {/* Fluffy cheeks hint */}
      <ellipse cx="16" cy="50" rx="9" ry="7" fill="#F8D060" opacity="0.6"/>
      <ellipse cx="64" cy="50" rx="9" ry="7" fill="#F8D060" opacity="0.6"/>
      {/* Eyes */}
      <circle cx="28" cy="40" r="7" fill="#2A1808"/>
      <circle cx="52" cy="40" r="7" fill="#2A1808"/>
      <circle cx="30" cy="37" r="2.5" fill="white"/>
      <circle cx="54" cy="37" r="2.5" fill="white"/>
      {/* Big nose */}
      <ellipse cx="40" cy="50" rx="8" ry="5.5" fill="#1A0E08"/>
      <ellipse cx="38" cy="48" rx="2.5" ry="1.5" fill="white" opacity="0.5"/>
      {/* Happy mouth */}
      <path d="M32,56 Q40,63 48,56" stroke="#904010" strokeWidth="2" fill="none"/>
      {/* Tongue */}
      <ellipse cx="40" cy="61" rx="5" ry="4" fill="#E84060"/>
      <ellipse cx="16" cy="52" rx="7" ry="4.5" fill="#FFCC80" opacity="0.4"/>
      <ellipse cx="64" cy="52" rx="7" ry="4.5" fill="#FFCC80" opacity="0.4"/>
    </svg>
  );
}

function Husky({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <polygon points="12,32 22,6 32,28" fill="#4A5870"/>
      <polygon points="48,28 58,6 68,32" fill="#4A5870"/>
      <polygon points="16,30 22,10 27,28" fill="#F0E8E0"/>
      <polygon points="53,28 58,10 64,30" fill="#F0E8E0"/>
      <circle cx="40" cy="44" r="27" fill="#6B7B9E"/>
      {/* White mask */}
      <ellipse cx="40" cy="50" rx="20" ry="17" fill="#E8EDF5"/>
      {/* Eye mask markings */}
      <ellipse cx="27" cy="38" rx="10" ry="8" fill="#4A5870"/>
      <ellipse cx="53" cy="38" rx="10" ry="8" fill="#4A5870"/>
      {/* Eyes */}
      <circle cx="27" cy="38" r="6" fill="#6BC8E8"/>
      <circle cx="53" cy="38" r="6" fill="#6BC8E8"/>
      <circle cx="27" cy="38" r="3.5" fill="#111"/>
      <circle cx="53" cy="38" r="3.5" fill="#111"/>
      <circle cx="28.5" cy="36" r="1.8" fill="white"/>
      <circle cx="54.5" cy="36" r="1.8" fill="white"/>
      {/* Nose */}
      <ellipse cx="40" cy="50" rx="7" ry="5" fill="#1A1E2A"/>
      <ellipse cx="38" cy="48.5" rx="2.5" ry="1.5" fill="white" opacity="0.5"/>
      {/* Mouth */}
      <path d="M33,56 Q40,61 47,56" stroke="#808090" strokeWidth="1.8" fill="none"/>
      <ellipse cx="16" cy="52" rx="7" ry="4" fill="#A0BBCC" opacity="0.4"/>
      <ellipse cx="64" cy="52" rx="7" ry="4" fill="#A0BBCC" opacity="0.4"/>
    </svg>
  );
}

function Rabbit({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <ellipse cx="27" cy="19" rx="8" ry="21" fill="#F0D0E8" transform="rotate(-8,27,19)"/>
      <ellipse cx="53" cy="19" rx="8" ry="21" fill="#F0D0E8" transform="rotate(8,53,19)"/>
      <ellipse cx="27" cy="19" rx="4" ry="17" fill="#FFAAB8" transform="rotate(-8,27,19)"/>
      <ellipse cx="53" cy="19" rx="4" ry="17" fill="#FFAAB8" transform="rotate(8,53,19)"/>
      <circle cx="40" cy="47" r="26" fill="#F8EEF4"/>
      <circle cx="28" cy="43" r="6.5" fill="#FF6BA8"/>
      <circle cx="52" cy="43" r="6.5" fill="#FF6BA8"/>
      <circle cx="28" cy="43" r="3.8" fill="#1A0E08"/>
      <circle cx="52" cy="43" r="3.8" fill="#1A0E08"/>
      <circle cx="29.5" cy="41" r="1.8" fill="white"/>
      <circle cx="53.5" cy="41" r="1.8" fill="white"/>
      <ellipse cx="40" cy="52" rx="3" ry="2" fill="#FF8BAA"/>
      <path d="M36,54 Q40,59 44,54" stroke="#D06080" strokeWidth="1.5" fill="none"/>
      <ellipse cx="17" cy="52" rx="7" ry="5" fill="#FFAABB" opacity="0.4"/>
      <ellipse cx="63" cy="52" rx="7" ry="5" fill="#FFAABB" opacity="0.4"/>
    </svg>
  );
}

function AIRobot({ s, color }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      {/* Antenna */}
      <line x1="40" y1="10" x2="40" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <circle cx="40" cy="8" r="4" fill={color}/>
      {/* Head */}
      <rect x="14" y="20" width="52" height="46" rx="14" fill={color}/>
      <rect x="18" y="24" width="44" height="38" rx="10" fill="rgba(0,0,0,0.2)"/>
      {/* Eyes */}
      <circle cx="28" cy="40" r="8" fill="white"/>
      <circle cx="52" cy="40" r="8" fill="white"/>
      <circle cx="28" cy="40" r="5" fill="#111"/>
      <circle cx="52" cy="40" r="5" fill="#111"/>
      <circle cx="30" cy="38" r="2" fill="white"/>
      <circle cx="54" cy="38" r="2" fill="white"/>
      {/* Mouth grid */}
      <rect x="24" y="52" width="32" height="8" rx="4" fill="rgba(255,255,255,0.3)"/>
      {[0,1,2,3].map(i => (
        <rect key={i} x={26 + i * 8} y="53.5" width="5" height="5" rx="1" fill="rgba(0,0,0,0.3)"/>
      ))}
    </svg>
  );
}

// Indices 0-5: player-selectable; 6-8: AI-only
const RENDERERS = [OrangeCat, BlackCat, WhiteCat, ShibaInu, Bulldog, Rabbit, GreyCat, GoldenRetriever, Husky];

export default function Avatar({ index = 0, size = 48, isAI = false, aiIndex = 0, className = '' }) {
  const s = size;

  if (isAI) {
    const aiColor = AI_AVATARS[aiIndex % AI_AVATARS.length].color;
    return (
      <div className={`${styles.wrap} ${className}`} style={{ width: s, height: s }}>
        <AIRobot s={s} color={aiColor} />
      </div>
    );
  }

  const Renderer = RENDERERS[index % RENDERERS.length];
  return (
    <div className={`${styles.wrap} ${className}`} style={{ width: s, height: s }}>
      <Renderer s={s} />
    </div>
  );
}

export function AvatarPicker({ selected, onChange, lang = 'zh' }) {
  return (
    <div className={styles.picker}>
      {AVATAR_LIST.map((a, i) => (
        <button
          key={a.id}
          type="button"
          className={`${styles.pickerBtn} ${selected === i ? styles.pickerSelected : ''}`}
          onClick={() => onChange(i)}
          title={a[lang]}
        >
          <Avatar index={i} size={44} />
          <span className={styles.pickerLabel}>{a[lang]}</span>
        </button>
      ))}
    </div>
  );
}
