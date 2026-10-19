import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getStats } from "@/lib/api";
import { sfx, resumeAudio, voice } from "@/lib/audio";
import { loadProfile } from "@/lib/profile";
import { getDailyChallenge } from "@/lib/daily";
import { getActiveSkin } from "@/lib/skins";
import Footer from "@/components/Footer";
import LotteryWheel from "@/components/LotteryWheel";
import IdleReward from "@/components/IdleReward";
import EscaladeWidget from "@/components/EscaladeWidget";
import BreakingTicker from "@/components/BreakingTicker";
import QrShareWidget from "@/components/QrShareWidget";

const RANDOM_BTN_TEXTS = ["💥 JOUER MAINTENANT", "💥 BAFFE-MOI !", "💥 GO GO GO", "💥 ÇA VA SAIGNER"];
const FALLING_EMOJIS = ['👋', '💥', '🥖', '🧀', '🥔', '🍮', '🐑', '👵', '👩', '👨'];

const FallingEmojiRain = () => {
    const items = useMemo(() => Array.from({ length: 8 }, (_, idx) => ({
        id: `falling-${idx}`,
        emoji: FALLING_EMOJIS[Math.floor(Math.random() * FALLING_EMOJIS.length)],
        left: Math.random() * 100, delay: Math.random() * 10, dur: 14 + Math.random() * 8,
        size: 18 + Math.random() * 18, rot: Math.random() * 720 - 360,
    })), []);
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {items.map((it) => (
                <motion.div key={it.id}
                    initial={{ y: -100, rotate: 0, opacity: 0.25 }}
                    animate={{ y: '110vh', rotate: it.rot, opacity: [0.25, 0.25, 0] }}
                    transition={{ duration: it.dur, delay: it.delay, repeat: Infinity, ease: 'linear' }}
                    className="absolute" style={{ left: `${it.left}%`, fontSize: `${it.size}px` }}>{it.emoji}</motion.div>
            ))}
        </div>
    );
};

