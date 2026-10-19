import { Component } from "react";

class GameErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error("[GameErrorBoundary] Le jeu a fait une baffe au navigateur :", error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleHome = () => {
        window.location.href = "/";
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div
                data-testid="game-error-boundary"
                className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-8 text-center"
                style={{
                    backgroundColor: "#FFF7E6",
                    touchAction: "none",
                    overscrollBehavior: "none",
                }}
            >
                <div
                    className="text-[7rem] sm:text-[10rem] leading-none mb-4 select-none"
                    style={{ filter: "drop-shadow(6px 6px 0 #0A0A0A)" }}
                    aria-hidden
                >
                    🥴
                </div>

                <h1
                    className="font-heading uppercase text-4xl sm:text-6xl tracking-tight leading-none mb-3"
                    style={{
                        color: "#FF3B30",
                        WebkitTextStroke: "3px #0A0A0A",
                        paintOrder: "stroke fill",
                        textShadow: "6px 6px 0 #0A0A0A",
                    }}
                    data-testid="error-boundary-title"
                >
                    Aïe, KO technique !
                </h1>

                <p
                    className="font-body font-bold uppercase tracking-widest text-xs sm:text-sm max-w-md mb-2 opacity-80"
                    data-testid="error-boundary-subtitle"
                >
                    Le jeu s'est pris une baffe trop forte et a vu des étoiles ✨
                </p>
                <p className="font-body text-sm sm:text-base max-w-md mb-8 opacity-70">
                    Pas de panique gladiateur, on remet les gants et c'est reparti 👋
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <button
                        onClick={this.handleRetry}
                        data-testid="error-boundary-retry-btn"
                        className="flex-1 bg-tomato text-white border-4 border-ink font-heading uppercase text-lg sm:text-xl py-3 px-4 shadow-[6px_6px_0px_#0A0A0A] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all duration-75 tracking-wider"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        🔁 On remet ça !
                    </button>
                    <button
                        onClick={this.handleHome}
                        data-testid="error-boundary-home-btn"
                        className="flex-1 bg-white border-4 border-ink font-heading uppercase text-lg sm:text-xl py-3 px-4 shadow-[6px_6px_0px_#0A0A0A] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all duration-75 tracking-wider"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        🏠 Accueil
                    </button>
                </div>

                {this.state.error?.message && (
                    <details className="mt-8 text-xs opacity-50 max-w-md w-full">
                        <summary className="cursor-pointer font-body uppercase tracking-widest">
                            Détails techniques (pour les devs curieux)
                        </summary>
                        <pre className="mt-2 p-3 bg-white border-2 border-ink text-left overflow-auto whitespace-pre-wrap break-words">
                            {String(this.state.error?.message)}
                        </pre>
                    </details>
                )}
            </div>
        );
    }
}

export default GameErrorBoundary;
