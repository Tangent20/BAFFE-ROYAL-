import { motion } from "framer-motion";
import { OPPONENTS } from "@/lib/gameData";

const PLACES = [
    { rank: 2, h: 'h-16 sm:h-20', medal: '🥈', bg: '#E5E5E5' },
    { rank: 1, h: 'h-24 sm:h-28', medal: '🥇', bg: '#FFFF00' },
    { rank: 3, h: 'h-12 sm:h-14', medal: '🥉', bg: '#FF8C00' },
];

export const KillPodium = ({ counts }) => {
    const top = OPPONENTS.map((o) => ({ ...o, kills: counts[o.id] || 0 }))
        .filter((o) => o.kills > 0)
        .sort((a, b) => b.kills - a.kills)
        .slice(0, 3);

    if (top.length === 0) {
        return (
            <div className="bg-white border-4 border-ink p-4 shadow-[5px_5px_0px_#0A0A0A] text-center" data-testid="kill-podium-empty">
                <p className="font-heading uppercase text-sm sm:text-base">🏆 Podium vide. Personne n&apos;a encore souffert.</p>
                <p className="font-body text-xs font-bold opacity-70 mt-1">Mets ton premier K.O. pour inaugurer le tableau de chasse.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border-4 border-ink p-3 sm:p-4 shadow-[5px_5px_0px_#0A0A0A]" data-testid="kill-podium">
            <p className="font-heading text-xs uppercase tracking-widest text-tomato mb-3">🏆 Top 3 de tes victimes préférées</p>
            <div className="grid grid-cols-3 gap-2 items-end">
                {PLACES.map((pl, i) => {
                    const op = top[pl.rank - 1];
                    return (
                        <div key={pl.rank} className="text-center" data-testid={`podium-rank-${pl.rank}`}>
                            {op ? (
                                <>
                                    <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 * i, type: 'spring' }} className="text-4xl sm:text-5xl leading-none" aria-hidden="true">{op.emoji}</motion.div>
                                    <p className="font-heading uppercase text-[10px] sm:text-xs leading-tight mt-1 truncate">{op.name}</p>
                                    <p className="font-body text-[10px] sm:text-xs font-bold">{op.kills} baffe{op.kills > 1 ? 's' : ''}</p>
                                </>
                            ) : <div className="text-3xl opacity-30" aria-hidden="true">❔</div>}
                            <div className={`${pl.h} border-4 border-ink mt-1 flex items-start justify-center pt-1 text-xl sm:text-2xl`} style={{ backgroundColor: pl.bg }}>{pl.medal}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
