import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getIntroTourState, introTourMatchesPath } from "../lib/introTour";

export function useIntroTourGame(): boolean {
  const loc = useLocation();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const tourParam = sp.get("tour") === "1";

  useEffect(() => {
    if (!tourParam) return;
    const s = getIntroTourState();
    if (!s) {
      nav("/about", { replace: true });
      return;
    }
    if (s.paths[s.index] !== loc.pathname) {
      nav(`${s.paths[s.index]}?tour=1`, { replace: true });
    }
  }, [tourParam, loc.pathname, nav]);

  return tourParam && introTourMatchesPath(loc.pathname);
}