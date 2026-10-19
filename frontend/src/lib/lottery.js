// Daily lottery wheel — 1 spin per day, absurd prizes
const LOTTERY_KEY = 'baffe_lottery_v1';

export const PRIZES = [
    { id: 'pyjama', label: 'PYJAMA EXCLUSIF', desc: 'Tu débloques le mode pyjama (lol non, c\'est juste un sticker)', emoji: '🩱', color: '#FF8C00' },
    { id: 'orgueil', label: '-50% ORGUEIL', desc: 'Ton orgueil vient de prendre une rouste. Tant mieux.', emoji: '📉', color: '#FF3B30', white: true },
    { id: 'lotto', label: 'MAMIE-LOTTO', desc: '1 billet gagnant... du grand RIEN. Bravo.', emoji: '🎫', color: '#FFFF00' },
    { id: 'jackpot', label: 'JACKPOT DU VIDE', desc: 'Tu as gagné... le vide intersidéral. Profite.', emoji: '🕳️', color: '#0A0A0A', white: true },
    { id: 'cafe', label: 'CAFÉ DE MAMIE', desc: 'Mamie te paie un café virtuel. Bois-le. Symboliquement.', emoji: '☕', color: '#39FF14' },
    { id: 'rien', label: 'RIEN DU TOUT', desc: 'Va te coucher.', emoji: '😴', color: '#5DA1D9' },
    { id: 'compliment', label: 'COMPLIMENT GRATUIT', desc: 'Tu es beau. C\'est tout. Le prix s\'arrête là.', emoji: '💋', color: '#00FFFF' },
    { id: 'sticker', label: 'STICKER NUMÉRIQUE', desc: '🌈 Voilà ton sticker. Il ne sert à rien.', emoji: '🌈', color: '#9C27FF', white: true },
];

const todayKey = () => new Date().toISOString().split('T')[0];

export const canSpinToday = () => {
    try {
        const data = JSON.parse(localStorage.getItem(LOTTERY_KEY) || '{}');
        return data.lastSpin !== todayKey();
    } catch { return true; }
};

export const getLastPrize = () => {
    try {
        const data = JSON.parse(localStorage.getItem(LOTTERY_KEY) || '{}');
        if (data.lastSpin === todayKey() && data.prizeId) {
            return PRIZES.find((p) => p.id === data.prizeId) || null;
        }
        return null;
    } catch { return null; }
};

export const spinWheel = () => {
    const winner = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    try {
        localStorage.setItem(LOTTERY_KEY, JSON.stringify({
            lastSpin: todayKey(),
            prizeId: winner.id,
        }));
    } catch (_) { /* ignore */ }
    return winner;
};
