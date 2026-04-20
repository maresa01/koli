import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell, type GameSessionApi } from "../components/GameShell";
import { t } from "../lib/strings";
import { endIntroTourStep } from "../lib/introTour.ts";
import { useIntroTourGame } from "../hooks/useIntroTourGame";

const TRIALS = 5;

type Phase = "readyClick" | "waiting" | "go" | "early" | "summary";

function pointsForAverage(avg: number): number {
  if (avg < 200) return 22;
  if (avg < 250) return 20;
  if (avg < 300) return 18;
  if (avg < 400) return 15;
  return 12;
}

function ReactionBoard({
  freezeSession,
  introTour,
}: Pick<GameSessionApi, "freezeSession"> & { introTour: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("readyClick");
  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);

  const tGreenRef = useRef(0);
  const waitTimerRef = useRef(0);
  const earlyTimerRef = useRef(0);

  const clearWait = useCallback(() => {
    if (waitTimerRef.current) window.clearTimeout(waitTimerRef.current);
    waitTimerRef.current = 0;
  }, []);

  const clearEarly = useCallback(() => {
    if (earlyTimerRef.current) window.clearTimeout(earlyTimerRef.current);
    earlyTimerRef.current = 0;
  }, []);

  const startWaiting = useCallback(() => {
    clearWait();
    clearEarly();
    setPhase("waiting");
    const delay = 2000 + Math.random() * 3000;
    waitTimerRef.current = window.setTimeout(() => {
      waitTimerRef.current = 0;
      tGreenRef.current = performance.now();
      setPhase("go");
    }, delay);
  }, [clearWait, clearEarly]);

  useEffect(() => {
    return () => {
      clearWait();
      clearEarly();
    };
  }, [clearWait, clearEarly]);

  const onHit = () => {
    if (phase === "readyClick") {
      startWaiting();
      return;
    }
    if (phase === "waiting") {
      clearWait();
      setPhase("early");
      earlyTimerRef.current = window.setTimeout(() => {
        earlyTimerRef.current = 0;
        startWaiting();
      }, 950);
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - tGreenRef.current);
      const next = [...times, ms];
      setTimes(next);
      setLastMs(ms);
      if (next.length >= TRIALS) {
        setPhase("summary");
        const avg = next.reduce((a, b) => a + b, 0) / next.length;
        freezeSession();
        void pointsForAverage(avg);
      } else {
        setPhase("readyClick");
      }
      return;
    }
  };

  const avg =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const best = times.length > 0 ? Math.min(...times) : 0;

  const screenClass =
    phase === "waiting"
      ? "rt-hit rt-hit--wait"
      : phase === "go"
        ? "rt-hit rt-hit--go"
        : phase === "early"
          ? "rt-hit rt-hit--early"
          : "rt-hit rt-hit--ready";

  return (
    <>
      {phase !== "summary" && (
        <div className="game-hud game-hud--compact rt-meta">
          <span>
            {t.reactionProgress} {times.length + 1}/{TRIALS}
          </span>
          {lastMs !== null && phase === "readyClick" && times.length > 0 && (
            <span className="rt-meta__last">
              {lastMs} {t.reactionMs}
            </span>
          )}
        </div>
      )}

      {phase !== "summary" ? (
        <button
          type="button"
          className={screenClass}
          onClick={onHit}
          disabled={phase === "early"}
          aria-label={
            phase === "readyClick"
              ? times.length === 0
                ? t.reactionClickToStart
                : t.reactionTapNext
              : phase === "waiting"
                ? t.reactionWaitGreen
                : phase === "go"
                  ? t.reactionNow
                  : t.reactionTooSoon
          }
        >
          {phase === "readyClick" && (
            <span className="rt-hit__inner">
              {times.length === 0 ? (
                <>
                  <span className="rt-hit__title">{t.reactionClickToStart}</span>
                  <span className="rt-hit__sub">{t.reactionDontEarly}</span>
                </>
              ) : (
                <>
                  <span className="rt-hit__big">{lastMs}</span>
                  <span className="rt-hit__unit">{t.reactionMs}</span>
                  <span className="rt-hit__title">{t.reactionTapNext}</span>
                </>
              )}
            </span>
          )}
          {phase === "waiting" && (
            <span className="rt-hit__inner">
              <span className="rt-hit__title">{t.reactionWaitGreen}</span>
              <span className="rt-hit__sub">{t.reactionDontEarly}</span>
            </span>
          )}
          {phase === "go" && (
            <span className="rt-hit__inner">
              <span className="rt-hit__bang">{t.reactionNow}</span>
              <span className="rt-hit__sub">{t.tapWhenGreen}</span>
            </span>
          )}
          {phase === "early" && (
            <span className="rt-hit__inner">
              <span className="rt-hit__title">{t.reactionTooSoon}</span>
            </span>
          )}
        </button>
      ) : (
        <div className="rt-hit rt-hit--summary" role="region" aria-label={t.reactionFinished}>
          <div className="rt-summary">
            <h3 className="rt-summary__h">{t.reactionFinished}</h3>
            <p className="rt-summary__row">
              <span>{t.reactionAvg}</span>
              <strong>
                {avg} {t.reactionMs}
              </strong>
            </p>
            <p className="rt-summary__row">
              <span>{t.reactionBest}</span>
              <strong>
                {best} {t.reactionMs}
              </strong>
            </p>
            <p className="rt-summary__list-title">{t.reactionAllResults}</p>
            <ul className="rt-summary__list">
              {times.map((ms, i) => (
                <li key={i}>
                  {t.reactionProgress} {i + 1}: {ms} {t.reactionMs}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {phase === "summary" && (
        <div className="game-inner-actions">
          {introTour ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => endIntroTourStep(true, navigate)}
            >
              {t.tourNextGame}
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              {t.restart}
            </button>
          )}
        </div>
      )}
    </>
  );
}

export function GameReaction() {
  const introTour = useIntroTourGame();
  return (
    <GameShell
      introTour={introTour}
      iconSrc="/game-icon-reaction.png"
      title={t.reactionOptional}
      howTo={t.reactionHowTo}
      demoKind="reaction"
    >
      {({ freezeSession }) => (
        <ReactionBoard freezeSession={freezeSession} introTour={introTour} />
      )}
    </GameShell>
  );
}