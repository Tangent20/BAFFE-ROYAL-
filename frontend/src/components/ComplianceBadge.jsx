import { Link } from "react-router-dom";

/**
 * Compliance badge — public-facing summary of all legal & accessibility
 * standards respected by the site. Shown in footer & legal page.
 */
const ComplianceBadge = ({ compact = false }) => {
    const items = [
        { id: 'lcen', icon: '⚖️', label: 'LCEN 2004', desc: 'Mentions légales conformes' },
        { id: 'rgpd', icon: '🔐', label: 'RGPD', desc: 'Données personnelles protégées' },
        { id: 'cnil', icon: '🍪', label: 'CNIL / ePrivacy', desc: 'Consentement cookies' },
        { id: 'a11y', icon: '♿', label: 'WCAG 2.1 AA', desc: 'Accessible aux handicapés' },
        { id: 'rgaa', icon: '🇫🇷', label: 'Loi 2005-102', desc: 'Accessibilité numérique' },
        { id: 'conso', icon: '📋', label: 'Code conso.', desc: 'CGU + droit français' },
    ];

    if (compact) {
        return (
            <div className="flex flex-wrap gap-1.5 justify-center" data-testid="compliance-badge-compact">
                {items.map((it) => (
                    <span
                        key={it.id}
                        title={`${it.label} — ${it.desc}`}
                        className="inline-flex items-center gap-1 bg-white border-2 border-current/40 px-2 py-0.5 text-[10px] font-heading uppercase tracking-wider"
                    >
                        <span aria-hidden="true">{it.icon}</span> {it.label}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <section
            className="bg-cream border-4 border-ink p-4 sm:p-5 shadow-[6px_6px_0px_#0A0A0A]"
            aria-labelledby="compliance-title"
            data-testid="compliance-panel"
        >
            <div className="flex items-center justify-between mb-3">
                <h3 id="compliance-title" className="font-heading text-base sm:text-xl uppercase">
                    🛡️ Conformités respectées
                </h3>
                <Link
                    to="/legal"
                    className="font-heading text-[10px] sm:text-xs uppercase tracking-widest bg-tomato text-white border-2 border-ink px-2 py-1 shadow-[3px_3px_0px_#0A0A0A] underline-offset-2"
                >
                    Détails →
                </Link>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="list">
                {items.map((it) => (
                    <li
                        key={it.id}
                        className="bg-white border-2 border-ink p-2 sm:p-2.5 shadow-[3px_3px_0px_#0A0A0A] flex items-start gap-2"
                    >
                        <span className="text-xl sm:text-2xl shrink-0" aria-hidden="true">{it.icon}</span>
                        <div className="min-w-0">
                            <p className="font-heading text-[11px] sm:text-xs uppercase leading-none">{it.label}</p>
                            <p className="font-body text-[10px] sm:text-[11px] font-bold opacity-70 mt-0.5 leading-tight">{it.desc}</p>
                        </div>
                    </li>
                ))}
            </ul>
            <p className="font-body text-[10px] sm:text-xs opacity-60 mt-3 italic">
                Site conforme aux principales lois françaises & européennes (LCEN, RGPD, CNIL, RGAA, WCAG, Code de la consommation).
            </p>
        </section>
    );
};

export default ComplianceBadge;
