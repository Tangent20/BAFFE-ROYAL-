import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { OPPONENTS } from "@/lib/gameData";
import { sfx, resumeAudio, voice, vibrate } from "@/lib/audio";
import BreakingTicker from "@/components/BreakingTicker";
import { loadKills, sortOpponents } from "@/lib/kills";
import { SortBar } from "@/components/roster/SortBar";
import { DifficultyBar } from "@/components/roster/DifficultyBar";

// ===== Versus stupid commentary pool =====
const COMMENTARY = {
    start: [
        "Mesdames et messieurs, c'est l'heure du choc !",
        "Bienvenue dans l'arène la plus stupide du monde !",
        "On va avoir du sport ce soir mes amis.",
        "Préparez-vous à voir des choses inavouables.",
    ],
    hit: [
        "OH LA BAFFE !",
        "ÇA C'EST DE LA GIFLE !",
        "Mais c'est pas humain ça !",
        "Le poignet a craqué !",
        "TARTINE EN PLEINE GUEULE !",
        "Y'a de la frappe ! Y'a de la frappe !",
        "Le karma vient d'envoyer une recommandée.",
        "Mon Dieu, ses cousins ont senti.",
    ],
    perfect: [
        "PERFECT ! LA LOI DU PLUS FORT !",
        "Précision chirurgicale !",
        "Le coup parfait ! Du jamais vu !",
        "INCROYABLE ! Notez ça dans le livre !",
    ],
    dodge: [
        "Esquive de ouf !",
        "Pfiouuu il l'a senti passer",
        "Matrix style ! Bravo !",
        "Il a évité comme un pro",
        "L'autre frappe dans le vent, classique.",
    ],
    crit: [
        "🚨 COUP CRITIQUE 🚨",
        "Triple combo facial !",
        "Là c'est juste illégal.",
        "Saignement de nez confirmé.",
    ],
    ko: [
        "K.O. ! K.O. ! K.O. !",
        "FATALITÉ ! C'EST FINI !",
        "Au tapis ! L'arbitre compte !",
        "Game over ! Bonne soirée !",
        "Y'a plus personne ! Y'a plus personne !",
    ],
};

const RANDOM_FIGHTER_PAIRS = [
    'mamie_ninja|papa', 'maman|papa', 'mamie_ninja|maman',
    'pigeon_avocat|crouton_possede', 'patate_musclee|camembert_boxeur',
    'baguette_sensei|mouton_diabolique', 'flamby_ultime|maman',
];

const pickRandomLine = (pool) => pool[Math.floor(Math.random() * pool.length)];

const FighterCard = ({ fighter, onPick, side, locked, selected }) => (
    <div className={`relative border-4 border-ink shadow-[6px_6px_0px_#0A0A0A] bg-white ${selected ? 'ring-4 ring-tomato' : ''}`}>
        <div className="border-b-4 border-ink p-3 sm:p-4 text-center" style={{ backgroundColor: fighter.bg }}>
            <div className="text-6xl sm:text-7xl mb-1 animate-wobble">{fighter.emoji}</div>
        </div>
        <div className="p-2 sm:p-3 text-center">
            <h3 className="font-heading text-base sm:text-xl uppercase leading-none">{fighter.name}</h3>
            <p className="font-body text-[10px] sm:text-xs font-bold mt-1 opacity-70">
                ❤️ {fighter.hp}{fighter.shieldHp ? <> · 🛡️ {fighter.shieldHp}</> : null} · ESQ {Math.round(fighter.dodgeChance * 100)}%
            </p>
            {!locked && (
                <button
                    onClick={() => onPick(side)}
                    data-testid={`pick-${side}-btn`}
                    className="w-full mt-2 bg-tomato text-white border-2 border-ink font-heading uppercase text-xs sm:text-sm py-1.5 shadow-[3px_3px_0px_#0A0A0A] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-75"
                >
                    Changer
                </button>
            )}
        </div>
    </div>
);

