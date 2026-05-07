import { isSoundEnabled } from '../store/settingsStore.js';

let _ctx = null;

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

export function resumeAudio() {
  const c = ctx();
  if (c.state === 'suspended') c.resume();
}

// tone: freq(Hz), startTime, duration(s), waveType, gain, endFreq
function tone(freq, t, dur, type = 'sine', gain = 0.22, endFreq = null) {
  const c = ctx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur);
}

function noise(t, dur, gain = 0.08) {
  const c = ctx();
  const size = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, size, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(g);
  g.connect(c.destination);
  src.start(t);
  src.stop(t + dur);
}

export const sounds = {
  shuffle() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      for (let i = 0; i < 5; i++) {
        noise(now + i * 0.09, 0.07, 0.14);
        tone(700, now + i * 0.09, 0.06, 'sawtooth', 0.07, 150);
      }
    } catch {}
  },

  deal() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(1500, now, 0.035, 'triangle', 0.16);
      noise(now, 0.025, 0.06);
    } catch {}
  },

  flip() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(520, now, 0.06, 'sine', 0.22);
      tone(780, now + 0.055, 0.1, 'sine', 0.18);
    } catch {}
  },

  play() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(680, now, 0.05, 'triangle', 0.18);
      noise(now, 0.045, 0.045);
    } catch {}
  },

  slap() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      // Short sharp impact: noise burst + low thud
      noise(now, 0.018, 0.22);
      tone(180, now, 0.06, 'sine', 0.28, 80);
    } catch {}
  },

  draw() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(340, now, 0.13, 'sine', 0.16, 200);
    } catch {}
  },

  plus2() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(380, now, 0.08, 'square', 0.2);
      tone(480, now + 0.09, 0.08, 'square', 0.2);
      // Cat meow ↑ then ↓
      tone(1900, now + 0.2, 0.1, 'sine', 0.14, 1500);
      tone(1500, now + 0.29, 0.12, 'sine', 0.11, 1000);
    } catch {}
  },

  plus4() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      [280, 360, 440, 520].forEach((f, i) => tone(f, now + i * 0.07, 0.07, 'square', 0.2));
      // Dramatic cat wail
      tone(2100, now + 0.35, 0.12, 'sine', 0.18, 1400);
      tone(1600, now + 0.46, 0.15, 'sine', 0.14, 900);
      tone(1000, now + 0.6, 0.18, 'sine', 0.1, 600);
    } catch {}
  },

  reverse() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(850, now, 0.12, 'sawtooth', 0.14, 1700);
      tone(1700, now + 0.08, 0.12, 'sawtooth', 0.1, 850);
      noise(now, 0.22, 0.045);
    } catch {}
  },

  skip() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(950, now, 0.04, 'square', 0.28);
      tone(460, now + 0.05, 0.08, 'square', 0.22);
    } catch {}
  },

  wildColor() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      // C E G C major arpeggio
      [523, 659, 784, 1047].forEach((f, i) => tone(f, now + i * 0.07, 0.12, 'sine', 0.2));
    } catch {}
  },

  uno() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      // Main melody: G → C → E, strong and bright
      tone(784,  now,       0.1,  'sine', 0.32);
      tone(1047, now + 0.1, 0.1,  'sine', 0.32);
      tone(1319, now + 0.2, 0.28, 'sine', 0.35);
      // Harmony layer for richness
      tone(1568, now + 0.2, 0.28, 'sine', 0.14, 1319);
      // Paw print flourish
      tone(2093, now + 0.35, 0.12, 'sine', 0.12, 1760);
    } catch {}
  },

  victory() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      [523, 659, 784, 659, 784, 1047, 1319].forEach((f, i) =>
        tone(f, now + i * 0.14, 0.17, 'sine', 0.2)
      );
    } catch {}
  },

  penalty() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(400, now, 0.1, 'sine', 0.2, 260);
      tone(260, now + 0.12, 0.22, 'sine', 0.18, 180);
    } catch {}
  },

  tick() {
    if (!isSoundEnabled()) return;
    try {
      const c = ctx(); const now = c.currentTime;
      tone(1100, now, 0.035, 'sine', 0.1);
    } catch {}
  },
};
