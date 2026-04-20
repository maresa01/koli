import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { t } from "../lib/strings";
import { KoliMascot } from "./KoliGuide";
import { GAME_SESSION_SECONDS } from "../lib/gameSession";
import { GameDemo, type GameDemoKind } from "./GameDemo";
import {
  INTRO_TOUR_TOTAL_SEC,
  cancelIntroTour,
  getIntroTourRemainingSec,
  introTourTimeUpAdvance,
  tickIntroTourSecond,
} from "../lib/introTour";

function formatMmSs(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Renders how-to copy with typographic hierarchy (lead, subheading, steps, asides). */
function GameHowtoRich({ text }: { text: string }) {
  const cautionPrefix = "\u0548\u0582\u0577\u0561\u0564\u056b\u057c";
  const benefitPrefix = "\u0531\u0575\u057d\u0020\u056d\u0561\u0572\u0568";
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const blocks: ReactNode[] = [];
  let i = 0;
  let firstText = true;

  const pushPara = (parts: string[], opts?: { note?: "caution" | "benefit" }) => {
    if (parts.length === 0) return;
    const body = parts.join(" ");
    if (opts?.note === "caution") {
      blocks.push(
        <p key={blocks.length} className="game-shell__howto-note game-shell__howto-note--caution">
          {body}
        </p>
      );
      return;
    }
    if (opts?.note === "benefit") {
      blocks.push(
        <p key={blocks.length} className="game-shell__howto-note game-shell__howto-note--benefit">
          {body}
        </p>
      );
      return;
    }
    const cls = ["game-shell__howto-block", firstText ? "game-shell__howto-block--lead" : ""]
      .filter(Boolean)
      .join(" ");
    firstText = false;
    blocks.push(
      <p key={blocks.length} className={cls}>
        {body}
      </p>
    );
  };

  while (i < lines.length) {
    const line = lines[i];
    const next = lines[i + 1];

    if (next && /^\d+[.)]\s*/.test(next) && !/^\d+[.)]\s*/.test(line)) {
      blocks.push(
        <h3 key={`h-${i}`} className="game-shell__howto-subheading">
          {line}
        </h3>
      );
      i++;
      continue;
    }

    if (/^\d+[.)]\s*/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s*/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+[.)]\s*/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="game-shell__howto-steps">
          {items.map((t, j) => (
            <li key={j}>{t}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith(cautionPrefix)) {
      pushPara([line], { note: "caution" });
      i++;
      continue;
    }
    if (line.startsWith(benefitPrefix)) {
      pushPara([line], { note: "benefit" });
      i++;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const L = lines[i];
      const N = lines[i + 1];
      if (/^\d+[.)]\s*/.test(L)) break;
      if (N && /^\d+[.)]\s*/.test(N) && !/^\d+[.)]\s*/.test(L)) break;
      if (L.startsWith(cautionPrefix) || L.startsWith(benefitPrefix)) break;
      para.push(L);
      i++;
    }
    pushPara(para);
  }

  return <div className="game-shell__howto-rich">{blocks}</div>;
}

export type GameSessionApi = {
  secondsLeft: number;
  freezeSession: () => void;
};

type Props = {
  title: string;
  howTo: string;
  /** Ծանոթության տուր՝ մեկ ընդհանուր 5 րոպե, freezeSession չի կանգնեցնում ժամանակը */
  introTour?: boolean;
  iconSrc?: string;
  demoKind?: GameDemoKind;
  children: (api: GameSessionApi) => ReactNode;
};

