import { useEffect, useState } from 'react';
import styles from './EmojiSticker.module.css';

/* ── SVG sticker components ─────────────────────────────────── */

export function CryCatSVG({ size = 100 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <polygon points="11,32 21,7 31,28" fill="#FF8C42"/>
      <polygon points="49,28 59,7 69,32" fill="#FF8C42"/>
      <polygon points="15,30 21,11 26,28" fill="#FFCABB"/>
      <polygon points="54,28 59,11 64,30" fill="#FFCABB"/>
      <circle cx="40" cy="44" r="26" fill="#FF8C42"/>
      {/* Crying squint eyes */}
      <path d="M24,38 Q30,44 36,38" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M44,38 Q50,44 56,38" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Tear streams */}
      <path d="M28,43 Q26,49 28,53" stroke="#4499FF" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M52,43 Q54,49 52,53" stroke="#4499FF" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="28" cy="54" rx="2.5" ry="3" fill="#4499FF" opacity="0.85"/>
      <ellipse cx="52" cy="54" rx="2.5" ry="3" fill="#4499FF" opacity="0.85"/>
      {/* Nose */}
      <ellipse cx="40" cy="50" rx="3.5" ry="2.5" fill="#FF6B8A"/>
      {/* Frown */}
      <path d="M34,57 Q40,53 46,57" stroke="#C04060" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="17" cy="50" rx="6" ry="4" fill="#FFB8A0" opacity="0.5"/>
      <ellipse cx="63" cy="50" rx="6" ry="4" fill="#FFB8A0" opacity="0.5"/>
    </svg>
  );
}

export function ShockCatSVG({ size = 100 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <polygon points="10,30 18,4 26,28" fill="#FF8C42"/>
      <polygon points="54,28 62,4 70,30" fill="#FF8C42"/>
      <polygon points="14,28 18,8 22,28" fill="#FFCABB"/>
      <polygon points="58,28 62,8 66,28" fill="#FFCABB"/>
      <circle cx="40" cy="44" r="26" fill="#FF8C42"/>
      {/* Shocked wide eyes */}
      <circle cx="28" cy="40" r="9" fill="white"/>
      <circle cx="52" cy="40" r="9" fill="white"/>
      <circle cx="28" cy="41" r="5.5" fill="#1A0E08"/>
      <circle cx="52" cy="41" r="5.5" fill="#1A0E08"/>
      <circle cx="30" cy="38" r="2" fill="white"/>
      <circle cx="54" cy="38" r="2" fill="white"/>
      {/* O-mouth */}
      <ellipse cx="40" cy="55" rx="5.5" ry="6.5" fill="#1A0E08"/>
      <ellipse cx="40" cy="56" rx="3.8" ry="5" fill="#E84060"/>
      {/* Sweat drop */}
      <ellipse cx="62" cy="26" rx="3" ry="5" fill="#88CCFF" opacity="0.9"/>
      <circle cx="62" cy="21.5" r="2" fill="#88CCFF" opacity="0.9"/>
      <ellipse cx="16" cy="50" rx="6" ry="4" fill="#FFB8A0" opacity="0.45"/>
      <ellipse cx="64" cy="50" rx="6" ry="4" fill="#FFB8A0" opacity="0.45"/>
    </svg>
  );
}

