import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * QR code share — desktop-only widget. Lets a desktop user
 * share a quick QR code with someone who has a phone, converting
 * desktop visits into mobile play sessions (more retention).
 * Uses a public QR API (no library install required).
 */
const QrShareWidget = () => {
    const [open, setOpen] = useState(false);
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://baffe-royale.fr';
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(url)}`;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                data-testid="qr-share-trigger"
                aria-label="Partager via QR code"
                className="hidden md:inline-flex items-center gap-2 bg-cyan border-[3px] border-ink font-heading uppercase text-xs sm:text-sm px-3 py-1.5 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-100"
            >
                📲 Partage QR
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setOpen(false)}
                        data-testid="qr-share-modal"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -5 }}
                            animate={{ scale: 1, rotate: -1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                            className="bg-acid border-4 border-ink shadow-[10px_10px_0px_#FF3B30] max-w-sm w-full p-5 sm:p-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="font-heading uppercase text-tomato text-xs tracking-widest mb-1">Scanne avec ton téléphone</p>
                            <h3 className="font-heading uppercase text-2xl sm:text-3xl leading-tight text-ink mb-4">📲 Joue sur mobile</h3>
                            <div className="bg-white border-4 border-ink p-3 shadow-[5px_5px_0px_#0A0A0A] mb-4 inline-block">
                                <img
                                    src={qrSrc}
                                    alt="QR code Baffe Royale"
                                    width="240"
                                    height="240"
                                    className="block"
                                    loading="lazy"
                                />
                            </div>
                            <p className="font-body text-xs sm:text-sm font-bold opacity-80 mb-3 break-all">{url}</p>
                            <button
                                onClick={() => setOpen(false)}
                                data-testid="qr-share-close"
                                className="w-full bg-tomato text-white border-4 border-ink font-heading uppercase text-base sm:text-lg py-2.5 shadow-[5px_5px_0px_#0A0A0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100"
                            >
                                ✅ Fermer
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default QrShareWidget;
