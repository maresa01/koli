
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell, type GameSessionApi } from "../components/GameShell";
import { t } from "../lib/strings";
import { endIntroTourStep } from "../lib/introTour";
import { useIntroTourGame } from "../hooks/useIntroTourGame";

type ColorId = "red" | "blue" | "yellow" | "green";

const COLORS: { id: ColorId; hex: string; label: () => string }[] = [
  { id: "red", hex: "#c0392b", label: () => t.seqColorRed },
  { id: "blue", hex: "#2980b9", label: () => t.seqColorBlue },
  { id: "yellow", hex: "#f39c12", label: () => t.seqColorYellow },
  { id: "green", hex: "#27ae60", label: () => t.seqColorGreen },
];

const ROUNDS = 30;

type Trial = {
  word: ColorId;
  ink: ColorId;
};

function randomColorId(): ColorId {
  const i = Math.floor(Math.random() * COLORS.length);
  return COLORS[i]!.id;
}

function makeTrial(): Trial {
  const word = randomColorId();
  const ink = randomColorId();
  return { word, ink };
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function StroopBoard({
  freezeSession,
  introTour,
}: Pick<GameSessionApi, "freezeSession"> & { introTour: boolean }) {
  const navigate = useNavigate();
  const [roundIdx, setRoundIdx] = useState(0);
  const [trial, setTrial] = useState<Trial>(() => makeTrial());
  const [t0, setT0] = useState<number>(() => performance.now());
  const [times, setTimes] = useState<number[]>([]);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const completedRef = useRef(false);

  const wordLabel = useMemo(() => {
    const c = COLORS.find((x) => x.id === trial.word);
    return c ? c.label() : "";
  }, [trial.word]);

  const inkHex = useMemo(() => COLORS.find((x) => x.id === trial.ink)?.hex ?? "#111", [trial.ink]);

  const progress = useMemo(
    () => `${Math.min(roundIdx + 1, ROUNDS)}/${ROUNDS}`,
    [roundIdx]
  );

  const accuracy = useMemo(() => (roundIdx > 0 ? Math.round((correct / roundIdx) * 100) : 0), [
    correct,
    roundIdx,
  ]);

  const scoreMs = useMemo(() => avg(times), [times]);

  useEffect(() => {
    if (!done) return;
    if (completedRef.current) return;
    completedRef.current = true;

    freezeSession();
  }, [accuracy, correct, done, freezeSession, scoreMs]);

  const pick = (picked: ColorId) => {
    if (done) return;
    const ms = Math.max(0, Math.round(performance.now() - t0));
    setTimes((x) => [...x, ms]);
    setCorrect((c) => c + (picked === trial.ink ? 1 : 0));

    const nextIdx = roundIdx + 1;
    if (nextIdx >= ROUNDS) {
      setRoundIdx(nextIdx);
      setDone(true);
      return;
    }

    setRoundIdx(nextIdx);
    setTrial(makeTrial());
    setT0(performance.now());
  };

  const restart = () => {
    completedRef.current = false;
    setRoundIdx(0);
    setTrial(makeTrial());
    setT0(performance.now());
    setTimes([]);
    setCorrect(0);
    setDone(false);
  };

  return (
    <div className="game-inner stroop-bgz">
      <div className="hud-row stroop-bgz-hud" aria-live="polite">
        <span className="pill">
          {t.stroopRound}: <strong>{progress}</strong>
        </span>
        <span className="pill">
          {t.stroopAccuracy}: <strong>{accuracy}%</strong>
        </span>
      </div>

      {!done ? (
        <>
          <p className="stroop-bgz-caption">{t.stroopCaption}</p>
          <div className="stroop-bgz-card" role="region" aria-label={t.stroopGame}>
            <div className="stroop-bgz-word" style={{ color: inkHex }}>
              {wordLabel}
            </div>
          </div>
          <div className="stroop-bgz-grid" role="group" aria-label={t.stroopPickColorAria}>
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className="stroop-bgz-btn"
                style={{ background: c.hex }}
                onClick={() => pick(c.id)}
              >
                {c.label()}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="done-card">
          <p className="done-title">{t.stroopDoneTitle}</p>
          <p className="done-sub">
            {t.stroopYourScore}:{" "}
            <strong>
              {scoreMs !== null ? `${scoreMs} ${t.reactionMs}` : t.stroopNoScore}
            </strong>
          </p>
          <p className="done-sub">
            {t.stroopAccuracy}: <strong>{accuracy}%</strong> · {t.stroopCorrect}:{" "}
            <strong>
              {correct}/{ROUNDS}
            </strong>
          </p>
          <div className="game-inner-actions">
            {introTour ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => endIntroTourStep(correct >= 24, navigate)}
              >
                {t.tourNextGame}
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={restart}>
                {t.playAgain}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GameStroop() {
  const introTour = useIntroTourGame();
  return (
    <GameShell
      iconSrc="/game-icon-stroop.svg"
      title={t.stroopGame}
      howTo={t.stroopHowTo}
      introTour={introTour}
    >
      {({ freezeSession }) => <StroopBoard freezeSession={freezeSession} introTour={introTour} />}
    </GameShell>
  );
}
