import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OPPONENTS } from "@/lib/gameData";
import { sfx } from "@/lib/audio";

const RAGES = [
    { id: 'boss', icon: '👔', label: 'Mon patron', target: 'papa', line: 'Ton boss n\'est pas là. Mais PAPA, si. Il est « déçu ». Baffe-le.' },
    { id: 'meeting', icon: '📧', label: 'Réunion inutile', target: 'ia_traumatisee', line: '3h de réunion qui auraient pu être un mail. L\'IA a pris les notes. Elle paie.' },
    { id: 'lunch', icon: '🥛', label: 'On a volé mon déj', target: 'yaourt_voleur', line: 'Le coupable est identifié. Il a encore la cuillère dans la bouche.' },
    { id: 'transport', icon: '🚇', label: 'Bouchons / métro', target: 'pigeon_avocat', line: 'Le pigeon du quai t\'a regardé de haut ce matin. Il va le regretter.' },
    { id: 'pc', icon: '💻', label: 'PC / wifi planté', target: 'boomer_wifi', line: 'Ton ordi a planté avant la sauvegarde. Le Boomer anti-wifi est responsable. Évidemment.' },
    { id: 'shop', icon: '🛒', label: 'Les courses', target: 'caissier_scan', line: '« Article non reconnu dans la zone d\'ensachage. » Plus jamais.' },
    { id: 'family', icon: '🏠', label: 'La famille', target: 'maman', line: 'Elle a encore demandé quand tu te trouves un vrai métier. Vas-y.' },
    { id: 'all', icon: '🌋', label: 'TOUT. Absolument tout.', target: 'mamie_dieu', line: 'Journée apocalyptique ? Il te faut un adversaire à la hauteur de ta rage.' },
];

const isEvening = () => { const h = new Date().getHours(); return h >= 17 || h < 3; };

export const RagePicker = ({ onFight }) => {
    const [rage, setRage] = useState(null);
    const target = rage && OPPONENTS.find((o) => o.id === rage.target);
    const evening = isEvening();

    return (
        <div className="bg-tomato text-white border-4 border-ink p-3 sm:p-4 shadow-[6px_6px_0px_#0A0A0A]" data-testid="rage-picker">
            <p className="font-heading uppercase text-[10px] sm:text-xs tracking-widest text-acid" data-testid="rage-time-banner">
                {evening ? '🌙 C\'est l\'heure du défoulement. Le boulot est fini. Pas ta rage.' : '☀️ Encore au boulot ? Garde ta rage pour ce soir… ou pas.'}
            </p>
            <h3 className="font-heading uppercase text-xl sm:text-2xl leading-none mt-1">😤 Qui t&apos;a énervé aujourd&apos;hui ?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {RAGES.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => { sfx.slap(0.6); setRage(r); }}
                        data-testid={`rage-option-${r.id}`}
                        aria-pressed={rage?.id === r.id}
                        className={`border-[3px] border-ink font-heading uppercase text-[11px] sm:text-xs px-2 py-2 text-left leading-tight transition-transform duration-75 active:translate-x-[2px] active:translate-y-[2px] ${rage?.id === r.id ? 'bg-acid text-ink shadow-none -rotate-1' : 'bg-white text-ink shadow-[3px_3px_0px_#0A0A0A]'}`}
                    >
                        <span className="text-lg mr-1" aria-hidden="true">{r.icon}</span>{r.label}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                {target && (
                    <motion.div
                        key={rage.id}
                        initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 bg-ink border-[3px] border-acid p-3 flex flex-wrap sm:flex-nowrap items-center gap-3"
                        data-testid="rage-result"
                    >
                        <div className="text-4xl sm:text-5xl animate-wobble shrink-0" aria-hidden="true">{target.emoji}</div>
                        <div className="flex-1 min-w-[150px]">
                            <p className="font-heading uppercase text-[10px] tracking-widest text-acid">Victime recommandée</p>
                            <p className="font-heading uppercase text-lg leading-none" data-testid="rage-target-name">{target.name}</p>
                            <p className="font-body text-xs font-bold mt-1 opacity-90">{rage.line}</p>
                        </div>
                        <button
                            onClick={() => onFight(target.id)}
                            data-testid="rage-fight-btn"
                            className="w-full sm:w-auto shrink-0 bg-acid text-ink border-[3px] border-white font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#FF3B30] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-transform duration-75"
                        >
                            💢 Défoule-toi
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
