// LocalStorage-backed player profile and stats
const KEY = 'baffe_royale_profile_v1';

const defaults = () => ({
    pseudo: '',
    created_at: new Date().toISOString(),
    games_played: 0,
    total_score: 0,
    best_score: 0,
    total_kos: 0,
    best_combo: 0,
    perfect_hits: 0,
    achievements: [], // list of achievement ids
    last_daily_played: null, // YYYY-MM-DD
    daily_streak: 0,
});

export const loadProfile = () => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return defaults();
        return { ...defaults(), ...JSON.parse(raw) };
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('[profile] load failed, falling back to defaults:', e?.message);
        }
        return defaults();
    }
};

export const saveProfile = (profile) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(profile));
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('[profile] save failed (private mode?):', e?.message);
        }
    }
};

export const updateProfileAfterGame = ({ score, kos, comboMax, perfects, isDaily }) => {
    const p = loadProfile();
    p.games_played += 1;
    p.total_score += score;
    p.best_score = Math.max(p.best_score, score);
    p.total_kos += kos;
    p.best_combo = Math.max(p.best_combo, comboMax);
    p.perfect_hits += perfects;

    if (isDaily) {
        const today = new Date().toISOString().slice(0, 10);
        if (p.last_daily_played === today) {
            // already played
        } else {
            const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            p.daily_streak = p.last_daily_played === y ? p.daily_streak + 1 : 1;
            p.last_daily_played = today;
        }
    }

    saveProfile(p);
    return p;
};

export const setPseudo = (pseudo) => {
    const p = loadProfile();
    p.pseudo = pseudo;
    saveProfile(p);
    return p;
};

export const unlockAchievement = (id) => {
    const p = loadProfile();
    if (p.achievements.includes(id)) return null;
    p.achievements.push(id);
    saveProfile(p);
    return id;
};
