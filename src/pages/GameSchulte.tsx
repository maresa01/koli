import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell, type GameSessionApi } from "../components/GameShell";
import { t } from "../lib/strings";
import { completeGame } from "../lib/storage";
import { endIntroTourStep } from "../lib/introTour";
import { useIntroTourGame } from "../hooks/useIntroTourGame";

/** Classic Schulte table: find 1…N in order on a shuffled grid (mozgotren-style). */
const GRID_BY_LEVEL = [3, 4, 5] as const;
const WIN_LEVEL = GRID_BY_LEVEL.length;
const INITIAL_LIVES = 3;

function shuffledValues(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function SchulteBoard({
  freezeSession,
  introTour,
}: Pick<GameSessionApi, "freezeSession"> & { introTour: boolean }) {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const grid = GRID_BY_LEVEL[level - 1] ?? 3;
  const cellCount = grid * grid;

  const [values, setValues] = useState(() => shuffledValues(9));
  const [nextNeed, setNextNeed] = useState(1);
  const [doneCells, setDoneCells] = useState<Set<number>>(() => new Set());
  const [wrongCell, setWrongCell] = useState<number | null>(null);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [won, setWon] = useState(false);
  const [dead, setDead] = useState(false);
  const [reward, setReward] = useState<{ bonus: number; total: number } | null>(null);

  const wrongTimerRef = useRef<number | null>(null);

  const resetRound = useCallback((lv: number) => {
    const g = GRID_BY_LEVEL[lv - 1] ?? 3;
    const n = g * g;
    setValues(shuffledValues(n));
    setNextNeed(1);
    setDoneCells(new Set());
    setWrongCell(null);
  }, []);

  useEffect(() => {
    resetRound(level);
  }, [level, resetRound]);

  useEffect(() => {
    return () => {
      if (wrongTimerRef.current != null) window.clearTimeout(wrongTimerRef.current);
    };
  }, []);

  const onCell = (idx: number) => {
    if (won || dead || doneCells.has(idx)) return;
    const v = values[idx];
    if (v !== nextNeed) {
      if (wrongTimerRef.current != null) window.clearTimeout(wrongTimerRef.current);
      setWrongCell(idx);
      wrongTimerRef.current = window.setTimeout(() => setWrongCell(null), 450);

      if (lives <= 1) {
        setDead(true);
        setLives(0);
        const partial = Math.min(18, 6 + (level - 1) * 4);
        setReward(completeGame(partial));
      } else {
        setLives(lives - 1);
        resetRound(level);
      }
      return;
    }

    const maxV = cellCount;
    const newDone = new Set(doneCells).add(idx);
    setDoneCells(newDone);

    if (nextNeed >= maxV) {
      if (level >= WIN_LEVEL) {
        setWon(true);
        freezeSession();
        setReward(completeGame(20));
      } else {
        setLevel((lv) => lv + 1);
      }
      return;
    }
    setNextNeed((n) => n + 1);
  };

  const phaseLabel =
    won ? t.done : dead ? t.gameOver : t.schultePhase.replace("{n}", String(nextNeed));

  return (
    <>
      <div className="game-hud game-hud--compact vm-hud">
        <span>
          {t.level}: {Math.min(level, WIN_LEVEL)}/{WIN_LEVEL}
        </span>
        <span className="vm-lives" aria-label={t.vmLives}>
          {t.vmLives}: {"❤️".repeat(Math.max(0, lives))}
          {lives <= 0 ? " —" : ""}
        </span>
      </div>
      <p className="game-phase-label">{phaseLabel}</p>
      {!won && !dead && (
        <p className="vm-hint muted">
          {grid}×{grid} · {t.schulteGridHint}
        </p>
      )}
      {reward && (
        <div className="toast-win" role="status">
          {t.earned} {reward.total} {t.points}
          {reward.bonus > 0 && (
            <span className="muted"> ({reward.bonus}՝ այս օրվա առաջին խաղը)</span>
          )}
        </div>
      )}
      {dead && (
        <div className="vm-panel vm-panel--bad">
          <p>{t.vmGameOver}</p>
        </div>
      )}

      <div
        className="vm-grid shulte-grid"
        style={{ gridTemplateColumns: `repeat(${grid}, 1fr)` }}
        role="grid"
        aria-label={t.schulteGame}
      >
        {values.map((num, i) => {
          const isDone = doneCells.has(i);
          const isWrong = wrongCell === i;
          return (
            <button
              key={i}
              type="button"
              className={[
                "vm-cell",
                "shulte-cell",
                isDone ? "shulte-cell--done" : "",
                isWrong ? "shulte-cell--wrong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onCell(i)}
              disabled={won || dead || isDone}
              aria-label={`${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>
      <p className="seq-bgz-caption muted">{t.schulteCaption}</p>

      {(won || dead) && (
        <div className="game-inner-actions">
          {introTour ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => endIntroTourStep(!!won, navigate)}
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

export function GameSchulte() {
  const introTour = useIntroTourGame();
  return (
    <GameShell introTour={introTour} title={t.schulteGame} howTo={t.schulteHowTo}>
      {({ freezeSession }) => (
        <SchulteBoard freezeSession={freezeSession} introTour={introTour} />
      )}
    </GameShell>
  );
}