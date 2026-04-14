
export type RegisteredChild = {
  childName: string;
  childAge: number;
  parentEmail: string;
  passwordHashHex: string;
  createdAt: string;
};

export type AuthSession = {
  parentEmail: string;
  createdAt: string;
};

const USERS_KEY = "koli-users-v1";
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

export function getUsers(): RegisteredChild[] {
  const parsed = safeJsonParse<RegisteredChild[]>(localStorage.getItem(USERS_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

function persistUsers(users: RegisteredChild[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event("koli-auth"));
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

function toHex(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

export async function hashPassword(password: string) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function registerChild(input: {
  childName: string;
  childAge: number;
  parentEmail: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const childName = input.childName.trim();
  const childAge = Math.round(input.childAge);
  const parentEmail = normalizeEmail(input.parentEmail);
  const password = input.password;

  if (childName.length < 2) return { ok: false, message: "Գրիր երեխայի անունը" };
  if (!Number.isFinite(childAge) || childAge < 3 || childAge > 18)
    return { ok: false, message: "Տարիքը պետք է լինի 3–18" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail))
    return { ok: false, message: "Էլ‑հասցեն սխալ է" };
  if (password.length < 6) return { ok: false, message: "Գաղտնաբառը նվազագույնը 6 նիշ" };

  const users = getUsers();
  if (users.some((u) => normalizeEmail(u.parentEmail) === parentEmail)) {
    return { ok: false, message: "Այս էլ‑հասցեով արդեն կա գրանցում" };
  }

  const passwordHashHex = await hashPassword(password);
  const next: RegisteredChild = {
    childName,
    childAge,
    parentEmail,
    passwordHashHex,
    createdAt: new Date().toISOString(),
  };
  persistUsers([...users, next]);
  setSession(parentEmail);
  return { ok: true };
}

export async function login(input: {
  parentEmail: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const parentEmail = normalizeEmail(input.parentEmail);
  const password = input.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail))
    return { ok: false, message: "Էլ‑հասցեն սխալ է" };
  if (!password) return { ok: false, message: "Գաղտնաբառը պարտադիր է" };

  const users = getUsers();
  const u = users.find((x) => normalizeEmail(x.parentEmail) === parentEmail);
  if (!u) return { ok: false, message: "Գրանցում չի գտնվել" };

  const passwordHashHex = await hashPassword(password);
  if (passwordHashHex !== u.passwordHashHex) {
    return { ok: false, message: "Սխալ գաղտնաբառ" };
  }

  setSession(parentEmail);
  return { ok: true };
}
