// IDLE MODE — Gant Auto qui frappe pendant que tu es offline
const IDLE_KEY = 'baffe_idle_v1';

// 1 baffe automatique toutes les X secondes, scaling avec games_played
const baffeIntervalMs = (gamesPlayed = 0) => {
    // base: 1 baffe / 30s ; chaque 10 parties → -2s d'intervalle, plancher 5s
    const base = 30 - Math.floor(gamesPlayed / 10) * 2;
    return Math.max(5, base) * 1000;
};

const pointsPerBaffe = (gamesPlayed = 0) => 5 + Math.floor(gamesPlayed / 5) * 2;

const loadIdle = () => {
    try {
        const raw = localStorage.getItem(IDLE_KEY);
        return raw ? JSON.parse(raw) : { last_seen: Date.now(), pending_baffes: 0, pending_score: 0, total_idle_baffes: 0 };
    } catch {
        return { last_seen: Date.now(), pending_baffes: 0, pending_score: 0, total_idle_baffes: 0 };
    }
};

const saveIdle = (s) => {
    try { localStorage.setItem(IDLE_KEY, JSON.stringify(s)); } catch (_) { /* ignore */ }
};

// Called when player opens the app — compute baffes accumulated since last_seen
export const computeIdleReward = (gamesPlayed = 0) => {
    const state = loadIdle();
    const now = Date.now();
    const elapsedMs = Math.max(0, now - (state.last_seen || now));
    const interval = baffeIntervalMs(gamesPlayed);
    const maxBaffes = Math.min(Math.floor(elapsedMs / interval), 5000); // cap 5000 baffes / session
    const pointsEach = pointsPerBaffe(gamesPlayed);
    const earned = maxBaffes * pointsEach;

    // Persist + return reward only if significant (≥1 baffe and ≥30s elapsed)
    const reward = (maxBaffes >= 1 && elapsedMs > 30000) ? { baffes: maxBaffes, points: earned, elapsedMin: Math.round(elapsedMs / 60000) } : null;

    saveIdle({
        last_seen: now,
        pending_baffes: 0,
        pending_score: 0,
        total_idle_baffes: (state.total_idle_baffes || 0) + maxBaffes,
    });
    return reward;
};

export const getTotalIdleBaffes = () => loadIdle().total_idle_baffes || 0;

export const resetIdleSeen = () => {
    saveIdle({ ...loadIdle(), last_seen: Date.now() });
};