export function GameShell({ title, howTo, introTour = false, iconSrc, demoKind, children }: Props) {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(GAME_SESSION_SECONDS);
  const [, forceTick] = useState(0);
  const [introTab, setIntroTab] = useState<"demo" | "howto">("demo");

  const freezeSession = useCallback(() => {
    if (introTour) return;
    setFrozen(true);
  }, [introTour]);

  useEffect(() => {
    if (!started || introTour || frozen) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [started, frozen, introTour]);

  const tourRemaining = introTour ? getIntroTourRemainingSec() : 0;

  useEffect(() => {
    if (!introTour || !started) return;
    if (tourRemaining <= 0) return;
    const id = window.setInterval(() => {
      tickIntroTourSecond();
      forceTick((x) => x + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [introTour, started, tourRemaining]);

  const effectiveSeconds = introTour && started ? tourRemaining : secondsLeft;
  const maxSeconds = introTour ? INTRO_TOUR_TOTAL_SEC : GAME_SESSION_SECONDS;

  const timeUp = introTour ? tourRemaining <= 0 : started && !frozen && secondsLeft === 0;
  const showBoard = started && !timeUp;

  const restartSession = () => {
    setStarted(false);
    setFrozen(false);
    setSecondsLeft(GAME_SESSION_SECONDS);
  };

  const progressPct = useMemo(
    () => (effectiveSeconds / maxSeconds) * 100,
    [effectiveSeconds, maxSeconds]
  );

  const api = useMemo(
    () => ({ secondsLeft: effectiveSeconds, freezeSession }),
    [effectiveSeconds, freezeSession]
  );

  const timerLabel = introTour ? t.tourSessionLine : t.sessionDurationLine;
  const timerTotalHint = introTour ? t.tourTotalHint : t.sessionTotal;

  return (
    <div className={["page game-page game-shell", introTour ? "game-shell--tour" : ""].join(" ")}>
      <div className="game-shell__head">
        <h2 className="game-shell__title">{title}</h2>
        {introTour && (
          <div className="tour-banner" aria-live="polite">
            <span className="tour-banner__label">{t.tourStepsTitle}</span>
            <span className="tour-banner__time">
              {t.timeRemainingShort}: <strong>{formatMmSs(tourRemaining)}</strong>
            </span>
          </div>
        )}
        {!started && (
          <>
            <div className="game-shell__intro">
              <div className="game-shell__intro-top">
                <div className="game-shell__intro-visual">
                  {iconSrc ? (
                    <img
                      className="game-shell__intro-icon"
                      src={iconSrc}
                      alt=""
                      width={160}
                      height={160}
                      decoding="async"
                    />
                  ) : (
                    <KoliMascot size="medium" className="game-shell__intro-mascot" alt="" />
                  )}
                </div>
                <p className="game-shell__duration-line">{timerLabel}</p>
              </div>

              {demoKind && (
                <>
                  <div className="game-shell__tabs" role="tablist" aria-label="Intro tabs">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={introTab === "demo"}
                      className={introTab === "demo" ? "game-shell__tab game-shell__tab--on" : "game-shell__tab"}
                      onClick={() => setIntroTab("demo")}
                    >
                      Ինչպես խաղալ
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={introTab === "howto"}
                      className={introTab === "howto" ? "game-shell__tab game-shell__tab--on" : "game-shell__tab"}
                      onClick={() => setIntroTab("howto")}
                    >
                      Խաղի նկարագրություն
                    </button>
                  </div>

                  {introTab === "demo" ? (
                    <div className="game-shell__demo" role="region" aria-label="Demo">
                      <GameDemo kind={demoKind} />
                    </div>
                  ) : (
                    <div className="game-shell__howtoWrap" role="region" aria-label="How to play">
                      <GameHowtoRich text={howTo} />
                    </div>
                  )}
                </>
              )}

              {!demoKind && <GameHowtoRich text={howTo} />}
            </div>
            <button
              type="button"
              className="btn-primary btn-large game-shell__start"
              onClick={() => setStarted(true)}
              disabled={introTour && tourRemaining <= 0}
            >
              {t.startGame}
            </button>
          </>
        )}
        {started && !timeUp && (
          <div className="game-shell__session" aria-live="polite">
            <div className="game-shell__timer-row">
              <span className="game-shell__timer-main">
                {t.timeRemainingShort}: <strong>{formatMmSs(effectiveSeconds)}</strong>
              </span>
              <span className="muted game-shell__timer-total">{timerTotalHint}</span>
            </div>
            <div
              className="game-shell__progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={maxSeconds}
              aria-valuenow={effectiveSeconds}
              aria-label={timerLabel}
            >
              <div
                className="game-shell__progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {timeUp && (
        <div className="game-shell__timeup">
          <KoliMascot size="medium" className="game-shell__timeup-mascot" alt="" />
          <p>{introTour ? t.tourTimeUp : t.timeUp}</p>
          <div className="game-shell__timeup-actions">
            {introTour ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => introTourTimeUpAdvance(navigate)}
              >
                {t.tourNextAfterTime}
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={restartSession}>
                {t.playAgain}
              </button>
            )}
            <Link to="/games" className="btn-secondary">
              {t.back}
            </Link>
          </div>
        </div>
      )}

      {showBoard && children(api)}

      <div className="game-footer game-shell__footer">
        {introTour ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => cancelIntroTour(navigate)}
          >
            {t.home}
          </button>
        ) : (
          <Link to="/games" className="btn-secondary">
            {t.back}
          </Link>
        )}
      </div>
    </div>
  );
}