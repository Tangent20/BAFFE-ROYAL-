import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getTopScores, getDailyScores } from "@/lib/api";

const Leaderboard = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('all'); // 'all' | 'daily'
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetcher = tab === 'all' ? getTopScores : getDailyScores;
        fetcher()
            .then(setScores)
            .catch(() => setScores([]))
            .finally(() => setLoading(false));
    }, [tab]);

    return (
        <div className="min-h-screen bg-cream relative overflow-hidden no-select py-8 px-4" data-testid="leaderboard-page">
            <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/')}
                        data-testid="back-home-btn"
                        className="bg-white border-4 border-ink font-heading uppercase text-base sm:text-xl px-4 py-2 shadow-[4px_4px_0px_#0A0A0A] hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75"
                    >
                        ← Retour
                    </button>
                    <button
                        onClick={() => navigate('/game')}
                        data-testid="play-from-board-btn"
                        className="bg-tomato text-white border-4 border-ink font-heading uppercase text-base sm:text-xl px-4 py-2 shadow-[4px_4px_0px_#0A0A0A] hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75"
                    >
                        💥 Jouer
                    </button>
                </div>

                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: -2 }}
                    transition={{ type: 'spring' }}
                    className="text-center mb-8"
                >
                    <h1
                        className="font-heading text-5xl sm:text-7xl uppercase tracking-tighter"
                        style={{ textShadow: '6px 6px 0 #FFFF00, 12px 12px 0 #00FFFF' }}
                    >
                        🏆 Hall of Baffes
                    </h1>
                    <p className="font-body text-sm font-bold uppercase tracking-widest mt-2">Les plus grands gifleurs de la planète</p>
                </motion.div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <TabButton active={tab === 'all'} onClick={() => setTab('all')} testId="tab-all">
                        🌍 ALL-TIME
                    </TabButton>
                    <TabButton active={tab === 'daily'} onClick={() => setTab('daily')} testId="tab-daily">
                        📅 AUJOURD'HUI
                    </TabButton>
                </div>

                {/* Scores list */}
                {loading ? (
                    <div className="bg-white border-4 border-ink p-10 text-center shadow-[8px_8px_0px_#0A0A0A]">
                        <div className="font-heading text-3xl animate-wobble">CHARGEMENT...</div>
                    </div>
                ) : scores.length === 0 ? (
                    <div className="bg-white border-4 border-ink p-10 text-center shadow-[8px_8px_0px_#0A0A0A]" data-testid="empty-board">
                        <div className="text-6xl mb-2">🦗</div>
                        <p className="font-heading text-2xl uppercase">Personne n'a encore baffé</p>
                        <p className="font-body text-sm font-bold mt-2">Sois le premier gladiateur !</p>
                    </div>
                ) : (
                    <div className="space-y-3" data-testid="scores-list">
                        {scores.map((s, i) => (
                            <ScoreRow key={s.id || i} score={s} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, children, testId }) => (
    <button
        onClick={onClick}
        data-testid={testId}
        className={`border-4 border-ink font-heading uppercase text-lg sm:text-2xl py-3 shadow-[5px_5px_0px_#0A0A0A] hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75 ${
            active ? 'bg-acid' : 'bg-white'
        }`}
    >
        {children}
    </button>
);

const ScoreRow = ({ score, index }) => {
    const medals = ['🥇', '🥈', '🥉'];
    const bgColors = ['#FFFF00', '#00FFFF', '#FF8C00'];
    const bg = index < 3 ? bgColors[index] : '#FFFFFF';

    return (
        <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="border-4 border-ink p-3 sm:p-4 shadow-[5px_5px_0px_#0A0A0A] flex items-center gap-3 sm:gap-4 relative overflow-hidden"
            style={{ backgroundColor: bg }}
            data-testid={`score-row-${index}`}
        >
            <div className="font-heading text-3xl sm:text-5xl w-12 sm:w-16 text-center">
                {index < 3 ? medals[index] : `#${index + 1}`}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-heading text-xl sm:text-3xl uppercase truncate">{score.pseudo}</div>
                <div className="font-body text-[10px] sm:text-xs uppercase font-bold opacity-70">
                    {score.kos} KO · combo max x{score.combo_max}
                </div>
            </div>
            <div className="text-right">
                <div className="font-heading text-2xl sm:text-4xl text-tomato text-stroke-thin">{score.score}</div>
                <div className="font-body text-[9px] uppercase font-bold tracking-widest">pts</div>
            </div>
        </motion.div>
    );
};

export default Leaderboard;
