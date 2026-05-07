/**
 * Canonical animal avatar component — type-string interface.
 * Types: 'orange-cat' | 'black-cat' | 'white-cat' | 'shiba' | 'bulldog' | 'rabbit'
 * Also: 'grey-cat' | 'golden' | 'husky' (AI-only, not in picker)
 */

export const ANIMAL_TYPES = [
  { type: 'orange-cat', zh: '橘猫',  en: 'Orange Cat', color: '#FF8C42', index: 0 },
  { type: 'black-cat',  zh: '黑猫',  en: 'Black Cat',  color: '#3D3565', index: 1 },
  { type: 'white-cat',  zh: '白猫',  en: 'White Cat',  color: '#C8D8E8', index: 2 },
  { type: 'shiba',      zh: '柴犬',  en: 'Shiba Inu',  color: '#E87040', index: 3 },
  { type: 'bulldog',    zh: '斗牛犬', en: 'Bulldog',   color: '#A07860', index: 4 },
  { type: 'rabbit',     zh: '兔子',  en: 'Rabbit',     color: '#F0A0C8', index: 5 },
];

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

function ShibaInu({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <polygon points="13,34 22,8 32,30" fill="#C06020"/>
      <polygon points="48,30 58,8 67,34" fill="#C06020"/>
      <polygon points="17,32 22,12 28,30" fill="#F0D0A0"/>
      <polygon points="52,30 58,12 63,32" fill="#F0D0A0"/>
      <circle cx="40" cy="44" r="27" fill="#E87040"/>
      <ellipse cx="40" cy="53" rx="16" ry="12" fill="#F5E8D0"/>
      <path d="M21,38 Q27,33 33,38" stroke="#1A0E08" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M47,38 Q53,33 59,38" stroke="#1A0E08" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="40" cy="48" rx="7" ry="5" fill="#1A0E08"/>
      <ellipse cx="38" cy="46.5" rx="2.5" ry="1.5" fill="white" opacity="0.6"/>
      <path d="M33,55 Q40,61 47,55" stroke="#A06030" strokeWidth="1.8" fill="none"/>
      <ellipse cx="17" cy="52" rx="8" ry="5" fill="#FFAA80" opacity="0.5"/>
      <ellipse cx="63" cy="52" rx="8" ry="5" fill="#FFAA80" opacity="0.5"/>
    </svg>
  );
}

function Bulldog({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <ellipse cx="14" cy="38" rx="10" ry="15" fill="#906850" transform="rotate(-15,14,38)"/>
      <ellipse cx="66" cy="38" rx="10" ry="15" fill="#906850" transform="rotate(15,66,38)"/>
      <circle cx="40" cy="44" r="27" fill="#B09070"/>
      <path d="M30,34 Q35,30 40,34" stroke="#907050" strokeWidth="1.5" fill="none"/>
      <path d="M40,34 Q45,30 50,34" stroke="#907050" strokeWidth="1.5" fill="none"/>
      <path d="M26,42 Q30,38 34,42" stroke="#907050" strokeWidth="1.2" fill="none"/>
      <path d="M46,42 Q50,38 54,42" stroke="#907050" strokeWidth="1.2" fill="none"/>
      <circle cx="28" cy="38" r="6" fill="#1A0E08"/>
      <circle cx="52" cy="38" r="6" fill="#1A0E08"/>
      <circle cx="30" cy="35.5" r="2" fill="white"/>
      <circle cx="54" cy="35.5" r="2" fill="white"/>
      <ellipse cx="40" cy="50" rx="9" ry="6" fill="#2A1810"/>
      <ellipse cx="37" cy="48" rx="3" ry="2" fill="white" opacity="0.4"/>
      <ellipse cx="40" cy="60" rx="8" ry="5" fill="#E84060"/>
      <path d="M32,58 Q40,64 48,58" fill="#E84060"/>
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
    </svg>
  );
}

function GoldenRetriever({ s }) {
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <ellipse cx="14" cy="42" rx="11" ry="18" fill="#D4A020" transform="rotate(-10,14,42)"/>
      <ellipse cx="66" cy="42" rx="11" ry="18" fill="#D4A020" transform="rotate(10,66,42)"/>
      <circle cx="40" cy="44" r="27" fill="#F0B828"/>
      <circle cx="28" cy="40" r="7" fill="#2A1808"/>
      <circle cx="52" cy="40" r="7" fill="#2A1808"/>
      <circle cx="30" cy="37" r="2.5" fill="white"/>
      <circle cx="54" cy="37" r="2.5" fill="white"/>
      <ellipse cx="40" cy="50" rx="8" ry="5.5" fill="#1A0E08"/>
      <ellipse cx="38" cy="48" rx="2.5" ry="1.5" fill="white" opacity="0.5"/>
      <path d="M32,56 Q40,63 48,56" stroke="#904010" strokeWidth="2" fill="none"/>
      <ellipse cx="40" cy="61" rx="5" ry="4" fill="#E84060"/>
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
      <ellipse cx="40" cy="50" rx="20" ry="17" fill="#E8EDF5"/>
      <ellipse cx="27" cy="38" rx="10" ry="8" fill="#4A5870"/>
      <ellipse cx="53" cy="38" rx="10" ry="8" fill="#4A5870"/>
      <circle cx="27" cy="38" r="6" fill="#6BC8E8"/>
      <circle cx="53" cy="38" r="6" fill="#6BC8E8"/>
      <circle cx="27" cy="38" r="3.5" fill="#111"/>
      <circle cx="53" cy="38" r="3.5" fill="#111"/>
      <circle cx="28.5" cy="36" r="1.8" fill="white"/>
      <circle cx="54.5" cy="36" r="1.8" fill="white"/>
      <ellipse cx="40" cy="50" rx="7" ry="5" fill="#1A1E2A"/>
      <path d="M33,56 Q40,61 47,56" stroke="#808090" strokeWidth="1.8" fill="none"/>
    </svg>
  );
}

const TYPE_MAP = {
  'orange-cat': OrangeCat,
  'black-cat':  BlackCat,
  'white-cat':  WhiteCat,
  'shiba':      ShibaInu,
  'bulldog':    Bulldog,
  'rabbit':     Rabbit,
  'grey-cat':   GreyCat,
  'golden':     GoldenRetriever,
  'husky':      Husky,
};

export default function AnimalAvatar({ type = 'orange-cat', size = 48 }) {
  const Renderer = TYPE_MAP[type] ?? OrangeCat;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Renderer s={size} />
    </div>
  );
}

export function animalTypeFromIndex(idx) {
  return ANIMAL_TYPES[idx % ANIMAL_TYPES.length]?.type ?? 'orange-cat';
}
