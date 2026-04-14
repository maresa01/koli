import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { t } from "../lib/strings";
import { clearSession, registerChild } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";

export function Register() {
  const session = useAuth();
  const nav = useNavigate();
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState<number>(8);
  const [parentEmail, setParentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => {
    return (
      busy ||
      childName.trim().length < 2 ||
      !Number.isFinite(childAge) ||
      childAge < 3 ||
      childAge > 18 ||
      parentEmail.trim().length < 4 ||
      password.length < 6
    );
  }, [busy, childName, childAge, parentEmail, password]);

  if (session) {
    return (
      <div className="page auth-page">
        <h1 className="auth-page__title">{t.registerTitle}</h1>
        <p className="auth-page__sub">{t.alreadyLoggedIn}</p>
        <div className="auth-page__links">
          <button
            type="button"
            className="btn-secondary btn-large"
            onClick={() => {
              clearSession();
              nav("/register", { replace: true });
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
      const res = await registerChild({
        childName,
        childAge,
        parentEmail,
        password,
      });
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
      <h1 className="auth-page__title">{t.registerTitle}</h1>
      <p className="auth-page__sub">{t.registerSubtitle}</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field">
          {t.childName}
          <input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            autoComplete="nickname"
            placeholder={t.childNamePh}
          />
        </label>

        <label className="field">
          {t.childAge}
          <input
            type="number"
            value={childAge}
            onChange={(e) => setChildAge(Number(e.target.value))}
            min={3}
            max={18}
            inputMode="numeric"
          />
        </label>

        <label className="field">
          {t.parentEmail}
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            autoComplete="email"
            placeholder="parent@example.com"
          />
          <span className="field__hint">{t.parentEmailHint}</span>
        </label>

        <label className="field">
          {t.password}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={t.passwordPh}
          />
          <span className="field__hint">{t.passwordHint}</span>
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button
          type="submit"
          className="btn-primary btn-large btn-block"
          disabled={disabled}
        >
          {busy ? t.saving : t.registerCta}
        </button>
      </form>

      <div className="auth-page__links">
        <Link to="/login" className="btn-ghost btn-small">
          {t.haveAccount}
        </Link>
        <Link to="/" className="btn-ghost btn-small">
          ← {t.back}
        </Link>
      </div>
    </div>
  );
}