import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { sfx, resumeAudio } from "@/lib/audio";
import Footer from "@/components/Footer";
import BreakingTicker from "@/components/BreakingTicker";

const RUMORS = [
    "🌶️ Mamie aurait un tatouage de katana sur la fesse.",
    "🍪 Papa cache des cookies dans la boîte à outils.",
    "🧦 Maman compte les chaussettes orphelines depuis 1987.",
    "🥖 La baguette sensei mange du riz en cachette.",
    "🐑 Le mouton suit secrètement les chats sur Insta.",
    "🍮 Le Flamby est en réalité un Flamby retraité depuis 2003.",
];

const PROPHECIES = [
    "🔮 Tu vas baffer. Tu vas pleurer. Tu vas rebaffer.",
    "🔮 Ta main droite te déçoit. Ta gauche te trahit.",
    "🔮 Un perfect t'attend après 3 ratés. Crois-y.",
    "🔮 Mamie a vu ton score. Elle rigole encore.",
    "🔮 Ce soir, ton téléphone va vibrer. Beaucoup.",
    "🔮 Papa est fier. Mais il ne te le dira pas.",
];

const TWEETS = [
    { user: "@kevin28", txt: "j'ai baffé maman j'ai perdu le wifi 😭", likes: "12k", av: "🧔" },
    { user: "@mamielol", txt: "battue par ma petite-fille 47 fois cette semaine", likes: "8.2k", av: "👵" },
    { user: "@flamby_off", txt: "je ne tremble pas. c'est vous qui bougez.", likes: "203k", av: "🍮" },
    { user: "@papa_repare", txt: "fils si tu lis ça range ta chambre. fin du tweet.", likes: "4.1k", av: "👨" },
    { user: "@anonymouton", txt: "BÊÊÊÊÊÊH", likes: "999", av: "🐑" },
];

const STUPID_FACTS = [
    "🦗 Selon une étude que personne n'a faite, 86% des grilles-pain rêvent de baffer un humain.",
    "🦴 Le coude est l'endroit le plus drôle du corps. Surtout quand il rate une mamie.",
    "🧅 Pleurer en coupant un oignon prépare au mode pratique. Scientifiquement prouvé.",
    "🐢 La baffe la plus lente du monde dure 47 secondes. Réalisée par une tortue retraitée.",
    "🪑 Les chaises de bureau gagnent 73% du temps contre les humains assis dessus 8h.",
];

