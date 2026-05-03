import { useEffect, useMemo, useState } from "react";
import { t } from "../lib/strings";

// Demo-ի արագությունը կառավարելու համար մեկ գործակից.
// Մեծացրու՝ եթե ուզում ես ավելի դանդաղ անցումներ։
const DEMO_SPEED = 1.35;
/** Reaction-ի բացատրությունը ավելի դանդաղ՝ երեխաների համար։ */
const REACTION_DEMO_MULT = 2.4;

export type GameDemoKind =
  | "reaction"
  | "sequence"
  | "visual"
  | "number"
  | "schulte"
  | "stroop"
  | "neuro";

type Props = { kind: GameDemoKind };

function DemoFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["game-demo", className].filter(Boolean).join(" ")} aria-hidden>
      {children}
    </div>
  );
}

export function GameDemo({ kind }: Props) {
  const frames = useMemo(() => {
    const raw = makeFrames(kind);
    const mult = kind === "reaction" ? DEMO_SPEED * REACTION_DEMO_MULT : DEMO_SPEED;
    return raw.map((f) => ({ ...f, ms: Math.round(f.ms * mult) }));
  }, [kind]);
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
    <DemoFrame className={kind === "reaction" ? "game-demo--reaction" : undefined}>
      <div className="demo-stage">{f.render()}</div>
      {f.caption ? <div className="demo-caption">{f.caption}</div> : null}
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
        caption: "",
        ms: 1900,
        render: () => (
          <div className="demo-rt demo-rt--ready">
            <div className="demo-rt__label">{t.reactionClickToStart}</div>
          </div>
        ),
      },
      {
        caption: "",
        ms: 2600,
        render: () => (
          <div className="demo-rt demo-rt--wait">
            <div className="demo-rt__label">Սպասիր</div>
          </div>
        ),
      },
      {
        caption: "",
        ms: 2100,
        render: () => (
          <div className="demo-rt demo-rt--go">
            <div className="demo-rt__label demo-rt__label--go">Սեղմիր</div>
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
      { caption: "Հիշիր հերթականությունը", ms: 850, render: () => lit(0) },
      { caption: "Հիշիր հերթականությունը", ms: 850, render: () => lit(1) },
      { caption: "Հիշիր հերթականությունը", ms: 850, render: () => lit(2) },
      { caption: "Հիմա դու", ms: 1100, render: base },
      { caption: "", ms: 850, render: () => lit(0) },
      { caption: "", ms: 850, render: () => lit(1) },
      { caption: "", ms: 850, render: () => lit(2) },
      { caption: "Կեցցես", ms: 1400, render: base },
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
      { caption: "Հիշիր վանդակները", ms: 1250, render: () => grid(new Set([0, 3, 8])) },
      { caption: "Հիմա սեղմիր", ms: 1250, render: () => grid(new Set()) },
      { caption: "", ms: 1250, render: () => grid(new Set([0])) },
      { caption: "", ms: 1250, render: () => grid(new Set([0, 3])) },
      { caption: "Կեցցես", ms: 1250, render: () => grid(new Set([0, 3, 8])) },
    ];
  }

  if (kind === "number") {
    return [
      {
        caption: "",
        ms: 2000,
        render: () => (
          <div className="demo-num">
            <div className="demo-num__screen">4827</div>
            <div className="demo-num__hint">Հիշիր թիվը</div>
          </div>
        ),
      },
      {
        caption: "",
        ms: 2000,
        render: () => (
          <div className="demo-num">
            <div className="demo-num__screen">••••</div>
            <div className="demo-num__hint">Մուտքագրիր</div>
          </div>
        ),
      },
      {
        caption: "",
        ms: 2000,
        render: () => (
          <div className="demo-num">
            <div className="demo-num__screen">4827</div>
            <div className="demo-num__hint">Հաստատիր</div>
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
      { caption: "Հերթականությամբ մինչև վերջ", ms: 700, render: () => grid(4) },
      { caption: "Հերթականությամբ մինչև վերջ", ms: 700, render: () => grid(5) },
      { caption: "Հերթականությամբ մինչև վերջ", ms: 700, render: () => grid(6) },
      { caption: "Հերթականությամբ մինչև վերջ", ms: 700, render: () => grid(7) },
      { caption: "Հերթականությամբ մինչև վերջ", ms: 700, render: () => grid(8) },
      { caption: "Հերթականությամբ մինչև վերջ", ms: 900, render: () => grid(9) },
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

