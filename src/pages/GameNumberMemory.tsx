import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell, type GameSessionApi } from "../components/GameShell";
import { t } from "../lib/strings";
import { completeGame } from "../lib/storage";
import { endIntroTourStep } from "../lib/introTour.ts";
import { useIntroTourGame } from "../hooks/useIntroTourGame";

/** braingameszone-style: start 1 digit, +1 per success; one wrong = game over. */
const WIN_DIGITS = 10;

function randomDigits(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

function NumberBoard({
  freezeSession,
  introTour,
}: Pick<GameSessionApi, "freezeSession"> & { introTour: boolean }) {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState("");
  const [visible, setVisible] = useState(true);
  const [input, setInput] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [reward, setReward] = useState<{ bonus: number; total: number } | null>(null);

  const showMs = Math.min(4500, 650 + level * 420);

  useEffect(() => {
    if (won || gameOver) return;
    const d = randomDigits(level);
    setTarget(d);
    setInput("");
    setVisible(true);
    const hide = window.setTimeout(() => setVisible(false), showMs);
    return () => clearTimeout(hide);
  }, [level, won, gameOver, showMs]);

  const appendDigit = (d: string) => {
    if (visible || won || gameOver) return;
    if (input.length < level) setInput((x) => x + d);
  };

  const backspace = () => {
    if (visible || won || gameOver) return;
    setInput((x) => x.slice(0, -1));
  };

  const submit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (visible || won || gameOver) return;
    if (input.length !== level) return;
    if (input === target) {
      if (level >= WIN_DIGITS) {
        setWon(true);
        freezeSession();
        setReward(completeGame(22));
      } else {
        setLevel((l) => l + 1);
      }
    } else {
      setGameOver(true);
      const ok = Math.max(0, level - 1);
      const partial = ok <= 0 ? 3 : Math.min(16, 5 + ok * 2);
      setReward(completeGame(partial));
    }
  };

  const canSubmit = !visible && !won && !gameOver && input.length === level;

  return (
    <>
      <div className="game-hud game-hud--compact num-bgz-hud">
        <span>
          {t.numDigitsLabel}: {Math.min(level, WIN_DIGITS)}/{WIN_DIGITS}
        </span>
      </div>
      <p className="game-phase-label">
        {won && t.done}
        {gameOver && (
          <>
            {t.gameOver}
            <span className="num-bgz-sub muted">
              {" "}
              · {t.numLastOk}: {Math.max(0, level - 1)}
            </span>
          </>
        )}
        {!won && !gameOver && visible && t.watch}
        {!won && !gameOver && !visible && t.enterNumber}
      </p>
      <div className="number-display num-bgz-display">
        {visible ? (
          <span className="number-display__big num-bgz-digits">{target}</span>
        ) : (
          <span className="number-display__hint">{t.enterNumber}</span>
        )}
      </div>
      {reward && (
        <div className="toast-win" role="status">
          {t.earned} {reward.total} {t.points}
          {reward.bonus > 0 && (
            <span className="muted"> ({reward.bonus}՝ օրվա բոնուս)</span>
          )}
        </div>
      )}
      <form onSubmit={submit} className="number-form">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="number-input"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, level))}
          disabled={visible || won || gameOver}
          autoComplete="off"
          aria-label={t.enterNumber}
        />
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {t.submit}
        </button>
      </form>
      <p className="muted center num-bgz-numpad-hint">{t.numNumpadHint}</p>
      <div className="num-bgz-numpad" aria-hidden={visible || won || gameOver}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            className="num-bgz-key"
            disabled={visible || won || gameOver}
            onClick={() => appendDigit(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="num-bgz-key num-bgz-key--wide"
          disabled={visible || won || gameOver}
          onClick={() => appendDigit("0")}
        >
          0
        </button>
        <button
          type="button"
          className="num-bgz-key num-bgz-key--accent"
          disabled={visible || won || gameOver || !input.length}
          onClick={backspace}
        >
          ⌫
        </button>
      </div>
      {(won || gameOver) && (
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

export function GameNumberMemory() {
  const introTour = useIntroTourGame();
  return (
    <GameShell
      introTour={introTour}
      iconSrc="/game-icon-number.png"
      title={t.numberGame}
      howTo={t.numberHowTo}
    >
      {({ freezeSession }) => (
        <NumberBoard freezeSession={freezeSession} introTour={introTour} />
      )}
    </GameShell>
  );
}