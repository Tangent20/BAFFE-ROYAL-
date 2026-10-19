// Web Audio synth — juicy multi-layered sounds for maximum slap satisfaction
let ctx = null;
let audioFailed = false;

const getCtx = () => {
    if (audioFailed) return null;
    try {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) {
                audioFailed = true;
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.warn('[audio] Web Audio API not supported in this browser');
                }
                return null;
            }
            ctx = new AC();
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    } catch (e) {
        audioFailed = true;
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('[audio] AudioContext init failed:', e?.message);
        }
        return null;
    }
};

const playTone = ({ freq = 440, type = 'sine', dur = 0.15, vol = 0.2, slide = 0, delay = 0 }) => {
    try {
        const c = getCtx();
        if (!c) return;
        const t = c.currentTime + delay;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain).connect(c.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    } catch (e) {}
};

const playNoise = ({ dur = 0.1, vol = 0.3, filter = 800, filterEnd = null, delay = 0, type = 'lowpass' }) => {
    try {
        const c = getCtx();
        if (!c) return;
        const t = c.currentTime + delay;
        const bufferSize = Math.floor(c.sampleRate * dur);
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = c.createBufferSource();
        noise.buffer = buffer;
        const bp = c.createBiquadFilter();
        bp.type = type;
        bp.frequency.setValueAtTime(filter, t);
        if (filterEnd != null) bp.frequency.exponentialRampToValueAtTime(Math.max(40, filterEnd), t + dur);
        const gain = c.createGain();
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noise.connect(bp).connect(gain).connect(c.destination);
        noise.start(t);
        noise.stop(t + dur + 0.02);
    } catch (e) {}
};

export const sfx = {
    charge: () => {
        // Rising rumble
        playTone({ freq: 80, type: 'sawtooth', dur: 1.0, vol: 0.08, slide: 400 });
        playNoise({ dur: 1.0, vol: 0.04, filter: 200, filterEnd: 800 });
    },
    // EPIC multi-layered slap that scales with power
    slap: (power = 1) => {
        const p = Math.max(0.3, Math.min(1.5, power));
        // 1. Pre-crack (woosh of the hand swinging)
        playNoise({ dur: 0.04, vol: 0.12 * p, filter: 6000, filterEnd: 2000, delay: 0 });
        // 2. Sharp crack (high freq snap on contact)
        playTone({ freq: 2400, type: 'square', dur: 0.02, vol: 0.18 * p, delay: 0.04 });
        // 3. Main impact: bright noise burst
        playNoise({ dur: 0.10, vol: 0.42 * p, filter: 3500 + p * 1500, filterEnd: 600, delay: 0.045 });
        // 4. Body thud: low sub-bass
        playTone({ freq: 110 + p * 30, type: 'sine', dur: 0.25, vol: 0.45 * p, slide: -60, delay: 0.05 });
        // 5. Tail: low passed reverb-ish noise
        playNoise({ dur: 0.35, vol: 0.12 * p, filter: 500, filterEnd: 80, delay: 0.08 });
    },
    perfect: (power = 1.3) => {
        sfx.slap(power);
        // Add a triumphant bell layer
        setTimeout(() => {
            [880, 1320, 1760].forEach((f, i) =>
                playTone({ freq: f, type: 'square', dur: 0.18, vol: 0.14, delay: i * 0.04 })
            );
        }, 50);
    },
    miss: () => {
        // Whoosh that fizzles
        playNoise({ dur: 0.25, vol: 0.2, filter: 1500, filterEnd: 300 });
        playTone({ freq: 300, type: 'triangle', dur: 0.3, vol: 0.12, slide: -200 });
    },
    ko: () => {
        // Heavy thud + crash + descending tone (like cartoon KO)
        playNoise({ dur: 0.5, vol: 0.4, filter: 1500, filterEnd: 100 });
        playTone({ freq: 200, type: 'sawtooth', dur: 0.5, vol: 0.3, slide: -150 });
        setTimeout(() => {
            // Cartoon "boing" descending
            [600, 400, 250, 150].forEach((f, i) =>
                playTone({ freq: f, type: 'triangle', dur: 0.15, vol: 0.18, delay: i * 0.08 })
            );
        }, 100);
    },
    combo: (n = 1) => {
        playTone({ freq: 500 + n * 90, type: 'square', dur: 0.08, vol: 0.18 });
        playTone({ freq: 700 + n * 90, type: 'square', dur: 0.06, vol: 0.14, delay: 0.04 });
    },
    chaos: () => {
        // Comical "uh-oh" with siren
        [800, 1200, 800, 1200].forEach((f, i) =>
            playTone({ freq: f, type: 'square', dur: 0.08, vol: 0.15, delay: i * 0.08 })
        );
    },
    win: () => {
        // Victory fanfare
        [400, 500, 600, 800, 1000, 1200].forEach((f, i) =>
            playTone({ freq: f, type: 'square', dur: 0.12, vol: 0.2, delay: i * 0.09 })
        );
    },
    click: () => playTone({ freq: 800, type: 'square', dur: 0.04, vol: 0.14 }),
    countdown: () => playTone({ freq: 700, type: 'sine', dur: 0.15, vol: 0.2 }),
    go: () => {
        playTone({ freq: 900, type: 'square', dur: 0.3, vol: 0.25, slide: 600 });
        playNoise({ dur: 0.3, vol: 0.2, filter: 3000, filterEnd: 500 });
    },
    achievement: () => {
        [600, 800, 1000, 1200, 1400].forEach((f, i) =>
            playTone({ freq: f, type: 'square', dur: 0.1, vol: 0.18, delay: i * 0.06 })
        );
    },
    // Cartoon "boing" — rising pitch when opening a panel/tile
    tileOpen: () => {
        playTone({ freq: 300, type: 'sine', dur: 0.18, vol: 0.18, slide: 600 });
        playTone({ freq: 500, type: 'triangle', dur: 0.12, vol: 0.1, delay: 0.04 });
    },
    // Cartoon "boop" — falling pitch when closing
    tileClose: () => {
        playTone({ freq: 700, type: 'sine', dur: 0.14, vol: 0.18, slide: -450 });
        playTone({ freq: 400, type: 'triangle', dur: 0.08, vol: 0.08, delay: 0.04 });
    },
};

