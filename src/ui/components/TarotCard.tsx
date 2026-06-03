import type { HeroDef, OwnedHero, Rarity } from "../../game/types";
import { ELEMENTS } from "../../game/data/elements";
import { Sigil } from "../art/sigil";
import "./tarot-card.css";

const RARITY_COLOR: Record<string, string> = {
  rare: "var(--r-rare)", epic: "var(--r-epic)", legendary: "var(--r-legendary)",
  mythic: "var(--r-mythic)", common: "var(--r-common)",
};
const RARITY_GEMS: Record<Rarity, number> = { rare: 2, epic: 3, legendary: 4, mythic: 5 };

interface Props {
  hero: HeroDef;
  owned?: OwnedHero;
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
  badge?: string;
}

export function TarotCard({ hero, owned, size = "md", locked, selected, dim, onClick, badge }: Props) {
  const numeral = hero.arcana.split("·")[0].trim();
  const el = ELEMENTS[hero.element];
  const rarityColor = RARITY_COLOR[hero.rarity] ?? "var(--r-epic)";
  const gems = RARITY_GEMS[hero.rarity] ?? 3;
  const [c1, c2] = hero.palette;

  return (
    <div
      className={`tcard tcard-${size} ${selected ? "is-selected" : ""} ${locked ? "is-locked" : ""} ${dim ? "is-dim" : ""}`}
      style={{ ["--c1" as string]: c1, ["--c2" as string]: c2, ["--rarity" as string]: rarityColor }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="tcard-bg" />
      <div className="tcard-foil" />
      <div className="tcard-frame" />

      <div className="tcard-top">
        <span className="tcard-numeral">{numeral}</span>
        <span className="tcard-elem" style={{ color: el.color }} title={`${el.suit} · ${el.label}`}>{el.glyph}</span>
      </div>

      <div className="tcard-art">
        <div className="tcard-sigil">
          <Sigil seed={hero.artSeed} color={c1} color2={c2} size={size === "lg" ? 260 : size === "md" ? 150 : 96} />
        </div>
        <div className="tcard-bignum">{numeral}</div>
        {locked && <div className="tcard-lock">🔒</div>}
      </div>

      <div className="tcard-name-plate">
        <div className="tcard-name title-display">{locked ? "???" : hero.name}</div>
        {size !== "xs" && <div className="tcard-title">{locked ? "Undiscovered Arcana" : hero.title}</div>}
      </div>

      {!locked && (
        <div className="tcard-gems">
          {Array.from({ length: gems }).map((_, i) => (
            <span key={i} className="tcard-gem" style={{ background: rarityColor }} />
          ))}
        </div>
      )}

      {owned && !locked && (
        <div className="tcard-lvl">
          <span>Lv{owned.level}</span>
          {owned.stars > 0 && <span className="tcard-stars">{"★".repeat(owned.stars)}</span>}
        </div>
      )}
      {badge && <div className="tcard-badge">{badge}</div>}
    </div>
  );
}
