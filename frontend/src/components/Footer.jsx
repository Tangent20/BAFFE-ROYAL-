import { Link } from "react-router-dom";
import ComplianceBadge from "@/components/ComplianceBadge";

/**
 * Legal-compliant footer (LCEN + RGPD).
 * Used on Home, Vitrine, Leaderboard, Versus pages.
 */
const Footer = ({ tone = 'light' }) => {
    const isDark = tone === 'dark';
    return (
        <footer
            className={`relative z-10 border-t-4 border-ink mt-6 ${isDark ? 'bg-ink text-cream' : 'bg-white text-ink'}`}
            data-testid="site-footer"
            role="contentinfo"
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                {/* Compliance pancarte */}
                <div className="mb-5">
                    <ComplianceBadge />
                </div>

                {/* Top row : branding + tagline */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b-2 border-current/30 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-2xl border-[3px] border-current shadow-[3px_3px_0px_currentColor] ${isDark ? 'bg-tomato' : 'bg-tomato text-white'}`}>👋</div>
                        <div>
                            <p className="font-heading text-lg sm:text-xl tracking-tight leading-none">BAFFE.ROYALE</p>
                            <p className="font-body text-[10px] sm:text-xs uppercase tracking-widest opacity-70 mt-0.5">
                                Le jeu le plus stupide du monde
                            </p>
                        </div>
                    </div>
                    <p className="font-body text-[10px] sm:text-xs italic opacity-70 sm:text-right max-w-xs">
                        Aucune mamie n&apos;a été blessée. La rigolade est réelle.
                    </p>
                </div>

                {/* Middle: legal grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4">
                    {/* Éditeur */}
                    <div>
                        <p className="font-heading text-xs uppercase tracking-widest mb-1.5 opacity-90">Éditeur</p>
                        <ul className="font-body text-[11px] sm:text-xs space-y-0.5 opacity-80">
                            <li><b>Charly Soudan</b></li>
                            <li>Auto-entrepreneur (en cours)</li>
                            <li>93290 Tremblay-en-France</li>
                            <li className="italic opacity-70">Contact : email en cours de création</li>
                            <li>
                                <Link to="/legal" className="underline hover:no-underline">Coordonnées complètes →</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Hébergement */}
                    <div>
                        <p className="font-heading text-xs uppercase tracking-widest mb-1.5 opacity-90">Hébergement</p>
                        <ul className="font-body text-[11px] sm:text-xs space-y-0.5 opacity-80">
                            <li>Emergent Labs</li>
                            <li>Kubernetes Cloud</li>
                            <li>
                                <a href="https://emergent.sh" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">emergent.sh</a>
                            </li>
                        </ul>
                    </div>

                    {/* Liens légaux */}
                    <div>
                        <p className="font-heading text-xs uppercase tracking-widest mb-1.5 opacity-90">Informations légales</p>
                        <ul className="font-body text-[11px] sm:text-xs space-y-1 opacity-80">
                            <li>
                                <Link to="/legal" data-testid="footer-mentions-link" className="underline hover:no-underline">📜 Mentions légales</Link>
                            </li>
                            <li>
                                <Link to="/legal" data-testid="footer-rgpd-link" className="underline hover:no-underline">🔐 Confidentialité (RGPD)</Link>
                            </li>
                            <li>
                                <Link to="/legal" data-testid="footer-cookies-link" className="underline hover:no-underline">🍪 Politique cookies</Link>
                            </li>
                            <li>
                                <Link to="/legal" data-testid="footer-cgu-link" className="underline hover:no-underline">📋 CGU</Link>
                            </li>
                            <li>
                                <Link to="/press" data-testid="footer-press-link" className="underline hover:no-underline">📰 Press kit</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom row : copyright */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between border-t-2 border-current/30 pt-4">
                    <p className="font-body text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-80">
                        © 2026 Charly Soudan · Tous droits réservés
                    </p>
                    <p className="font-body text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-60">
                        Fait avec 💥 et bêtise · Aucun cerveau utilisé
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
