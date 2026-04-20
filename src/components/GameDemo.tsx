import { useEffect, useMemo, useState } from "react";
import { t } from "../lib/strings";

// Demo-ի արագությունը կառավարելու համար մեկ գործակից.
// Մեծացրու՝ եթե ուզում ես ավելի դանդաղ անցումներ։
const DEMO_SPEED = 1.35;

export type GameDemoKind =
  | "reaction"
  | "sequence"
  | "visual"
  | "number"
  | "schulte"
  | "stroop"
  | "neuro";

type Props = { kind: GameDemoKind };

function DemoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="game-demo" aria-hidden>
      {children}
    </div>
  );
}

export function GameDemo({ kind }: Props) {
  const frames = useMemo(() => makeFrames(kind).map((f) => ({ ...f, ms: Math.round(f.ms * DEMO_SPEED) })), [kind]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [kind]);

  useEffect(() => {
    if (frames.length <= 1) return;
    const ms = frames[idx]?.ms ?? 900;
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % frames.length), ms);
    return () => window.clearTimeout(id);
  }, [frames, idx]);

  const f = frames[Math.min(idx, frames.length - 1)];
  if (!f) return null;

  return (
    <DemoFrame>
      <div className="demo-stage">{f.render()}</div>
      <div className="demo-caption">{f.caption}</div>
      {frames.length > 1 && (
        <div className="demo-dots" aria-hidden>
          {frames.map((_, i) => (
            <span key={i} className={i === idx ? "demo-dot demo-dot--on" : "demo-dot"} />
          ))}
        </div>
      )}
    </DemoFrame>
  );
}

type DemoFrameDef = { caption: string; ms: number; render: () => React.ReactNode };

