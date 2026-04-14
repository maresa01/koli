import { Link, Outlet, useLocation } from "react-router-dom";
// import { useState } from "react";
import { t } from "../lib/strings";
import { useAppState } from "../hooks/useAppState";
import { useIntroCoins } from "../hooks/useIntroCoins";
// import { ParentPanel } from "./ParentPanel";
import { KoliMascot } from "./KoliGuide";
import { BetaApiStatus } from "./BetaApiStatus";

const pathTitles: Record<string, string> = {
  "/": t.appName,
  "/about": t.aboutTitle,
  "/register": t.registerTitle,
  "/login": t.loginTitle,
  "/focus": t.focus15Title,
  "/games": t.gamesTitle,
  "/games/visual": t.visualGame,
  "/games/sequence": t.sequenceGame,
  "/games/number": t.numberGame,
  "/games/reaction": t.reactionOptional,
  "/tasks": t.goTasks,
  "/games/neuro": t.neuroGame,
  "/games/stroop": t.stroopGame,
};

export function Layout() {
  const { totalPoints } = useAppState();
  const coins = useIntroCoins();
  // const [parentOpen, setParentOpen] = useState(false);
  const loc = useLocation();
  const title = pathTitles[loc.pathname] ?? t.appName;
  const hideTopBar = ["/", "/about", "/register", "/login"].includes(loc.pathname);

  return (
    <div className="layout">
      {!hideTopBar && (
        <header className="top-bar">
          <Link to="/" className="top-bar__brand">
            <KoliMascot size="thumb" className="top-bar__logo" alt="" />
            <span className="top-bar__title">{title}</span>
          </Link>
          <div className="top-bar__actions">
            <div className="top-bar__stats" aria-live="polite">
              <div
                className="stat-pill stat-pill--energy"
                aria-label={`${t.energy}: ${totalPoints}`}
              >
                <span className="stat-pill__iconWrap stat-pill__iconWrap--energy">
                  <img
                    src="/koli-energy-icon.png"
                    alt=""
                    className="stat-pill__iconImg"
                    width={28}
                    height={28}
                  />
                </span>
                <span className="stat-pill__value">{totalPoints}</span>
              </div>
              <div
                className="stat-pill stat-pill--coins"
                aria-label={`${t.coinsCollected}: ${coins}`}
              >
                <span className="stat-pill__iconWrap stat-pill__iconWrap--coin">
                  <img
                    src="/koli-coin.png"
                    alt=""
                    className="stat-pill__coinIcon"
                    width={22}
                    height={22}
                  />
                </span>
                <span className="stat-pill__value">{coins}</span>
              </div>
            </div>
            {/* ծնողի բաժին — ժամանակավորապես անջատված
            <button
              type="button"
              className="btn-parent"
              onClick={() => setParentOpen(true)}
            >
              {t.parent}
            </button>
            */}
          </div>
        </header>
      )}
      <main className="main-area">
        <Outlet />
      </main>
      <BetaApiStatus />
      {/* {parentOpen && <ParentPanel onClose={() => setParentOpen(false)} />} */}
    </div>
  );
}
