import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell, type GameSessionApi } from "../components/GameShell";
import { t } from "../lib/strings";
import { endIntroTourStep } from "../lib/introTour.ts";
import { useIntroTourGame } from "../hooks/useIntroTourGame";

/** braingameszone-style Simon: 4 tiles, sequence grows by 1 each level. */
const TILES = 4;
const WIN_LEVEL = 12;

const TILE_ARIA = [
  () => t.seqColorRed,
  () => t.seqColorBlue,
  () => t.seqColorYellow,
  () => t.seqColorGreen,
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
        window.setTimeout(() => playNext(i + 1), 360);
      }, 720);
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
      return;
    }
    const next = playerIdx + 1;
    if (next >= sequence.length) {
      if (level >= WIN_LEVEL) {
        setWon(true);
        freezeSession();
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
      <p className="seq-bgz-caption muted">{t.seqTiles}</p>
      <div className="seq-bgz-grid" role="group" aria-label={t.sequenceGame}>
        {Array.from({ length: TILES }, (_, i) => {
          const lit = active === i;
          return (
            <button
              key={i}
              type="button"
              className={`seq-bgz-tile seq-bgz-tile--${i} ${lit ? "seq-bgz-tile--lit" : ""}`}
              aria-label={TILE_ARIA[i]()}
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