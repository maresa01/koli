import { Link, useNavigate } from "react-router-dom";
import { t } from "../lib/strings";
import { KoliMascot } from "../components/KoliGuide";
import { startIntroTour } from "../lib/introTour.ts";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="page welcome welcome-v2">
      <div className="welcome-v2__hero">
        <div className="welcome-v2__mascotWrap" aria-hidden>
          <KoliMascot size="hero" className="welcome-v2__mascot" alt="" />
          <svg
            className="welcome-v2__sparkle welcome-v2__sparkle--teal"
            viewBox="0 0 24 24"
            role="presentation"
            focusable="false"
          >
            <polygon points="12,1 14.5,9.5 23,12 14.5,14.5 12,23 9.5,14.5 1,12 9.5,9.5" />
          </svg>
          <svg
            className="welcome-v2__sparkle welcome-v2__sparkle--gold"
            viewBox="0 0 24 24"
            role="presentation"
            focusable="false"
          >
            <polygon points="12,1 14.5,9.5 23,12 14.5,14.5 12,23 9.5,14.5 1,12 9.5,9.5" />
          </svg>
        </div>
        <h1 className="welcome-v2__title">{t.welcomeTitle}</h1>
        <p className="welcome-v2__subtitle">{t.welcomeSubtitle}</p>
      </div>
      <div className="welcome-v2__actions" aria-label={t.welcomeActionsAria}>
        <Link to="/about" className="btn-primary btn-large">
          {t.meetKoli}
        </Link>
        <button
          type="button"
          className="btn-primary btn-large"
          onClick={() => {
            startIntroTour();
            navigate("/games/reaction?tour=1");
          }}
        >
          {t.tourStartCta}
        </button>
        {/* Գրանցում / մուտք — հանված են ինտերֆեյսից
        <Link to="/register" className="btn-secondary btn-large">
          {t.register}
        </Link>
        <Link to="/login" className="btn-secondary btn-large">
          {t.login}
        </Link>
        */}
      </div>
    </div>
  );
}