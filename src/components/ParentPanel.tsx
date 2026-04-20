import { useState } from "react";
import { t } from "../lib/strings";
import { addTask, deleteTask } from "../lib/storage";
import { useAppState } from "../hooks/useAppState";

type Props = { onClose: () => void };

export function ParentPanel({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [focusMinutes, setFocusMinutes] = useState(15);
  const { tasks } = useAppState();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, focusMinutes);
    setTitle("");
    setFocusMinutes(15);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal aria-labelledby="parent-title">
      <div className="modal-card">
        <div className="modal-card__head">
          <h2 id="parent-title" className="modal-card__h">
            {t.parentTitle}
          </h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            {t.close}
          </button>
        </div>
        <p className="modal-card__hint">{t.parentHint}</p>
        <form onSubmit={handleAdd} className="parent-form">
          <label className="field">
            <span>{t.taskTitle}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Օրինակ՝ մաթեմատիկա, էջ 12"
              autoComplete="off"
            />
          </label>
          <label className="field">
            <span>{t.taskFocusMinutes}</span>
            <input
              type="number"
              min={5}
              max={90}
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              aria-describedby="focus-minutes-hint"
            />
            <span id="focus-minutes-hint" className="field__hint muted">
              {t.taskFocusMinutesHint}
            </span>
          </label>
          <button type="submit" className="btn-primary btn-block">
            {t.addTask}
          </button>
        </form>
        <ul className="parent-task-list">
          {tasks
            .slice()
            .reverse()
            .map((task) => (
              <li key={task.id} className="parent-task-row">
                <div>
                  <strong>{task.title}</strong>
                  <span className="muted">
                    {" "}
                    — {task.focusMinutes ?? 15} րոպե
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-danger-soft"
                  onClick={() => deleteTask(task.id)}
                >
                  ✕
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
