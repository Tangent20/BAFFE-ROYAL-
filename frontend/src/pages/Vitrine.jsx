import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { sfx, resumeAudio } from "@/lib/audio";
import { OPPONENTS } from "@/lib/gameData";
import Footer from "@/components/Footer";

const DUMB_TIPS = [
    "💡 Conseil n°47 : Une baffe c'est comme un câlin, mais plus rapide.",
    "💡 Conseil n°12 : Si tu rates, c'est de la faute du wifi.",
    "💡 Conseil n°89 : Mamie sent la peur. Elle l'a déjà sentie sur toi.",
    "💡 Conseil n°3 : Le pigeon avocat a déjà ton numéro.",
    "💡 Conseil n°666 : Le Flamby vous voit. Toujours.",
    "💡 Conseil n°21 : Hydrate-toi entre deux baffes. Ou pas.",
    "💡 Conseil n°404 : Conseil non trouvé. Baffe à l'instinct.",
];

const FAKE_NEWS = [
    "📰 EN DIRECT : Une baguette porte plainte pour préjudice croustillant",
    "📰 ALERTE : Mamie Ninja aperçue au rayon surgelé d'un Carrefour",
    "📰 BREAKING : Le pigeon avocat plaide non-coupable",
    "📰 SCANDALE : Un Flamby refuse de trembler. Il est radié.",
    "📰 INSOLITE : Un croûton possédé est exorcisé par une biscotte",
];