// Portail = grande carte cliquable vers une page dédiée
const Portal = ({ to, icon, title, subtitle, color, textColor = "#0A0A0A", tilt = 0, testId, badge, onClick }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        sfx.click();
        if (onClick) onClick();
        else if (to) navigate(to);
    };
    return (
        <motion.button
            type="button"
            onClick={handleClick}
            initial={{ y: 20, opacity: 0, rotate: 0 }}
            whileInView={{ y: 0, opacity: 1, rotate: tilt }}
            whileHover={{ rotate: 0, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            data-testid={testId}
            aria-label={title}
            className="relative border-4 border-ink shadow-[6px_6px_0px_#0A0A0A] p-4 sm:p-5 text-left active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#0A0A0A] transition-all duration-100"
            style={{ backgroundColor: color, color: textColor }}
        >
            <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl shrink-0" aria-hidden="true">{icon}</span>
                <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg sm:text-xl uppercase leading-none tracking-tight">{title}</h3>
                    {subtitle && <p className="font-body text-[11px] sm:text-xs font-bold opacity-80 mt-1.5 leading-tight">{subtitle}</p>}
                </div>
                <span className="font-heading text-3xl shrink-0" aria-hidden="true">→</span>
            </div>
            {badge && (
                <span className="absolute -top-2 -right-2 bg-acid text-ink font-heading text-[10px] px-2 py-0.5 border-2 border-ink shadow-[2px_2px_0px_#0A0A0A] rotate-12" aria-hidden="true">{badge}</span>
            )}
        </motion.button>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_games: 0, top_score: 0 });
    const [profile, setProfile] = useState(loadProfile());
    const [voiceOn, setVoiceOn] = useState(voice.isEnabled());
    const [btnTextIdx, setBtnTextIdx] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [titleTaps, setTitleTaps] = useState(0);
    const [flyingHands, setFlyingHands] = useState([]);
    const activeSkin = getActiveSkin();
    const daily = getDailyChallenge();

    useEffect(() => {
        getStats().then(setStats).catch(() => {});
        setProfile(loadProfile());
        const b = setInterval(() => setBtnTextIdx((i) => (i + 1) % RANDOM_BTN_TEXTS.length), 2400);
        const p = setTimeout(() => setShowPopup(true), 10000);
        return () => { clearInterval(b); clearTimeout(p); };
    }, []);

    const handlePlay = () => { resumeAudio(); sfx.go(); navigate('/game'); };
    const handleDaily = () => { resumeAudio(); sfx.go(); navigate('/game?mode=daily'); };
    const handlePractice = () => { resumeAudio(); sfx.click(); navigate('/game?mode=practice'); };
    const handleVersus = () => { resumeAudio(); sfx.click(); navigate('/versus'); };
    const handleToggleVoice = () => {
        const on = voice.toggle();
        setVoiceOn(on);
        sfx.click();
        if (on) voice.say('Voix activée. Préparez-vous.', { rate: 0.9 });
    };
    const handleTitleTap = () => {
        const n = titleTaps + 1;
        setTitleTaps(n);
        sfx.slap(0.4 + Math.random() * 0.6);
        const id = Date.now() + Math.random();
        const x = 10 + Math.random() * 80;
        const y = 20 + Math.random() * 50;
        setFlyingHands((f) => [...f, { id, x, y, emoji: activeSkin.emoji }]);
        setTimeout(() => setFlyingHands((f) => f.filter((h) => h.id !== id)), 1100);
        if (n === 25) { sfx.win(); voice.say('TRICHEUR DÉTECTÉ !', { rate: 0.8 }); }
    };

    const dailyDone = profile.last_daily_played === daily.date;
    const hasPlayed = profile.games_played > 0;

    return (
        <div className="bg-cream relative overflow-x-hidden no-select min-h-screen" data-testid="home-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" aria-hidden="true" />
            <FallingEmojiRain />
            <IdleReward />

            <AnimatePresence>
                {flyingHands.map((h) => (
                    <motion.div key={h.id}
                        initial={{ scale: 0, rotate: -25, opacity: 1 }}
                        animate={{ scale: [0, 2, 1.5], rotate: 720, opacity: 0, y: -260 }}
                        transition={{ duration: 1.1 }}
                        className="fixed pointer-events-none z-50 select-none"
                        style={{ left: `${h.x}%`, top: `${h.y}%`, fontSize: '4rem' }}
                        aria-hidden="true">{h.emoji}</motion.div>
                ))}
            </AnimatePresence>

            <AnimatePresence>
                {showPopup && (
                    <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: -3 }} exit={{ scale: 0 }}
                        className="fixed top-24 right-3 sm:right-8 z-40 w-56 sm:w-64 bg-cyan border-4 border-ink shadow-[8px_8px_0px_#0A0A0A]"
                        data-testid="fake-popup" role="dialog" aria-label="Alerte humoristique">
                        <div className="bg-ink text-acid px-2 py-1 flex justify-between items-center">
                            <span className="font-heading text-[10px] uppercase tracking-widest">⚠️ alerte_baffe.exe</span>
                            <button onClick={() => { setShowPopup(false); sfx.click(); }} aria-label="Fermer" className="font-heading text-xs px-1 bg-tomato text-white">✕</button>
                        </div>
                        <div className="p-3 font-body text-xs font-bold">
                            <p>8 <span className="bg-tomato text-white px-1">mamies</span> détectées.</p>
                            <button onClick={() => { setShowPopup(false); handlePlay(); }} className="mt-2 w-full bg-tomato text-white border-2 border-ink font-heading uppercase text-sm py-1.5">OUI</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main id="main-content" tabIndex={-1}>
                {/* ===== HEADER + TICKER ===== */}
                <nav className="relative z-20 max-w-5xl mx-auto flex justify-between items-center px-4 sm:px-6 pt-4 pb-2 gap-2" aria-label="Navigation principale">
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 1, repeat: Infinity }}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-tomato border-[3px] border-ink flex items-center justify-center text-2xl sm:text-3xl shadow-[4px_4px_0px_#0A0A0A]" aria-hidden="true">👋</motion.div>
                        <span className="font-heading text-xl sm:text-3xl tracking-tight">BAFFE.ROYALE</span>
                    </div>
                    <div className="flex gap-2 items-center shrink-0">
                        <button onClick={handleToggleVoice} data-testid="toggle-voice-btn"
                            aria-label={voiceOn ? "Désactiver la voix off" : "Activer la voix off"} aria-pressed={voiceOn}
                            className={`border-[3px] border-ink font-heading uppercase text-lg w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-100 ${voiceOn ? 'bg-tomato text-white' : 'bg-white'}`}>
                            <span aria-hidden="true">{voiceOn ? '🔊' : '🔇'}</span>
                        </button>
                        <button onClick={() => { sfx.click(); navigate('/leaderboard'); }} data-testid="nav-leaderboard-btn"
                            aria-label="Classement mondial"
                            className="bg-acid border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-100">
                            <span aria-hidden="true">🏆</span> Top
                        </button>
                        <QrShareWidget />
                    </div>
                </nav>

                <BreakingTicker />

                {/* ===== HERO ===== */}
                <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6" aria-labelledby="hero-title">
                    <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: -3 }} transition={{ type: 'spring' }}
                        className="inline-block bg-acid border-[3px] border-ink px-3 py-1 mb-3 shadow-[4px_4px_0px_#0A0A0A]">
                        <span className="font-heading text-xs sm:text-base">🔥 LE JEU LE PLUS STUPIDE DU MONDE</span>
                    </motion.div>

                    <motion.h1 id="hero-title" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}
                        onClick={handleTitleTap} whileTap={{ scale: 0.97 }}
                        className="font-heading uppercase text-ink leading-[0.9] tracking-tighter cursor-pointer select-none break-words"
                        style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)', textShadow: '0.06em 0.06em 0 #FF3B30, 0.12em 0.12em 0 #00FFFF' }}
                        data-testid="game-title">
                        Baffe <span className="inline-block">Royale</span>
                    </motion.h1>

                    <p className="font-body text-base sm:text-2xl font-bold mt-3 max-w-xl">
                        👋 Tape. Charge. Relâche. <span className="text-tomato">Mamie tombe.</span>
                    </p>
                </section>

                {/* ===== MODES (CTA principal) ===== */}
                <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-6" aria-label="Modes de jeu">
                    <motion.button animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 0.5, repeat: Infinity }} whileTap={{ scale: 0.95 }}
                        onClick={handlePlay} data-testid="play-button"
                        className="w-full bg-tomato text-white border-[3px] sm:border-4 border-ink font-heading uppercase text-2xl sm:text-4xl md:text-5xl px-4 py-4 sm:py-5 shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all duration-75 tracking-wider"
                        aria-label="Lancer une partie classique">
                        {RANDOM_BTN_TEXTS[btnTextIdx]}
                    </motion.button>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3">
                        <button onClick={handleDaily} data-testid="daily-button"
                            aria-label={`Mode quotidien: ${daily.modifier.name}${dailyDone ? ' (déjà joué)' : ''}`}
                            className={`border-[3px] border-ink font-heading uppercase text-xs sm:text-base px-2 py-2.5 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100 text-left ${dailyDone ? 'bg-muted' : 'bg-lime'}`}>
                            <div className="flex items-center gap-1"><span aria-hidden="true">{daily.modifier.emoji}</span><span className="leading-none">Daily {dailyDone ? '✓' : ''}</span></div>
                            <div className="text-[9px] font-body normal-case opacity-80 mt-1 truncate">{daily.modifier.name}</div>
                        </button>
                        <button onClick={handlePractice} data-testid="practice-button"
                            aria-label="Mode pratique sans score"
                            className="bg-cyan border-[3px] border-ink font-heading uppercase text-xs sm:text-base px-2 py-2.5 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100 text-left">
                            <div className="flex items-center gap-1"><span aria-hidden="true">🎯</span><span className="leading-none">Pratique</span></div>
                            <div className="text-[9px] font-body normal-case opacity-80 mt-1">Sans score</div>
                        </button>
                        <button onClick={handleVersus} data-testid="versus-button"
                            aria-label="Mode versus nouveau"
                            className="border-[3px] border-ink font-heading uppercase text-xs sm:text-base px-2 py-2.5 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100 text-left relative text-white overflow-visible"
                            style={{ backgroundColor: '#FF1493' }}>
                            <div className="flex items-center gap-1"><span aria-hidden="true">🥊</span><span className="leading-none">Versus</span></div>
                            <div className="text-[9px] font-body normal-case opacity-90 mt-1">2 tarés</div>
                            <motion.span
                                animate={{ rotate: [-4, 4, -4] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="absolute -top-3 -right-2 bg-acid text-ink font-heading text-[11px] px-2 py-1 border-[3px] border-ink shadow-[3px_3px_0px_#0A0A0A] leading-none whitespace-nowrap"
                                aria-hidden="true">
                                ✨ NOUVEAU
                            </motion.span>
                        </button>
                    </div>
                </section>

                {/* ===== ROUE DE LA FORTUNE V17 ===== */}
                <LotteryWheel />

                {/* ===== ESCALADE V18 ===== */}
                <EscaladeWidget />

                {/* ===== PROFIL JOUEUR (compact) ===== */}
                {hasPlayed && (
                    <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-6" aria-label="Mon profil">
                        <div className="bg-white border-4 border-ink p-3 sm:p-4 shadow-[6px_6px_0px_#0A0A0A]">
                            <div className="flex items-center justify-between mb-2 gap-2">
                                <p className="font-heading text-sm sm:text-base uppercase tracking-tight">👤 Ton bulletin</p>
                                <span className="font-body text-[10px] uppercase tracking-widest bg-acid border-2 border-ink px-2 py-0.5">Niv. {profile.games_played}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <Mini label="Best" value={profile.best_score} bg="#FFFF00" />
                                <Mini label="Combo" value={`x${profile.best_combo}`} bg="#00FFFF" />
                                <Mini label="KO" value={profile.total_kos} bg="#FF3B30" white />
                                <Mini label="Streak" value={`🔥${profile.daily_streak}`} bg="#39FF14" />
                            </div>
                        </div>
                    </section>
                )}

                {/* ===== 3 PORTAILS — pages dédiées ===== */}
                <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-6" aria-label="Pages d'exploration">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-ink text-acid font-heading uppercase text-[10px] sm:text-xs tracking-widest px-2 py-0.5">★ Explore</span>
                        <span className="font-body text-[10px] opacity-60">3 zones · 1 thème par zone</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <Portal to="/roster" testId="portal-roster"
                            icon="🥊" title="Le Roster" subtitle="15 tarés · bio · HP · taunts cultes"
                            color="#FF8C00" tilt={-1} />
                        <Portal to="/collection" testId="portal-collection"
                            icon="🎁" title="Ma Collection" subtitle="🎰 Loots · 👋 Skins · 🎖️ Trophées"
                            color="#FFFF00" tilt={1} badge={`${profile.achievements.length} trouvés`} />
                        <Portal to="/zone-debile" testId="portal-debile"
                            icon="📢" title="Zone Débile" subtitle="Rumeurs · Tweets · Prophéties · Faits inutiles"
                            color="#FF3B30" textColor="white" tilt={-1} badge="WTF" />
                    </div>
                </section>

                {/* ===== COMMENT ÇA MARCHE ===== */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-8" aria-label="Comment jouer">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-ink text-acid font-heading uppercase text-[10px] sm:text-xs tracking-widest px-2 py-0.5">★ Comment jouer</span>
                        <span className="font-body text-[10px] opacity-60">3 étapes. Pas plus.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { e: '👇', t: 'MAINTIENS', d: 'Doigt sur le bouton. La barre charge.', bg: '#FFFF00' },
                            { e: '🎯', t: 'VISE VERT', d: 'Zone verte = perfect. Tu vas rater.', bg: '#39FF14' },
                            { e: '💥', t: 'RELÂCHE', d: 'BAM. Mamie s\'envole. Combo. KO.', bg: '#FF3B30', white: true },
                        ].map((r, i) => (
                            <div key={r.t} className="border-[3px] border-ink p-3 shadow-[4px_4px_0px_#0A0A0A]" style={{ backgroundColor: r.bg, color: r.white ? 'white' : '#0A0A0A', transform: `rotate(${i === 1 ? 0 : (i === 0 ? -1 : 1)}deg)` }}>
                                <div className="text-3xl mb-1" aria-hidden="true">{r.e}</div>
                                <h3 className="font-heading text-lg uppercase leading-none">{r.t}</h3>
                                <p className="font-body text-xs font-bold mt-1.5 leading-snug">{r.d}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== FINAL CTA ===== */}
                <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-8 text-center">
                    <motion.button animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity }}
                        onClick={handlePlay} data-testid="play-button-bottom"
                        className="w-full bg-tomato text-white border-[3px] sm:border-4 border-ink font-heading uppercase text-2xl sm:text-3xl px-6 py-4 shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all duration-75 tracking-wider">
                        💥 ALLEZ — UNE PARTIE !
                    </motion.button>
                    <p className="font-body text-[10px] sm:text-xs uppercase tracking-widest font-bold mt-3 opacity-60 italic">
                        « C&apos;est en baffant qu&apos;on devient gifleur. »
                    </p>
                </section>

                <Footer />
            </main>
        </div>
    );
};

const Mini = ({ label, value, bg, white }) => (
    <div className="border-2 border-ink p-1.5 shadow-[2px_2px_0px_#0A0A0A] text-center" style={{ backgroundColor: bg, color: white ? 'white' : '#0A0A0A' }}>
        <div className="font-heading text-base sm:text-lg leading-none">{value}</div>
        <div className="font-body text-[9px] uppercase tracking-widest font-bold mt-0.5">{label}</div>
    </div>
);

export default Home;
