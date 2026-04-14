import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { t } from "../lib/strings";
import { KoliGuide } from "../components/KoliGuide";
import { TaskFocusTimer } from "../components/TaskFocusTimer";
import {
  clearFocusActive,
  consumeEndedFocusSession,
  getEligibleTaskIds,
  getFocusActive,
  getState,
  setFocusActive,
  toggleTaskDone,
} from "../lib/storage";
import { useAppState } from "../hooks/useAppState";

export function Tasks() {
  const { tasks } = useAppState();
  const [eligibleTick, setEligibleTick] = useState(0);
  const [focusUi, setFocusUi] = useState<null | { taskId: string; endTs: number; totalSec: number }>(
    () => {
      consumeEndedFocusSession();
      const fa = getFocusActive();
      if (!fa) return null;
      const task = getState().tasks.find((x) => x.id === fa.taskId);
      const totalSec = (task?.focusMinutes ?? 15) * 60;
      return { taskId: fa.taskId, endTs: fa.endTs, totalSec };
    }
  );

  useEffect(() => {
    const fn = () => setEligibleTick((x) => x + 1);
    window.addEventListener("koli-focus-eligible", fn);
    return () => window.removeEventListener("koli-focus-eligible", fn);
  }, []);

  const eligible = useMemo(() => getEligibleTaskIds(), [eligibleTick, tasks]);
  const open = tasks.filter((x) => !x.done);
  const done = tasks.filter((x) => x.done);

  const activeFocusTask = focusUi ? tasks.find((t) => t.id === focusUi.taskId) : undefined;

  const startFocus = useCallback((taskId: string, minutes: number) => {
    setFocusActive(taskId, minutes * 60);
    const fa = getFocusActive();
    if (fa) {
      setFocusUi({ taskId: fa.taskId, endTs: fa.endTs, totalSec: minutes * 60 });
    }
  }, []);

  const cancelFocus = useCallback(() => {
    clearFocusActive();
    setFocusUi(null);
  }, []);

  const onFocusTimerFinished = useCallback(() => {
    setFocusUi(null);
    setEligibleTick((x) => x + 1);
  }, []);

  return (
    <div className="page tasks-page">
      <KoliGuide message={<p className="koli-guide__text">{t.tasksJoonIntro}</p>} />

      {activeFocusTask && focusUi && (
        <TaskFocusTimer
          taskId={focusUi.taskId}
          taskTitle={activeFocusTask.title}
          endTs={focusUi.endTs}
          totalSec={focusUi.totalSec}
          onFinished={onFocusTimerFinished}
          onCancel={cancelFocus}
        />
      )}

      {tasks.length === 0 ? (
        <p className="empty-state">{t.noTasks}</p>
      ) : (
        <>
          {open.length > 0 && (
            <section className="task-section">
              <h2 className="task-section__h">{t.taskQuests}</h2>
              <ul className="task-list">
                {open.map((task) => {
                  const fm = task.focusMinutes ?? 15;
                  const canMark = eligible.has(task.id);
                  const isFocusing = focusUi?.taskId === task.id;
                  return (
                    <li key={task.id} className="task-item task-item--quest">
                      <div className="task-item__main">
                        <span className="task-item__title">{task.title}</span>
                        <div className="task-item__meta">
                          <span className="task-item__pts">+{task.points} {t.points}</span>
                          <span className="task-item__focus muted">
                            ⏱ {fm} րոպե
                          </span>
                        </div>
                        {!canMark && !isFocusing && (
                          <p className="task-item__need-focus muted">{t.taskFocusNeedTimer}</p>
                        )}
                      </div>
                      <div className="task-item__actions">
                        {!isFocusing && (
                          <button
                            type="button"
                            className="btn-primary btn-task-focus"
                            disabled={!!focusUi}
                            onClick={() => startFocus(task.id, fm)}
                          >
                            {t.taskFocusStart}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-mint"
                          disabled={!canMark}
                          onClick={() => toggleTaskDone(task.id)}
                          title={!canMark ? t.taskFocusNeedTimer : undefined}
                        >
                          {t.markDone}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {done.length > 0 && (
            <section className="task-section">
              <h2 className="task-section__h">Ավարտված</h2>
              <ul className="task-list task-list--done">
                {done.map((task) => (
                  <li key={task.id} className="task-item task-item--done">
                    <div>
                      <span className="task-item__title">{task.title}</span>
                      <span className="task-item__pts muted">✓</span>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost btn-small"
                      onClick={() => toggleTaskDone(task.id)}
                    >
                      չեղարկել
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
      <div className="tasks-nav">
        <Link to="/games" className="link-back">
          ← {t.gamesTitle}
        </Link>
        <Link to="/" className="link-back">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
