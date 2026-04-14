/**
 * Public API base for beta / production. Empty string = same-origin /api/*
 * (Vite dev proxy or a reverse proxy in front of the app + API).
 *
 * Secrets and real access control belong on the server only; see SERVER_BOUNDARIES.md.
 */
export function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/\/$/, "");
}

export function shouldShowApiStatus(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_SHOW_API_STATUS === "1";
}

export type ApiHealth = {
  ok: boolean;
  service?: string;
  ts?: string;
};

export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false };
  }
  const origin = getApiOrigin();
  const url = origin ? `${origin}/api/health` : "/api/health";
  try {
    const res = await fetch(url, {
      method: "GET",
      signal,
      credentials: "omit",
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as ApiHealth;
    return { ok: !!data.ok, service: data.service, ts: data.ts };
  } catch {
    return { ok: false };
  }
}
