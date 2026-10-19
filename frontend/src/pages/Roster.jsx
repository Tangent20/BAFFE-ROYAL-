import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { OPPONENTS } from "@/lib/gameData";
import { sfx, resumeAudio } from "@/lib/audio";
import Footer from "@/components/Footer";
import BreakingTicker from "@/components/BreakingTicker";

const Roster = () => {
    const navigate = useNavigate();
    const handlePlay = () => { resumeAudio(); sfx.go(); navigate('/game'); };

    return (
        <div className="bg-cream relative min-h-screen overflow-x-hidden" data-testid="roster-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" aria-hidden="true" />

            <main id="main-content" tabIndex={-1}>
                {/* Nav */}
                <nav className="relative z-20 max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 gap-2" aria-label="Navigation">
                    <Link to="/app" data-testid="back-btn" className="bg-white border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A]">← Menu</Link>
                    <h1 className="font-heading text-xl sm:text-3xl uppercase tracking-tight">🥊 Le Roster</h1>
                    <div className="w-[68px]" />
                </nav>

                <BreakingTicker />

                {/* Hero */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 text-center">
                    <motion.h2
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: -2 }}
                        transition={{ type: 'spring' }}
                        className="font-heading uppercase leading-[0.95] tracking-tighter break-words text-ink"
                        style={{ fontSize: 'clamp(2.25rem, 8vw, 4.5rem)', textShadow: '0.04em 0.04em 0 #FFFF00, 0.08em 0.08em 0 #FF3B30' }}
                    >
                        Galerie <span className="text-tomato inline-block">des tarés</span>
                    </motion.h2>
                    <p className="font-body text-xs sm:text-sm font-bold opacity-80 mt-3 max-w-md mx-auto">
                        Chaque combattant a sa bio, ses HP, son taux d&apos;esquive et ses répliques cultes.
                    </p>
                </section>

                {/* Roster cards */}
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-8" aria-label="Liste des combattants">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {OPPONENTS.map((op, i) => {
                            const isNew = op.id === 'maman' || op.id === 'papa';
                            const rotate = (i % 2 === 0 ? -1 : 1) * (0.5 + (i % 3) * 0.5);
                            return (
                                <motion.article
                                    key={op.id}
                                    initial={{ y: 20, opacity: 0, rotate: 0 }}
                                    whileInView={{ y: 0, opacity: 1, rotate }}
                                    viewport={{ once: true, margin: '-30px' }}
                                    whileHover={{ rotate: 0, scale: 1.02 }}
                                    transition={{ delay: i * 0.04 }}
                                    data-testid={`roster-card-${op.id}`}
                                    className="bg-white border-4 border-ink shadow-[6px_6px_0px_#0A0A0A] relative"
                                >
                                    <header className="border-b-4 border-ink p-4 text-center" style={{ backgroundColor: op.bg }}>
                                        <div className="text-6xl sm:text-7xl mb-2 animate-wobble" style={{ animationDelay: `${i * 0.3}s` }} aria-hidden="true">{op.emoji}</div>
                                        <h3 className="font-heading text-lg sm:text-2xl uppercase tracking-tight leading-none">{op.name}</h3>
                                    </header>
                                    <div className="p-3 sm:p-4">
                                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                                            <Stat icon="❤️" label="HP" value={op.hp} bg="#FF3B30" white />
                                            <Stat icon="🎯" label="ESQ" value={`${Math.round(op.dodgeChance * 100)}%`} bg="#00FFFF" />
                                            <Stat icon="🛡️" label="Bouclier" value={op.shieldHp || '—'} bg="#39FF14" />
                                        </div>
                                        <p className="font-body text-xs sm:text-sm font-bold leading-snug mb-2">{op.bio}</p>
                                        <div className="bg-cream border-2 border-ink p-2 mt-2">
                                            <p className="font-heading text-[10px] uppercase tracking-widest text-tomato mb-1">Taunt favori</p>
                                            <p className="font-body text-xs italic">« {op.taunt[0]} »</p>
                                        </div>
                                    </div>
                                    {isNew && (
                                        <span className="absolute -top-2 -right-2 bg-acid text-ink font-heading text-[10px] px-2 py-0.5 border-2 border-ink shadow-[2px_2px_0px_#0A0A0A] rotate-12" aria-hidden="true">NEW</span>
                                    )}
                                </motion.article>
                            );
                        })}
                    </div>

                    <motion.button
                        animate={{ rotate: [-1, 1, -1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        onClick={handlePlay}
                        data-testid="roster-play-btn"
                        className="mt-8 w-full bg-tomato text-white border-4 border-ink font-heading uppercase text-2xl sm:text-3xl px-6 py-4 shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all duration-75 tracking-wider"
                    >
                        💥 LES BAFFER MAINTENANT
                    </motion.button>
                </section>

                <Footer />
            </main>
        </div>
    );
};

const Stat = ({ icon, label, value, bg, white }) => (
    <div className="border-2 border-ink p-1.5 shadow-[2px_2px_0px_#0A0A0A] text-center" style={{ backgroundColor: bg, color: white ? '#fff' : '#0A0A0A' }}>
        <div className="text-base" aria-hidden="true">{icon}</div>
        <div className="font-heading text-sm leading-none">{value}</div>
        <div className="font-body text-[8px] uppercase tracking-widest font-bold mt-0.5">{label}</div>
    </div>
);

export default Roster;
