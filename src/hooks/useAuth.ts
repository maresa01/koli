import { useSyncExternalStore } from "react";
import { getCurrentSession, type AuthSession } from "../lib/auth";

function subscribe(cb: () => void) {
  const on = () => cb();
  window.addEventListener("koli-auth", on);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "koli-users-v1" || e.key === "koli-session-v1") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("koli-auth", on);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): AuthSession | null {
  return getCurrentSession();
}

export function useAuth(): AuthSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}