import { Link, useNavigate } from "react-router-dom";
import { t } from "../lib/strings";
import { KoliMascot } from "../components/KoliGuide";
import { startIntroTour } from "../lib/introTour";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="page welcome welcome-v2">
      <div className="welcome-v2__hero">
        <KoliMascot size="hero" className="welcome-v2__mascot" alt="" />
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
        <Link to="/register" className="btn-secondary btn-large">
          {t.register}
        </Link>
        <Link to="/login" className="btn-secondary btn-large">
          {t.login}
        </Link>
      </div>
    </div>
  );
}