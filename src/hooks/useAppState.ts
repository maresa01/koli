import { useSyncExternalStore } from "react";
import { getState, type AppState } from "../lib/storage";

function subscribe(cb: () => void) {
  const on = () => cb();
  window.addEventListener("koli-storage", on);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "koli-app-state-v1") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("koli-storage", on);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): AppState {
  return getState();
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
