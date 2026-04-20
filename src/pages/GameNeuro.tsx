import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import { t } from "../lib/strings";

const STEPS = [
  { src: "/neuro-1.png", alt: t.neuroStepAlt1 },
  { src: "/neuro-2.png", alt: t.neuroStepAlt2 },
  { src: "/neuro-3.png", alt: t.neuroStepAlt3 },
  { src: "/neuro-4.png", alt: t.neuroStepAlt4 },
] as const;

const REPEAT_EACH = 6;
const STEP_MS = 3000;

export function GameNeuro() {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number>(0);

  const sequence = useMemo(
    () =>
      Array.from({ length: REPEAT_EACH })
        .flatMap(() => [...STEPS])
        .map((s) => s),
    []
  );

  const step = sequence[Math.min(idx, sequence.length - 1)];
  const stepLabel = useMemo(() => `${idx + 1}/${sequence.length}`, [idx, sequence.length]);

  useEffect(() => {
    if (done) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIdx((i) => {
        const ni = i + 1;
        if (ni >= sequence.length) {
          setDone(true);
          return i;
        }
        return ni;
      });
    }, STEP_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };
  }, [idx, done, sequence.length]);

  return (
    <GameShell iconSrc="/neuro-1.png" title={t.neuroGame} howTo={t.neuroHowTo} demoKind="neuro">
      {() => (
        <div className="neuro-page">
          <div className="neuro-hud" aria-live="polite">
            <span className="neuro-hud__label">{t.neuroStep}</span>
            <strong className="neuro-hud__count">{stepLabel}</strong>
          </div>
          <div className="neuro-card" role="region" aria-label={t.neuroGame}>
            {!done ? (
              <img className="neuro-img" src={step.src} alt={step.alt} decoding="async" />
            ) : (
              <div className="neuro-done">
                <p className="neuro-done__h">{t.neuroDone}</p>
                <button
                  type="button"
                  className="btn-primary btn-large"
                  onClick={() => {
                    setDone(false);
                    setIdx(0);
                  }}
                >
                  {t.restart}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}
