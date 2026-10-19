import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Reset scroll position to top on every route change.
// React Router does NOT do this automatically — without it, navigating
// to a new page keeps you scrolled where you were on the previous page,
// which feels broken (e.g. lands at the bottom of the new page).
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        // Use 'auto' (not smooth) so users don't see the page scrolling
        // up after each navigation — feels instant + correct.
        try {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } catch {
            // Fallback for very old browsers
            window.scrollTo(0, 0);
        }
    }, [pathname]);
    return null;
};

export default ScrollToTop;
