import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { OPPONENTS, CHAOS_EVENTS, SLAP_LABELS, PERFECT_LABELS } from "@/lib/gameData";
import { sfx, resumeAudio, vibrate, voice } from "@/lib/audio";
import { submitScore, getRank } from "@/lib/api";
import { loadProfile, updateProfileAfterGame, unlockAchievement, setPseudo as savePseudo } from "@/lib/profile";
import { checkUnlocks, getAchievement } from "@/lib/achievements";
import { getDailyChallenge, applyModifierToOpponents } from "@/lib/daily";
import { generateShareCard, downloadShareCard } from "@/lib/shareCard";
import { applyBoostToOpponent } from "@/lib/loot";
import LootMachine from "@/components/LootMachine";
import { getActiveSkin } from "@/lib/skins";
import { recordKill } from "@/lib/kills";
import { toast } from "sonner";

const GAME_STATES = { COUNTDOWN: 'countdown', PLAYING: 'playing', SLAP_CAM: 'slap_cam', LOOT: 'loot', RESULT: 'result' };

const Game = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const isDaily = params.get('mode') === 'daily';
    const challengeFrom = params.get('challenge');
    const challengeTarget = params.get('target');

    // Daily challenge setup
    const daily = isDaily ? getDailyChallenge() : null;
    const modifier = daily?.modifier;

    // Build opponent roster (potentially modified + easier on first game)
    const baseRoster = modifier ? applyModifierToOpponents(modifier) : OPPONENTS;
    const profileForRoster = loadProfile();
    const isFirstGameInit = profileForRoster.games_played === 0 && !isDaily;
    const rosterRef = useRef(
        isFirstGameInit
            ? baseRoster.map((op, i) => i === 0 ? { ...op, hp: Math.round(op.hp * 0.5), dodgeChance: op.dodgeChance * 0.3 } : op)
            : baseRoster
    );
    const pickedIdx = OPPONENTS.findIndex((o) => o.id === params.get('start'));
    const startIdx = modifier?.stat?.startOpponent ?? Math.max(0, pickedIdx);

    const [gameState, setGameState] = useState(GAME_STATES.COUNTDOWN);
    const [countdown, setCountdown] = useState(3);
    const [opponentIdx, setOpponentIdx] = useState(startIdx);
    const [activeBoost, setActiveBoost] = useState(null);
    const opponentRaw = rosterRef.current[opponentIdx];
    const opponent = applyBoostToOpponent(opponentRaw, activeBoost);

    const [opponentHp, setOpponentHp] = useState(opponent.hp);
    const [shieldHp, setShieldHp] = useState(opponent.shieldHp || 0);
    const skinRef = useRef(getActiveSkin());
    const [charging, setCharging] = useState(false);
    const [chargeValue, setChargeValue] = useState(0);
    const chargeStartRef = useRef(null);
    const rafRef = useRef(null);

    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [comboMax, setComboMax] = useState(0);
    const [kos, setKos] = useState(0);
    const [perfects, setPerfects] = useState(0);

    const [shakeIntensity, setShakeIntensity] = useState(0); // 0, 1, 2, 3
    const [flash, setFlash] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [slowMo, setSlowMo] = useState(false);
    const [comboFinisher, setComboFinisher] = useState(false);
    const [pendingBoost, setPendingBoost] = useState(null);
    const [popups, setPopups] = useState([]);
    const [particles, setParticles] = useState([]);
    const [taunt, setTaunt] = useState('');
    const [chaosEvent, setChaosEvent] = useState(null);
    const [opponentReact, setOpponentReact] = useState('');
    const [slapCamData, setSlapCamData] = useState(null);
    const [thoughtBubble, setThoughtBubble] = useState('');

    const startTimeRef = useRef(Date.now());
    const submittedRef = useRef(false);
    const arenaRef = useRef(null);
    const profileRef = useRef(loadProfile());
    const [pseudoLocal, setPseudoLocal] = useState(profileRef.current.pseudo || '');
    const [rank, setRank] = useState(null);
    const [newAchievements, setNewAchievements] = useState([]);

    // Perfect window may be narrower in tiny_hands mode
    const perfectWindowMult = (modifier?.stat?.perfectWindow ?? 1) * (activeBoost?.mods?.perfectWindowMult ?? 1);
    const chaosFreq = modifier?.stat?.chaosFreq ?? 0.35;
    const scoreMult = (modifier?.stat?.scoreMult ?? 1) * (activeBoost?.mods?.scoreMult ?? 1);
    const dmgMult = (modifier?.stat?.dmgMult ?? 1) * (activeBoost?.mods?.dmgMult ?? 1);
    const suddenDeath = activeBoost?.mods?.suddenDeath === true;

    // Taunt on each new opponent
    useEffect(() => {
        if (gameState !== GAME_STATES.PLAYING) return;
        const t = opponent.taunt[Math.floor(Math.random() * opponent.taunt.length)];
        setTaunt(t);
        const id = setTimeout(() => setTaunt(''), 2200);
        return () => clearTimeout(id);
    }, [opponentIdx, gameState, opponent]);

    // Countdown — skippable, shorter for first-time players
    const isFirstGame = profileRef.current.games_played === 0 && !isDaily;
    const NARRATOR_LINES = [
        'Observez l\'adversaire. Il ne sait pas encore.',
        'Une mamie en captivité. Étudions son comportement.',
        'Voici, dans son habitat naturel, le boss du jour.',
        'L\'humain s\'apprête à frapper. Quelle inconscience.',
        'Le silence règne. La nature retient son souffle.',
    ];
    useEffect(() => {
        if (gameState !== GAME_STATES.COUNTDOWN) return;
        if (countdown === 3 && !isFirstGame) {
            const line = NARRATOR_LINES[Math.floor(Math.random() * NARRATOR_LINES.length)];
            voice.say(line, { rate: 0.85, pitch: 0.9 });
        }
        if (countdown === 0) {
            sfx.go();
            setGameState(GAME_STATES.PLAYING);
            startTimeRef.current = Date.now();
            return;
        }
        sfx.countdown();
        const delay = isFirstGame ? 700 : 1200;
        const t = setTimeout(() => setCountdown((c) => c - 1), delay);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countdown, gameState, isFirstGame]);

    const skipCountdown = () => {
        if (gameState === GAME_STATES.COUNTDOWN) {
            setCountdown(0);
        }
    };

    // Chaos events
    useEffect(() => {
        if (gameState !== GAME_STATES.PLAYING) return;
        const baseInterval = isDaily && modifier?.id === 'chaos_storm' ? 2500 : 4500;
        const interval = setInterval(() => {
            if (Math.random() < chaosFreq) {
                const ev = CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)];
                setChaosEvent({ ...ev, id: Date.now() });
                sfx.chaos();
                setTimeout(() => setChaosEvent(null), 1800);
            }
        }, baseInterval);
        return () => clearInterval(interval);
    }, [gameState, chaosFreq, isDaily, modifier]);

    // Thought bubbles — opponent random inner monologue during fight
    const RANDOM_THOUGHTS = [
        "🤔 Pourquoi je suis ici ?",
        "🥖 J'ai faim.",
        "💭 Maman m'a oublié à la sortie de l'école.",
        "😴 J'aurais dû dormir.",
        "🧐 C'est qui ce gugusse ?",
        "💸 Faut que je paie mes impôts.",
        "🦷 J'ai un truc entre les dents.",
        "📱 Mon forfait expire demain.",
        "🌧️ Il va pleuvoir ce soir.",
        "🍕 Une pizza me sauverait.",
    ];
    useEffect(() => {
        if (gameState !== GAME_STATES.PLAYING) return;
        const t = setInterval(() => {
            if (Math.random() < 0.45) {
                const msg = RANDOM_THOUGHTS[Math.floor(Math.random() * RANDOM_THOUGHTS.length)];
                setThoughtBubble(msg);
                setTimeout(() => setThoughtBubble(''), 2200);
            }
        }, 5500);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, opponentIdx]);

    // ===== CHARGE / RELEASE MECHANIC =====
    const startCharge = useCallback(() => {
        if (gameState !== GAME_STATES.PLAYING) return;
        resumeAudio();
        if (charging) return;
        setCharging(true);
        chargeStartRef.current = performance.now();
        sfx.charge();
        const tick = () => {
            const elapsed = performance.now() - chargeStartRef.current;
            const t = elapsed / 1100;
            const val = Math.min(100, t * 100);
            if (val < 100) {
                setChargeValue(val);
                rafRef.current = requestAnimationFrame(tick);
            } else {
                const overTime = (elapsed - 1100) / 600;
                const osc = 100 - Math.abs(Math.sin(overTime * Math.PI) * 70);
                setChargeValue(Math.max(20, osc));
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
    }, [charging, gameState]);

    const releaseSlap = useCallback(() => {
        if (!charging) return;
        cancelAnimationFrame(rafRef.current);
        setCharging(false);
        const val = chargeValue;

        // Quality bands
        const perfectMin = 80 + (1 - perfectWindowMult) * 7.5;
        const perfectMax = 95 - (1 - perfectWindowMult) * 7.5;
        const isPerfect = val >= perfectMin && val <= perfectMax;
        const isGood = !isPerfect && val >= 50 && val < perfectMax + 5;
        const isWeak = val < 50;

        const dodged = Math.random() < opponent.dodgeChance;
        const slapX = 50 + (Math.random() - 0.5) * 20;
        const slapY = 38 + (Math.random() - 0.5) * 12;

        if (dodged) {
            sfx.miss();
            vibrate(40);
            setCombo(0);
            spawnPopup('ESQUIVÉ !', slapX, slapY, '#FF0000', 'normal');
            setOpponentReact('dodge');
            setShakeIntensity(1);
            setTimeout(() => setOpponentReact(''), 300);
            setTimeout(() => setShakeIntensity(0), 250);
            // Sudden death: a single miss costs the game
            if (suddenDeath) {
                voice.say('TU AS ÉCHOUÉ !', { rate: 0.8, pitch: 0.3 });
                setTimeout(() => endGame(), 600);
            }
        } else {
            let dmg, label, color, intensity, popupSize;
            if (isPerfect) {
                dmg = Math.round((40 + Math.random() * 15) * dmgMult);
                label = PERFECT_LABELS[Math.floor(Math.random() * PERFECT_LABELS.length)];
                color = '#39FF14';
                intensity = 3;
                popupSize = 'mega';
                sfx.perfect(1.4);
                vibrate([30, 20, 60]);
                setPerfects((p) => p + 1);
                // Slow-mo + zoom kick
                setSlowMo(true);
                setZoom(1.12);
                setTimeout(() => { setSlowMo(false); setZoom(1); }, 220);
            } else if (isGood) {
                dmg = Math.round((20 + Math.random() * 12) * dmgMult);
                label = SLAP_LABELS[Math.floor(Math.random() * SLAP_LABELS.length)];
                color = '#FFFF00';
                intensity = 2;
                popupSize = 'big';
                sfx.slap(1);
                vibrate([20, 10, 30]);
                setZoom(1.06);
                setTimeout(() => setZoom(1), 150);
            } else {
                dmg = Math.round((5 + Math.random() * 6) * dmgMult);
                label = 'PIOU...';
                color = '#FF8C00';
                intensity = 1;
                popupSize = 'normal';
                sfx.slap(0.4);
                vibrate(15);
            }

            const newCombo = isWeak ? 0 : combo + 1;
            setCombo(newCombo);
            setComboMax((m) => Math.max(m, newCombo));
            if (newCombo >= 2) sfx.combo(newCombo);

            // ===== COMBO FINISHER x10 — devastating burst =====
            if (newCombo === 10) {
                voice.say('RAFALE INFERNALE !', { rate: 0.8, pitch: 0.2 });
                setComboFinisher(true);
                setSlowMo(true);
                setZoom(1.18);
                setFlash(true);
                setScore((s) => s + Math.round(5000 * scoreMult));
                spawnPopup('RAFALE INFERNALE !', 50, 30, '#FF3B30', 'mega');
                vibrate([60, 30, 80, 30, 100, 30, 120]);
                setTimeout(() => { setSlowMo(false); setZoom(1); setFlash(false); }, 900);
                setTimeout(() => setComboFinisher(false), 1200);
            }

            const multiplier = 1 + newCombo * 0.25;
            const finalScore = Math.round(dmg * 10 * multiplier * scoreMult);
            setScore((s) => s + finalScore);

            // ===== BOSS SHIELD logic =====
            // Shield absorbs 80% of normal damage; perfect cuts straight through.
            let dmgToShield = 0;
            let dmgToHp = dmg;
            if (shieldHp > 0) {
                if (isPerfect) {
                    // perfects shred the shield + spill into HP if shield breaks
                    dmgToShield = Math.min(shieldHp, dmg);
                    dmgToHp = Math.max(0, dmg - dmgToShield);
                } else {
                    dmgToShield = Math.min(shieldHp, Math.round(dmg * 0.6));
                    dmgToHp = Math.round(dmg * 0.2);
                }
                setShieldHp((s) => {
                    const next = Math.max(0, s - dmgToShield);
                    if (s > 0 && next === 0) {
                        // Shield just broke!
                        setTimeout(() => {
                            voice.say('BOUCLIER BRISÉ !', { rate: 0.9, pitch: 0.3 });
                            spawnPopup('BOUCLIER BRISÉ !', 50, 28, '#00FFFF', 'big');
                            sfx.chaos();
                        }, 0);
                    }
                    return next;
                });
            }

            const willKo = opponentHp - dmgToHp <= 0;
            setOpponentHp((hp) => Math.max(0, hp - dmgToHp));

            spawnPopup(label, slapX, slapY, color, popupSize);
            if (newCombo >= 3) spawnPopup(`COMBO x${newCombo}`, slapX + 6, slapY - 10, '#00FFFF', 'normal');
            spawnParticles(slapX, slapY, intensity);

            setShakeIntensity(intensity);
            setFlash(true);
            setOpponentReact('hit');
            setTimeout(() => setShakeIntensity(0), 350);
            setTimeout(() => setFlash(false), 120);
            setTimeout(() => setOpponentReact(''), 250);

            if (willKo) {
                setTimeout(() => triggerKO(label, color), 350);
            }
        }

        setChargeValue(0);
    }, [charging, chargeValue, combo, opponent, opponentHp, perfectWindowMult, dmgMult, scoreMult]);

    const spawnPopup = (text, x, y, color, size) => {
        const id = Math.random();
        setPopups((p) => [...p, { id, text, x, y, color, size }]);
        setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), 850);
    };

    const spawnParticles = (x, y, count) => {
        const emojis = ['💥', '⭐', '✨', '💫', '🌟'];
        const n = count === 3 ? 14 : count === 2 ? 8 : 4;
        const news = Array.from({ length: n }).map(() => ({
            id: Math.random(),
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x,
            y,
            dx: (Math.random() - 0.5) * 400,
            dy: (Math.random() - 0.5) * 300 - 50,
            rot: (Math.random() - 0.5) * 720,
            size: 30 + Math.random() * 40,
        }));
        setParticles((p) => [...p, ...news]);
        setTimeout(() => {
            setParticles((p) => p.filter((pp) => !news.some((n) => n.id === pp.id)));
        }, 900);
    };

    const triggerKO = (label, color) => {
        sfx.ko();
        vibrate([60, 50, 100, 50, 60]);
        setKos((k) => k + 1);
        recordKill(opponentRaw.id);
        setScore((s) => s + Math.round(1000 * scoreMult));

        // Voice-over for KO
        const koLines = ['K.O.!', 'FATALITY !', 'LE COMBO !', 'OBLITERÉ !'];
        voice.say(koLines[Math.floor(Math.random() * koLines.length)], { rate: 0.75, pitch: 0.25 });

        // Slap-Cam!
        setSlapCamData({
            opponent: opponent,
            label,
            color,
            isDaily,
        });
        setGameState(GAME_STATES.SLAP_CAM);
    };

    // Voice-over: "FINISH HIM!" when opponent HP < 15%
    const finishVoiceRef = useRef(0);
    useEffect(() => {
        if (gameState !== GAME_STATES.PLAYING) return;
        const totalEffective = opponentHp + shieldHp;
        const startTotal = opponent.hp + (opponent.shieldHp || 0);
        if (totalEffective > 0 && totalEffective / startTotal < 0.15 && finishVoiceRef.current !== opponentIdx) {
            finishVoiceRef.current = opponentIdx;
            voice.say('ACHÈVE-LE !', { rate: 0.75, pitch: 0.25 });
        }
    }, [opponentHp, shieldHp, opponent, opponentIdx, gameState]);

    const dismissSlapCam = useCallback(() => {
        setSlapCamData(null);
        const nextIdx = opponentIdx + 1;
        if (nextIdx >= rosterRef.current.length) {
            sfx.win();
            voice.say('VICTOIRE TOTALE !', { rate: 0.8, pitch: 0.3 });
            endGame();
        } else {
            // Show loot machine before the next opponent
            setGameState(GAME_STATES.LOOT);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opponentIdx]);

    const handleLootPicked = useCallback((boost) => {
        setPendingBoost(boost);
    }, []);

    const handleLootClose = useCallback(() => {
        const nextIdx = opponentIdx + 1;
        const boost = pendingBoost;
        setActiveBoost(boost);
        setPendingBoost(null);
        setOpponentIdx(nextIdx);
        const nextRaw = rosterRef.current[nextIdx];
        const nextWithBoost = applyBoostToOpponent(nextRaw, boost);
        setOpponentHp(nextWithBoost.hp);
        setShieldHp(nextWithBoost.shieldHp || 0);
        setCombo(boost?.mods?.startCombo || 0);
        setGameState(GAME_STATES.PLAYING);
    }, [opponentIdx, pendingBoost]);

    // Auto-dismiss slap cam after 2.6s
    useEffect(() => {
        if (gameState !== GAME_STATES.SLAP_CAM) return;
        const t = setTimeout(dismissSlapCam, 2600);
        return () => clearTimeout(t);
    }, [gameState, dismissSlapCam]);

    const endGame = useCallback(async () => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        setGameState(GAME_STATES.RESULT);

        // Update profile + check achievements
        const stats = { score, kos, comboMax, perfects, dailyStreak: profileRef.current.daily_streak };
        const profile = updateProfileAfterGame({ score, kos, comboMax, perfects, isDaily });
        const newlyUnlocked = checkUnlocks(
            { ...stats, dailyStreak: profile.daily_streak },
            profile.achievements
        );
        newlyUnlocked.forEach((id) => unlockAchievement(id));
        if (newlyUnlocked.length > 0) {
            setNewAchievements(newlyUnlocked);
            sfx.achievement();
        }

        try {
            const r = await getRank(score);
            setRank(r);
        } catch {}
    }, [score, kos, comboMax, perfects, isDaily]);

    const handleQuit = () => endGame();

    // Keyboard support
    useEffect(() => {
        const down = (e) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); startCharge(); } };
        const up = (e) => { if (e.code === 'Space') { e.preventDefault(); releaseSlap(); } };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, [startCharge, releaseSlap]);

    // Block native mobile gestures ON THE ARENA ONLY.
    // Document-level touchmove blocking was too aggressive and interfered with
    // long-press on the slap button (touch could be cancelled during charge).
    useEffect(() => {
        const isActive = gameState === GAME_STATES.PLAYING
            || gameState === GAME_STATES.SLAP_CAM
            || gameState === GAME_STATES.LOOT
            || gameState === GAME_STATES.COUNTDOWN;
        if (!isActive) {
            document.body.classList.remove('is-playing');
            document.documentElement.classList.remove('is-playing');
            return;
        }

        document.body.classList.add('is-playing');
        document.documentElement.classList.add('is-playing');

        const el = arenaRef.current;
        const opts = { passive: false };
        // Arena-scoped touchmove blocker — preserves button touch events
        const preventArena = (e) => {
            // Allow events that target the slap button itself (don't cancel charge)
            if (e.target && e.target.closest && e.target.closest('[data-testid="slap-button"]')) return;
            if (e.cancelable) e.preventDefault();
        };

        if (el) {
            el.addEventListener('touchmove', preventArena, opts);
            el.addEventListener('gesturestart', preventArena, opts);
            el.addEventListener('gesturechange', preventArena, opts);
            el.addEventListener('gestureend', preventArena, opts);
        }

        return () => {
            document.body.classList.remove('is-playing');
            document.documentElement.classList.remove('is-playing');
            if (el) {
                el.removeEventListener('touchmove', preventArena, opts);
                el.removeEventListener('gesturestart', preventArena, opts);
                el.removeEventListener('gesturechange', preventArena, opts);
                el.removeEventListener('gestureend', preventArena, opts);
            }
        };
    }, [gameState]);

    const handleSubmit = async () => {
        if (!pseudoLocal.trim()) { toast.error('Donne un pseudo, anonyme !'); return; }
        try {
            const pseudo = pseudoLocal.trim().toUpperCase();
            savePseudo(pseudo);
            await submitScore({
                pseudo,
                score,
                combo_max: comboMax,
                kos,
                duration_sec: (Date.now() - startTimeRef.current) / 1000,
            });
            toast.success('Score envoyé au classement mondial 🏆');
            navigate('/leaderboard');
        } catch (e) {
            toast.error('Erreur d\'envoi, retente !');
        }
    };

    const handleChallenge = () => {
        const pseudo = (pseudoLocal || 'ANONYME').toUpperCase();
        const url = `${window.location.origin}/game?challenge=${encodeURIComponent(pseudo)}&target=${score}`;
        try {
            navigator.clipboard.writeText(url);
            toast.success('Lien de défi copié ! Envoie-le à un pote 📲');
        } catch (e) {
            toast.error('Copie ratée, copie manuellement : ' + url);
        }
    };

    const handleDownload = async () => {
        const grade = score > 50000 ? 'S' : score > 30000 ? 'A' : score > 15000 ? 'B' : score > 5000 ? 'C' : 'D';
        const dataUrl = generateShareCard({
            pseudo: pseudoLocal || 'ANONYME',
            score, kos, comboMax, grade, isDaily,
        });
        // Try Web Share API on mobile
        try {
            if (navigator.share && navigator.canShare) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'baffe-royale.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Baffe Royale',
                        text: `J'ai fait ${score} points sur Baffe Royale 👋💥 Tente mieux ! ${window.location.origin}`,
                    });
                    toast.success('Partagé 🚀');
                    return;
                }
            }
        } catch (e) {}
        downloadShareCard(dataUrl, `baffe-royale-${Date.now()}.png`);
        toast.success('Carte téléchargée ! Partage-la 📸');
    };

    // ===== RENDER =====
    if (gameState === GAME_STATES.RESULT) {
        return (
            <ResultScreen
                score={score}
                kos={kos}
                comboMax={comboMax}
                perfects={perfects}
                rank={rank}
                pseudo={pseudoLocal}
                setPseudo={setPseudoLocal}
                onSubmit={handleSubmit}
                onDownload={handleDownload}
                onChallenge={handleChallenge}
                onReplay={() => navigate(0)}
                onHome={() => navigate('/')}
                newAchievements={newAchievements}
                isDaily={isDaily}
            />
        );
    }

    const shakeClass = shakeIntensity === 3
        ? 'animate-[shake_0.5s_ease-in-out]'
        : shakeIntensity === 2
        ? 'animate-shake'
        : shakeIntensity === 1
        ? 'animate-[shake_0.25s_ease-in-out]'
        : '';

    return (
        <div
            ref={arenaRef}
            className="no-select relative flex flex-col overflow-hidden"
            style={{
                height: '100dvh',
                minHeight: '100vh',
                backgroundColor: opponent.bg,
                paddingTop: 'env(safe-area-inset-top)',
                touchAction: 'none',
                overscrollBehavior: 'none',
                WebkitOverflowScrolling: 'auto',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
            }}
            data-testid="game-arena"
        >
            {/* Inner wrapper for shake/zoom — keeps layout intact */}
            <div
                className={`absolute inset-0 transition-transform ${shakeClass}`}
                style={{ transform: `scale(${zoom})`, transitionDuration: slowMo ? '180ms' : '90ms', transformOrigin: 'center' }}
            >
                <div className="absolute inset-0 halftone-dense opacity-15 pointer-events-none" />
            </div>
            {flash && <div className="absolute inset-0 bg-white pointer-events-none z-30 animate-flash" />}
            {slowMo && <div className="absolute inset-0 bg-black/15 pointer-events-none z-30 backdrop-blur-[1px]" />}

            {/* ========== HEADER / HUD ========== */}
            <header className="relative z-20 shrink-0 px-2 sm:px-4 pt-2 sm:pt-3 flex justify-between items-start gap-2 w-full max-w-3xl mx-auto">
                <div className="bg-white border-[3px] sm:border-4 border-ink px-2 py-1 sm:px-3 sm:py-2 shadow-[4px_4px_0px_#0A0A0A]">
                    <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-widest font-bold leading-none">Score</div>
                    <div className="font-heading text-2xl sm:text-4xl text-tomato text-stroke-thin leading-none mt-0.5" data-testid="game-score">{score}</div>
                </div>

                {isDaily && modifier && (
                    <div className="bg-lime border-[3px] sm:border-4 border-ink px-2 py-1 shadow-[3px_3px_0px_#0A0A0A] flex-1 max-w-[44%] text-center" data-testid="daily-modifier-badge">
                        <div className="font-body text-[9px] uppercase font-bold leading-none">📅 Daily</div>
                        <div className="font-heading text-xs sm:text-base leading-tight mt-0.5 truncate">{modifier.emoji} {modifier.name}</div>
                    </div>
                )}

                {challengeFrom && (
                    <div className="bg-tomato text-white border-[3px] sm:border-4 border-ink px-2 py-1 shadow-[3px_3px_0px_#0A0A0A] flex-1 max-w-[44%] text-center" data-testid="challenge-badge">
                        <div className="font-body text-[9px] uppercase font-bold leading-none">⚔️ Défi de</div>
                        <div className="font-heading text-xs sm:text-base leading-tight mt-0.5 truncate">{challengeFrom} · {challengeTarget} pts</div>
                    </div>
                )}

                <div className="flex flex-col gap-1 sm:gap-2 items-end">
                    <div className="bg-acid border-[3px] sm:border-4 border-ink px-2 py-1 sm:px-3 shadow-[3px_3px_0px_#0A0A0A]">
                        <div className="font-body text-[9px] uppercase font-bold leading-none">Combo</div>
                        <div className="font-heading text-xl sm:text-3xl leading-none mt-0.5" data-testid="game-combo">x{combo}</div>
                    </div>
                    <button
                        onClick={handleQuit}
                        data-testid="quit-btn"
                        className="bg-white border-[3px] sm:border-4 border-ink font-heading uppercase text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 shadow-[2px_2px_0px_#0A0A0A] hover:shadow-[1px_1px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-75"
                    >
                        Quitter
                    </button>
                </div>
            </header>

            {/* Countdown */}
            <AnimatePresence>
                {gameState === GAME_STATES.COUNTDOWN && (
                    <motion.div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink/60 backdrop-blur-sm cursor-pointer px-4" onClick={skipCountdown}>
                        <motion.p
                            key={`taunt-${countdown}`}
                            initial={{ y: -30, opacity: 0, rotate: -3 }}
                            animate={{ y: 0, opacity: 1, rotate: -2 }}
                            exit={{ y: 30, opacity: 0 }}
                            className="font-heading uppercase text-acid mb-4 sm:mb-6 text-center bg-tomato border-4 border-white px-4 sm:px-6 py-1.5 sm:py-2 shadow-[6px_6px_0px_#0A0A0A] tracking-wider"
                            style={{ fontSize: 'clamp(1rem, 4vw, 2rem)' }}
                        >
                            {countdown === 3 ? '👀 PRÊT ?!'
                                : countdown === 2 ? '😤 CONCENTRE-TOI...'
                                : countdown === 1 ? '🔥 ALLEZ ALLEZ !'
                                : '💥 VAS-Y !'}
                        </motion.p>
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 2, opacity: 0, rotate: 15 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                            className="font-heading text-white text-center"
                            style={{ fontSize: 'clamp(7rem, 32vw, 18rem)', textShadow: '0.06em 0.06em 0 #FF3B30, 0.12em 0.12em 0 #FFFF00', lineHeight: 1 }}
                            data-testid="countdown"
                        >
                            {countdown === 0 ? 'BAFFE !' : countdown}
                        </motion.div>
                        {countdown === 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.5, 1] }}
                                transition={{ duration: 0.4 }}
                                className="absolute"
                                style={{ fontSize: 'clamp(6rem, 20vw, 12rem)' }}
                            >
                                💥
                            </motion.div>
                        )}
                        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-body text-xs sm:text-sm font-bold uppercase tracking-widest text-white opacity-70 whitespace-nowrap">Tap pour passer →</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slap-Cam Overlay */}
            <AnimatePresence>
                {gameState === GAME_STATES.SLAP_CAM && slapCamData && (
                    <SlapCam data={slapCamData} onSkip={dismissSlapCam} />
                )}
            </AnimatePresence>

            {/* Loot Machine Overlay */}
            <AnimatePresence>
                {gameState === GAME_STATES.LOOT && (
                    <LootMachine onPicked={handleLootPicked} onClose={handleLootClose} />
                )}
            </AnimatePresence>

            {/* Combo Finisher Cinematic */}
            <AnimatePresence>
                {comboFinisher && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center"
                        data-testid="combo-finisher"
                    >
                        <div className="absolute inset-0 bg-tomato/40" />
                        <div className="absolute inset-0 diagonal-stripes opacity-60" />
                        <motion.div
                            initial={{ scale: 0, rotate: -25 }}
                            animate={{ scale: [0, 1.4, 1.1], rotate: [-25, 8, -3] }}
                            transition={{ duration: 0.6, ease: 'backOut' }}
                            className="relative font-heading uppercase tracking-tighter text-center px-4 leading-none"
                            style={{
                                fontSize: 'clamp(3.5rem, 14vw, 9rem)',
                                color: '#FFFF00',
                                WebkitTextStroke: '5px #0A0A0A',
                                paintOrder: 'stroke fill',
                                textShadow: '0.08em 0.08em 0 #FF3B30',
                            }}
                        >
                            RAFALE<br/>INFERNALE 🔥
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active boost badge */}
            {activeBoost && gameState === GAME_STATES.PLAYING && (
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute top-20 sm:top-24 left-2 sm:left-4 z-20 border-4 border-ink shadow-[4px_4px_0px_#0A0A0A] px-2 py-1 flex items-center gap-1.5"
                    style={{ backgroundColor: activeBoost.bg, color: activeBoost.color }}
                    data-testid="active-boost-badge"
                >
                    <span className="text-xl sm:text-2xl">{activeBoost.emoji}</span>
                    <span className="font-heading text-[10px] sm:text-xs uppercase leading-none">{activeBoost.name}</span>
                </motion.div>
            )}

            {/* Taunt */}
            <AnimatePresence>
                {taunt && gameState === GAME_STATES.PLAYING && (
                    <motion.div
                        initial={{ y: -30, opacity: 0, rotate: -8 }}
                        animate={{ y: 0, opacity: 1, rotate: -3 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute top-[22%] left-1/2 -translate-x-1/2 z-30 bg-white border-[3px] sm:border-4 border-ink px-3 sm:px-5 py-1.5 sm:py-2 shadow-[5px_5px_0px_#0A0A0A] max-w-[88vw] text-center"
                        data-testid="taunt-bubble"
                    >
                        <p className="font-heading text-base sm:text-2xl uppercase leading-tight">"{taunt}"</p>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-ink" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Thought bubble — random inner monologue */}
            <AnimatePresence>
                {thoughtBubble && gameState === GAME_STATES.PLAYING && !taunt && (
                    <motion.div
                        initial={{ y: 20, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1, rotate: 4 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute top-[28%] right-3 sm:right-8 z-30 bg-cyan border-[3px] border-ink px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-[4px_4px_0px_#0A0A0A] max-w-[60%] sm:max-w-xs"
                        data-testid="thought-bubble"
                        style={{ borderRadius: '24px' }}
                    >
                        <p className="font-body text-[11px] sm:text-sm font-bold italic leading-tight">{thoughtBubble}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient stupid stickers in arena bg */}
            {gameState === GAME_STATES.PLAYING && (
                <div className="absolute inset-0 pointer-events-none z-[1] opacity-30">
                    <div className="absolute top-[15%] left-2 font-heading text-[10px] sm:text-xs uppercase tracking-widest bg-ink text-acid px-1.5 py-0.5 border-2 border-ink" style={{ transform: 'rotate(-12deg)' }}>VS</div>
                    <div className="absolute bottom-[28%] right-2 font-heading text-[10px] sm:text-xs uppercase tracking-widest bg-tomato text-white px-1.5 py-0.5 border-2 border-ink" style={{ transform: 'rotate(8deg)' }}>ROUND {opponentIdx + 1}</div>
                </div>
            )}

            {/* Chaos banner */}
            <AnimatePresence>
                {chaosEvent && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="absolute top-1/3 left-0 right-0 z-30 diagonal-stripes py-3"
                        data-testid="chaos-event"
                    >
                        <div className="bg-tomato text-white border-y-4 border-ink py-3 px-4 text-center">
                            <span className="text-3xl sm:text-4xl mr-3">{chaosEvent.emoji}</span>
                            <span className="font-heading text-xl sm:text-3xl uppercase">{chaosEvent.text}</span>
                            <span className="text-3xl sm:text-4xl ml-3">{chaosEvent.emoji}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {chaosEvent && <FallingEmoji emoji={chaosEvent.emoji} key={chaosEvent.id} />}

            {/* ========== MAIN / OPPONENT AREA ========== */}
            <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-3 sm:px-4 py-2 sm:py-3 overflow-hidden w-full max-w-3xl mx-auto">
                <div className="font-heading text-2xl sm:text-4xl md:text-5xl uppercase mb-1 text-stroke-thin text-white text-center leading-none" data-testid="opponent-name">
                    {opponent.name}
                </div>
                <p className="font-body text-[11px] sm:text-sm font-bold mb-2 sm:mb-3 max-w-xs text-center leading-snug">{opponent.bio}</p>

                <div className="w-full max-w-md mb-2 sm:mb-4 px-2">
                    {opponent.shieldHp > 0 && (
                        <div className="h-3 sm:h-4 border-[3px] sm:border-4 border-ink bg-white relative overflow-hidden mb-1 shadow-[3px_3px_0px_#0A0A0A]" data-testid="shield-bar">
                            <motion.div
                                className="h-full bg-cyan"
                                initial={false}
                                animate={{ width: `${(shieldHp / opponent.shieldHp) * 100}%` }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center font-heading text-[10px] sm:text-xs text-ink leading-none">
                                🛡️ BOUCLIER {shieldHp}/{opponent.shieldHp}
                            </div>
                        </div>
                    )}
                    <div className="h-7 sm:h-10 border-[3px] sm:border-4 border-ink bg-white relative overflow-hidden shadow-[4px_4px_0px_#0A0A0A]">
                        <motion.div
                            className="h-full bg-tomato"
                            initial={false}
                            animate={{ width: `${(opponentHp / opponent.hp) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-heading text-sm sm:text-xl text-stroke-thin text-white">
                            {opponentHp} / {opponent.hp}
                        </div>
                    </div>
                </div>

                <motion.div
                    animate={
                        opponentReact === 'hit'
                            ? { x: [0, -60, 60, -25, 0], rotate: [0, -25, 22, -10, 0], scale: [1, 0.9, 1.1, 1] }
                            : opponentReact === 'dodge'
                            ? { x: [0, 80, 0], scale: [1, 1.15, 1] }
                            : {}
                    }
                    transition={{ duration: 0.35 }}
                    className="leading-none relative flex items-center justify-center"
                    style={{ fontSize: 'clamp(7rem, 32vh, 20rem)' }}
                    data-testid="opponent-character"
                >
                    {opponent.emoji}
                    {opponentReact === 'hit' && (
                        <>
                            <span className="absolute top-0 left-0 text-3xl sm:text-4xl animate-spin-slow">⭐</span>
                            <span className="absolute top-0 right-0 text-3xl sm:text-4xl animate-spin-slow" style={{ animationDelay: '0.1s' }}>💫</span>
                            <span className="absolute bottom-4 left-1/2 text-3xl sm:text-4xl animate-spin-slow" style={{ animationDelay: '0.2s' }}>✨</span>
                        </>
                    )}
                </motion.div>
            </main>

            {/* Particles */}
            <div className="absolute inset-0 pointer-events-none z-30">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.5 }}
                        animate={{ x: p.dx, y: p.dy + 200, rotate: p.rot, opacity: 0, scale: 1.2 }}
                        transition={{ duration: 0.85, ease: 'easeOut' }}
                        className="absolute"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: `${p.size}px` }}
                    >
                        {p.emoji}
                    </motion.div>
                ))}
            </div>

            {/* Popups */}
            <div className="absolute inset-0 pointer-events-none z-30">
                {popups.map((p) => {
                    const fontSize = p.size === 'mega' ? 'clamp(4rem, 14vw, 9rem)' : p.size === 'big' ? 'clamp(3rem, 10vw, 6rem)' : 'clamp(2rem, 7vw, 4rem)';
                    return (
                        <motion.div
                            key={p.id}
                            initial={{ scale: 0, rotate: -25, y: 0, opacity: 1 }}
                            animate={{ scale: [0, 1.4, 1.1], rotate: [-25, 8, 0], y: -120, opacity: 0 }}
                            transition={{ duration: 0.85, ease: 'easeOut' }}
                            className="absolute font-heading uppercase tracking-tighter leading-none"
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                color: p.color,
                                fontSize,
                                WebkitTextStroke: '3px #0A0A0A',
                                paintOrder: 'stroke fill',
                                textShadow: '6px 6px 0 #0A0A0A',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {p.text}
                        </motion.div>
                    );
                })}
            </div>

            {/* ========== FOOTER / CHARGE + SLAP ========== */}
            <footer
                className="relative z-20 shrink-0 px-3 sm:px-6 pt-1 sm:pt-2"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 1rem, 5rem)' }}
            >
                <div className="max-w-xl mx-auto">
                    <div className="relative mb-2 sm:mb-3 h-8 sm:h-12 border-[3px] sm:border-4 border-ink bg-white overflow-hidden rounded-full shadow-[4px_4px_0px_#0A0A0A]">
                        <div className="absolute top-0 bottom-0 bg-lime" style={{ left: '80%', width: '15%' }} />
                        <div className="absolute top-0 bottom-0 bg-acid" style={{ left: '50%', width: '30%' }} />
                        <motion.div
                            className="absolute top-0 bottom-0 w-2 bg-ink z-10"
                            animate={{ left: `${chargeValue}%` }}
                            transition={{ duration: 0 }}
                            data-testid="charge-indicator"
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-heading text-xs sm:text-xl pointer-events-none px-2 text-center leading-none">
                            {charging ? 'RELÂCHE !' : 'MAINTIENS LE BOUTON 👇'}
                        </div>
                    </div>

                    <button
                        onMouseDown={startCharge}
                        onMouseUp={releaseSlap}
                        onMouseLeave={() => charging && releaseSlap()}
                        onTouchStart={(e) => { e.preventDefault(); startCharge(); }}
                        onTouchEnd={(e) => { e.preventDefault(); releaseSlap(); }}
                        onTouchCancel={(e) => { e.preventDefault(); releaseSlap(); }}
                        onContextMenu={(e) => e.preventDefault()}
                        data-testid="slap-button"
                        className={`w-full bg-tomato text-white border-[3px] sm:border-4 border-ink font-heading uppercase text-2xl sm:text-4xl md:text-5xl py-3 sm:py-5 shadow-[6px_6px_0px_#0A0A0A] sm:shadow-[8px_8px_0px_#0A0A0A] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all duration-75 tracking-wider touch-none select-none ${charging ? 'animate-wobble' : ''}`}
                        style={{ WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none' }}
                    >
                        {charging ? '💢 CHARGE...' : `${skinRef.current.emoji} BAFFE !`}
                    </button>
                    <p className="hidden sm:block text-center font-body text-[11px] mt-1.5 font-bold uppercase tracking-widest opacity-70">
                        ou maintiens [ESPACE]
                    </p>
                </div>
            </footer>
        </div>
    );
};

// ===== SlapCam =====
const SlapCam = ({ data, onSkip }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-ink flex items-center justify-center overflow-hidden"
            data-testid="slap-cam"
            onClick={onSkip}
        >
            {/* Background stripes */}
            <div className="absolute inset-0 diagonal-stripes opacity-30" />

            {/* SLAP-CAM label */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-6 left-6 flex items-center gap-2 bg-tomato border-4 border-white px-3 py-1"
            >
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="font-heading text-2xl text-white tracking-widest">SLAP-CAM</span>
            </motion.div>

            {/* Replay text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute top-6 right-6 font-heading text-acid text-3xl"
            >
                ● REPLAY
            </motion.div>

            {/* The character flying back */}
            <motion.div
                initial={{ scale: 1, x: 0, rotate: 0 }}
                animate={{ scale: [1, 2.2, 2.2, 2.2], x: [0, -40, -160, -280], rotate: [0, -10, -25, -40] }}
                transition={{ duration: 1.8, times: [0, 0.2, 0.6, 1], ease: 'easeOut' }}
                className="leading-none relative"
                style={{ fontSize: 'clamp(6rem, 25vh, 14rem)' }}
            >
                {data.opponent.emoji}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    transition={{ delay: 0.3, duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl sm:text-7xl"
                >
                    💫
                </motion.span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, rotate: -360 }}
                    transition={{ delay: 0.4, duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-4 -right-12 text-4xl sm:text-6xl"
                >
                    ⭐
                </motion.span>
            </motion.div>

            {/* Giant slap label */}
            <motion.div
                initial={{ scale: 0, rotate: -30, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1.2], rotate: [-30, 5, -3], opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'backOut' }}
                className="absolute font-heading uppercase tracking-tighter pointer-events-none px-4 text-center leading-none"
                style={{
                    fontSize: 'clamp(4rem, 14vw, 10rem)',
                    color: data.color,
                    WebkitTextStroke: '5px #0A0A0A',
                    paintOrder: 'stroke fill',
                    textShadow: '0.08em 0.08em 0 #FF3B30',
                }}
            >
                {data.label}
            </motion.div>

            {/* KO badge */}
            <motion.div
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: -8 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 bg-tomato border-4 border-white px-5 sm:px-8 py-2 sm:py-3 shadow-[8px_8px_0px_#FFFF00] sm:shadow-[10px_10px_0px_#FFFF00]"
            >
                <span className="font-heading text-5xl sm:text-7xl text-white tracking-wider">K.O. !</span>
            </motion.div>

            {/* Skip hint */}
            <div className="absolute bottom-6 right-6 font-body text-white text-xs uppercase font-bold tracking-widest opacity-80">
                Tap pour passer →
            </div>
        </motion.div>
    );
};

const FallingEmoji = ({ emoji }) => {
    const items = Array.from({ length: 8 }).map(() => ({
        left: 5 + Math.random() * 90,
        delay: Math.random() * 0.5,
        size: 30 + Math.random() * 40,
        dur: 1 + Math.random() * 0.8,
    }));
    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {items.map((it, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -100, rotate: 0, opacity: 1 }}
                    animate={{ y: '110vh', rotate: 720, opacity: [1, 1, 0] }}
                    transition={{ duration: it.dur, delay: it.delay, ease: 'linear' }}
                    className="absolute"
                    style={{ left: `${it.left}%`, fontSize: `${it.size}px` }}
                >
                    {emoji}
                </motion.div>
            ))}
        </div>
    );
};

// ===== Result =====
const ResultScreen = ({ score, kos, comboMax, perfects, rank, pseudo, setPseudo, onSubmit, onDownload, onChallenge, onReplay, onHome, newAchievements, isDaily }) => {
    const grade = score > 50000 ? 'S' : score > 30000 ? 'A' : score > 15000 ? 'B' : score > 5000 ? 'C' : 'D';
    const gradeColor = { S: '#39FF14', A: '#FFFF00', B: '#00FFFF', C: '#FF8C00', D: '#FF0000' }[grade];
    const gradeEmoji = { S: '🏆', A: '🥇', B: '🥈', C: '🥉', D: '💩' }[grade];
    const verdicts = { S: 'GIFLEUR LÉGENDAIRE', A: 'CHAMPION DU SLAP', B: 'BAFFEUR HONORABLE', C: 'MAIN MOLLE', D: 'PIOUPIOU' };
    const verdictSubs = {
        S: 'Mamie a appelé un avocat. Tu es trop fort.',
        A: 'Les pigeons te respectent. Ta légende grandit.',
        B: 'Pas mal. Ta tante serait fière (peut-être).',
        C: 'Tu baffes comme un chamallow. Réessaye.',
        D: 'Mamie t\'a humilié. Pleure dans ton oreiller.',
    };

    // AI roast (Emergent LLM)
    const [aiTaunt, setAiTaunt] = useState(null);
    const [loadingTaunt, setLoadingTaunt] = useState(false);
    const requestTaunt = async () => {
        if (!pseudo || pseudo.trim().length < 2 || loadingTaunt) return;
        setLoadingTaunt(true);
        try {
            const { getAITaunt } = await import('@/lib/api');
            const t = await getAITaunt({ pseudo: pseudo.trim(), score, grade });
            setAiTaunt(t);
        } catch (e) {
            setAiTaunt('Mamie a refusé de commenter. Elle est en pause thé.');
        } finally {
            setLoadingTaunt(false);
        }
    };

    // Confetti for S/A grades
    const confetti = grade === 'S' || grade === 'A' ? Array.from({ length: 30 }, (_, i) => ({
        id: i, x: Math.random() * 100, delay: Math.random() * 0.5,
        rot: Math.random() * 720, dur: 2 + Math.random() * 2,
        emoji: ['🎉', '🎊', '⭐', '✨', '💫', '👋'][Math.floor(Math.random() * 6)],
    })) : [];

    return (
        <div className="min-h-screen bg-cream relative overflow-x-hidden no-select py-4 sm:py-8 px-3 sm:px-4" data-testid="result-screen" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" />

            {/* Confetti */}
            {confetti.length > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {confetti.map((c) => (
                        <motion.div key={c.id}
                            initial={{ y: -50, x: `${c.x}vw`, rotate: 0, opacity: 1 }}
                            animate={{ y: '110vh', rotate: c.rot, opacity: [1, 1, 0] }}
                            transition={{ duration: c.dur, delay: c.delay, ease: 'linear' }}
                            className="absolute text-2xl sm:text-3xl"
                        >{c.emoji}</motion.div>
                    ))}
                </div>
            )}

            <div className="relative z-10 max-w-3xl mx-auto">
                {/* Title bell-ringing */}
                <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180 }}
                    className="text-center mb-5 sm:mb-8"
                >
                    <motion.div
                        animate={{ rotate: [-8, 8, -8] }}
                        transition={{ duration: 0.6, repeat: 3 }}
                        className="inline-block text-5xl sm:text-7xl mb-2"
                    >🔔</motion.div>
                    <h1 className="font-heading uppercase text-stroke-thin text-white leading-[0.9] tracking-tighter break-words"
                        style={{ fontSize: 'clamp(2.5rem, 10vw, 6rem)', textShadow: '0.06em 0.06em 0 #FF3B30, 0.12em 0.12em 0 #FFFF00' }}>
                        DING DING DING !
                    </h1>
                    <p className="font-body text-xs sm:text-base font-bold uppercase mt-2 tracking-widest opacity-80">
                        Le verdict est tombé{isDaily ? ' · DAILY' : ''}
                    </p>
                </motion.div>

                {/* Grade card */}
                <motion.div
                    initial={{ scale: 0, rotate: -5 }}
                    animate={{ scale: 1, rotate: -1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
                    className="border-4 border-ink p-5 sm:p-8 shadow-[10px_10px_0px_#0A0A0A] relative overflow-hidden mb-5 sm:mb-6 text-center"
                    style={{ backgroundColor: gradeColor }}
                >
                    <div className="absolute inset-0 halftone-bg opacity-20" />
                    <div className="absolute top-2 left-2 text-3xl sm:text-5xl">{gradeEmoji}</div>
                    <div className="absolute top-2 right-2 text-3xl sm:text-5xl">{gradeEmoji}</div>
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
                            className="font-heading leading-none"
                            style={{ fontSize: 'clamp(7rem, 32vw, 16rem)' }}
                            data-testid="grade"
                        >{grade}</motion.div>
                        <p className="font-heading text-xl sm:text-3xl md:text-4xl uppercase mt-2">{verdicts[grade]}</p>
                        <p className="font-body text-xs sm:text-sm font-bold italic mt-2 opacity-80 px-2">« {verdictSubs[grade]} »</p>
                    </div>
                </motion.div>

                {/* New achievements */}
                {newAchievements.length > 0 && (
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-lime border-4 border-ink p-4 mb-5 sm:mb-6 shadow-[6px_6px_0px_#0A0A0A]"
                        data-testid="new-achievements"
                    >
                        <p className="font-heading text-lg sm:text-2xl uppercase mb-2">🎖️ Nouveau succès débloqué !</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {newAchievements.map((id) => {
                                const a = getAchievement(id);
                                if (!a) return null;
                                return (
                                    <div key={id} className="bg-white border-4 border-ink p-2 flex items-center gap-3">
                                        <div className="text-3xl sm:text-4xl shrink-0">{a.emoji}</div>
                                        <div className="min-w-0">
                                            <div className="font-heading text-base sm:text-lg uppercase leading-none truncate">{a.name}</div>
                                            <div className="font-body text-[11px] sm:text-xs font-bold leading-snug">{a.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
                    <ResultStat label="Score" value={score} bg="#FFFF00" testId="result-score" />
                    <ResultStat label="KO" value={kos} bg="#00FFFF" testId="result-kos" />
                    <ResultStat label="Combo Max" value={`x${comboMax}`} bg="#FF3B30" textColor="white" testId="result-combo" />
                    <ResultStat label="Perfects" value={perfects} bg="#39FF14" testId="result-perfects" />
                </div>

                {rank && (
                    <div className="bg-white border-4 border-ink p-3 sm:p-4 mb-5 sm:mb-6 text-center shadow-[6px_6px_0px_#0A0A0A]" data-testid="rank-display">
                        <p className="font-body text-[10px] sm:text-xs uppercase font-bold tracking-widest">Classement mondial</p>
                        <p className="font-heading text-2xl sm:text-4xl">#{rank.rank} <span className="text-sm sm:text-xl">/ {rank.total}</span></p>
                    </div>
                )}

                {/* Pseudo + share */}
                <div className="bg-acid border-4 border-ink p-3 sm:p-5 mb-4 sm:mb-6 shadow-[6px_6px_0px_#0A0A0A]">
                    <label className="font-heading text-base sm:text-xl uppercase block mb-2">Ton pseudo de gladiateur :</label>
                    <input
                        type="text"
                        maxLength={20}
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        placeholder="MAMA_BAFFEUSE"
                        data-testid="pseudo-input"
                        className="w-full bg-white border-4 border-ink p-2 sm:p-3 font-body text-base sm:text-lg font-bold uppercase tracking-wider focus:outline-none focus:bg-cyan"
                    />

                    {/* AI TAUNT — Mamie roast personnalisé */}
                    <button
                        onClick={requestTaunt}
                        disabled={!pseudo || pseudo.trim().length < 2 || loadingTaunt}
                        data-testid="ai-taunt-btn"
                        className={`w-full mt-3 bg-tomato text-white border-4 border-ink font-heading uppercase text-sm sm:text-base py-2 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all duration-100 ${(!pseudo || loadingTaunt) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {loadingTaunt ? '🌀 Mamie réfléchit...' : '🎙️ Que dit MAMIE de toi ?'}
                    </button>
                    {aiTaunt && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-3 bg-white border-4 border-ink p-3 shadow-[3px_3px_0px_#0A0A0A]"
                            data-testid="ai-taunt-output"
                        >
                            <p className="font-heading text-xs uppercase text-tomato tracking-widest">🎤 Mamie a dit :</p>
                            <p className="font-body text-sm sm:text-base font-bold italic leading-snug mt-1">« {aiTaunt} »</p>
                            <p className="font-body text-[9px] uppercase opacity-50 mt-1">✨ Généré par IA en direct</p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                        <button
                            onClick={onSubmit}
                            data-testid="submit-score-btn"
                            className="bg-ink text-acid border-4 border-ink font-heading uppercase text-base sm:text-lg py-2.5 sm:py-3 shadow-[5px_5px_0px_#FF3B30] hover:shadow-[2px_2px_0px_#FF3B30] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#FF3B30] transition-all duration-75"
                        >
                            🏆 Au classement
                        </button>
                        <button
                            onClick={onDownload}
                            data-testid="download-card-btn"
                            className="bg-cyan border-4 border-ink font-heading uppercase text-base sm:text-lg py-2.5 sm:py-3 shadow-[5px_5px_0px_#0A0A0A] hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-75"
                        >
                            📸 Partager / DL
                        </button>
                    </div>
                </div>

                {/* Bottom buttons */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`💩 Mamie m'a humilié sur Baffe Royale.\nMon score : ${score} pts · Grade ${grade}\nVerdict : ${verdicts[grade]}\nTu fais mieux ? Prouve-le 👋💥`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="share-defeat-twitter"
                        className="col-span-2 bg-ink text-acid border-4 border-ink font-heading uppercase text-base sm:text-xl py-2.5 sm:py-3 text-center shadow-[5px_5px_0px_#FF3B30] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] transition-all duration-75"
                    >
                        🎬 PARTAGER MON HUMILIATION (X · TIKTOK · IG)
                    </a>
                    <button onClick={onChallenge} data-testid="challenge-friend-btn" className="col-span-2 bg-lime border-4 border-ink font-heading uppercase text-base sm:text-xl py-2.5 sm:py-3 shadow-[5px_5px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-75">
                        ⚔️ Défier un pote
                    </button>
                    <button
                        onClick={onReplay}
                        data-testid="replay-btn"
                        className="bg-tomato text-white border-4 border-ink font-heading uppercase text-lg sm:text-2xl py-2.5 sm:py-3 shadow-[5px_5px_0px_#0A0A0A] hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-75"
                    >
                        🔁 Rejouer
                    </button>
                    <button
                        onClick={onHome}
                        data-testid="home-btn"
                        className="bg-white border-4 border-ink font-heading uppercase text-lg sm:text-2xl py-2.5 sm:py-3 shadow-[5px_5px_0px_#0A0A0A] hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#0A0A0A] transition-all duration-75"
                    >
                        🏠 Accueil
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResultStat = ({ label, value, bg, textColor = '#0A0A0A', testId }) => (
    <div className="border-4 border-ink p-2 sm:p-3 shadow-[5px_5px_0px_#0A0A0A] text-center" style={{ backgroundColor: bg, color: textColor }} data-testid={testId}>
        <div className="font-heading text-2xl sm:text-3xl md:text-4xl leading-none">{value}</div>
        <div className="font-body text-[9px] sm:text-xs uppercase font-bold tracking-widest mt-1">{label}</div>
    </div>
);

export default Game;
