export const COLORS = ['red', 'yellow', 'green', 'blue'];

export const COLOR_HEX = {
  red: '#FF4757',
  yellow: '#FFD32A',
  green: '#2ED573',
  blue: '#1E90FF',
  wild: '#9B59B6',
};

let _idCounter = 0;
const uid = () => `c${++_idCounter}`;

export function createDeck() {
  const cards = [];

  for (const color of COLORS) {
    // 0 × 1
    cards.push({ id: uid(), color, type: 'number', value: 0 });
    // 1-9 × 2
    for (let v = 1; v <= 9; v++) {
      cards.push({ id: uid(), color, type: 'number', value: v });
      cards.push({ id: uid(), color, type: 'number', value: v });
    }
    // Skip × 2, Reverse × 2, Draw Two × 2
    for (let i = 0; i < 2; i++) {
      cards.push({ id: uid(), color, type: 'skip', value: null });
      cards.push({ id: uid(), color, type: 'reverse', value: null });
      cards.push({ id: uid(), color, type: 'draw2', value: null });
    }
  }

  // Wild × 4, Wild Draw Four × 4
  for (let i = 0; i < 4; i++) {
    cards.push({ id: uid(), color: 'wild', type: 'wild', value: null });
    cards.push({ id: uid(), color: 'wild', type: 'wild4', value: null });
  }

  return shuffleDeck(cards);
}

export function shuffleDeck(deck) {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function cardLabel(card, lang = 'zh') {
  const typeLabels = {
    zh: { skip: '禁止', reverse: '反转', draw2: '+2', wild: '换色', wild4: '+4换色' },
    en: { skip: 'Skip', reverse: 'Reverse', draw2: '+2', wild: 'Wild', wild4: 'Wild+4' },
  };
  if (card.type === 'number') return String(card.value);
  return typeLabels[lang][card.type] || card.type;
}
