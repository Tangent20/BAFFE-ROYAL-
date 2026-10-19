// Achievement definitions and unlock checks
export const ACHIEVEMENTS = [
    { id: 'first_blood', emoji: '🩸', name: 'PREMIER SANG', desc: 'Première baffe portée.', check: (s) => s.kos >= 1 },
    { id: 'combo_5', emoji: '🔥', name: 'EN FEU', desc: 'Combo x5 atteint.', check: (s) => s.comboMax >= 5 },
    { id: 'combo_10', emoji: '🌋', name: 'VOLCAN', desc: 'Combo x10 atteint.', check: (s) => s.comboMax >= 10 },
    { id: 'score_10k', emoji: '💯', name: 'CINQ CHIFFRES', desc: 'Score de 10 000 dépassé.', check: (s) => s.score >= 10000 },
    { id: 'score_50k', emoji: '💎', name: 'DIAMANT BRUT', desc: 'Score de 50 000 dépassé.', check: (s) => s.score >= 50000 },
    { id: 'score_100k', emoji: '👑', name: 'GIFLEUR ULTIME', desc: 'Score de 100 000 dépassé.', check: (s) => s.score >= 100000 },
    { id: 'all_ko', emoji: '🏆', name: 'GRAND CHELEM', desc: 'Tous les adversaires KO.', check: (s) => s.kos >= 8 },
    { id: 'perfect_3', emoji: '✨', name: 'CHIRURGIEN', desc: '3 baffes parfaites en une partie.', check: (s) => s.perfects >= 3 },
    { id: 'perfect_10', emoji: '🎯', name: 'SNIPER', desc: '10 baffes parfaites en une partie.', check: (s) => s.perfects >= 10 },
    { id: 'daily_3', emoji: '📅', name: 'RÉGULIER', desc: '3 jours de Daily Challenge d\'affilée.', check: (s) => s.dailyStreak >= 3 },
    { id: 'daily_7', emoji: '🗓️', name: 'INARRÊTABLE', desc: '7 jours de Daily Challenge d\'affilée.', check: (s) => s.dailyStreak >= 7 },
    // ===== WTF Achievements V17 =====
    { id: 'pacifist', emoji: '☮️', name: 'PACIFISTE', desc: 'Survis 30s sans donner de baffe (Mamie te paie un café).', check: (s) => s.pacifistTime >= 30 },
    { id: 'shouter', emoji: '🗣️', name: 'CRIE-DESSUS', desc: 'Crie sur ton téléphone 5 secondes (mic détecté).', check: (s) => s.didShout === true },
    { id: 'midnight', emoji: '🌙', name: 'L\'HEURE DE MAMIE', desc: 'Joue entre 0h00 et 0h05 du matin.', check: (s) => s.playedAtMidnight === true },
    { id: 'konami', emoji: '🎮', name: 'OLD-SCHOOL', desc: 'Active le Konami code quelque part sur le site.', check: (s) => s.foundKonami === true },
    { id: 'humiliated', emoji: '💩', name: 'HUMILIÉ PUBLIQUEMENT', desc: 'Perds 5 parties d\'affilée avec un grade D.', check: (s) => s.consecutiveDFails >= 5 },
];

// Returns array of newly unlocked achievement IDs (not yet in profile.achievements)
export const checkUnlocks = (stats, alreadyUnlocked = []) => {
    return ACHIEVEMENTS.filter(
        (a) => !alreadyUnlocked.includes(a.id) && a.check(stats)
    ).map((a) => a.id);
};

export const getAchievement = (id) => ACHIEVEMENTS.find((a) => a.id === id);
