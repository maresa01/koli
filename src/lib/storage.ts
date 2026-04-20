export type HomeworkTask = {
  id: string;
  title: string;
  points: number;
  done: boolean;
  createdAt: string;
  /** Focus session length in minutes (parent-set, Joon-style). Default 15 in UI. */
  focusMinutes?: number;
};

const FOCUS_ACTIVE_KEY = "koli-focus-active";
const ELIGIBLE_KEY = "koli-task-focus-eligible";

export type FocusActive = { taskId: string; endTs: number };

export function consumeEndedFocusSession(): void {
  try {
    const raw = localStorage.getItem(FOCUS_ACTIVE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw) as FocusActive;
    if (p.endTs <= Date.now()) {
      addEligibleTaskId(p.taskId);
      localStorage.removeItem(FOCUS_ACTIVE_KEY);
      window.dispatchEvent(new Event("koli-focus-eligible"));
    }
  } catch {
    localStorage.removeItem(FOCUS_ACTIVE_KEY);
  }
}

export function getFocusActive(): FocusActive | null {
  try {
    const raw = localStorage.getItem(FOCUS_ACTIVE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as FocusActive;
    if (p.endTs <= Date.now()) {
      consumeEndedFocusSession();
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function setFocusActive(taskId: string, durationSec: number) {
  const endTs = Date.now() + durationSec * 1000;
  localStorage.setItem(FOCUS_ACTIVE_KEY, JSON.stringify({ taskId, endTs }));
}

export function clearFocusActive() {
  localStorage.removeItem(FOCUS_ACTIVE_KEY);
}

export function getEligibleTaskIds(): Set<string> {
  try {
    const r = localStorage.getItem(ELIGIBLE_KEY);
    return new Set(r ? (JSON.parse(r) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistEligible(s: Set<string>) {
  localStorage.setItem(ELIGIBLE_KEY, JSON.stringify([...s]));
  window.dispatchEvent(new Event("koli-focus-eligible"));
}

export function addEligibleTaskId(id: string) {
  const s = getEligibleTaskIds();
  s.add(id);
  persistEligible(s);
}

export function removeEligibleTaskId(id: string) {
  const s = getEligibleTaskIds();
  s.delete(id);
  persistEligible(s);
}

export type AppState = {
  tasks: HomeworkTask[];
};

const KEY = "koli-app-state-v1";

const emptyState = (): AppState => ({
  tasks: [],
});

/** Holds one snapshot; replaced (new reference) on each update so useSyncExternalStore sees changes. */
let cachedState: AppState | null = null;

function invalidateCache() {
  cachedState = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) invalidateCache();
  });
}

function parseStorage(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map((t) => ({ ...t })) : [],
    };
  } catch {
    return emptyState();
  }
}

function persist(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("koli-storage"));
}

export function getState(): AppState {
  if (!cachedState) {
    cachedState = parseStorage();
  }
  return cachedState;
}

function replaceState(next: AppState) {
  cachedState = next;
  persist(next);
}

export function addTask(title: string, focusMinutes = 15): HomeworkTask {
  const s = getState();
  const fm = Math.min(90, Math.max(5, Math.round(focusMinutes)));
  const task: HomeworkTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    points: 0,
    done: false,
    createdAt: new Date().toISOString(),
    focusMinutes: fm,
  };
  replaceState({ ...s, tasks: [...s.tasks, task] });
  return task;
}

export function toggleTaskDone(id: string) {
  const s = getState();
  const task = s.tasks.find((t) => t.id === id);
  if (!task) return;
  const wasDone = task.done;
  const done = !wasDone;
  if (done && !wasDone && !getEligibleTaskIds().has(id)) {
    return;
  }
  removeEligibleTaskId(id);
  replaceState({
    ...s,
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, done } : t)),
  });
}

export function deleteTask(id: string) {
  const s = getState();
  try {
    const raw = localStorage.getItem(FOCUS_ACTIVE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as FocusActive;
      if (p.taskId === id) localStorage.removeItem(FOCUS_ACTIVE_KEY);
    }
  } catch {
    /* ignore */
  }
  removeEligibleTaskId(id);
  replaceState({
    ...s,
    tasks: s.tasks.filter((t) => t.id !== id),
  });
}
