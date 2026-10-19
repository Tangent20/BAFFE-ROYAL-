import { OPPONENTS } from "@/lib/gameData";
import { getDailyTarget, isDailyTargetDone } from "@/lib/kills";

export const HuntStatus = ({ kills, onHunt }) => {
    const total = OPPONENTS.length;
    const hunted = OPPONENTS.filter((o) => (kills.counts[o.id] || 0) > 0).length;
    const totalKills = Object.values(kills.counts).reduce((s, n) => s + n, 0);
    const target = getDailyTarget();
    const done = isDailyTargetDone(kills, target);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-ink text-white border-4 border-ink p-3 shadow-[5px_5px_0px_#FF3B30]" data-testid="hunt-progress">
                <div className="flex justify-between items-baseline">
                    <p className="font-heading uppercase text-xs tracking-widest text-acid">📋 Tableau de chasse</p>
                    <p className="font-heading text-sm" data-testid="hunt-total-kills">{totalKills} K.O.</p>
                </div>
                <p className="font-heading text-2xl leading-none mt-1" data-testid="hunt-count">{hunted}<span className="text-sm opacity-70">/{total} tarés baffés</span></p>
                <div className="h-3 border-2 border-white bg-white/10 mt-2 overflow-hidden">
                    <div className="h-full bg-acid transition-[width] duration-500" style={{ width: `${(hunted / total) * 100}%` }} />
                </div>
                <p className="font-body text-[11px] font-bold mt-1.5 opacity-80">
                    {hunted === total ? '🎉 COLLECTION COMPLÈTE. Tu es un monstre. On t\'aime.' : `Encore ${total - hunted} visage${total - hunted > 1 ? 's' : ''} jamais baffé${total - hunted > 1 ? 's' : ''}. Ça te démange, non ?`}
                </p>
            </div>
            <div className={`border-4 border-ink p-3 shadow-[5px_5px_0px_#0A0A0A] flex items-center gap-3 ${done ? 'bg-[#39FF14]' : 'bg-acid'}`} data-testid="daily-target">
                <div className="text-5xl animate-wobble shrink-0" aria-hidden="true">{target.emoji}</div>
                <div className="flex-1 min-w-0">
                    <p className="font-heading uppercase text-[10px] tracking-widest text-tomato">🎯 Cible du jour</p>
                    <p className="font-heading uppercase text-base sm:text-lg leading-none truncate">{target.name}</p>
                    <p className="font-body text-[11px] font-bold mt-1">{done ? '✅ Baffé(e) aujourd\'hui. Nouvelle cible demain à minuit.' : 'Personne ne l\'a encore baffé(e) aujourd\'hui. Honte.'}</p>
                </div>
                {!done && (
                    <button onClick={() => onHunt(target.id)} data-testid="daily-target-btn" className="shrink-0 bg-tomato text-white border-[3px] border-ink font-heading uppercase text-xs px-2 py-2 shadow-[3px_3px_0px_#0A0A0A] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-transform duration-75">
                        👋 Go
                    </button>
                )}
            </div>
        </div>
    );
};
