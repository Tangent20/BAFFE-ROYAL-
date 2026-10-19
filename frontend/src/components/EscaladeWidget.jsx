import { motion } from "framer-motion";
import { loadProfile } from "@/lib/profile";
import { getCurrentTier, getNextTier, ESCALADE_TIERS } from "@/lib/escalade";

const EscaladeWidget = () => {
    const profile = loadProfile();
    const best = profile.best_score || 0;
    const current = getCurrentTier(best);
    const next = getNextTier(best);
    const progress = next ? Math.min(100, (best / next.threshold) * 100) : 100;

    return (
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-6" aria-label="Mode Escalade">
            <div className="flex items-center gap-2 mb-3">
                <span className="bg-ink text-acid font-heading uppercase text-[10px] sm:text-xs tracking-widest px-2 py-0.5">📈 ESCALADE</span>
                <span className="font-body text-[10px] opacity-60">5 paliers de stupidité débloquables</span>
            </div>
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="border-4 border-ink p-3 sm:p-4 shadow-[6px_6px_0px_#0A0A0A]"
                style={{ backgroundColor: current.color, color: current.white ? 'white' : '#0A0A0A' }}
                data-testid="escalade-widget"
            >
                <div className="flex items-center gap-3">
                    <div className="text-4xl sm:text-5xl shrink-0" aria-hidden="true">{current.emoji}</div>
                    <div className="flex-1 min-w-0">
                        <p className="font-body text-[10px] sm:text-xs uppercase font-bold opacity-80">Palier actuel</p>
                        <p className="font-heading text-lg sm:text-2xl uppercase leading-tight">{current.name}</p>
                        <p className="font-body text-[11px] sm:text-xs font-bold opacity-90 leading-snug mt-1">{current.desc}</p>
                    </div>
                </div>
                {next && (
                    <div className="mt-3 pt-3 border-t-2 border-current/30">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                            <p className="font-body text-[10px] uppercase tracking-widest font-bold opacity-80">Prochain palier</p>
                            <p className="font-heading text-xs sm:text-sm">{next.emoji} {next.name}</p>
                        </div>
                        <div className="h-3 bg-white/30 border-2 border-ink relative overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-ink"
                            />
                        </div>
                        <p className="font-body text-[10px] uppercase font-bold opacity-70 mt-1 text-right">{best.toLocaleString('fr-FR')} / {next.threshold.toLocaleString('fr-FR')} pts</p>
                    </div>
                )}
                {!next && (
                    <p className="mt-3 pt-3 border-t-2 border-current/30 font-heading text-sm uppercase text-center">🏆 Tu as TOUT débloqué. Tu es une légende.</p>
                )}
            </motion.div>
            {/* Tier preview chips */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto hide-scrollbar">
                {ESCALADE_TIERS.map((t) => {
                    const unlocked = best >= t.threshold;
                    return (
                        <div key={t.id} className={`shrink-0 border-2 border-ink px-2 py-1 font-heading text-[10px] uppercase tracking-wider ${unlocked ? 'bg-acid text-ink' : 'bg-white text-ink opacity-40'}`} title={t.name}>
                            {unlocked ? t.emoji : '🔒'} {t.name}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default EscaladeWidget;
