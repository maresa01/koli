import { Link } from "react-router-dom";
import { t } from "../lib/strings";
import { KoliGuide } from "../components/KoliGuide";

const cards: {
  to: string;
  title: string;
  desc: string;
  color: string;
  icon?: string;
  iconSrc?: string;
}[] = [
  {
    to: "/games/neuro",
    title: t.neuroGame,
    desc: t.neuroDesc,
    iconSrc: "/neuro-1.png",
    color: "card--lilac",
  },
  {
    to: "/games/visual",
    title: t.visualGame,
    desc: t.visualDesc,
    iconSrc: "/game-icon-visual.png",
    color: "card--mint",
  },
  {
    to: "/games/sequence",
    title: t.sequenceGame,
    desc: t.sequenceDesc,
    iconSrc: "/game-icon-sequence.png",
    color: "card--sun",
  },
  {
    to: "/games/number",
    title: t.numberGame,
    desc: t.numberDesc,
    iconSrc: "/game-icon-number.png",
    color: "card--sky",
  },
  {
    to: "/games/reaction",
    title: t.reactionOptional,
    desc: t.reactionCardDesc,
    iconSrc: "/game-icon-reaction.png",
    color: "card--coral",
  },
  {
    to: "/games/stroop",
    title: t.stroopGame,
    desc: t.stroopDesc,
    iconSrc: "/game-icon-stroop.png",
    color: "card--sun",
  },
  {
    to: "/games/schulte",
    title: t.schulteGame,
    desc: t.schulteDesc,
    iconSrc: "/game-icon-schulte.png",
    color: "card--lilac",
  },
];

export function Games() {
  return (
    <div className="page games-page">
      <KoliGuide message={<p className="koli-guide__text">{t.gamesSub}</p>} />
      <div className="game-grid">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className={`game-card ${c.color}`}>
            {c.iconSrc ? (
              <img
                className="game-card__iconImg"
                src={c.iconSrc}
                alt=""
                width={72}
                height={72}
                decoding="async"
              />
            ) : (
              <span className="game-card__icon" aria-hidden>
                {c.icon}
              </span>
            )}
            <span className="game-card__duration">{t.gamesDurationBadge}</span>
            <span className="game-card__title">{c.title}</span>
            <span className="game-card__desc">{c.desc}</span>
          </Link>
        ))}
      </div>
      <Link to="/tasks" className="link-next">
        {t.goTasks} →
      </Link>
    </div>
  );
}