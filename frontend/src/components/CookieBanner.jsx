import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RGPD cookie consent banner.
 * Shown only on first visit. Choice persisted in localStorage.
 * If user refuses, opts out PostHog tracking.
 * Hidden on /game route to avoid blocking the slap-button.
 */
const CookieBanner = () => {
    const [visible, setVisible] = useState(false);
    const location = useLocation();
    // Hide on game route — banner overlaps the slap-button & result CTAs on mobile
    const isGameplay = location.pathname === '/game';

    useEffect(() => {
        try {
            const choice = localStorage.getItem('baffe_cookie_consent');
            if (!choice) {
                // Delay to not be intrusive on first paint
                const t = setTimeout(() => setVisible(true), 1500);
                return () => clearTimeout(t);
            } else if (choice === 'refused' && typeof window !== 'undefined' && window.posthog) {
                try { window.posthog.opt_out_capturing(); } catch (e) {}
            }
        } catch (e) {}
    }, []);

    const decide = (choice) => {
        try {
            localStorage.setItem('baffe_cookie_consent', choice);
            if (typeof window !== 'undefined' && window.posthog) {
                if (choice === 'refused') {
                    try { window.posthog.opt_out_capturing(); } catch (e) {}
                } else {
                    try { window.posthog.opt_in_capturing(); } catch (e) {}
                }
            }
        } catch (e) {}
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && !isGameplay && (
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                    className="fixed bottom-0 left-0 right-0 z-[60] p-3 sm:p-4"
                    data-testid="cookie-banner"
                >
                    <div className="max-w-3xl mx-auto bg-ink text-cream border-4 border-tomato shadow-[8px_8px_0px_#FF3B30] p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-3xl sm:text-4xl shrink-0">🍪</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-heading text-sm sm:text-base uppercase tracking-tight text-acid mb-1">Cookies & vie privée</p>
                                <p className="font-body text-xs sm:text-sm leading-snug">
                                    On utilise des cookies <b>essentiels</b> (ton profil de jeu, c&apos;est obligé)
                                    et des cookies <b>analytiques</b> pour comprendre ce qui marche.
                                    Tu peux refuser, ça change rien au jeu.
                                </p>
                                <p className="font-body text-[10px] sm:text-xs opacity-70 mt-1">
                                    Voir notre <Link to="/legal" className="underline">politique de cookies</Link>.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <button
                                        onClick={() => decide('accepted')}
                                        data-testid="cookie-banner-accept"
                                        className="bg-tomato text-white border-2 border-cream font-heading uppercase text-xs sm:text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all"
                                    >
                                        ✅ Accepter
                                    </button>
                                    <button
                                        onClick={() => decide('refused')}
                                        data-testid="cookie-banner-refuse"
                                        className="bg-white text-ink border-2 border-cream font-heading uppercase text-xs sm:text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all"
                                    >
                                        🚫 Refuser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
