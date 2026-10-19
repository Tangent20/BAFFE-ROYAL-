import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import Versus from "@/pages/Versus";
import Roster from "@/pages/Roster";
import Collection from "@/pages/Collection";
import ZoneDebile from "@/pages/ZoneDebile";
import Leaderboard from "@/pages/Leaderboard";
import Vitrine from "@/pages/Vitrine";
import Legal from "@/pages/Legal";
import Press from "@/pages/Press";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
import FakeNotifications from "@/components/FakeNotifications";
import EasterEggs from "@/components/EasterEggs";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";

function App() {
    return (
        <div className="App">
            <a href="#main-content" className="skip-link" data-testid="skip-link">
                Aller au contenu principal
            </a>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/app" element={<Home />} />
                    <Route path="/vitrine" element={<Vitrine />} />
                    <Route path="/game" element={<GameErrorBoundary><Game /></GameErrorBoundary>} />
                    <Route path="/versus" element={<Versus />} />
                    <Route path="/roster" element={<Roster />} />
                    <Route path="/collection" element={<Collection />} />
                    <Route path="/zone-debile" element={<ZoneDebile />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/press" element={<Press />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                </Routes>
                <CookieBanner />
                <FakeNotifications />
                <EasterEggs />
            </BrowserRouter>
            <Toaster position="top-center" />
        </div>
    );
}

export default App;
