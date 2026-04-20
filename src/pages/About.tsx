import { Link, useSearchParams } from "react-router-dom";
import { t } from "../lib/strings";
import { getIntroCoins } from "../lib/introTour.ts";

export function About() {
  const [sp] = useSearchParams();
  const tourDone = sp.get("tourDone") === "1";
  const coins = getIntroCoins();

  if (tourDone) {
    return (
      <div className="page about-page">
        <div className="about-tour-done" role="status">
          <div className="celebrate" aria-hidden>
            <span className="celebrate__spark celebrate__spark--1" />
            <span className="celebrate__spark celebrate__spark--2" />
            <span className="celebrate__spark celebrate__spark--3" />
            <span className="celebrate__spark celebrate__spark--4" />
          </div>
          <p className="about-tour-done__title">{t.tourDoneTitle}</p>
          <p className="about-tour-done__congrats">{t.tourCongrats}</p>
          <p className="about-tour-done__coinsLabel">{t.tourDoneCoins}</p>
          <div className="about-tour-done__coinRow about-tour-done__coinRow--big" aria-label={`${coins}`}>
            <strong>{coins}</strong>
            <span className="about-tour-done__coinIconWrap" aria-hidden>
              <img className="about-tour-done__coinIcon" src="/koli-coin.png" alt="" />
            </span>
          </div>
          <p className="about-tour-done__ask">{t.tourAskFocus}</p>
          <div className="about-tour-done__actions">
            <Link to="/focus?from=tour" className="btn-primary btn-large">
              {t.focus15Cta}
            </Link>
            <Link to="/" className="btn-secondary btn-large">
              {t.home}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page about-page">
      <h1 className="about-page__title">{t.aboutTitle}</h1>

      <div className="about-hero" aria-label={t.aboutTitle}>
        <div className="about-hero__imgWrap" aria-hidden>
          <img
            className="about-hero__child"
            src="/koli-about-child.png"
            alt=""
            decoding="async"
            loading="lazy"
          />
        </div>
        <div className="about-hero__koli" aria-hidden>
          <div className="about-hero__badgeWrap">
            <img
              className="about-hero__badgeIcon"
              src="/koli-coin.png"
              alt=""
              decoding="async"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="about-card">
        <p className="about-card__text">
          Ես Կոլին եմ՝ քո կրթական օգնականը։ Ես այստեղ եմ, որպեսզի
          միասին ավելի ուրախ և զվարճալի կատարենք մեր տնային առաջադրանքները։
          Սա ուղղակի հարթակ չէ․ այստեղ իմ տված ամեն առաջադրանքի
          հաջողման դեպքում դու կստանաս «Կոլի մետաղադրամ», որը հետագայում 
          կկարողանաս օգտագործել։ Սկզբում ես ու դու կխաղանք
          ու կմարզենք մեր ուղեղը։ Իսկ այ խաղերից հետո դու ունես շատ կարևոր
          առաջադրանք քո ընկեր Կոլիի կողմից։ Դու պետք է կարողանաս 15 րոպե
          կենտրոնացած ժամանակ տրամադրել քո տնային հանձնարարություններին, քանի որ
          հենց այդ ժամանակ դու կստանաս օրվա ամենաշատ մետաղադրամները։ Դե ինչ, եթե
          պատրաստ ես, սկսենք։
        </p>
      </div>

      <div className="about-page__actions about-page__actions--split">
        <Link to="/" className="btn-secondary btn-large">
          {t.home}
        </Link>
      </div>
    </div>
  );
}