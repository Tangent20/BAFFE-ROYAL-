import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NOTIFS = [
    { icon: '📞', title: 'MAMIE', body: 'T\'a appelé 47 fois. 47 messages vocaux.' },
    { icon: '📨', title: 'PIGEON AVOCAT', body: 'Lecture confirmée. Pas de réponse. Note : -5 karma.' },
    { icon: '🔔', title: 'MAMAN', body: 'A vu ton historique. Tu sais ce que ça veut dire.' },
    { icon: '⚖️', title: 'TRIBUNAL DES MAMIES', body: 'Convocation reçue. Comparais avant demain.' },
    { icon: '🐑', title: 'MOUTON DIABOLIQUE', body: 'A compté jusqu\'à 999 999. Tu dors toujours pas.' },
    { icon: '🥖', title: 'BOULANGERIE', body: 'Ta baguette habituelle t\'attend. ARMÉE.' },
    { icon: '🧀', title: 'CAMEMBERT BOXEUR', body: 'A confirmé sa présence au match.' },
    { icon: '📰', title: 'JT DE 13H', body: 'On parle de toi. Pas une bonne pub.' },
    { icon: '🛸', title: 'OVNI', body: 'A scanné ton wifi. Contenu suspect détecté.' },
    { icon: '👮', title: 'BRIGADE ANTI-BAFFE', body: 'Une enquête est ouverte. Reste calme.' },
    { icon: '🏥', title: 'CHU DE LA RÉGION', body: 'Service Mamie-Réanimation : guichet 4.' },
    { icon: '🧓', title: 'BOOMER ANTI-WIFI', body: 'A coupé ta box. Pour ton bien.' },
];

const FakeNotifications = () => {
    const [active, setActive] = useState(null);

    useEffect(() => {
        const spawn = () => {
            const n = NOTIFS[Math.floor(Math.random() * NOTIFS.length)];
            setActive({ ...n, id: Date.now() });
            setTimeout(() => setActive(null), 5500);
        };
        // First notif after 25s, then every 60-120s
        const t1 = setTimeout(spawn, 25000);
        const interval = setInterval(() => {
            if (Math.random() > 0.5) spawn();
        }, 60000);
        return () => { clearTimeout(t1); clearInterval(interval); };
    }, []);

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    key={active.id}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                    className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md bg-white/95 backdrop-blur-md border-4 border-ink shadow-[6px_6px_0px_#0A0A0A] cursor-pointer"
                    onClick={() => setActive(null)}
                    role="alert"
                    data-testid="fake-notification"
                >
                    <div className="flex gap-3 p-3">
                        <div className="text-3xl shrink-0" aria-hidden="true">{active.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="font-heading text-xs uppercase tracking-widest text-tomato truncate flex-1">{active.title}</p>
                                <p className="font-body text-[8px] uppercase opacity-50 shrink-0 whitespace-nowrap">à l&apos;instant</p>
                            </div>
                            <p
                                className="font-body text-[11px] sm:text-sm font-bold mt-1 leading-tight break-words"
                                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}
                            >{active.body}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FakeNotifications;
