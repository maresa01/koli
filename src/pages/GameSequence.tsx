import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell, type GameSessionApi } from "../components/GameShell";
import { t } from "../lib/strings";
import { completeGame } from "../lib/storage";
import { endIntroTourStep } from "../lib/introTour";
import { useIntroTourGame } from "../hooks/useIntroTourGame";

/** braingameszone-style Simon: 4 tiles, sequence grows by 1 each level. */
const TILES = 4;
const WIN_LEVEL = 12;

const TILE_STYLES = [
  { base: "#c0392b", flash: "#ff7675", aria: () => t.seqColorRed },
  { base: "#2980b9", flash: "#74b9ff", aria: () => t.seqColorBlue },
  { base: "#f39c12", flash: "#fdcb6e", aria: () => t.seqColorYellow },
  { base: "#27ae60", flash: "#55efc4", aria: () => t.seqColorGreen },
] as const;

function SequenceBoard({
  freezeSession,
  introTour,
}: Pick<GameSessionApi, "freezeSession"> & { introTour: boolean }) {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<"watch" | "play">("watch");
  const [playerIdx, setPlayerIdx] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [reward, setReward] = useState<{ bonus: number; total: number } | null>(null);

  const seqGenRef = useRef(0);

  useEffect(() => {
    if (won || gameOver) return;
    const gen = ++seqGenRef.current;
    const seq = Array.from({ length: level }, () => Math.floor(Math.random() * TILES));
    setSequence(seq);
    setPlayerIdx(0);
    setPhase("watch");
    setActive(null);

    const playNext = (i: number) => {
      if (seqGenRef.current !== gen) return;
      if (i >= seq.length) {
        setPhase("play");
        setActive(null);
        return;
      }
      setActive(seq[i]);
      window.setTimeout(() => {
        if (seqGenRef.current !== gen) return;
        setActive(null);
        window.setTimeout(() => playNext(i + 1), 300);
      }, 580);
    };

    const t0 = window.setTimeout(() => playNext(0), 500);
    return () => {
      window.clearTimeout(t0);
      seqGenRef.current++;
    };
  }, [level, won, gameOver]);

  const onTile = (idx: number) => {
    if (phase !== "play" || won || gameOver) return;
    const want = sequence[playerIdx];
    if (idx !== want) {
      setGameOver(true);
      const partial = Math.min(16, 4 + Math.max(0, level - 1) * 2);
      setReward(completeGame(partial));
      return;
    }
    const next = playerIdx + 1;
    if (next >= sequence.length) {
      if (level >= WIN_LEVEL) {
        setWon(true);
        freezeSession();
        setReward(completeGame(22));
      } else {
        setLevel((l) => l + 1);
      }
    } else {
      setPlayerIdx(next);
    }
  };

  return (
    <>
      <div className="game-hud game-hud--compact seq-bgz-hud">
        <span>
          {t.level}: {Math.min(level, WIN_LEVEL)}/{WIN_LEVEL}
        </span>
        <span className="muted">
          {t.seqStepsThisLevel}: {sequence.length || level}
        </span>
      </div>
      <p className="game-phase-label">
        {gameOver && t.gameOver}
        {won && t.done}
        {!gameOver && !won && phase === "watch" && t.seqWatch}
        {!gameOver && !won && phase === "play" && t.seqRepeat}
      </p>
      {reward && (
        <div className="toast-win" role="status">
          {t.earned} {reward.total} {t.points}
          {reward.bonus > 0 && (
            <span className="muted"> ({reward.bonus}՝ օրվա բոնուս)</span>
          )}
        </div>
      )}
      <p className="seq-bgz-caption muted">{t.seqTiles}</p>
      <div className="seq-bgz-grid" role="group" aria-label={t.sequenceGame}>
        {TILE_STYLES.map((tile, i) => {
          const lit = active === i;
          return (
            <button
              key={i}
              type="button"
              className={`seq-bgz-tile ${lit ? "seq-bgz-tile--lit" : ""}`}
              style={{
                background: lit ? tile.flash : tile.base,
                boxShadow: lit ? `0 0 24px ${tile.flash}` : undefined,
              }}
              aria-label={tile.aria()}
              onClick={() => onTile(i)}
              disabled={phase !== "play" || won || gameOver}
            />
          );
        })}
      </div>
      {(gameOver || won) && (
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

export function GameSequence() {
  const introTour = useIntroTourGame();
  return (
    <GameShell
      introTour={introTour}
      iconSrc="/game-icon-sequence.png"
      title={t.sequenceGame}
      howTo={t.sequenceHowTo}
    >
      {({ freezeSession }) => (
        <SequenceBoard freezeSession={freezeSession} introTour={introTour} />
      )}
    </GameShell>
  );
}