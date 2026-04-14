import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell, type GameSessionApi } from "../components/GameShell";
import { t } from "../lib/strings";
import { completeGame } from "../lib/storage";
import { endIntroTourStep } from "../lib/introTour";
import { useIntroTourGame } from "../hooks/useIntroTourGame";

/** Target level to finish (braingameszone-style progression). */
const WIN_LEVEL = 10;
const INITIAL_LIVES = 3;

type LevelCfg = { grid: number; count: number; showMs: number };

function getLevelConfig(level: number): LevelCfg {
  const table: LevelCfg[] = [
    { grid: 3, count: 3, showMs: 3200 },
    { grid: 3, count: 4, showMs: 3000 },
    { grid: 3, count: 5, showMs: 2800 },
    { grid: 4, count: 4, showMs: 3000 },
    { grid: 4, count: 5, showMs: 2800 },
    { grid: 4, count: 6, showMs: 2600 },
    { grid: 4, count: 7, showMs: 2400 },
    { grid: 5, count: 6, showMs: 2600 },
    { grid: 5, count: 7, showMs: 2400 },
    { grid: 5, count: 8, showMs: 2200 },
  ];
  return table[Math.min(Math.max(level, 1), table.length) - 1] ?? table[0];
}

function pickRandomUnique(maxCell: number, count: number): Set<number> {
  const indices = Array.from({ length: maxCell }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, count));
}

function setsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

type Phase = "show" | "recall" | "feedback";

function VisualBoard({
  freezeSession,
  introTour,
}: Pick<GameSessionApi, "freezeSession"> & { introTour: boolean }) {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [nonce, setNonce] = useState(0);
  const [pattern, setPattern] = useState<Set<number>>(() => pickRandomUnique(9, 3));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<Phase>("show");
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [won, setWon] = useState(false);
  const [dead, setDead] = useState(false);
  const [reward, setReward] = useState<{ bonus: number; total: number } | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const startNewRound = useCallback(() => {
    const cfg = getLevelConfig(level);
    const total = cfg.grid * cfg.grid;
    setPattern(pickRandomUnique(total, Math.min(cfg.count, total)));
    setSelected(new Set());
    setPhase("show");
    setFeedbackOk(null);
  }, [level]);

  useEffect(() => {
    startNewRound();
    return () => clearTimers();
  }, [level, nonce, startNewRound]);

  const cfg = getLevelConfig(level);

  useEffect(() => {
    if (phase !== "show") return;
    clearTimers();
    const id = window.setTimeout(() => setPhase("recall"), cfg.showMs);
    timersRef.current.push(id);
    return () => {
      window.clearTimeout(id);
    };
  }, [phase, cfg.showMs, pattern, level, nonce]);

  const toggleCell = (i: number) => {
    if (phase !== "recall" || dead || won) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < pattern.size) next.add(i);
      return next;
    });
  };

  const submit = () => {
    if (phase !== "recall" || dead || won) return;
    if (selected.size !== pattern.size) return;

    if (setsEqual(selected, pattern)) {
      if (level === WIN_LEVEL) {
        setWon(true);
        freezeSession();
        setReward(completeGame(20));
        return;
      }
      setPhase("feedback");
      setFeedbackOk(true);
      clearTimers();
      const id = window.setTimeout(() => {
        setFeedbackOk(null);
        setLevel((l) => l + 1);
      }, 1400);
      timersRef.current.push(id);
    } else {
      setPhase("feedback");
      setFeedbackOk(false);
      clearTimers();
      const id = window.setTimeout(() => {
        setFeedbackOk(null);
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) {
            setDead(true);
            return 0;
          }
          setNonce((n) => n + 1);
          return nl;
        });
      }, 2000);
      timersRef.current.push(id);
    }
  };

  const cellClass = (i: number): string => {
    const base = "vm-cell";
    const inPat = pattern.has(i);
    const inSel = selected.has(i);

    if (phase === "show" && inPat) return `${base} vm-cell--lit`;
    if (phase === "recall") {
      if (inSel) return `${base} vm-cell--picked`;
      return base;
    }
    if (phase === "feedback" && feedbackOk === true) {
      if (inPat && inSel) return `${base} vm-cell--ok`;
      if (inPat && !inSel) return `${base} vm-cell--miss`;
      if (!inPat && inSel) return `${base} vm-cell--bad`;
      return `${base} vm-cell--dim`;
    }
    if (phase === "feedback" && feedbackOk === false) {
      if (inPat && inSel) return `${base} vm-cell--ok`;
      if (inPat && !inSel) return `${base} vm-cell--miss`;
      if (!inPat && inSel) return `${base} vm-cell--bad`;
      return `${base} vm-cell--dim`;
    }
    return base;
  };

  const phaseLabel =
    phase === "show"
      ? t.vmPhaseMemorize
      : phase === "recall"
        ? t.vmPhaseRecall
        : feedbackOk
          ? t.correct
          : t.vmWrongTiles;

  const canSubmit = phase === "recall" && selected.size === pattern.size && !dead && !won;

  return (
    <>
      <div className="game-hud game-hud--compact vm-hud">
        <span>
          {t.vmLevel}: {level}/{WIN_LEVEL}
        </span>
        <span className="vm-lives" aria-label={t.vmLives}>
          {t.vmLives}: {"❤️".repeat(Math.max(0, lives))}
          {lives <= 0 ? " —" : ""}
        </span>
      </div>
      <p className="game-phase-label">{phaseLabel}</p>
      {phase === "recall" && !dead && !won && (
        <p className="vm-hint muted">
          {t.vmPickExact} {pattern.size} {t.vmSquares} ({t.selectedCount} {selected.size}/
          {pattern.size})
        </p>
      )}
      {won && reward && (
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
        className="vm-grid"
        style={{ gridTemplateColumns: `repeat(${cfg.grid}, 1fr)` }}
        role="grid"
        aria-label={t.visualGame}
      >
        {Array.from({ length: cfg.grid * cfg.grid }, (_, i) => (
          <button
            key={i}
            type="button"
            className={cellClass(i)}
            onClick={() => toggleCell(i)}
            disabled={phase !== "recall" || dead || won}
          />
        ))}
      </div>

      {phase === "recall" && !dead && !won && (
        <div className="game-inner-actions">
          <button type="button" className="btn-primary" disabled={!canSubmit} onClick={submit}>
            {t.vmConfirm}
          </button>
        </div>
      )}

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

export function GameVisualMemory() {
  const introTour = useIntroTourGame();
  return (
    <GameShell
      introTour={introTour}
      iconSrc="/game-icon-visual.png"
      title={t.visualGame}
      howTo={t.visualHowTo}
    >
      {({ freezeSession }) => (
        <VisualBoard freezeSession={freezeSession} introTour={introTour} />
      )}
    </GameShell>
  );
}