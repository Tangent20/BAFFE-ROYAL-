import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { OPPONENTS } from "@/lib/gameData";
import { GLOVE_SKINS } from "@/lib/skins";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { BOOSTS } from "@/lib/loot";
import { ESCALADE_TIERS } from "@/lib/escalade";
import BreakingTicker from "@/components/BreakingTicker";
import Footer from "@/components/Footer";

const QUOTES = [
    "Le jeu le plus stupide du monde — et on en est fiers.",
    "Tu charges. Tu vises. Tu baffes une mamie ninja. C'est tout le concept.",
    "Quand le ridicule devient un sport olympique.",
    "Ne baffez pas votre mamie. Baffez la nôtre.",
];

const Press = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const copyAll = () => {
        const summary = `BAFFE ROYALE — Press Kit\n\n${QUOTES[0]}\n\n• ${OPPONENTS.length} personnages absurdes\n• ${GLOVE_SKINS.length} skins/armes (baguette, chariot, mjölnir)\n• ${ACHIEVEMENTS.length} trophées\n• ${ESCALADE_TIERS.length} paliers d'escalade\n• ${BOOSTS.length} bonus loot\n• PWA gratuit, mobile-first, sans pub\n\nURL : ${baseUrl}\nContact presse : presse@baffe-royale.fr`;
        try { navigator.clipboard.writeText(summary); alert('Press kit copié dans le presse-papiers !'); }
        catch (e) { alert('Erreur copy : ' + e.message); }
    };

    return (
        <div className="bg-cream relative min-h-screen overflow-x-hidden" data-testid="press-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" aria-hidden="true" />

            <main id="main-content" tabIndex={-1}>
                <nav className="relative z-20 max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 gap-2">
                    <Link to="/" data-testid="back-btn" className="bg-white border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A]">← Menu</Link>
                    <h1 className="font-heading text-xl sm:text-3xl uppercase tracking-tight">📰 Press Kit</h1>
                    <div className="w-[68px]" />
                </nav>

                <BreakingTicker />

                <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-6">
                    <motion.div initial={{ scale: 0, rotate: -5 }} animate={{ scale: 1, rotate: -1 }} transition={{ type: 'spring' }}
                        className="text-center mb-6">
                        <span className="bg-tomato text-white border-4 border-ink font-heading uppercase text-xs sm:text-sm tracking-widest px-3 py-1 inline-block shadow-[5px_5px_0px_#0A0A0A]">
                            📰 Pour journalistes & créateurs
                        </span>
                        <h2 className="font-heading uppercase text-4xl sm:text-5xl leading-tight text-ink mt-3"
                            style={{ textShadow: '0.04em 0.04em 0 #FFFF00, 0.08em 0.08em 0 #FF3B30' }}>
                            Tout sur <span className="text-tomato">Baffe Royale</span>
                        </h2>
                    </motion.div>

                    {/* Pitch */}
                    <div className="bg-white border-4 border-ink p-4 sm:p-5 shadow-[6px_6px_0px_#0A0A0A] mb-5">
                        <p className="font-heading uppercase text-xs tracking-widest opacity-70 mb-1">Pitch 1 ligne</p>
                        <p className="font-body text-base sm:text-lg font-bold leading-snug">« {QUOTES[0]} »</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
                        <StatBox label="Personnages" value={OPPONENTS.length} bg="#FFFF00" />
                        <StatBox label="Skins/Armes" value={GLOVE_SKINS.length} bg="#00FFFF" />
                        <StatBox label="Trophées" value={ACHIEVEMENTS.length} bg="#39FF14" />
                        <StatBox label="Bonus loot" value={BOOSTS.length} bg="#FF8C00" />
                        <StatBox label="Paliers Escalade" value={ESCALADE_TIERS.length} bg="#FF3B30" white />
                        <StatBox label="Modes de jeu" value={3} bg="#9C27FF" white />
                    </div>

                    {/* Quotes */}
                    <div className="bg-acid border-4 border-ink p-4 sm:p-5 shadow-[6px_6px_0px_#0A0A0A] mb-5">
                        <p className="font-heading uppercase text-xs tracking-widest mb-3">Citations utilisables</p>
                        {QUOTES.map((q, i) => (
                            <p key={i} className="font-body text-sm sm:text-base font-bold italic leading-snug mb-2 last:mb-0">« {q} »</p>
                        ))}
                    </div>

                    {/* Key features */}
                    <div className="bg-white border-4 border-ink p-4 sm:p-5 shadow-[6px_6px_0px_#0A0A0A] mb-5">
                        <p className="font-heading uppercase text-sm sm:text-base mb-3">🎯 Points forts à mettre en avant</p>
                        <ul className="font-body text-xs sm:text-sm font-bold space-y-1.5 leading-snug">
                            <li>✅ <b>PWA gratuit</b> — sans pub, sans IAP, sans inscription</li>
                            <li>✅ <b>15 personnages absurdes</b> avec bio, taunts, stats</li>
                            <li>✅ <b>Humour 100% français</b> (Mamie Ninja, Pigeon Avocat, IA Traumatisée...)</li>
                            <li>✅ <b>Mode IDLE</b> — ton &laquo;&nbsp;Gant Auto&nbsp;&raquo; frappe pendant que tu fermes l&apos;app</li>
                            <li>✅ <b>Roue de la Fortune</b> quotidienne avec 8 lots débiles</li>
                            <li>✅ <b>5 paliers d&apos;Escalade</b> : du Mode Normal à la Guerre contre la France</li>
                            <li>✅ <b>Konami code easter egg</b> pour les vieux gamers</li>
                            <li>✅ <b>Accessibilité WCAG, RGPD complet, mentions légales</b></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="bg-ink text-acid border-4 border-ink p-4 sm:p-5 shadow-[6px_6px_0px_#FF3B30] mb-5">
                        <p className="font-heading uppercase text-xs sm:text-sm tracking-widest mb-2 text-tomato">📞 Contact presse</p>
                        <p className="font-body text-sm sm:text-base font-bold mb-1">URL officielle : <a href={baseUrl} className="underline" data-testid="press-url">{baseUrl}</a></p>
                        <p className="font-body text-sm sm:text-base font-bold mb-3">Email : <a href="mailto:presse@baffe-royale.fr" className="underline" data-testid="press-email">presse@baffe-royale.fr</a></p>
                        <button
                            onClick={copyAll}
                            data-testid="copy-press-kit-btn"
                            className="bg-tomato text-white border-4 border-acid font-heading uppercase text-sm sm:text-base px-4 py-2.5 shadow-[4px_4px_0px_#FFFF00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#FFFF00] transition-all duration-100"
                        >
                            📋 Copier le press kit complet
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/" data-testid="press-back" className="inline-block bg-acid border-4 border-ink font-heading uppercase text-sm sm:text-base px-4 py-2.5 shadow-[5px_5px_0px_#0A0A0A]">
                            ← Retour au jeu
                        </Link>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
};

const StatBox = ({ label, value, bg, white }) => (
    <div className="border-4 border-ink p-3 sm:p-4 shadow-[4px_4px_0px_#0A0A0A] text-center" style={{ backgroundColor: bg, color: white ? 'white' : '#0A0A0A' }}>
        <p className="font-heading text-3xl sm:text-4xl leading-none">{value}</p>
        <p className="font-body text-[10px] sm:text-xs uppercase font-bold tracking-widest mt-1">{label}</p>
    </div>
);

export default Press;