export function SwapCatsSVG({ size = 130 }) {
  return (
    <svg viewBox="0 0 110 60" width={size} height={Math.round(size * 60 / 110)}>
      {/* Left cat (orange) */}
      <polygon points="6,26 13,8 20,24" fill="#FF8C42"/>
      <polygon points="22,24 29,8 36,26" fill="#FF8C42"/>
      <circle cx="21" cy="34" r="18" fill="#FF8C42"/>
      <circle cx="15" cy="30" r="5" fill="#1A0E08"/>
      <circle cx="27" cy="30" r="5" fill="#1A0E08"/>
      <circle cx="16" cy="28" r="1.8" fill="white"/>
      <circle cx="28" cy="28" r="1.8" fill="white"/>
      <ellipse cx="21" cy="38" rx="3" ry="2.2" fill="#FF6B8A"/>
      {/* Right cat (husky) */}
      <polygon points="74,26 81,8 88,24" fill="#6B7B9E"/>
      <polygon points="90,24 97,8 104,26" fill="#6B7B9E"/>
      <circle cx="89" cy="34" r="18" fill="#6B7B9E"/>
      <ellipse cx="89" cy="40" rx="13" ry="10" fill="#E8EDF5" opacity="0.9"/>
      <circle cx="83" cy="30" r="5.5" fill="#6BC8E8"/>
      <circle cx="95" cy="30" r="5.5" fill="#6BC8E8"/>
      <circle cx="83" cy="30" r="3" fill="#111"/>
      <circle cx="95" cy="30" r="3" fill="#111"/>
      <circle cx="84" cy="28" r="1.5" fill="white"/>
      <circle cx="96" cy="28" r="1.5" fill="white"/>
      <ellipse cx="89" cy="38" rx="3" ry="2.2" fill="#FF6B8A"/>
      {/* Swap arrows */}
      <defs>
        <marker id="arUp" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <polygon points="0,6 3,0 6,6" fill="#FFD32A"/>
        </marker>
        <marker id="arDn" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <polygon points="0,0 3,6 6,0" fill="#FF4757"/>
        </marker>
      </defs>
      <path d="M42,18 Q55,4 68,18" stroke="#FFD32A" strokeWidth="2.5" fill="none" strokeLinecap="round" markerEnd="url(#arUp)"/>
      <path d="M68,46 Q55,60 42,46" stroke="#FF4757" strokeWidth="2.5" fill="none" strokeLinecap="round" markerEnd="url(#arDn)"/>
    </svg>
  );
}

export function RefuseDogSVG({ size = 100 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <ellipse cx="14" cy="38" rx="10" ry="15" fill="#C06020" transform="rotate(-15,14,38)"/>
      <ellipse cx="66" cy="38" rx="10" ry="15" fill="#C06020" transform="rotate(15,66,38)"/>
      <circle cx="40" cy="44" r="26" fill="#E87040"/>
      <ellipse cx="40" cy="52" rx="14" ry="10" fill="#F5E8D0"/>
      {/* Stern closed eyes */}
      <path d="M22,36 Q28,32 34,36" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M46,36 Q52,32 58,36" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="40" cy="48" rx="6" ry="4" fill="#1A0E08"/>
      <ellipse cx="38.5" cy="46.5" rx="2" ry="1.5" fill="white" opacity="0.5"/>
      <path d="M34,55 L46,55" stroke="#A06030" strokeWidth="2" strokeLinecap="round"/>
      {/* Raised paw */}
      <circle cx="64" cy="24" r="11" fill="#E87040"/>
      <ellipse cx="60" cy="19" rx="3.5" ry="3" fill="#F0D0A0"/>
      <ellipse cx="68" cy="19" rx="3.5" ry="3" fill="#F0D0A0"/>
      <ellipse cx="64" cy="27" rx="5.5" ry="4.5" fill="#F0D0A0"/>
      {/* Red X above paw */}
      <line x1="56" y1="8" x2="64" y2="16" stroke="#FF4757" strokeWidth="3" strokeLinecap="round"/>
      <line x1="64" y1="8" x2="56" y2="16" stroke="#FF4757" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="17" cy="52" rx="6" ry="4" fill="#FFAA80" opacity="0.4"/>
    </svg>
  );
}

