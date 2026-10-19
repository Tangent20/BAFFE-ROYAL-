import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sfx, resumeAudio } from "@/lib/audio";
import { loadKills, sortOpponents } from "@/lib/kills";
import Footer from "@/components/Footer";
import BreakingTicker from "@/components/BreakingTicker";
import { SortBar } from "@/components/roster/SortBar";
import { KillPodium } from "@/components/roster/KillPodium";
import { HuntStatus } from "@/components/roster/HuntStatus";
import { RosterCard } from "@/components/roster/RosterCard";
import { RagePicker } from "@/components/roster/RagePicker";

const Roster = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('order');
    const [kills] = useState(loadKills);
    const list = sortOpponents(mode, kills.counts);

    const fight = (id) => { resumeAudio(); sfx.go(); navigate(`/game?start=${id}`); };
    const handlePlay = () => { resumeAudio(); sfx.go(); navigate('/game'); };

    return (
        <div className="bg-cream relative min-h-screen overflow-x-clip" data-testid="roster-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" aria-hidden="true" />

            <main id="main-content" tabIndex={-1}>
                <nav className="relative z-20 max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 gap-2" aria-label="Navigation">
                    <Link to="/app" data-testid="back-btn" className="bg-white border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A]">← Menu</Link>
                    <h1 className="font-heading text-xl sm:text-3xl uppercase tracking-tight">🥊 Le Roster</h1>
                    <div className="w-[68px]" />
                </nav>

                <BreakingTicker />

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
                        Trie-les, choisis ta victime, baffe-la. Chaque K.O. est gravé à vie dans ton tableau de chasse.
                    </p>
                </section>

                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-4 flex flex-col gap-3" aria-label="Tableau de chasse">
                    <RagePicker onFight={fight} />
                    <HuntStatus kills={kills} onHunt={fight} />
                    <KillPodium counts={kills.counts} />
                </section>

                <section className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-y-4 border-ink py-2 mb-4">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <SortBar mode={mode} onChange={setMode} />
                    </div>
                </section>

                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-8" aria-label="Liste des combattants">
                    <p className="font-heading uppercase text-xs tracking-widest mb-3" data-testid="roster-result-count">{list.length} combattant{list.length > 1 ? 's' : ''}</p>
                    {list.length === 0 ? (
                        <div className="bg-white border-4 border-ink p-6 text-center shadow-[5px_5px_0px_#0A0A0A]" data-testid="roster-empty">
                            <div className="text-5xl mb-2" aria-hidden="true">😈</div>
                            <p className="font-heading uppercase text-lg">Tu as baffé TOUT LE MONDE.</p>
                            <p className="font-body text-sm font-bold opacity-70 mt-1">Psychopathe certifié. Va voir le tri « + baffés » pour admirer ton œuvre.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {list.map((op, i) => <RosterCard key={op.id} op={op} index={i} onFight={fight} />)}
                        </div>
                    )}

                    <motion.button
                        animate={{ rotate: [-1, 1, -1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        onClick={handlePlay}
                        data-testid="roster-play-btn"
                        className="mt-8 w-full bg-tomato text-white border-4 border-ink font-heading uppercase text-2xl sm:text-3xl px-6 py-4 shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all duration-75 tracking-wider"
                    >
                        💥 LES BAFFER DANS L&apos;ORDRE
                    </motion.button>
                </section>

                <Footer />
            </main>
        </div>
    );
};

export default Roster;