function makeFrames(kind: GameDemoKind): DemoFrameDef[] {
  if (kind === "reaction") {
    return [
      {
        caption: "Սեղմիր՝ սկսելու համար",
        ms: 1400,
        render: () => (
          <div className="demo-rt demo-rt--ready">
            <div className="demo-rt__label">{t.reactionClickToStart}</div>
            <div className="demo-rt__tap">{t.reactionDontEarly}</div>
          </div>
        ),
      },
      {
        caption: "Սպասիր կանաչին",
        ms: 1700,
        render: () => (
          <div className="demo-rt demo-rt--wait">
            <div className="demo-rt__label">{t.reactionWaitGreen}</div>
            <div className="demo-rt__tap">{t.reactionDontEarly}</div>
          </div>
        ),
      },
      {
        caption: "Կանաչ է՝ սեղմիր",
        ms: 1400,
        render: () => (
          <div className="demo-rt demo-rt--go">
            <div className="demo-rt__label">{t.reactionNow}</div>
            <div className="demo-rt__tap">{t.tapWhenGreen}</div>
          </div>
        ),
      },
    ];
  }

  if (kind === "sequence") {
    const base = () => (
      <div className="demo-seq-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={["demo-seq-tile", `demo-seq-tile--${i}`].join(" ")} />
        ))}
      </div>
    );
    const lit = (i: number) => (
      <div className="demo-seq-grid">
        {Array.from({ length: 4 }, (_, k) => (
          <div
            key={k}
            className={[
              "demo-seq-tile",
              `demo-seq-tile--${k}`,
              k === i ? "demo-seq-tile--lit" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
    );
    return [
      { caption: "Նայիր", ms: 1100, render: base },
      { caption: "Հիշիր", ms: 850, render: () => lit(0) },
      { caption: "Հիշիր", ms: 850, render: () => lit(1) },
      { caption: "Հիշիր", ms: 850, render: () => lit(2) },
      { caption: "Հիմա դու", ms: 1100, render: base },
      { caption: "Սեղմիր նույնը", ms: 850, render: () => lit(0) },
      { caption: "Սեղմիր նույնը", ms: 850, render: () => lit(1) },
      { caption: "Սեղմիր նույնը", ms: 850, render: () => lit(2) },
    ];
  }

  if (kind === "visual") {
    const grid = (lit: Set<number>) => (
      <div className="demo-vm-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className={`demo-vm-cell ${lit.has(i) ? "demo-vm-cell--lit" : ""}`} />
        ))}
      </div>
    );
    return [
      { caption: "Նայիր ու հիշիր", ms: 1250, render: () => grid(new Set([0, 3, 8])) },
      { caption: "Հիմա սեղմիր", ms: 1250, render: () => grid(new Set()) },
      { caption: "Սեղմիր նույնը ", ms: 1250, render: () => grid(new Set([0])) },
      { caption: "Սեղմիր նույնը ", ms: 1250, render: () => grid(new Set([0, 3])) },
      { caption: "Ապրես", ms: 1250, render: () => grid(new Set([0, 3, 8])) },
    ];
  }

  if (kind === "number") {
    return [
      {
        caption: "Հիշիր թիվը",
        ms: 1400,
        render: () => (
          <div className="demo-num">
            <div className="demo-num__screen">4827</div>
            <div className="demo-num__hint">{t.watch}</div>
          </div>
        ),
      },
      {
        caption: "Գրիր նույն թիվը",
        ms: 1400,
        render: () => (
          <div className="demo-num">
            <div className="demo-num__screen">••••</div>
            <div className="demo-num__hint">{t.enterNumber}</div>
          </div>
        ),
      },
      {
        caption: "Հաստատի՛ր",
        ms: 1400,
        render: () => (
          <div className="demo-num">
            <div className="demo-num__screen">4827</div>
            <div className="demo-num__hint">{t.submit}</div>
          </div>
        ),
      },
    ];
  }

  if (kind === "schulte") {
    const grid = (n: number) => (
      <div className="demo-schulte-grid">
        {Array.from({ length: 9 }, (_, i) => {
          const v = i + 1;
          return (
            <div
              key={v}
              className={`demo-schulte-cell ${v === n ? "demo-schulte-cell--next" : ""}`}
            >
              {v}
            </div>
          );
        })}
      </div>
    );
    return [
      { caption: "Գտիր 1-ը", ms: 1100, render: () => grid(1) },
      { caption: "Հետո՝ 2-ը", ms: 1100, render: () => grid(2) },
      { caption: "Հետո՝ 3-ը", ms: 1100, render: () => grid(3) },
    ];
  }

  if (kind === "stroop") {
    const items = [
      { word: t.seqColorRed, color: "#2980b9" },
      { word: t.seqColorBlue, color: "#27ae60" },
      { word: t.seqColorYellow, color: "#c0392b" },
    ];
    const card = (idx: number) => {
      const it = items[idx]!;
      return (
        <div className="demo-stroop">
          <div className="demo-stroop__card">
            <span className="demo-stroop__word" style={{ color: it.color }}>
              {it.word}
            </span>
          </div>
        </div>
      );
    };
    return [
      { caption: "Նայի՛ր գույնին", ms: 1400, render: () => card(0) },
      { caption: "Ոչ թե բառին", ms: 1400, render: () => card(1) },
      { caption: "Ընտրիր ճիշտ գույնը", ms: 1400, render: () => card(2) },
    ];
  }

  // neuro
  const imgs = ["/neuro-1.png", "/neuro-2.png", "/neuro-3.png", "/neuro-4.png"];
  const strip = (on: number) => (
    <div className="demo-neuro">
      {imgs.map((src, i) => (
        <img
          key={src}
          className={`demo-neuro__img ${on === i ? "demo-neuro__img--on" : ""}`}
          src={src}
          alt=""
          decoding="async"
          loading="lazy"
        />
      ))}
    </div>
  );
  return [
    { caption: "Կրկնիր իմ հետ", ms: 1000, render: () => strip(0) },
    { caption: "Կրկնիր իմ հետ", ms: 1000, render: () => strip(1) },
    { caption: "Կրկնիր իմ հետ", ms: 1000, render: () => strip(2) },
    { caption: "Կրկնիր իմ հետ", ms: 1000, render: () => strip(3) },
  ];
}

