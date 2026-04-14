import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { t } from "../lib/strings";
import { addIntroCoins } from "../lib/introTour.ts";

const TOTAL_SEC = 15 * 60;
const BONUS_COINS = 5;

function formatMmSs(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function FocusTimerVisual({
  totalSec,
  secLeft,
}: {
  totalSec: number;
  secLeft: number;
}) {
  const ratio = totalSec > 0 ? Math.min(1, Math.max(0, secLeft / totalSec)) : 0;
  const pctDone = Math.round((1 - ratio) * 100);

  // ring timer (Joon-style, but unlabeled)
  const r = 52;
  const c = 2 * Math.PI * r;
  const dashoffset = c * (1 - ratio);
  return (
    <div className="timer-joon" aria-label={t.focus15Title}>
      <div className="timer-joon__wrap" aria-hidden>
        <svg className="timer-joon__svg" viewBox="0 0 120 120">
          <circle className="timer-joon__track" cx="60" cy="60" r={r} />
          <circle
            className="timer-joon__bar"
            cx="60"
            cy="60"
            r={r}
            transform="rotate(-90 60 60)"
            style={{ strokeDasharray: c, strokeDashoffset: dashoffset }}
          />
        </svg>
        <div className="timer-joon__time">{formatMmSs(secLeft)}</div>
      </div>
      <div className="timer-joon__meta muted">{pctDone}%</div>
    </div>
  );
}

export function Focus15() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const fromTour = sp.get("from") === "tour";

  const [started, setStarted] = useState(false);
  const [secLeft, setSecLeft] = useState(TOTAL_SEC);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!started || done) return;
    if (secLeft <= 0) {
      setDone(true);
      addIntroCoins(BONUS_COINS);
      return;
    }
    const id = window.setInterval(() => {
      setSecLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [started, done, secLeft]);

  const pct = useMemo(() => (secLeft / TOTAL_SEC) * 100, [secLeft]);

  return (
    <div className="page focus15-page">
      <h1 className="focus15__title">{t.focus15Title}</h1>
      <p className="focus15__sub">{t.focus15Sub}</p>

      {!started && !done && (
        <button
          type="button"
          className="btn-primary btn-large btn-block"
          onClick={() => setStarted(true)}
        >
          {t.focus15Start}
        </button>
      )}

      {started && !done && (
        <div className="focus15__timer" aria-live="polite">
          <div className="focus15__timeRow">
            <span>
              {t.timeRemainingShort}: <strong>{formatMmSs(secLeft)}</strong>
            </span>
            <span className="muted">{t.focus15Total}</span>
          </div>
          <div className="focus15__visual">
            <FocusTimerVisual totalSec={TOTAL_SEC} secLeft={secLeft} />
          </div>
          <div
            className="focus15__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL_SEC}
            aria-valuenow={secLeft}
          >
            <div className="focus15__progressFill" style={{ width: `${pct}%` }} />
          </div>
          <p className="focus15__hint">{t.focus15Hint}</p>
          <button
            type="button"
            className="btn-secondary btn-large btn-block"
            onClick={() => {
              setStarted(false);
              setSecLeft(TOTAL_SEC);
              nav(fromTour ? "/about?tourDone=1" : "/", { replace: true });
            }}
          >
            {t.back}
          </button>
        </div>
      )}

      {done && (
        <div className="focus15__done" role="status">
          <div className="celebrate celebrate--small" aria-hidden>
            <span className="celebrate__spark celebrate__spark--1" />
            <span className="celebrate__spark celebrate__spark--2" />
            <span className="celebrate__spark celebrate__spark--3" />
          </div>
          <p className="focus15__doneH">{t.focus15DoneTitle}</p>
          <p className="focus15__doneCoins">
            {t.focus15DoneCoins} <strong>+{BONUS_COINS}</strong>{" "}
            <img className="focus15__coin" src="/koli-coin.png" alt="" width={22} height={22} />
          </p>
          <div className="focus15__doneActions">
            <Link to={fromTour ? "/about?tourDone=1" : "/"} className="btn-primary btn-large">
              {t.home}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}