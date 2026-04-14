import { useEffect, useRef, useState } from "react";
import { t } from "../lib/strings";
import { addEligibleTaskId, clearFocusActive } from "../lib/storage";

const R = 52;
const C = 2 * Math.PI * R;

type Props = {
  taskId: string;
  taskTitle: string;
  endTs: number;
  totalSec: number;
  onFinished: () => void;
  onCancel: () => void;
};

function formatMmSs(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TaskFocusTimer({
  taskId,
  taskTitle,
  endTs,
  totalSec,
  onFinished,
  onCancel,
}: Props) {
  const [left, setLeft] = useState(() =>
    Math.max(0, Math.ceil((endTs - Date.now()) / 1000))
  );
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const tick = () => {
      const sec = Math.max(0, Math.ceil((endTs - Date.now()) / 1000));
      setLeft(sec);
      if (sec <= 0 && !firedRef.current) {
        firedRef.current = true;
        clearFocusActive();
        addEligibleTaskId(taskId);
        onFinishedRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [endTs, taskId]);

  const remainingRatio = totalSec > 0 ? Math.min(1, left / totalSec) : 0;
  const strokeDashoffset = C * (1 - remainingRatio);
  const pctDone = Math.round((1 - remainingRatio) * 100);

  return (
    <div className="task-focus-panel">
      <p className="task-focus-panel__label">{t.taskFocusTitle}</p>
      <p className="task-focus-panel__task">{taskTitle}</p>
      <div className="task-focus-ring-wrap" aria-live="polite">
        <svg className="task-focus-ring" viewBox="0 0 120 120" aria-hidden>
          <circle className="task-focus-ring__track" cx="60" cy="60" r={R} />
          <circle
            className="task-focus-ring__bar"
            cx="60"
            cy="60"
            r={R}
            transform="rotate(-90 60 60)"
            style={{
              strokeDasharray: C,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="task-focus-ring__time">{formatMmSs(left)}</div>
      </div>
      <p className="task-focus-panel__hint muted">{t.taskFocusHint}</p>
      <p className="task-focus-panel__pct muted">
        {left > 0 ? `${pctDone}% · ${t.taskFocusProgress}` : t.taskFocusDoneRing}
      </p>
      <button type="button" className="btn-secondary task-focus-panel__cancel" onClick={onCancel}>
        {t.taskFocusCancel}
      </button>
    </div>
  );
}
