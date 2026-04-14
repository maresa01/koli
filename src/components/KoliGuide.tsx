import { type ReactNode } from "react";
import { t } from "../lib/strings";

/** App icon (transparent) in public/koli-icon-transparent.png */
export const KOLI_HUMMINGBIRD_SRC = "/koli-icon-transparent.png";

type MascotSize = "hero" | "medium" | "thumb";

const mascotClass: Record<MascotSize, string> = {
  hero: "koli-mascot koli-mascot--hero",
  medium: "koli-mascot koli-mascot--medium",
  thumb: "koli-mascot koli-mascot--thumb",
};

const mascotPx: Record<MascotSize, { w: number; h?: number }> = {
  hero: { w: 320 },
  medium: { w: 88, h: 88 },
  thumb: { w: 40, h: 40 },
};

type KoliMascotProps = {
  size?: MascotSize;
  className?: string;
  alt?: string;
};

export function KoliMascot({
  size = "medium",
  className,
  alt = t.guideCharacterAlt,
}: KoliMascotProps) {
  const { w, h } = mascotPx[size];
  return (
    <img
      src={KOLI_HUMMINGBIRD_SRC}
      alt={alt}
      width={w}
      height={h ?? undefined}
      className={[mascotClass[size], className].filter(Boolean).join(" ")}
      decoding="async"
    />
  );
}

type KoliGuideProps = {
  message: ReactNode;
  mascotSize?: Exclude<MascotSize, "hero">;
  className?: string;
};

export function KoliGuide({
  message,
  mascotSize = "medium",
  className,
}: KoliGuideProps) {
  return (
    <div
      className={["koli-guide", className].filter(Boolean).join(" ")}
      aria-label={t.guideCharacterAlt}
    >
      <div className="koli-guide__mascot" aria-hidden>
        <KoliMascot size={mascotSize} alt="" />
      </div>
      <div className="koli-guide__bubble">{message}</div>
    </div>
  );
}