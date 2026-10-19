// Loot system — picked after each KO, modifies the next opponent fight
// Each boost is consumed when the next opponent appears.

export const BOOSTS = [
    {
        id: 'fire_hands',
        emoji: '🔥',
        name: 'MAINS DE FEU',
        desc: 'Dégâts x2. Mais ta vie ne tient qu\'à un fil.',
        color: '#0A0A0A',
        bg: '#FFFF00',
        rarity: 1,          // most common
        mods: { dmgMult: 2.0 },
    },
    {
        id: 'clover',
        emoji: '🍀',
        name: 'TRÈFLE TRUQUÉ',
        desc: '+50% de score sur les baffes du prochain round.',
        color: '#0A0A0A',
        bg: '#39FF14',
        rarity: 1,
        mods: { scoreMult: 1.5 },
    },
    {
        id: 'iron_fist',
        emoji: '🥊',
        name: 'POING DE FER',
        desc: 'Esquive ennemie divisée par 3.',
        color: '#FFFF00',
        bg: '#0A0A0A',
        rarity: 2,
        mods: { dodgeMult: 0.33 },
    },
    {
        id: 'butter',
        emoji: '🧈',
        name: 'BEURRE PERFECT',
        desc: 'Zone PERFECT doublée. Tu deviens sale.',
        color: '#0A0A0A',
        bg: '#FFFF00',
        rarity: 2,
        mods: { perfectWindowMult: 2.0 },
    },
    {
        id: 'rage_cap',
        emoji: '😡',
        name: 'CAPSULE DE RAGE',
        desc: 'Tu démarres le round avec combo x3 déjà chargé.',
        color: '#FFFFFF',
        bg: '#FF3B30',
        rarity: 2,
        mods: { startCombo: 3 },
    },
    {
        id: 'shotgun',
        emoji: '🎯',
        name: 'TIR FUSIL',
        desc: 'Chaque baffe en touche 3. La science a parlé.',
        color: '#0A0A0A',
        bg: '#FF8C00',
        rarity: 3,
        mods: { dmgMult: 3.0, scoreMult: 1.2 },
    },
    {
        id: 'sudden_death',
        emoji: '💀',
        name: 'MORT SUBITE',
        desc: 'Boss à 1 HP. Mais 1 raté = game over.',
        color: '#39FF14',
        bg: '#0A0A0A',
        rarity: 3,
        mods: { opponentHpMult: 0.01, suddenDeath: true },
    },
    {
        id: 'banana',
        emoji: '🍌',
        name: 'PEAU TRAÎTRESSE',
        desc: 'Boss esquive 0%. Tu glisses pas, lui si.',
        color: '#0A0A0A',
        bg: '#FFFF00',
        rarity: 2,
        mods: { dodgeMult: 0 },
    },
];

// Weighted pick: lower rarity number = more common
export const pickRandomBoost = () => {
    const weights = BOOSTS.map((b) => 4 - b.rarity); // 3, 2, 1
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < BOOSTS.length; i++) {
        r -= weights[i];
        if (r <= 0) return BOOSTS[i];
    }
    return BOOSTS[0];
};

// Returns 3 distinct boosts (the spinner shows multiple, lands on one)
export const pickReelSet = (winner) => {
    const others = BOOSTS.filter((b) => b.id !== winner.id);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    return [shuffled[0], winner, shuffled[1] || shuffled[0]];
};

export const applyBoostToOpponent = (opp, boost) => {
    if (!boost) return opp;
    let hp = opp.hp;
    let dodgeChance = opp.dodgeChance;
    if (boost.mods.opponentHpMult != null) hp = Math.max(1, Math.round(hp * boost.mods.opponentHpMult));
    if (boost.mods.dodgeMult != null) dodgeChance = Math.max(0, dodgeChance * boost.mods.dodgeMult);
    return { ...opp, hp, dodgeChance, _boosted: boost.id };
};

export const getBoostById = (id) => BOOSTS.find((b) => b.id === id) || null;
