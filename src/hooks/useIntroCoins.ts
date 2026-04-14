import { useSyncExternalStore } from "react";
import { getIntroCoins } from "../lib/introTour";

function subscribe(cb: () => void) {
  const on = () => cb();
  window.addEventListener("koli-intro-tour", on);
  return () => window.removeEventListener("koli-intro-tour", on);
}

function getSnapshot(): number {
  return getIntroCoins();
}

export function useIntroCoins(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}