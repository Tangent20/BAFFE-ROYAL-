// Daily Challenge: deterministic per-day modifiers
import { OPPONENTS } from "@/lib/gameData";

const DAILY_MODIFIERS = [
    { id: 'tiny_hands', name: 'Petites Mains', emoji: '🤏', desc: 'La fenêtre parfaite est plus étroite.', stat: { perfectWindow: 0.5 } },
    { id: 'iron_skin', name: 'Peau de Fer', emoji: '🛡️', desc: 'Les ennemis ont +50% de PV.', stat: { hpMult: 1.5 } },
    { id: 'slippery', name: 'Esquive Royale', emoji: '💨', desc: 'Les ennemis esquivent 2x plus.', stat: { dodgeMult: 2 } },
    { id: 'chaos_storm', name: 'Tempête Chaos', emoji: '🌪️', desc: 'Événements chaos plus fréquents.', stat: { chaosFreq: 0.7 } },
    { id: 'double_score', name: 'Score Doublé', emoji: '💰', desc: 'Tous les points sont doublés.', stat: { scoreMult: 2 } },
    { id: 'glass_cannon', name: 'Verre Cassant', emoji: '🥃', desc: 'Tu fais x2 dégâts mais les ennemis aussi.', stat: { dmgMult: 2 } },
    { id: 'boss_rush', name: 'Boss Rush', emoji: '👹', desc: 'Tu commences directement face au Flamby Ultime.', stat: { startOpponent: 7 } },
];

// Deterministic hash for date
const hashDate = (dateStr) => {
    let h = 0;
    for (let i = 0; i < dateStr.length; i++) h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
    return Math.abs(h);
};

export const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const getDailyChallenge = (dateStr = getTodayDate()) => {
    const h = hashDate(dateStr);
    const modifier = DAILY_MODIFIERS[h % DAILY_MODIFIERS.length];
    const featuredOpponentIdx = h % OPPONENTS.length;
    return {
        date: dateStr,
        modifier,
        featured_opponent: OPPONENTS[featuredOpponentIdx],
    };
};

export const applyModifierToOpponents = (modifier) => {
    return OPPONENTS.map((op, idx) => ({
        ...op,
        hp: Math.round(op.hp * (modifier.stat.hpMult || 1)),
        dodgeChance: Math.min(0.7, op.dodgeChance * (modifier.stat.dodgeMult || 1)),
    }));
};
