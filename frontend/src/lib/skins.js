// Glove skins + ARSENAL d'armes délirantes (V18) — unlocked via achievements or play milestones
export const GLOVE_SKINS = [
    { id: 'hand', emoji: '👋', name: 'Main nue', unlockedBy: 'default', desc: 'Pour les puristes.' },
    { id: 'glove', emoji: '🧤', name: 'Gant de boxe', unlockedBy: 'kos_5', desc: '5 KO au compteur.' },
    { id: 'fist', emoji: '✊', name: 'Poing serré', unlockedBy: 'combo_5', desc: 'Combo x5 atteint.' },
    { id: 'metal', emoji: '🤘', name: 'Mains de métal', unlockedBy: 'perfect_10', desc: '10 perfects cumulés.' },
    { id: 'rocket', emoji: '🚀', name: 'Poing-fusée', unlockedBy: 'games_10', desc: '10 parties jouées.' },
    { id: 'chicken', emoji: '🐔', name: 'Poulet humiliant', unlockedBy: 'streak_3', desc: '3 jours de daily d\'affilée.' },
    // ====== ARSENAL V18 — armes débiles ======
    { id: 'baguette', emoji: '🥖', name: 'Baguette tradition', unlockedBy: 'games_3', desc: 'Croustillante. Mortelle. À déguster.' },
    { id: 'caddy', emoji: '🛒', name: 'Chariot Carrefour', unlockedBy: 'kos_10', desc: 'BIIIP. Article validé. BAFFE.' },
    { id: 'trumpet', emoji: '🎺', name: 'Trompette à air', unlockedBy: 'combo_10', desc: 'Le son physique du désespoir.' },
    { id: 'hotdog', emoji: '🌭', name: 'Hot-dog explosif', unlockedBy: 'perfect_20', desc: 'KO instantané... ou pas. Roulette.' },
    { id: 'mjolnir', emoji: '🪶', name: 'Mjölnir en plumes', unlockedBy: 'score_50k', desc: 'Légendaire. Drop rate 0.01%. Lol non.' },
];

const SKIN_KEY = 'baffe_active_skin';

export const getActiveSkin = () => {
    try {
        const id = localStorage.getItem(SKIN_KEY);
        const found = GLOVE_SKINS.find((s) => s.id === id);
        return found || GLOVE_SKINS[0];
    } catch (e) {
        return GLOVE_SKINS[0];
    }
};

export const setActiveSkin = (id) => {
    try { localStorage.setItem(SKIN_KEY, id); } catch (e) {}
};

export const isSkinUnlocked = (skin, profile) => {
    if (skin.unlockedBy === 'default') return true;
    const [type, threshold] = skin.unlockedBy.split('_');
    const n = parseInt(threshold, 10);
    if (type === 'kos') return (profile.total_kos || 0) >= n;
    if (type === 'combo') return (profile.best_combo || 0) >= n;
    if (type === 'perfect') return (profile.perfect_hits || 0) >= n;
    if (type === 'games') return (profile.games_played || 0) >= n;
    if (type === 'streak') return (profile.daily_streak || 0) >= n;
    if (type === 'score') return (profile.best_score || 0) >= n * 1000; // score_50k = 50000
    return false;
};
