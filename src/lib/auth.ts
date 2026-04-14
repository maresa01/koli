/**
 * Սեսիա (տեղային) — մնում է ակտիվ։
 *
 * Գրանցում / մուտքի ձևերն ու `registerChild` / `login` տրամաբանությունը հանվել են ինտերֆեյսից։
 * Նախկին կոդը պահել git պատմության մեջ՝ անհրաժեշտության դեպքում վերականգնելու համար։
 */
export type AuthSession = {
  parentEmail: string;
  createdAt: string;
};

const SESSION_KEY = "koli-session-v1";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getCurrentSession(): AuthSession | null {
  const s = safeJsonParse<AuthSession>(localStorage.getItem(SESSION_KEY));
  if (!s || typeof s.parentEmail !== "string") return null;
  return { parentEmail: normalizeEmail(s.parentEmail), createdAt: s.createdAt ?? "" };
}

export function setSession(parentEmail: string) {
  const session: AuthSession = {
    parentEmail: normalizeEmail(parentEmail),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("koli-auth"));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("koli-auth"));
}
