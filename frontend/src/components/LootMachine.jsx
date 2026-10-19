import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BOOSTS, pickRandomBoost } from "@/lib/loot";
import { sfx } from "@/lib/audio";

/**
 * Slot-machine that appears after each KO (except the very last one).
 * Calls `onPicked(boost)` after the reel lands, then `onClose()` ~1.4s later.
 *
 * The reel is 3 lanes; the middle lane lands on the chosen boost.
 */
const LootMachine = ({ onPicked, onClose }) => {
    const [winner] = useState(() => pickRandomBoost());
    const [landed, setLanded] = useState(false);
    const tickRef = useRef(null);
    const startedAt = useRef(performance.now());
    const [scrollPositions, setScrollPositions] = useState([0, 0, 0]);

    // Animate the 3 reels with different stop times (cascade feel)
    useEffect(() => {
        const totalDuration = 2200; // ms
        const reelDurations = [1100, 1500, 1900];

        const tick = () => {
            const elapsed = performance.now() - startedAt.current;
            const positions = reelDurations.map((d, idx) => {
                if (elapsed >= d) {
                    // Landed on a stable position
                    if (idx === 1) {
                        // Middle reel must land on winner
                        const winnerIdx = BOOSTS.findIndex((b) => b.id === winner.id);
                        return winnerIdx * 88;
                    }
                    // Side reels land randomly (cosmetic only)
                    return (idx === 0 ? 3 : 5) * 88;
                }
                // Spinning fast
                const speed = 0.6 + idx * 0.05;
                return (elapsed * speed) % (BOOSTS.length * 88);
            });
            setScrollPositions(positions);

            if (elapsed < totalDuration) {
                tickRef.current = requestAnimationFrame(tick);
            } else {
                setLanded(true);
                sfx.achievement();
                onPicked(winner);
                setTimeout(() => onClose(), 1500);
            }
        };

        tickRef.current = requestAnimationFrame(tick);

        // Reel tick sound every ~80ms during spin
        const soundInterval = setInterval(() => {
            sfx.click();
        }, 90);
        setTimeout(() => clearInterval(soundInterval), totalDuration);

        return () => {
            if (tickRef.current) cancelAnimationFrame(tickRef.current);
            clearInterval(soundInterval);
        };
    }, []);

    const handleSkip = () => {
        if (tickRef.current) cancelAnimationFrame(tickRef.current);
        if (!landed) {
            setLanded(true);
            sfx.achievement();
            onPicked(winner);
        }
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4 py-6"
            style={{
                backgroundColor: "rgba(10,10,10,0.92)",
                touchAction: "none",
            }}
            onClick={handleSkip}
            data-testid="loot-machine"
        >
            <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />

            {/* Title */}
            <motion.div
                initial={{ y: -40, opacity: 0, rotate: -8 }}
                animate={{ y: 0, opacity: 1, rotate: -3 }}
                className="relative z-10 mb-4 sm:mb-6 text-center"
            >
                <div className="inline-block bg-acid border-4 border-ink px-4 py-1 shadow-[6px_6px_0px_#FF3B30] mb-2">
                    <span className="font-heading text-base sm:text-2xl uppercase tracking-widest">🎰 LOOT MACHINE 🎰</span>
                </div>
                <p className="font-body text-xs sm:text-sm font-bold uppercase tracking-widest text-acid opacity-80">
                    Bonus pour le prochain round
                </p>
            </motion.div>

            {/* The 3-reel machine */}
            <motion.div
                initial={{ scale: 0.6, rotate: -2 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="relative z-10 bg-ink border-4 border-acid p-3 sm:p-4 shadow-[10px_10px_0px_#FF3B30]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-2 sm:gap-3">
                    {[0, 1, 2].map((lane) => (
                        <div
                            key={lane}
                            className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden bg-cream border-4 border-acid"
                            data-testid={`reel-${lane}`}
                        >
                            <div
                                className="absolute left-0 right-0 transition-none flex flex-col"
                                style={{
                                    transform: `translateY(-${scrollPositions[lane]}px)`,
                                    transitionDuration: landed && lane === 1 ? "300ms" : "0ms",
                                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                                }}
                            >
                                {[...BOOSTS, ...BOOSTS, ...BOOSTS].map((b, i) => (
                                    <div
                                        key={`${b.id}-${i}`}
                                        className="h-[88px] sm:h-24 flex items-center justify-center text-5xl sm:text-6xl shrink-0"
                                    >
                                        {b.emoji}
                                    </div>
                                ))}
                            </div>
                            {/* Top/bottom mask */}
                            <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-cream to-transparent pointer-events-none" />
                            <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
                        </div>
                    ))}
                </div>

                {/* Pointer arrows pointing at middle reel */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 text-tomato text-3xl sm:text-4xl pointer-events-none">▶</div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-3 text-tomato text-3xl sm:text-4xl pointer-events-none">◀</div>
            </motion.div>

            {/* Result card (appears after landed) */}
            <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={landed ? { scale: 1, y: 0 } : { scale: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="relative z-10 mt-5 sm:mt-6 max-w-md w-full"
                data-testid="loot-result"
            >
                <div
                    className="border-4 border-ink p-3 sm:p-4 shadow-[8px_8px_0px_#0A0A0A] text-center"
                    style={{ backgroundColor: winner.bg, color: winner.color }}
                >
                    <div className="text-4xl sm:text-5xl mb-1">{winner.emoji}</div>
                    <h3 className="font-heading text-xl sm:text-3xl uppercase leading-none tracking-tight">{winner.name}</h3>
                    <p className="font-body text-[11px] sm:text-sm font-bold mt-1.5">{winner.desc}</p>
                </div>
            </motion.div>

            <p className="relative z-10 mt-4 font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest text-acid opacity-60">
                Tape pour passer →
            </p>
        </motion.div>
    );
};

export default LootMachine;
