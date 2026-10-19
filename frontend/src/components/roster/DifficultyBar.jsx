import { getDifficulty } from "@/lib/kills";

export const DifficultyBar = ({ op, compact = false }) => {
    const d = getDifficulty(op);
    return (
        <div className="flex items-center gap-1.5" data-testid={`difficulty-${op.id}`} title={`Difficulté : ${d.label}`}>
            <div className="flex gap-0.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} border-2 border-ink`} style={{ backgroundColor: n <= d.level ? d.color : '#fff' }} />
                ))}
            </div>
            <span className={`font-heading uppercase ${compact ? 'text-[9px]' : 'text-[11px]'} leading-none`}>{d.label}</span>
        </div>
    );
};