export const resumeAudio = () => getCtx();

// Haptic feedback for mobile
export const vibrate = (pattern) => {
    try {
        if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
};

// ===== Voice-over arcade (Mortal Kombat style) =====
// Uses native SpeechSynthesis. Toggleable via localStorage flag.
const VOICE_KEY = 'baffe_voice_enabled';
let cachedVoice = null;

const pickVoice = () => {
    if (cachedVoice) return cachedVoice;
    try {
        const voices = window.speechSynthesis?.getVoices?.() || [];
        // Prefer male/deep French voice, fallback to first FR, then first EN
        const fr = voices.find((v) => /fr/i.test(v.lang) && /(male|thomas|paul|nicolas|antoine)/i.test(v.name));
        const anyFr = voices.find((v) => /fr/i.test(v.lang));
        const en = voices.find((v) => /en/i.test(v.lang));
        cachedVoice = fr || anyFr || en || voices[0] || null;
    } catch (e) {}
    return cachedVoice;
};

export const voice = {
    isEnabled: () => {
        try { return localStorage.getItem(VOICE_KEY) === '1'; } catch (e) { return false; }
    },
    setEnabled: (on) => {
        try { localStorage.setItem(VOICE_KEY, on ? '1' : '0'); } catch (e) {}
    },
    toggle: () => {
        const current = voice.isEnabled();
        voice.setEnabled(!current);
        return !current;
    },
    say: (text, { rate = 0.85, pitch = 0.4, volume = 1 } = {}) => {
        if (!voice.isEnabled()) return;
        try {
            const synth = window.speechSynthesis;
            if (!synth) return;
            // Cancel previous (we want overlay drama, not queue)
            synth.cancel();
            const u = new SpeechSynthesisUtterance(text);
            const v = pickVoice();
            if (v) u.voice = v;
            u.rate = rate;
            u.pitch = pitch;
            u.volume = volume;
            u.lang = v?.lang || 'fr-FR';
            synth.speak(u);
        } catch (e) {}
    },
    cancel: () => { try { window.speechSynthesis?.cancel(); } catch (e) {} },
};

// Preload voices (some browsers populate them async)
try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => { cachedVoice = null; pickVoice(); };
        pickVoice();
    }
} catch (e) {}