const ZoneDebile = () => {
    const navigate = useNavigate();
    const [worldCount, setWorldCount] = useState(0);
    const [rumorIdx, setRumorIdx] = useState(0);
    const [tweetIdx, setTweetIdx] = useState(0);
    const [prophecyIdx, setProphecyIdx] = useState(0);
    const [factIdx, setFactIdx] = useState(0);

    useEffect(() => {
        const r = setInterval(() => setRumorIdx((i) => (i + 1) % RUMORS.length), 4200);
        const t = setInterval(() => setTweetIdx((i) => (i + 1) % TWEETS.length), 4600);
        const f = setInterval(() => setFactIdx((i) => (i + 1) % STUPID_FACTS.length), 5000);
        const w = setInterval(() => setWorldCount((c) => c + Math.floor(Math.random() * 6) + 1), 900);
        return () => { clearInterval(r); clearInterval(t); clearInterval(f); clearInterval(w); };
    }, []);

    const drawProphecy = () => { sfx.click(); setProphecyIdx((i) => (i + 1) % PROPHECIES.length); };
    const handlePlay = () => { resumeAudio(); sfx.go(); navigate('/game'); };

    return (
        <div className="bg-cream relative min-h-screen overflow-x-hidden" data-testid="zone-debile-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" aria-hidden="true" />

            <main id="main-content" tabIndex={-1}>
                <nav className="relative z-20 max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 gap-2" aria-label="Navigation">
                    <Link to="/app" data-testid="back-btn" className="bg-white border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A]">← Menu</Link>
                    <h1 className="font-heading text-xl sm:text-3xl uppercase tracking-tight">📢 Zone Débile</h1>
                    <div className="w-[68px]" />
                </nav>

                <BreakingTicker />

                {/* Hero */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 text-center">
                    <motion.h2
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: -2 }}
                        transition={{ type: 'spring' }}
                        className="font-heading uppercase leading-[0.85] tracking-tighter text-ink"
                        style={{ fontSize: 'clamp(2.5rem, 9vw, 5rem)', textShadow: '0.04em 0.04em 0 #FFFF00, 0.08em 0.08em 0 #FF3B30' }}
                    >
                        100% <span className="text-tomato inline-block">absurdité</span>
                    </motion.h2>
                    <p className="font-body text-xs sm:text-sm font-bold opacity-80 mt-3 max-w-md mx-auto">
                        Rumeurs · Témoignages · Prophéties · Faits inutiles. Aucune source. Aucun cerveau utilisé.
                    </p>
                </section>

                {/* Compteur mondial */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-4" aria-label="Compteur mondial">
                    <div className="border-4 border-ink p-4 sm:p-5 shadow-[6px_6px_0px_#FF3B30] text-center" style={{ backgroundColor: '#9C27FF', color: 'white' }}>
                        <p className="font-body text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-80">Compteur mondial de baffes</p>
                        <p className="font-heading text-4xl sm:text-6xl tracking-tighter mt-1" aria-live="polite" data-testid="world-counter">
                            {worldCount.toLocaleString('fr-FR')} 💥
                        </p>
                        <p className="font-body text-[10px] uppercase tracking-widest opacity-70 mt-1 italic">100% inventé · pour de vrai</p>
                    </div>
                </section>

                {/* Tweet + Prophétie */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tweetIdx}
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -30, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white border-4 border-ink p-3 sm:p-4 shadow-[6px_6px_0px_#0A0A0A]"
                                data-testid="tweet-card"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan border-[3px] border-ink flex items-center justify-center text-2xl shrink-0" aria-hidden="true">{TWEETS[tweetIdx].av}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-heading text-tomato text-sm uppercase">{TWEETS[tweetIdx].user}</p>
                                        <p className="font-body text-sm font-bold mt-1 leading-tight">{TWEETS[tweetIdx].txt}</p>
                                        <p className="font-body text-[10px] uppercase tracking-widest opacity-60 mt-2">❤️ {TWEETS[tweetIdx].likes}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={drawProphecy}
                            data-testid="prophecy-btn"
                            className="bg-acid border-4 border-ink p-3 sm:p-4 shadow-[6px_6px_0px_#0A0A0A] text-left active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0px_#0A0A0A] transition-all"
                        >
                            <div className="font-heading text-xs uppercase tracking-widest mb-1.5">🔮 Tire une prophétie</div>
                            <p className="font-body text-sm font-bold italic">{PROPHECIES[prophecyIdx]}</p>
                        </button>
                    </div>
                </section>

                {/* Rumeur + Fait stupide */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`r-${rumorIdx}`}
                                initial={{ y: 20, opacity: 0, rotate: -2 }}
                                animate={{ y: 0, opacity: 1, rotate: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-tomato text-white border-4 border-ink p-3 sm:p-4 shadow-[6px_6px_0px_#0A0A0A]"
                                data-testid="rumor-card"
                            >
                                <div className="font-heading text-sm uppercase tracking-widest mb-2 bg-acid text-ink inline-block px-2 py-0.5">RUMEUR DU JOUR</div>
                                <p className="font-body text-sm sm:text-base font-bold">{RUMORS[rumorIdx]}</p>
                            </motion.div>
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`f-${factIdx}`}
                                initial={{ y: 20, opacity: 0, rotate: 2 }}
                                animate={{ y: 0, opacity: 1, rotate: -1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-cyan border-4 border-ink p-3 sm:p-4 shadow-[6px_6px_0px_#0A0A0A]"
                                data-testid="fact-card"
                            >
                                <div className="font-heading text-sm uppercase tracking-widest mb-2 bg-ink text-acid inline-block px-2 py-0.5">FAIT INUTILE</div>
                                <p className="font-body text-sm sm:text-base font-bold">{STUPID_FACTS[factIdx]}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center">
                    <motion.button
                        animate={{ rotate: [-1, 1, -1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        onClick={handlePlay}
                        data-testid="zone-play-btn"
                        className="w-full bg-tomato text-white border-4 border-ink font-heading uppercase text-2xl sm:text-3xl px-6 py-4 shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all duration-75 tracking-wider"
                    >
                        💥 ASSEZ LU. JE BAFFE !
                    </motion.button>
                    <p className="font-body text-[10px] sm:text-xs uppercase tracking-widest font-bold mt-3 opacity-60 italic">
                        « La connaissance c&apos;est la baffe. » — Mamie Ninja
                    </p>
                </section>

                <Footer />
            </main>
        </div>
    );
};

export default ZoneDebile;
