// MODE ESCALADE — Tiers absurdes débloqués selon ton best_score
export const ESCALADE_TIERS = [
    { id: 'normal', threshold: 0, name: 'Mode Normal', desc: 'Tu baffes des mamies. Voilà.', emoji: '👋', color: '#FFFF00' },
    { id: 'hammer', threshold: 1000, name: 'Mode Marteau-Pillon', desc: 'Tes baffes pèsent 5 tonnes. Mamie ricoche.', emoji: '🔨', color: '#FF8C00' },
    { id: 'mecha', threshold: 10000, name: 'Mamie Mecha', desc: 'Mamie a maintenant un EXO-SQUELETTE en titane.', emoji: '🤖', color: '#00FFFF' },
    { id: 'apocalypse', threshold: 100000, name: 'Mode Apocalyptique', desc: 'Le ciel rougit. Les sirènes hurlent. La fin est proche.', emoji: '☄️', color: '#FF3B30', white: true },
    { id: 'guerre', threshold: 1000000, name: 'Guerre contre la France', desc: 'Mamie a déclaré la guerre. À TON pays. Bonne chance.', emoji: '🇫🇷', color: '#9C27FF', white: true },
];

export const getCurrentTier = (bestScore = 0) => {
    return [...ESCALADE_TIERS].reverse().find((t) => bestScore >= t.threshold) || ESCALADE_TIERS[0];
};

export const getNextTier = (bestScore = 0) => {
    return ESCALADE_TIERS.find((t) => t.threshold > bestScore) || null;
};