const Versus = () => {
    const navigate = useNavigate();
    const [leftId, setLeftId] = useState(OPPONENTS[0].id);
    const [rightId, setRightId] = useState(OPPONENTS[OPPONENTS.length - 1].id);
    const [pickerOpen, setPickerOpen] = useState(null); // 'left' | 'right' | null
    const [phase, setPhase] = useState('select'); // select | fighting | result
    const [leftHp, setLeftHp] = useState(0);
    const [rightHp, setRightHp] = useState(0);
    const [log, setLog] = useState([]);
    const [winner, setWinner] = useState(null);
    const [hitFx, setHitFx] = useState({ side: null, intensity: 0 });
    const tickRef = useRef(null);
    const [pickerSort, setPickerSort] = useState('order');
    const [versusWins, setVersusWins] = useState({});
    const pickerList = sortOpponents(pickerSort, loadKills().counts);

    const left = OPPONENTS.find((o) => o.id === leftId);
    const right = OPPONENTS.find((o) => o.id === rightId);

    const pushLog = useCallback((text, color = '#0A0A0A') => {
        setLog((l) => {
            const next = [{ id: Date.now() + Math.random(), text, color }, ...l];
            return next.slice(0, 6);
        });
    }, []);

    const randomPair = () => {
        const pair = RANDOM_FIGHTER_PAIRS[Math.floor(Math.random() * RANDOM_FIGHTER_PAIRS.length)].split('|');
        setLeftId(pair[0]);
        setRightId(pair[1]);
        sfx.click();
    };

    const startFight = useCallback(() => {
        if (leftId === rightId) return;
        resumeAudio();
        sfx.go();
        voice.say("FIGHT !", { rate: 0.8, pitch: 0.2 });
        setLeftHp(left.hp + (left.shieldHp || 0));
        setRightHp(right.hp + (right.shieldHp || 0));
        setLog([]);
        setWinner(null);
        setPhase('fighting');
        pushLog(`🎤 ${pickRandomLine(COMMENTARY.start)}`, '#FF3B30');
    }, [leftId, rightId, left, right, pushLog]);

    // Fight loop
    useEffect(() => {
        if (phase !== 'fighting') return;
        let attackerSide = Math.random() < 0.5 ? 'left' : 'right';

        const step = () => {
            const attacker = attackerSide === 'left' ? left : right;
            const defender = attackerSide === 'left' ? right : left;

            const dodged = Math.random() < defender.dodgeChance;
            const isPerfect = !dodged && Math.random() < 0.18;
            const isCrit = !dodged && !isPerfect && Math.random() < 0.12;
            let dmg = 0;
            let color = '#0A0A0A';
            let line = '';

            if (dodged) {
                line = `${defender.emoji} ${defender.name} ESQUIVE — ${pickRandomLine(COMMENTARY.dodge)}`;
                color = '#00FFFF';
                sfx.miss();
            } else {
                dmg = 10 + Math.floor(Math.random() * 25);
                if (isPerfect) {
                    dmg = Math.round(dmg * 2.5);
                    line = `${attacker.emoji} ${pickRandomLine(COMMENTARY.perfect)} −${dmg}❤️`;
                    color = '#39FF14';
                    sfx.perfect(1.4);
                    vibrate([20, 10, 50]);
                    setHitFx({ side: attackerSide === 'left' ? 'right' : 'left', intensity: 3 });
                } else if (isCrit) {
                    dmg = Math.round(dmg * 1.7);
                    line = `${attacker.emoji} ${pickRandomLine(COMMENTARY.crit)} −${dmg}❤️`;
                    color = '#FF3B30';
                    sfx.slap(1.2);
                    setHitFx({ side: attackerSide === 'left' ? 'right' : 'left', intensity: 2 });
                } else {
                    line = `${attacker.emoji} ${pickRandomLine(COMMENTARY.hit)} −${dmg}❤️`;
                    color = '#FFFF00';
                    sfx.slap(0.8);
                    setHitFx({ side: attackerSide === 'left' ? 'right' : 'left', intensity: 1 });
                }
                setTimeout(() => setHitFx({ side: null, intensity: 0 }), 300);
                if (attackerSide === 'left') {
                    setRightHp((hp) => Math.max(0, hp - dmg));
                } else {
                    setLeftHp((hp) => Math.max(0, hp - dmg));
                }
            }
            pushLog(line, color);
            attackerSide = attackerSide === 'left' ? 'right' : 'left';
        };

        // First strike after 600ms, then every 900-1200ms
        const id = setTimeout(function loop() {
            step();
            tickRef.current = setTimeout(loop, 900 + Math.random() * 300);
        }, 600);
        tickRef.current = id;

        return () => { if (tickRef.current) clearTimeout(tickRef.current); };
    }, [phase, left, right, pushLog]);

    // Check for KO
    useEffect(() => {
        if (phase !== 'fighting') return;
        if (leftHp === 0 || rightHp === 0) {
            if (tickRef.current) clearTimeout(tickRef.current);
            const win = leftHp === 0 ? right : left;
            const lose = leftHp === 0 ? left : right;
            setWinner({ winner: win, loser: lose });
            sfx.ko();
            voice.say(`${win.name} GAGNE !`, { rate: 0.8, pitch: 0.25 });
            pushLog(`🏆 ${win.emoji} ${win.name} GAGNE ! ${pickRandomLine(COMMENTARY.ko)}`, '#FF3B30');
            // Persist count
            try {
                const key = 'baffe_versus_wins';
                const prev = JSON.parse(localStorage.getItem(key) || '{}');
                prev[win.id] = (prev[win.id] || 0) + 1;
                localStorage.setItem(key, JSON.stringify(prev));
            } catch (e) {}
            setTimeout(() => setPhase('result'), 1800);
        }
    }, [leftHp, rightHp, phase, left, right, pushLog]);

    const reset = () => {
        setPhase('select');
        setLeftHp(0);
        setRightHp(0);
        setLog([]);
        setWinner(null);
        sfx.click();
    };

    const rematch = () => {
        setLeftHp(0);
        setRightHp(0);
        setLog([]);
        setWinner(null);
        setTimeout(() => startFight(), 200);
    };

    const handlePick = (side) => {
        try { setVersusWins(JSON.parse(localStorage.getItem('baffe_versus_wins') || '{}')); } catch (e) { setVersusWins({}); }
        setPickerOpen(side);
    };
    const handleSelectFighter = (id) => {
        if (pickerOpen === 'left') setLeftId(id);
        else if (pickerOpen === 'right') setRightId(id);
        setPickerOpen(null);
        sfx.combo(2);
    };

    return (
        <div className="bg-cream relative min-h-screen overflow-x-hidden no-select" data-testid="versus-page">
            <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />

            {/* Header */}
            <nav className="relative z-20 max-w-5xl mx-auto flex justify-between items-center px-4 sm:px-6 pt-4 pb-3 gap-2">
                <button
                    onClick={() => navigate('/app')}
                    data-testid="versus-home-btn"
                    className="bg-white border-[3px] border-ink font-heading uppercase text-sm px-3 py-2 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-100"
                >
                    ← Menu
                </button>
                <h1 className="font-heading text-xl sm:text-3xl uppercase tracking-tight">
                    🥊 VERSUS 🥊
                </h1>
                <div className="w-[70px] sm:w-[80px]" />
            </nav>

            <BreakingTicker />

            {/* ============== SELECTION SCREEN ============== */}
            {phase === 'select' && (
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10" data-testid="versus-select">
                    <div className="text-center mb-6">
                        <h2 className="font-heading uppercase text-3xl sm:text-5xl leading-[0.9] text-ink" style={{ textShadow: '0.04em 0.04em 0 #FFFF00, 0.08em 0.08em 0 #FF3B30' }}>
                            Choisis tes <span className="text-tomato inline-block">deux abrutis</span>
                        </h2>
                        <p className="font-body text-xs sm:text-sm font-bold opacity-70 mt-3">
                            Ils se baffent tout seuls. Toi tu regardes. Tu manges du pop-corn.
                        </p>
                    </div>

                    {/* Picker for current side */}
                    {pickerOpen && (
                        <div className="fixed inset-0 z-40 bg-ink/80 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setPickerOpen(null)} data-testid="fighter-picker">
                            <div className="bg-cream border-4 border-ink shadow-[10px_10px_0px_#FF3B30] p-4 sm:p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-heading text-xl sm:text-2xl uppercase">Choisis ton coin {pickerOpen === 'left' ? '🔴' : '🔵'}</h3>
                                    <button onClick={() => setPickerOpen(null)} className="bg-tomato text-white border-2 border-ink font-heading text-lg w-9 h-9 shadow-[3px_3px_0px_#0A0A0A]">✕</button>
                                </div>
                                <SortBar mode={pickerSort} onChange={setPickerSort} prefix="versus" />
                                {pickerList.length === 0 && (
                                    <p className="font-heading uppercase text-sm text-center py-6" data-testid="versus-picker-empty">Tu as déjà baffé tout le monde. Bravo le psychopathe.</p>
                                )}
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[55vh] overflow-y-auto mt-2 p-1">
                                    {pickerList.map((op) => (
                                        <button
                                            key={op.id}
                                            onClick={() => handleSelectFighter(op.id)}
                                            disabled={op.id === (pickerOpen === 'left' ? rightId : leftId)}
                                            data-testid={`fighter-option-${op.id}`}
                                            className="bg-white border-[3px] border-ink p-2 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex flex-col items-center gap-1"
                                        >
                                            <div className="text-4xl text-center">{op.emoji}</div>
                                            <div className="font-heading text-[10px] sm:text-xs uppercase text-center leading-none">{op.name}</div>
                                            <DifficultyBar op={op} compact />
                                            <div className="font-body text-[9px] font-bold opacity-80 leading-tight">❤️{op.hp + (op.shieldHp || 0)} · 🎯{Math.round(op.dodgeChance * 100)}%</div>
                                            <div className="font-body text-[9px] font-bold leading-tight" data-testid={`fighter-option-stats-${op.id}`}>🏆 {versusWins[op.id] || 0} vict. · 👋 {op.kills}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Both fighters side by side */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center">
                        <FighterCard fighter={left} onPick={handlePick} side="left" />
                        <FighterCard fighter={right} onPick={handlePick} side="right" />
                    </div>

                    {/* VS in middle, then FIGHT btn */}
                    <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            <motion.div
                                animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="bg-tomato text-white border-4 border-ink shadow-[6px_6px_0px_#0A0A0A] font-heading uppercase text-2xl sm:text-4xl px-3 sm:px-5 py-1 sm:py-2"
                            >
                                VS
                            </motion.div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            onClick={randomPair}
                            data-testid="versus-random-btn"
                            className="bg-acid border-4 border-ink font-heading uppercase text-base sm:text-xl py-3 shadow-[5px_5px_0px_#0A0A0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-75"
                        >
                            🎲 Tirage random
                        </button>
                        <motion.button
                            animate={{ rotate: [-1, 1, -1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            onClick={startFight}
                            disabled={leftId === rightId}
                            data-testid="versus-fight-btn"
                            className="sm:col-span-2 bg-tomato text-white border-4 border-ink font-heading uppercase text-2xl sm:text-3xl py-4 shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] disabled:bg-muted disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[8px_8px_0px_#0A0A0A] transition-all duration-75 tracking-wider"
                        >
                            🥊 FIGHT !
                        </motion.button>
                    </div>

                    {/* Funny matchups suggestions */}
                    <div className="mt-6 sm:mt-8 bg-white border-4 border-ink p-3 sm:p-4 shadow-[5px_5px_0px_#0A0A0A]">
                        <div className="font-heading text-xs uppercase tracking-widest text-tomato mb-2">🎬 Matchs cultes à essayer</div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['mamie_ninja', 'papa', '👵 vs 👨'],
                                ['maman', 'papa', '👩 vs 👨'],
                                ['flamby_ultime', 'maman', '🍮 vs 👩'],
                                ['pigeon_avocat', 'crouton_possede', '🕊️ vs 🍞'],
                            ].map(([a, b, lbl]) => (
                                <button
                                    key={lbl}
                                    onClick={() => { setLeftId(a); setRightId(b); sfx.click(); }}
                                    data-testid={`preset-${a}-${b}`}
                                    className="bg-cyan border-2 border-ink font-heading uppercase text-xs sm:text-sm px-2 py-1 shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-75"
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============== FIGHTING SCREEN ============== */}
            {(phase === 'fighting' || phase === 'result') && (
                <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8" data-testid="versus-fight">
                    {/* HP bars */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4">
                        <FightHPBar fighter={left} hp={leftHp} side="left" hit={hitFx.side === 'left' ? hitFx.intensity : 0} />
                        <FightHPBar fighter={right} hp={rightHp} side="right" hit={hitFx.side === 'right' ? hitFx.intensity : 0} />
                    </div>

                    {/* Arena */}
                    <div className="bg-white border-4 border-ink shadow-[8px_8px_0px_#0A0A0A] p-4 sm:p-6 relative overflow-hidden" style={{ minHeight: '40vh' }}>
                        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
                        <div className="grid grid-cols-2 gap-4 items-center relative z-10">
                            <FighterAnim fighter={left} hit={hitFx.side === 'left'} side="left" />
                            <FighterAnim fighter={right} hit={hitFx.side === 'right'} side="right" />
                        </div>

                        {/* Live commentary log */}
                        <div className="mt-4 sm:mt-6 bg-ink p-2 sm:p-3 border-2 border-tomato" data-testid="commentary-log">
                            <div className="font-heading text-xs uppercase tracking-widest text-acid mb-1">📺 COMMENTAIRE EN DIRECT</div>
                            <div className="space-y-1 min-h-[100px]">
                                <AnimatePresence mode="popLayout">
                                    {log.map((l, i) => (
                                        <motion.div
                                            key={l.id}
                                            initial={{ x: 50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 - i * 0.18 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="font-body text-xs sm:text-sm font-bold leading-tight"
                                            style={{ color: l.color }}
                                        >
                                            {l.text}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Winner overlay */}
                    <AnimatePresence>
                        {phase === 'result' && winner && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-ink/85 flex items-center justify-center p-4 overflow-y-auto"
                                data-testid="versus-result"
                                onClick={reset}
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: -2 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="bg-cream border-4 border-ink p-6 sm:p-8 shadow-[12px_12px_0px_#FF3B30] text-center max-w-md w-full"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-7xl sm:text-9xl mb-2">{winner.winner.emoji}</div>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: -3 }}
                                        transition={{ delay: 0.2, type: 'spring' }}
                                        className="inline-block bg-acid border-4 border-ink px-3 py-1 mb-3 shadow-[5px_5px_0px_#0A0A0A]"
                                    >
                                        <span className="font-heading uppercase text-base sm:text-xl">🏆 VAINQUEUR</span>
                                    </motion.div>
                                    <h2 className="font-heading uppercase text-3xl sm:text-5xl leading-none text-ink" style={{ textShadow: '0.04em 0.04em 0 #FFFF00, 0.08em 0.08em 0 #FF3B30' }}>
                                        {winner.winner.name}
                                    </h2>
                                    <p className="font-body text-xs sm:text-sm font-bold mt-3 opacity-70">
                                        Vaincu : {winner.loser.emoji} {winner.loser.name} (paix à son emoji 🌹)
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        <button
                                            onClick={rematch}
                                            data-testid="versus-rematch-btn"
                                            className="bg-tomato text-white border-4 border-ink font-heading uppercase text-base sm:text-xl py-3 shadow-[5px_5px_0px_#0A0A0A] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] transition-all duration-75"
                                        >
                                            🔁 Revanche
                                        </button>
                                        <button
                                            onClick={reset}
                                            data-testid="versus-pick-again-btn"
                                            className="bg-white border-4 border-ink font-heading uppercase text-base sm:text-xl py-3 shadow-[5px_5px_0px_#0A0A0A] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] transition-all duration-75"
                                        >
                                            🎲 Autres
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            )}
        </div>
    );
};

const FightHPBar = ({ fighter, hp, side, hit }) => {
    const max = fighter.hp + (fighter.shieldHp || 0);
    const pct = max > 0 ? (hp / max) * 100 : 0;
    return (
        <motion.div
            animate={hit > 0 ? { x: side === 'left' ? [-6, 6, 0] : [6, -6, 0] } : {}}
            transition={{ duration: 0.2 }}
            className={`border-4 border-ink p-2 sm:p-3 shadow-[5px_5px_0px_#0A0A0A] ${side === 'left' ? 'text-left' : 'text-right'}`}
            style={{ backgroundColor: fighter.bg }}
        >
            <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
                <div className="text-3xl sm:text-4xl">{fighter.emoji}</div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm sm:text-lg uppercase leading-none truncate">{fighter.name}</h3>
                    <div className="h-3 sm:h-4 border-2 border-ink bg-white mt-1.5 relative overflow-hidden">
                        <motion.div
                            className="h-full"
                            style={{ backgroundColor: pct > 50 ? '#39FF14' : pct > 20 ? '#FFFF00' : '#FF3B30' }}
                            animate={{ width: `${pct}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        />
                    </div>
                    <div className={`font-body text-[10px] sm:text-xs font-bold mt-1 ${side === 'right' ? 'text-right' : ''}`}>
                        ❤️ {hp} / {max}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const FighterAnim = ({ fighter, hit, side }) => (
    <motion.div
        animate={hit ? { x: side === 'left' ? [-20, 20, -10, 0] : [20, -20, 10, 0], rotate: side === 'left' ? [-10, 10, 0] : [10, -10, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="text-7xl sm:text-9xl text-center leading-none"
    >
        {fighter.emoji}
    </motion.div>
);

export default Versus;