const Vitrine = () => {
    const navigate = useNavigate();
    const play = () => { resumeAudio(); sfx.go(); navigate('/game'); };
    const [tipIdx, setTipIdx] = useState(0);
    const [newsIdx, setNewsIdx] = useState(0);
    const [logoClicks, setLogoClicks] = useState(0);
    const [easterFlying, setEasterFlying] = useState([]);

    useEffect(() => {
        const t1 = setInterval(() => setTipIdx((i) => (i + 1) % DUMB_TIPS.length), 4000);
        const t2 = setInterval(() => setNewsIdx((i) => (i + 1) % FAKE_NEWS.length), 5000);
        return () => { clearInterval(t1); clearInterval(t2); };
    }, []);

    const handleLogoClick = () => {
        const n = logoClicks + 1;
        setLogoClicks(n);
        sfx.slap(0.6);
        // Spawn flying hands
        const id = Date.now();
        setEasterFlying((f) => [...f, { id, x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 }]);
        setTimeout(() => setEasterFlying((f) => f.filter((e) => e.id !== id)), 1200);
        if (n === 7) { sfx.win(); alert('🏆 Tu as trouvé l\'easter egg secret ! Récompense : tu peux continuer à cliquer.'); }
    };

    const SectionHeader = ({ num, title, sub }) => (
        <div className="mb-6 sm:mb-8">
            <div className="inline-block bg-ink text-acid border-[3px] border-ink font-heading uppercase text-xs sm:text-sm px-2 py-0.5 mb-2 tracking-widest">§ {num}</div>
            <h2 className="font-heading text-3xl sm:text-5xl uppercase leading-none">{title}</h2>
            {sub && <p className="font-body text-xs sm:text-sm font-bold opacity-70 uppercase tracking-widest mt-2">{sub}</p>}
        </div>
    );

    const PlayBtn = ({ size = 'lg', testId, label = '💥 JOUER MAINTENANT' }) => (
        <button onClick={play} data-testid={testId}
            className={`bg-tomato text-white border-[3px] sm:border-4 border-ink font-heading uppercase shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all duration-75 tracking-wider ${size==='lg'?'text-2xl sm:text-4xl px-6 py-4':'text-base sm:text-xl px-4 py-2'}`}>
            {label}
        </button>
    );

    return (
        <div className="bg-cream relative" style={{ minHeight: '100dvh' }}>
            <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                {/* NAV */}
                <nav className="flex justify-between items-center py-4 sticky top-0 bg-cream/95 backdrop-blur z-30 -mx-4 px-4 border-b-2 border-ink/10">
                    <button onClick={handleLogoClick} data-testid="logo-egg" className="font-heading text-xl sm:text-2xl">👋 BAFFE.ROYALE</button>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/leaderboard')} data-testid="nav-leaderboard-btn" className="bg-acid border-[3px] border-ink font-heading uppercase text-xs sm:text-sm px-3 py-1.5 shadow-[3px_3px_0px_#0A0A0A]">🏆</button>
                        <PlayBtn size="sm" testId="vitrine-play-top" label="💥 Jouer" />
                    </div>
                </nav>

                {/* Fake news ticker */}
                <div className="bg-ink text-acid border-4 border-ink py-2 px-3 overflow-hidden -mx-4 sm:mx-0 mb-4">
                    <motion.p key={newsIdx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-heading text-xs sm:text-base uppercase truncate">
                        {FAKE_NEWS[newsIdx]}
                    </motion.p>
                </div>

                {/* Easter egg flying hands */}
                {easterFlying.map((e) => (
                    <motion.div key={e.id} initial={{ scale: 0, rotate: -20, opacity: 1 }} animate={{ scale: [0, 2, 1.5], rotate: 720, opacity: 0, y: -200 }} transition={{ duration: 1.2 }}
                        className="fixed text-7xl pointer-events-none z-50" style={{ left: `${e.x}%`, top: `${e.y}%` }}>👋</motion.div>
                ))}

                {/* § 1 — HERO */}
                <section className="text-center py-10 sm:py-16">
                    <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: -2 }} transition={{ type: 'spring' }}
                        className="inline-block max-w-[95%] bg-tomato text-white border-[3px] sm:border-4 border-ink px-3 sm:px-4 py-1.5 mb-5 shadow-[5px_5px_0px_#0A0A0A]">
                        <span className="font-heading text-[11px] sm:text-xl whitespace-nowrap">🔥 LE JEU LE PLUS STUPIDE DU MONDE 🔥</span>
                    </motion.div>
                    <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="font-heading uppercase leading-[0.85] tracking-tighter break-words"
                        style={{ fontSize: 'clamp(3rem, 13vw, 8rem)', textShadow: '0.06em 0.06em 0 #FFFF00, 0.12em 0.12em 0 #00FFFF' }} data-testid="vitrine-title">
                        Baffe <span className="inline-block">Royale</span>
                    </motion.h1>
                    <p className="font-body text-base sm:text-xl font-bold mt-6 max-w-xl mx-auto px-2">
                        Tu charges. Tu vises. Tu baffes une <span className="bg-acid px-1 border-2 border-ink whitespace-nowrap inline-block">mamie ninja</span>. <span className="opacity-60">C'est tout le concept.</span>
                    </p>
                    <div className="mt-8"><PlayBtn testId="vitrine-play-hero" label="💥 BAFFE-MOI MAINTENANT" /></div>
                    <p className="font-body text-[10px] sm:text-xs font-bold uppercase mt-3 tracking-widest opacity-60">Gratuit · Aucune inscription · 30 secondes pour commencer</p>
                </section>

                {/* § 2 — LE PITCH (3 stats absurdes) */}
                <section className="py-8 grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    {[
                        { n: '8', l: 'boss délirants', bg: '#FFFF00' },
                        { n: '∞', l: 'baffes possibles', bg: '#00FFFF' },
                        { n: '0', l: 'mamie réelle blessée', bg: '#FF3B30', white: true },
                    ].map((s) => (
                        <div key={s.l} className="border-[3px] sm:border-4 border-ink p-3 shadow-[5px_5px_0px_#0A0A0A]" style={{ backgroundColor: s.bg, color: s.white ? 'white' : '#0A0A0A' }}>
                            <div className="font-heading text-4xl sm:text-6xl leading-none">{s.n}</div>
                            <div className="font-body text-[10px] sm:text-xs uppercase font-bold mt-1">{s.l}</div>
                        </div>
                    ))}
                </section>

                {/* § 3 — LE ROSTER */}
                <section className="py-10">
                    <SectionHeader num="01" title="Le Roster" sub="Tes futurs adversaires (et bourreaux)" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {OPPONENTS.map((op, i) => (
                            <motion.div key={op.id} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                                className="border-[3px] sm:border-4 border-ink p-3 shadow-[5px_5px_0px_#0A0A0A] text-center" style={{ backgroundColor: op.bg }}>
                                <div className="text-5xl sm:text-6xl animate-wobble" style={{ animationDelay: `${i*0.3}s` }}>{op.emoji}</div>
                                <h3 className="font-heading text-sm sm:text-lg uppercase mt-1 leading-none">{op.name}</h3>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* § 4 — COMMENT ÇA MARCHE */}
                <section className="py-10">
                    <SectionHeader num="02" title="Comment ça marche" sub="3 étapes. C'est tout. Vraiment." />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { e: '👇', t: 'TU MAINTIENS', d: 'La barre se charge. Ton stress aussi.', bg: '#FFFF00' },
                            { e: '🎯', t: 'TU VISES VERT', d: 'Petite zone verte. Tu la rates. Souvent.', bg: '#39FF14' },
                            { e: '💥', t: 'TU EXPLOSES', d: 'Mamie s\'envole. Tu te sens vivant.', bg: '#FF3B30', white: true },
                        ].map((s, i) => (
                            <div key={s.t} className="border-[3px] sm:border-4 border-ink p-4 shadow-[6px_6px_0px_#0A0A0A]" style={{ backgroundColor: s.bg, color: s.white?'white':'#0A0A0A' }}>
                                <div className="text-5xl mb-2">{s.e}</div>
                                <h3 className="font-heading text-xl sm:text-2xl uppercase">{s.t}</h3>
                                <p className="font-body text-xs sm:text-sm font-bold mt-1">{s.d}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* § 5 — TÉMOIGNAGES & PRESSE (fusionnés) */}
                <section className="py-10">
                    <SectionHeader num="03" title="Ils ont essayé" sub="(Et leur vie n'est plus la même)" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { e: '🧔', who: 'Kévin, 28 ans', q: 'Mamie m\'a humilié. J\'ai pleuré. J\'y retourne.', bg: '#FFFF00' },
                            { e: '👵', who: 'Jacqueline, 67 ans', q: 'Je domine le classement. Mes petits-enfants me craignent.', bg: '#00FFFF' },
                            { e: '📰', who: 'Le Journal des Mamies', q: 'Meilleur jeu de baffes 2026. ⭐⭐⭐⭐⭐', bg: '#39FF14' },
                            { e: '🥖', who: 'Anonyme, une baguette', q: 'Je suis là. Je ne sais pas pourquoi. Mais je baffe.', bg: '#FF8C00' },
                        ].map((t, i) => (
                            <div key={t.who} className="border-[3px] sm:border-4 border-ink p-4 shadow-[5px_5px_0px_#0A0A0A] flex gap-3" style={{ backgroundColor: t.bg, transform: `rotate(${i%2?'0.5deg':'-0.5deg'})` }}>
                                <div className="text-4xl shrink-0">{t.e}</div>
                                <div>
                                    <p className="font-body text-xs sm:text-sm font-bold italic">"{t.q}"</p>
                                    <p className="font-heading text-sm uppercase mt-1 text-tomato">— {t.who}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* § 6 — CLASSEMENT + PARTAGE */}
                <section className="py-10">
                    <SectionHeader num="04" title="Rejoins l'arène" sub="Classement mondial + partage tes exploits" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={() => navigate('/leaderboard')} data-testid="vitrine-leaderboard-btn"
                            className="bg-acid border-[3px] sm:border-4 border-ink p-5 shadow-[6px_6px_0px_#0A0A0A] text-left active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#0A0A0A] transition-all">
                            <div className="text-5xl mb-2">🏆</div>
                            <h3 className="font-heading text-2xl uppercase">Classement mondial</h3>
                            <p className="font-body text-xs sm:text-sm font-bold mt-1">Les plus grands gifleurs. Détrône-les.</p>
                        </button>
                        <div className="bg-ink text-cream border-[3px] sm:border-4 border-ink p-5 shadow-[6px_6px_0px_#FF3B30]">
                            <div className="text-5xl mb-2">📣</div>
                            <h3 className="font-heading text-2xl uppercase text-acid">Partage ta baffe</h3>
                            <div className="flex gap-2 flex-wrap mt-3">
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Je viens de baffer une mamie ninja 👋💥')}&url=${encodeURIComponent(window.location.origin)}`} target="_blank" rel="noopener noreferrer" data-testid="share-twitter" className="bg-cyan text-ink border-2 border-cream px-3 py-1 font-heading text-sm uppercase">𝕏</a>
                                <a href={`https://wa.me/?text=${encodeURIComponent('Joue à Baffe Royale 👋 ' + window.location.origin)}`} target="_blank" rel="noopener noreferrer" data-testid="share-whatsapp" className="bg-lime text-ink border-2 border-cream px-3 py-1 font-heading text-sm uppercase">WhatsApp</a>
                                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" data-testid="share-discord" className="bg-tomato text-cream border-2 border-cream px-3 py-1 font-heading text-sm uppercase">Discord</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* § 7 — CRÉATEUR + FAQ (côte-à-côte) */}
                <section className="py-10">
                    <SectionHeader num="05" title="Les coulisses" sub="Et autres questions inutiles" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white border-[3px] sm:border-4 border-ink p-5 shadow-[6px_6px_0px_#0A0A0A]">
                            <div className="flex items-start gap-3">
                                <div className="text-6xl">🧑‍🍳</div>
                                <div className="font-body text-xs sm:text-sm font-bold space-y-1.5">
                                    <p className="font-heading text-lg uppercase">Charly Soudan, 24 ans</p>
                                    <p>Créateur et développeur de Baffe Royale.</p>
                                    <p className="italic opacity-70">"J'ai voulu créer le jeu le plus stupide du monde. Mission accomplie."</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {[
                                { q: 'C\'est gratuit ?', a: 'Oui. Comme une baffe.' },
                                { q: 'Faut-il s\'inscrire ?', a: 'Non. Un pseudo suffit pour le classement.' },
                                { q: 'Ça marche sur mobile ?', a: 'iPhone, Android, tablette, ordi. Pas testé sur grille-pain.' },
                                { q: 'Pourquoi un pigeon avocat ?', a: 'Pourquoi pas.' },
                            ].map((f) => (
                                <details key={f.q} className="bg-white border-[3px] border-ink shadow-[3px_3px_0px_#0A0A0A] group">
                                    <summary className="cursor-pointer p-3 font-heading text-sm sm:text-base uppercase flex justify-between items-center">
                                        <span>{f.q}</span><span className="text-tomato group-open:rotate-45 transition-transform">+</span>
                                    </summary>
                                    <p className="px-3 pb-3 font-body text-xs sm:text-sm font-bold border-t border-ink pt-2">{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* § 8 — CTA FINAL */}
                <section className="py-12 text-center">
                    <motion.div initial={{ scale: 0, rotate: -5 }} whileInView={{ scale: 1, rotate: -2 }} viewport={{ once: true }}
                        className="inline-block bg-acid border-[3px] sm:border-4 border-ink px-4 py-2 mb-4 shadow-[5px_5px_0px_#0A0A0A]">
                        <span className="font-heading text-lg sm:text-2xl">PRÊT À DEVENIR STUPIDE ?</span>
                    </motion.div>
                    <div><PlayBtn testId="vitrine-play-final" label="👋 LANCE LE JEU" /></div>
                </section>

                <footer className="text-center py-4 border-t-4 border-ink">
                    <p className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        © 2026 Charly Soudan · <a href="/legal" data-testid="legal-link" className="underline">Mentions légales</a>
                    </p>
                </footer>
            </div>
            <Footer />
        </div>
    );
};

export default Vitrine;
