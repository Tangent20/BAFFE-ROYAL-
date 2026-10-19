import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { voice, sfx } from "@/lib/audio";

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const EasterEggs = () => {
    const [konamiHit, setKonamiHit] = useState(false);
    const [midnight, setMidnight] = useState(false);

    // Konami code detector
    useEffect(() => {
        let seq = [];
        const onKey = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            seq = [...seq, key].slice(-KONAMI.length);
            if (seq.join(',') === KONAMI.join(',')) {
                setKonamiHit(true);
                try { localStorage.setItem('baffe_konami', '1'); } catch (_) { /* ignore */ }
                sfx.win();
                voice.say('MODE TARPIN ACTIVÉ. ATTACHEZ VOS CEINTURES.', { rate: 0.85 });
                document.documentElement.style.filter = 'hue-rotate(280deg) saturate(1.4)';
                setTimeout(() => { document.documentElement.style.filter = ''; setKonamiHit(false); }, 8000);
                seq = [];
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Midnight detector (0h00 - 0h05)
    useEffect(() => {
        const check = () => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() < 5) {
                setMidnight(true);
                try { localStorage.setItem('baffe_midnight', '1'); } catch (_) { /* ignore */ }
                voice.say('L\'heure de Mamie a sonné. Elle est en pyjama. Et grognon.', { rate: 0.9 });
                setTimeout(() => setMidnight(false), 12000);
            }
        };
        check();
        const t = setInterval(check, 60000); // recheck every minute
        return () => clearInterval(t);
    }, []);

    return (
        <AnimatePresence>
            {konamiHit && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
                    aria-hidden="true"
                    data-testid="konami-overlay"
                >
                    <motion.p
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: [0, 1.3, 1], rotate: [-30, 5, -2] }}
                        transition={{ duration: 0.8 }}
                        className="font-heading text-white uppercase text-4xl sm:text-7xl tracking-tighter"
                        style={{ textShadow: '0.06em 0.06em 0 #FF3B30, 0.12em 0.12em 0 #FFFF00' }}
                    >
                        🎮 MODE TARPIN 🎮
                    </motion.p>
                </motion.div>
            )}
            {midnight && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-ink text-acid border-4 border-acid px-4 py-2 shadow-[6px_6px_0px_#FFFF00] pointer-events-none"
                    data-testid="midnight-overlay"
                >
                    <p className="font-heading text-sm sm:text-lg uppercase">🌙 L&apos;heure de Mamie · elle ronfle 💤</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EasterEggs;