export function RainbowCatSVG({ size = 110 }) {
  return (
    <svg viewBox="0 0 90 80" width={size} height={Math.round(size * 80 / 90)}>
      {/* Rainbow arc */}
      <path d="M4,72 Q45,-8 86,72" stroke="#FF4757" strokeWidth="6" fill="none" opacity="0.85"/>
      <path d="M9,72 Q45,2 81,72"  stroke="#FF8C00" strokeWidth="5" fill="none" opacity="0.85"/>
      <path d="M14,72 Q45,12 76,72" stroke="#FFD32A" strokeWidth="5" fill="none" opacity="0.85"/>
      <path d="M19,72 Q45,20 71,72" stroke="#2ED573" strokeWidth="5" fill="none" opacity="0.85"/>
      <path d="M24,72 Q45,28 66,72" stroke="#1E90FF" strokeWidth="5" fill="none" opacity="0.85"/>
      <path d="M29,72 Q45,36 61,72" stroke="#9B59B6" strokeWidth="4" fill="none" opacity="0.85"/>
      {/* White cat */}
      <polygon points="32,30 39,10 46,28" fill="#EEF4FC"/>
      <polygon points="44,28 51,10 58,30" fill="#EEF4FC"/>
      <polygon points="35,28 39,14 43,28" fill="#FFCABB"/>
      <polygon points="47,28 51,14 55,28" fill="#FFCABB"/>
      <circle cx="45" cy="44" r="22" fill="#EEF4FC"/>
      <circle cx="36" cy="40" r="6.5" fill="#6688CC"/>
      <circle cx="54" cy="40" r="6.5" fill="#6688CC"/>
      <ellipse cx="36" cy="40" rx="3.5" ry="5.5" fill="#111"/>
      <ellipse cx="54" cy="40" rx="3.5" ry="5.5" fill="#111"/>
      <circle cx="37.5" cy="37" r="2" fill="white"/>
      <circle cx="55.5" cy="37" r="2" fill="white"/>
      <ellipse cx="45" cy="49" rx="3.5" ry="2.5" fill="#FF8BAA"/>
      <path d="M40,53 Q45,57 50,53" stroke="#D06080" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Sparkles */}
      <text x="10" y="30" fontSize="13" fill="#FFD32A">✦</text>
      <text x="71" y="30" fontSize="13" fill="#FF4757">✦</text>
    </svg>
  );
}

