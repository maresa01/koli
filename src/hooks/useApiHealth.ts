import { useEffect, useState } from "react";
import { fetchApiHealth, getApiOrigin, shouldShowApiStatus } from "../lib/api";

export type ApiHealthState =
  | { status: "idle" | "checking" }
  | { status: "ok"; service?: string }
  | { status: "offline" };

/**
 * Optional connectivity check when API base is configured or same-origin /api is expected.
 */
export function useApiHealth(enabled: boolean): ApiHealthState {
  const [state, setState] = useState<ApiHealthState>(() =>
    enabled ? { status: "checking" } : { status: "idle" }
  );

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle" });
      return;
    }
    const ac = new AbortController();
    setState({ status: "checking" });
    fetchApiHealth(ac.signal).then((h) => {
      if (ac.signal.aborted) return;
      setState(h.ok ? { status: "ok", service: h.service } : { status: "offline" });
    });
    return () => ac.abort();
  }, [enabled]);

  return state;
}

export function useShouldPingApi(): boolean {
  if (!shouldShowApiStatus()) return false;
  // Ping when we have an explicit API URL, or in dev (Vite proxy to local API).
  const origin = getApiOrigin();
  return import.meta.env.DEV || origin.length > 0;
}