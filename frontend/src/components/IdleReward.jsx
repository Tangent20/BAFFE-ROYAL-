import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeIdleReward } from "@/lib/idle";
import { loadProfile, saveProfile } from "@/lib/profile";
import { sfx } from "@/lib/audio";

const IdleReward = () => {
    const [reward, setReward] = useState(null);

    useEffect(() => {
        const profile = loadProfile();
        const r = computeIdleReward(profile.games_played || 0);
        if (r) {
            // Credit points to total_score
            profile.total_score = (profile.total_score || 0) + r.points;
            saveProfile(profile);
            setReward(r);
            try { sfx.win(); } catch (_) { /* ignore */ }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        sfx.click();
        setReward(null);
    };

    if (!reward) return null;

    const minLabel = reward.elapsedMin < 60
        ? `${reward.elapsedMin} min`
        : reward.elapsedMin < 1440
            ? `${Math.floor(reward.elapsedMin / 60)}h${reward.elapsedMin % 60 || ''}`
            : `${Math.floor(reward.elapsedMin / 1440)} jour${reward.elapsedMin >= 2880 ? 's' : ''}`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={handleClose}
                data-testid="idle-reward-modal"
            >
                <motion.div
                    initial={{ scale: 0, rotate: -8 }}
                    animate={{ scale: 1, rotate: -2 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="bg-acid border-4 border-ink shadow-[10px_10px_0px_#FF3B30] max-w-md w-full p-5 sm:p-7 text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        animate={{ rotate: [-15, 15, -15] }}
                        transition={{ duration: 0.8, repeat: 2 }}
                        className="text-6xl sm:text-7xl mb-2"
                    >🤖</motion.div>
                    <p className="font-heading text-tomato uppercase text-[10px] sm:text-xs tracking-widest mb-1">Pendant ton absence...</p>
                    <h2 className="font-heading uppercase text-2xl sm:text-3xl text-ink leading-tight mb-3" style={{ textShadow: '0.04em 0.04em 0 #FF3B30' }}>
                        Ton Gant Auto a bossé !
                    </h2>
                    <div className="bg-white border-4 border-ink p-3 sm:p-4 shadow-[4px_4px_0px_#0A0A0A] mb-4">
                        <p className="font-body text-xs sm:text-sm font-bold opacity-70">Absent depuis</p>
                        <p className="font-heading text-2xl sm:text-3xl text-tomato leading-none mt-1">{minLabel}</p>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-tomato text-white border-2 border-ink p-2">
                                <p className="font-body text-[10px] uppercase font-bold opacity-90">Baffes auto</p>
                                <p className="font-heading text-lg sm:text-2xl leading-none" data-testid="idle-baffes">{reward.baffes.toLocaleString('fr-FR')}</p>
                            </div>
                            <div className="bg-lime border-2 border-ink p-2">
                                <p className="font-body text-[10px] uppercase font-bold opacity-90">Points gagnés</p>
                                <p className="font-heading text-lg sm:text-2xl leading-none" data-testid="idle-points">+{reward.points.toLocaleString('fr-FR')}</p>
                            </div>
                        </div>
                    </div>
                    <p className="font-body text-[11px] sm:text-xs font-bold italic opacity-70 mb-3 px-2 leading-snug">
                        « Pendant que tu dormais, je l&apos;ai baffée. Encore. Et encore. »
                    </p>
                    <button
                        onClick={handleClose}
                        data-testid="idle-claim-btn"
                        className="w-full bg-tomato text-white border-4 border-ink font-heading uppercase text-lg sm:text-xl py-3 shadow-[5px_5px_0px_#0A0A0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100"
                    >
                        ✅ Encaisser et continuer
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default IdleReward;