export function LoudCatSVG({ size = 100 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <polygon points="8,28 17,3 27,26" fill="#FF8C42"/>
      <polygon points="53,26 63,3 72,28" fill="#FF8C42"/>
      <polygon points="12,26 17,7 22,26" fill="#FFCABB"/>
      <polygon points="58,26 63,7 68,26" fill="#FFCABB"/>
      {/* Puffed head */}
      <ellipse cx="40" cy="44" rx="29" ry="27" fill="#FF8C42"/>
      {/* Excited squint eyes */}
      <path d="M22,36 Q28,31 34,36" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M46,36 Q52,31 58,36" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Big open shouting mouth */}
      <ellipse cx="40" cy="55" rx="13" ry="11" fill="#1A0E08"/>
      <ellipse cx="40" cy="57" rx="10" ry="9" fill="#E84060"/>
      <ellipse cx="40" cy="63" rx="5" ry="3.5" fill="#FF9EC8"/>
      {/* Puffed cheeks */}
      <ellipse cx="13" cy="48" rx="9" ry="7" fill="#FFB8A0" opacity="0.65"/>
      <ellipse cx="67" cy="48" rx="9" ry="7" fill="#FFB8A0" opacity="0.65"/>
      {/* Sound waves */}
      <path d="M70,34 Q77,40 70,46" stroke="#FFD32A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M74,30 Q84,40 74,50" stroke="#FFD32A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

export function JumpDogSVG({ size = 100 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      {/* Motion blur lines */}
      <path d="M28,74 Q40,68 52,74" stroke="rgba(255,180,50,0.35)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M22,78 Q40,71 58,78" stroke="rgba(255,180,50,0.18)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Floppy ears floating */}
      <ellipse cx="12" cy="32" rx="10" ry="16" fill="#D4A020" transform="rotate(-28,12,32)"/>
      <ellipse cx="68" cy="32" rx="10" ry="16" fill="#D4A020" transform="rotate(28,68,32)"/>
      {/* Head */}
      <circle cx="40" cy="38" r="26" fill="#F0B828"/>
      <ellipse cx="16" cy="44" rx="9" ry="7" fill="#F8D060" opacity="0.65"/>
      <ellipse cx="64" cy="44" rx="9" ry="7" fill="#F8D060" opacity="0.65"/>
      {/* Star eyes */}
      <text x="28" y="40" fontSize="14" textAnchor="middle" fill="#FF4757">★</text>
      <text x="52" y="40" fontSize="14" textAnchor="middle" fill="#FF4757">★</text>
      {/* Big nose */}
      <ellipse cx="40" cy="46" rx="7" ry="5" fill="#1A0E08"/>
      <ellipse cx="38" cy="44.5" rx="2.2" ry="1.5" fill="white" opacity="0.5"/>
      {/* Happy mouth + tongue */}
      <path d="M30,52 Q40,61 50,52" stroke="#904010" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="40" cy="59" rx="5.5" ry="4.5" fill="#E84060"/>
      {/* Raised paws (arms up) */}
      <ellipse cx="11" cy="50" rx="9" ry="7" fill="#F0B828" transform="rotate(-40,11,50)"/>
      <ellipse cx="69" cy="50" rx="9" ry="7" fill="#F0B828" transform="rotate(40,69,50)"/>
    </svg>
  );
}

export function SadCatSVG({ size = 100 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      {/* Drooping ears */}
      <polygon points="14,36 22,10 28,32" fill="#8890A8" transform="rotate(20,22,20)"/>
      <polygon points="52,32 58,10 66,36" fill="#8890A8" transform="rotate(-20,58,20)"/>
      <polygon points="17,34 22,13 26,30" fill="#FFCABB" transform="rotate(20,22,20)"/>
      <polygon points="54,30 58,13 63,34" fill="#FFCABB" transform="rotate(-20,58,20)"/>
      {/* Head */}
      <circle cx="40" cy="46" r="26" fill="#8890A8"/>
      {/* Sad droopy eyes */}
      <path d="M24,40 Q30,38 36,42" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M44,42 Q50,38 56,40" stroke="#1A0E08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="26" cy="40" r="2" fill="white" opacity="0.85"/>
      <circle cx="56" cy="40" r="2" fill="white" opacity="0.85"/>
      {/* Single tear */}
      <path d="M29,43 Q28,49 30,52" stroke="#4499FF" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <ellipse cx="30" cy="53" rx="2.5" ry="3" fill="#4499FF"/>
      {/* Nose */}
      <ellipse cx="40" cy="52" rx="4" ry="3" fill="#FF8BAA"/>
      {/* Sad frown */}
      <path d="M33,58 Q40,54 47,58" stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="18" cy="53" rx="6" ry="4" fill="#AAB8CC" opacity="0.45"/>
      <ellipse cx="62" cy="53" rx="6" ry="4" fill="#AAB8CC" opacity="0.45"/>
    </svg>
  );
}

/* ── Sticker type map ───────────────────────────────────────── */

const STICKER_MAP = {
  cryCat:    CryCatSVG,
  shockCat:  ShockCatSVG,
  swapCats:  SwapCatsSVG,
  refuseDog: RefuseDogSVG,
  rainbowCat: RainbowCatSVG,
  loudCat:   LoudCatSVG,
  jumpDog:   JumpDogSVG,
  sadCat:    SadCatSVG,
};

/* ── Main EmojiSticker component ────────────────────────────── */

export default function EmojiSticker({ type, onDone }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 380);
    const t2 = setTimeout(() => setPhase('exit'), 1250);
    const t3 = setTimeout(() => onDone?.(), 1650);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  const StickerComp = STICKER_MAP[type];
  if (!StickerComp) return null;

  const animClass = type === 'rainbowCat'
    ? (phase === 'enter' ? styles.rainbowEnter : phase === 'exit' ? styles.rainbowExit : styles.rainbowHold)
    : type === 'sadCat'
    ? (phase === 'enter' ? styles.sadEnter : phase === 'exit' ? styles.stickerExit : styles.sadHold)
    : (phase === 'enter' ? styles.stickerEnter : phase === 'exit' ? styles.stickerExit : styles.stickerHold);

  return (
    <div className={`${styles.wrap} ${animClass}`}>
      <StickerComp />
    </div>
  );
}
