import { motion } from "framer-motion";
import { getKillTitle } from "@/lib/kills";
import { DifficultyBar } from "@/components/roster/DifficultyBar";

const Stat = ({ icon, label, value, bg, white }) => (
    <div className="border-2 border-ink p-1.5 shadow-[2px_2px_0px_#0A0A0A] text-center" style={{ backgroundColor: bg, color: white ? '#fff' : '#0A0A0A' }}>
        <div className="text-base" aria-hidden="true">{icon}</div>
        <div className="font-heading text-sm leading-none">{value}</div>
        <div className="font-body text-[8px] uppercase tracking-widest font-bold mt-0.5">{label}</div>
    </div>
);

const KillBlock = ({ op }) => {
    const { title, prevAt, next } = getKillTitle(op.kills);
    const pct = next ? ((op.kills - prevAt) / (next.at - prevAt)) * 100 : 100;
    return (
        <div className={`border-2 border-ink p-2 ${op.kills ? 'bg-ink text-white' : 'bg-cream'}`} data-testid={`kill-block-${op.id}`}>
            <div className="flex justify-between items-baseline gap-2">
                <p className="font-heading uppercase text-sm leading-none" data-testid={`kill-count-${op.id}`}>
                    {op.kills ? `👋 Baffé ${op.kills} fois` : '🆕 Jamais baffé'}
                </p>
                <p className={`font-body text-[10px] font-bold italic text-right ${op.kills ? 'text-acid' : 'opacity-70'}`}>{title}</p>
            </div>
            {next && (
                <>
                    <div className={`h-2 border ${op.kills ? 'border-white' : 'border-ink'} mt-1.5 overflow-hidden`}>
                        <div className="h-full bg-tomato" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="font-body text-[10px] font-bold mt-1 opacity-80">
                        Encore {next.at - op.kills} baffe{next.at - op.kills > 1 ? 's' : ''} → « {next.title} »
                    </p>
                </>
            )}
        </div>
    );
};

export const RosterCard = ({ op, index, onFight }) => (
    <motion.article
        layout
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: Math.min(index, 8) * 0.04 }}
        data-testid={`roster-card-${op.id}`}
        className="bg-white border-4 border-ink shadow-[6px_6px_0px_#0A0A0A] relative flex flex-col"
    >
        <span className="absolute top-2 left-2 bg-white border-2 border-ink font-heading text-[10px] px-1.5 py-0.5 z-10" data-testid={`roster-round-${op.id}`}>ROUND {op.order + 1}</span>
        <header className="border-b-4 border-ink p-4 text-center" style={{ backgroundColor: op.bg }}>
            <div className="text-6xl sm:text-7xl mb-2 animate-wobble" style={{ animationDelay: `${index * 0.3}s` }} aria-hidden="true">{op.emoji}</div>
            <h3 className="font-heading text-lg sm:text-2xl uppercase tracking-tight leading-none" style={{ color: op.bg === '#0A0A0A' || op.bg === '#9C27FF' ? '#fff' : '#0A0A0A' }}>{op.name}</h3>
        </header>
        <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
            <DifficultyBar op={op} />
            <div className="grid grid-cols-3 gap-1.5">
                <Stat icon="❤️" label="HP" value={op.hp} bg="#FF3B30" white />
                <Stat icon="🎯" label="ESQ" value={`${Math.round(op.dodgeChance * 100)}%`} bg="#00FFFF" />
                <Stat icon="🛡️" label="Bouclier" value={op.shieldHp || '—'} bg="#39FF14" />
            </div>
            <KillBlock op={op} />
            <p className="font-body text-xs sm:text-sm font-bold leading-snug">{op.bio}</p>
            <p className="font-body text-xs italic opacity-80">« {op.taunt[0]} »</p>
            <button
                onClick={() => onFight(op.id)}
                data-testid={`roster-fight-${op.id}`}
                className="mt-auto w-full bg-tomato text-white border-[3px] border-ink font-heading uppercase text-base sm:text-lg py-2 shadow-[4px_4px_0px_#0A0A0A] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-transform duration-75 hover:-rotate-1"
            >
                👋 Baffer ce perso
            </button>
        </div>
    </motion.article>
);
