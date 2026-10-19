import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { canSpinToday, spinWheel, getLastPrize, PRIZES } from "@/lib/lottery";
import { sfx } from "@/lib/audio";

const LotteryWheel = () => {
    const [spinning, setSpinning] = useState(false);
    const [prize, setPrize] = useState(getLastPrize());
    const [canSpin, setCanSpin] = useState(canSpinToday());

    const handleSpin = () => {
        if (!canSpin || spinning) return;
        setSpinning(true);
        sfx.go();
        // Spin animation duration ~ 2s
        setTimeout(() => {
            const winner = spinWheel();
            setPrize(winner);
            setCanSpin(false);
            setSpinning(false);
            sfx.win();
        }, 2200);
    };

    return (
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-6" aria-label="Roue de la fortune quotidienne">
            <div className="flex items-center gap-2 mb-3">
                <span className="bg-ink text-acid font-heading uppercase text-[10px] sm:text-xs tracking-widest px-2 py-0.5">🎰 Roue du jour</span>
                <span className="font-body text-[10px] opacity-60">1 fois / jour · rien à gagner mais quand même</span>
            </div>

            <div className="bg-white border-4 border-ink p-4 sm:p-5 shadow-[6px_6px_0px_#0A0A0A]" data-testid="lottery-wheel">
                <div className="flex items-center gap-4">
                    {/* Wheel emoji */}
                    <motion.div
                        animate={spinning ? { rotate: 1440 } : { rotate: 0 }}
                        transition={{ duration: 2.2, ease: 'easeOut' }}
                        className="text-6xl sm:text-7xl shrink-0"
                        aria-hidden="true"
                    >
                        🎡
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {spinning ? (
                                <motion.p
                                    key="spinning"
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    className="font-heading text-base sm:text-xl uppercase"
                                >
                                    🌀 La roue tourne... attends...
                                </motion.p>
                            ) : prize ? (
                                <motion.div key="prize" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <div className="inline-block border-2 border-ink px-2 py-0.5 mb-1" style={{ backgroundColor: prize.color, color: prize.white ? 'white' : '#0A0A0A' }}>
                                        <span className="font-heading text-xs sm:text-sm uppercase tracking-wider">{prize.emoji} {prize.label}</span>
                                    </div>
                                    <p className="font-body text-[11px] sm:text-sm font-bold leading-snug" data-testid="lottery-prize-desc">{prize.desc}</p>
                                </motion.div>
                            ) : (
                                <motion.p key="idle" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-heading text-base sm:text-xl uppercase">
                                    Tente ta chance !
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <button
                    onClick={handleSpin}
                    disabled={!canSpin || spinning}
                    data-testid="lottery-spin-btn"
                    className={`mt-3 w-full border-4 border-ink font-heading uppercase text-lg sm:text-xl py-2.5 shadow-[5px_5px_0px_#0A0A0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100 ${
                        canSpin && !spinning ? 'bg-tomato text-white hover:scale-[1.01]' : 'bg-muted opacity-60 cursor-not-allowed'
                    }`}
                >
                    {spinning ? '🌀 TOURNE...' : canSpin ? '🎰 TOURNE LA ROUE !' : '⏳ Reviens demain'}
                </button>
            </div>
        </section>
    );
};

export default LotteryWheel;
