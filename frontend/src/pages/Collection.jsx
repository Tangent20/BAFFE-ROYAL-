import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BOOSTS } from "@/lib/loot";
import { GLOVE_SKINS, getActiveSkin, setActiveSkin, isSkinUnlocked } from "@/lib/skins";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { loadProfile } from "@/lib/profile";
import { sfx, resumeAudio } from "@/lib/audio";
import Footer from "@/components/Footer";
import BreakingTicker from "@/components/BreakingTicker";

const TABS = [
    { id: 'loots', label: '🎰 Loots', color: '#FFFF00' },
    { id: 'skins', label: '👋 Skins', color: '#00FFFF' },
    { id: 'trophies', label: '🎖️ Trophées', color: '#39FF14' },
];

const Collection = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(loadProfile());
    const [active, setActive] = useState('loots');
    const [activeSkin, setActiveSkinState] = useState(getActiveSkin());

    const handlePlay = () => { resumeAudio(); sfx.go(); navigate('/game'); };
    const handlePickSkin = (skin) => {
        if (!isSkinUnlocked(skin, profile)) return;
        setActiveSkin(skin.id);
        setActiveSkinState(skin);
        sfx.combo(2);
    };

    const unlockedAch = profile.achievements.length;

    return (
        <div className="bg-cream relative min-h-screen overflow-x-hidden" data-testid="collection-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" aria-hidden="true" />

            <main id="main-content" tabIndex={-1}>
                <nav className="relative z-20 max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 gap-2" aria-label="Navigation">
                    <Link to="/app" data-testid="back-btn" className="bg-white border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A]">← Menu</Link>
                    <h1 className="font-heading text-xl sm:text-3xl uppercase tracking-tight">🎁 Collection</h1>
                    <div className="w-[68px]" />
                </nav>

                <BreakingTicker />

                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 text-center">
                    <motion.h2
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: -2 }}
                        transition={{ type: 'spring' }}
                        className="font-heading uppercase leading-[0.85] tracking-tighter text-ink"
                        style={{ fontSize: 'clamp(2.5rem, 9vw, 5rem)', textShadow: '0.04em 0.04em 0 #FFFF00, 0.08em 0.08em 0 #FF3B30' }}
                    >
                        Ta <span className="text-tomato inline-block">collection</span>
                    </motion.h2>
                </section>

                {/* Tabs */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-4" role="tablist" aria-label="Sections de collection">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { sfx.click(); setActive(t.id); }}
                                role="tab"
                                aria-selected={active === t.id}
                                data-testid={`collection-tab-${t.id}`}
                                className={`border-[3px] border-ink font-heading uppercase text-sm sm:text-lg px-2 py-2.5 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100 ${active === t.id ? 'bg-tomato text-white' : 'bg-white'}`}
                                style={active === t.id ? {} : { backgroundColor: t.color }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-8">
                    <AnimatePresence mode="wait">
                        {active === 'loots' && (
                            <motion.div key="loots" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} role="tabpanel">
                                <p className="font-body text-xs sm:text-sm font-bold opacity-80 mb-4">
                                    Bonus pioché après chaque KO via la slot-machine. Effet appliqué au round suivant.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {BOOSTS.map((b, i) => (
                                        <motion.div
                                            key={b.id}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.04 }}
                                            className="border-4 border-ink p-3 shadow-[5px_5px_0px_#0A0A0A] text-center"
                                            style={{ backgroundColor: b.bg, color: b.color, transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
                                        >
                                            <div className="text-4xl sm:text-5xl mb-1" aria-hidden="true">{b.emoji}</div>
                                            <h3 className="font-heading text-xs sm:text-sm uppercase leading-none">{b.name}</h3>
                                            <p className="font-body text-[10px] sm:text-xs font-bold opacity-80 mt-1.5 leading-tight">{b.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {active === 'skins' && (
                            <motion.div key="skins" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} role="tabpanel">
                                <p className="font-body text-xs sm:text-sm font-bold opacity-80 mb-4">
                                    Change l&apos;emoji de ton bouton BAFFE. Débloque-les en jouant.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {GLOVE_SKINS.map((s) => {
                                        const unlocked = isSkinUnlocked(s, profile);
                                        const isActive = activeSkin.id === s.id;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => handlePickSkin(s)}
                                                disabled={!unlocked}
                                                data-testid={`collection-skin-${s.id}`}
                                                aria-label={`Skin ${s.name}${isActive ? ' (actif)' : ''}${unlocked ? '' : ' (verrouillé)'}`}
                                                className={`border-4 border-ink p-3 shadow-[5px_5px_0px_#0A0A0A] text-center transition-all ${
                                                    isActive ? 'bg-acid ring-4 ring-tomato' : unlocked ? 'bg-white hover:bg-cream' : 'bg-muted opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                <div className="text-5xl sm:text-6xl mb-1" aria-hidden="true">{unlocked ? s.emoji : '🔒'}</div>
                                                <h3 className="font-heading text-sm uppercase leading-none">{s.name}</h3>
                                                <p className="font-body text-[10px] sm:text-xs font-bold opacity-70 mt-1">{unlocked ? (isActive ? 'ACTIF' : 'Touche pour activer') : s.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {active === 'trophies' && (
                            <motion.div key="trophies" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} role="tabpanel">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="font-body text-xs sm:text-sm font-bold opacity-80">Débloqués en jouant. {unlockedAch}/{ACHIEVEMENTS.length}.</p>
                                    <span className="font-heading text-base bg-acid border-2 border-ink px-2 py-0.5">{unlockedAch}/{ACHIEVEMENTS.length}</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {ACHIEVEMENTS.map((a, i) => {
                                        const unlocked = profile.achievements.includes(a.id);
                                        return (
                                            <div
                                                key={a.id}
                                                data-testid={`collection-achievement-${a.id}`}
                                                className={`border-4 border-ink p-3 shadow-[5px_5px_0px_#0A0A0A] text-center ${unlocked ? 'bg-acid' : 'bg-muted opacity-60'}`}
                                                style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
                                            >
                                                <div className="text-4xl sm:text-5xl mb-1" aria-hidden="true">{unlocked ? a.emoji : '🔒'}</div>
                                                <h3 className="font-heading text-xs sm:text-sm uppercase leading-none">{a.name}</h3>
                                                <p className="font-body text-[10px] sm:text-xs font-bold opacity-70 mt-1.5 leading-tight">{a.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        animate={{ rotate: [-1, 1, -1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        onClick={handlePlay}
                        data-testid="collection-play-btn"
                        className="mt-8 w-full bg-tomato text-white border-4 border-ink font-heading uppercase text-2xl sm:text-3xl px-6 py-4 shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all duration-75 tracking-wider"
                    >
                        💥 JOUER POUR TOUT DÉBLOQUER
                    </motion.button>
                </section>

                <Footer />
            </main>
        </div>
    );
};

export default Collection;
