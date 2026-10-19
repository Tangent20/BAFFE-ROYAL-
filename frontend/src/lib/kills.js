// Per-opponent kill tracking (localStorage) + sorting / difficulty / titles
import { OPPONENTS } from "@/lib/gameData";

const KEY = 'baffe_kills_v1';
const today = () => new Date().toISOString().slice(0, 10);

export const loadKills = () => {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
        return { counts: raw.counts || {}, last: raw.last || {} };
    } catch (e) {
        return { counts: {}, last: {} };
    }
};

export const recordKill = (id) => {
    const k = loadKills();
    k.counts[id] = (k.counts[id] || 0) + 1;
    k.last[id] = today();
    try { localStorage.setItem(KEY, JSON.stringify(k)); } catch (e) { /* private mode */ }
};

export const effectiveHp = (op) => (op.hp + (op.shieldHp || 0)) / (1 - op.dodgeChance);

const DIFFICULTY = [
    { max: 270, level: 1, label: 'Facile', color: '#39FF14' },
    { max: 320, level: 2, label: 'Moyen', color: '#FFFF00' },
    { max: 400, level: 3, label: 'Costaud', color: '#FF8C00' },
    { max: 2000, level: 4, label: 'Boss', color: '#FF3B30' },
    { max: Infinity, level: 5, label: 'Divin', color: '#9C27FF' },
];

export const getDifficulty = (op) => DIFFICULTY.find((d) => effectiveHp(op) < d.max);

const TITLES = [
    { at: 0, title: 'Inconnu au bataillon' },
    { at: 1, title: 'Légèrement giflé' },
    { at: 5, title: 'Joue toute rouge' },
    { at: 15, title: 'Traumatisé à vie' },
    { at: 30, title: 'Fait des cauchemars de toi' },
    { at: 60, title: 'A porté plainte (rejetée)' },
    { at: 100, title: 'Ta victime officielle' },
    { at: 250, title: 'A déménagé en Belgique' },
];

export const getKillTitle = (n) => {
    const idx = TITLES.reduce((acc, t, i) => (n >= t.at ? i : acc), 0);
    return { title: TITLES[idx].title, prevAt: TITLES[idx].at, next: TITLES[idx + 1] || null };
};

export const SORT_MODES = [
    { id: 'order', label: 'Ordre combat', icon: '🥊' },
    { id: 'difficulty', label: 'Difficulté', icon: '💀' },
    { id: 'hp', label: '+ de HP', icon: '❤️' },
    { id: 'dodge', label: 'Esquive', icon: '🎯' },
    { id: 'most', label: '+ baffés', icon: '🔥' },
    { id: 'never', label: 'Jamais baffés', icon: '🆕' },
];

export const sortOpponents = (mode, counts) => {
    const list = OPPONENTS.map((op, order) => ({ ...op, order, kills: counts[op.id] || 0 }));
    switch (mode) {
        case 'difficulty': return list.sort((a, b) => effectiveHp(a) - effectiveHp(b));
        case 'hp': return list.sort((a, b) => (b.hp + (b.shieldHp || 0)) - (a.hp + (a.shieldHp || 0)));
        case 'dodge': return list.sort((a, b) => b.dodgeChance - a.dodgeChance);
        case 'most': return list.sort((a, b) => b.kills - a.kills || a.order - b.order);
        case 'never': return list.filter((o) => o.kills === 0);
        default: return list;
    }
};

export const getDailyTarget = () => {
    const d = today();
    const seed = [...d].reduce((s, c) => s * 31 + c.charCodeAt(0), 7);
    const pool = OPPONENTS.filter((o) => o.id !== 'mamie_dieu');
    return pool[Math.abs(seed) % pool.length];
};

export const isDailyTargetDone = (kills, target) => kills.last[target.id] === today();
