// Reusable breaking-news ticker — used across Home / Roster / Collection / Versus / ZoneDebile
// Marquee CSS infini (38s/cycle, no JS interval needed).

const HEADLINES = [
    "📰 Une mamie a baffé un huissier ce matin",
    "🚨 Le pigeon avocat porte plainte contre la gravité",
    "💥 Camembert AOP intercepté à Roland-Garros",
    "🔥 Papa retrouvé dans le garage · état stable",
    "📡 Maman a lu ton historique · RIP",
    "🥖 Une baguette tradition prend la fuite",
    "🐑 Mouton diabolique abandonne le comptage à 1 million",
    "🤖 IA traumatisée demande l'asile politique",
    "🛒 Caissier auto-scan déclare la guerre aux articles",
    "🪴 La plante vengeresse fait grève de la photosynthèse",
];

const BreakingTicker = () => {
    return (
        <div className="relative z-10 bg-ink text-acid border-y-[3px] border-ink py-2 overflow-hidden" aria-label="Breaking news défilantes" data-testid="breaking-ticker">
            <div className="flex whitespace-nowrap" style={{ animation: 'baffe-marquee 38s linear infinite' }}>
                {[...HEADLINES, ...HEADLINES].map((h, i) => (
                    <span key={`hl-${i}`} className="font-heading text-sm sm:text-base uppercase mx-6 inline-flex items-center gap-2">
                        <span className="text-tomato">●</span> {h}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default BreakingTicker;
