import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { t } from "../lib/strings";
import { clearSession, login } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const session = useAuth();
  const nav = useNavigate();
  const [parentEmail, setParentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => {
    return busy || parentEmail.trim().length < 4 || password.length < 1;
  }, [busy, parentEmail, password]);

  if (session) {
    return (
      <div className="page auth-page">
        <h1 className="auth-page__title">{t.loginTitle}</h1>
        <p className="auth-page__sub">{t.alreadyLoggedIn}</p>
        <div className="auth-page__links">
          <button
            type="button"
            className="btn-secondary btn-large"
            onClick={() => {
              clearSession();
              nav("/login", { replace: true });
            }}
          >
            {t.logout}
          </button>
          <Link to="/" className="btn-ghost btn-small">
            ← {t.back}
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await login({ parentEmail, password });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      nav("/", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth-page">
      <h1 className="auth-page__title">{t.loginTitle}</h1>
      <p className="auth-page__sub">{t.loginSubtitle}</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field">
          {t.parentEmail}
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            autoComplete="email"
            placeholder="parent@example.com"
          />
        </label>

        <label className="field">
          {t.password}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder={t.passwordPh}
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button
          type="submit"
          className="btn-primary btn-large btn-block"
          disabled={disabled}
        >
          {busy ? t.checking : t.loginCta}
        </button>
      </form>

      <div className="auth-page__links">
        <Link to="/register" className="btn-ghost btn-small">
          {t.noAccount}
        </Link>
        <Link to="/" className="btn-ghost btn-small">
          ← {t.back}
        </Link>
      </div>
    </div>
  );
}
