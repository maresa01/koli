import type { NavigateFunction } from "react-router-dom";

const TOUR_KEY = "koli-intro-tour-v1";
const COINS_KEY = "koli-coins-v1";

export const INTRO_TOUR_TOTAL_SEC = 5 * 60;

export type IntroTourState = {
  remainingSec: number;
  paths: string[];
  index: number;
};

function parseTour(): IntroTourState | null {
  try {
    const raw = localStorage.getItem(TOUR_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<IntroTourState> & { endTs?: unknown };

    // Backward compat: older versions stored endTs instead of remainingSec.
    let remainingSec =
      typeof p.remainingSec === "number" && Number.isFinite(p.remainingSec)
        ? Math.max(0, Math.floor(p.remainingSec))
        : null;

    if (remainingSec === null && typeof p.endTs === "number" && Number.isFinite(p.endTs)) {
      remainingSec = Math.max(0, Math.ceil((p.endTs - Date.now()) / 1000));
    }

    if (remainingSec === null || !Array.isArray(p.paths) || typeof p.index !== "number") {
      return null;
    }

    const s: IntroTourState = {
      remainingSec,
      paths: p.paths.filter((x) => typeof x === "string"),
      index: p.index,
    };

    // Persist migrated state to avoid repeated conversion.
    if (typeof p.remainingSec !== "number") {
      localStorage.setItem(TOUR_KEY, JSON.stringify(s));
    }

    return s;
  } catch {
    return null;
  }
}

function persistTour(s: IntroTourState | null) {
  if (!s) localStorage.removeItem(TOUR_KEY);
  else localStorage.setItem(TOUR_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("koli-intro-tour"));
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getIntroTourState(): IntroTourState | null {
  return parseTour();
}

export function getIntroTourRemainingSec(): number {
  const s = parseTour();
  if (!s) return 0;
  return Math.max(0, Math.floor(s.remainingSec));
}

export function startIntroTour(): void {
  const rest = shuffleInPlace([
    "/games/visual",
    "/games/sequence",
    "/games/number",
    "/games/stroop",
    "/games/schulte",
  ]);
  const paths = ["/games/reaction", ...rest];
  const state: IntroTourState = {
    remainingSec: INTRO_TOUR_TOTAL_SEC,
    paths,
    index: 0,
  };
  persistTour(state);
}

export function clearIntroTour(): void {
  persistTour(null);
}

export function getIntroCoins(): number {
  try {
    const n = Number(localStorage.getItem(COINS_KEY) || "0");
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  } catch {
    return 0;
  }
}

function addIntroCoin(): void {
  const next = getIntroCoins() + 1;
  localStorage.setItem(COINS_KEY, String(next));
  window.dispatchEvent(new Event("koli-intro-tour"));
}

export function addIntroCoins(amount: number): number {
  const a = Math.max(0, Math.floor(amount));
  if (!a) return getIntroCoins();
  const next = getIntroCoins() + a;
  localStorage.setItem(COINS_KEY, String(next));
  window.dispatchEvent(new Event("koli-intro-tour"));
  return next;
}

/** Current path must match tour queue[index]. */
export function introTourMatchesPath(pathname: string): boolean {
  const s = parseTour();
  if (!s || s.index < 0 || s.index >= s.paths.length) return false;
  return s.paths[s.index] === pathname;
}

export function endIntroTourStep(
  won: boolean,
  navigate: NavigateFunction
): void {
  const s = parseTour();
  if (!s) {
    navigate("/about", { replace: true });
    return;
  }
  if (won) addIntroCoin();

  const nextIdx = s.index + 1;
  const timeUp = s.remainingSec <= 0;

  if (nextIdx >= s.paths.length || timeUp) {
    persistTour(null);
    navigate("/about?tourDone=1", { replace: true });
    return;
  }

  persistTour({ ...s, index: nextIdx });
  navigate(`${s.paths[nextIdx]}?tour=1`, { replace: true });
}

export function cancelIntroTour(navigate: NavigateFunction): void {
  persistTour(null);
  navigate("/about", { replace: true });
}

export function introTourTimeUpAdvance(navigate: NavigateFunction): void {
  endIntroTourStep(false, navigate);
}

/** Decrements remaining seconds by 1 while playing. Returns updated remainingSec. */
export function tickIntroTourSecond(): number {
  const s = parseTour();
  if (!s) return 0;
  const next = Math.max(0, Math.floor(s.remainingSec) - 1);
  persistTour({ ...s, remainingSec: next });
  return next;
}