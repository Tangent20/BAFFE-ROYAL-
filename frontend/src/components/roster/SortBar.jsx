import { SORT_MODES } from "@/lib/kills";
import { sfx } from "@/lib/audio";

export const SortBar = ({ mode, onChange, prefix = 'roster' }) => (
    <div className="relative">
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 pr-8 snap-x" role="tablist" aria-label="Trier les combattants" data-testid={`${prefix}-sort-bar`}>
        {SORT_MODES.map((m) => {
            const active = m.id === mode;
            return (
                <button
                    key={m.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => { sfx.click(); onChange(m.id); }}
                    data-testid={`${prefix}-sort-${m.id}`}
                    className={`snap-start shrink-0 border-[3px] border-ink font-heading uppercase text-xs sm:text-sm px-3 py-1.5 transition-transform duration-75 active:translate-x-[2px] active:translate-y-[2px] ${active ? 'bg-ink text-acid shadow-[3px_3px_0px_#FF3B30] -rotate-1' : 'bg-white text-ink shadow-[3px_3px_0px_#0A0A0A]'}`}
                >
                    <span aria-hidden="true">{m.icon}</span> {m.label}
                </button>
            );
        })}
    </div>
    <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 flex items-center justify-end bg-gradient-to-l from-cream to-transparent font-heading text-lg sm:hidden" aria-hidden="true">→</div>
    </div>
);
