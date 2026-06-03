import { useState } from "react";
import { useGame } from "../../game/state/store";
import { heroDef } from "../../game/data/heroes";
import { GEAR } from "../../game/data/gear";
import { ELEMENTS, counters } from "../../game/data/elements";
import { statsForOwned, levelCap } from "../../game/engine/build";
import { levelUpCost, ascendShardCost, ascendDustCost, canAscend, canLevelUp, MAX_STARS } from "../../game/state/progression";
import type { Stat } from "../../game/types";
import { TarotCard } from "./TarotCard";
import { sfx } from "../audio/sfx";
import { fmt } from "./TopBar";
import "./hero-detail.css";

export function HeroDetail({ heroId, onClose }: { heroId: string; onClose: () => void }) {
  const owned = useGame((s) => s.save.roster[heroId]);
  const dust = useGame((s) => s.save.dust);
  const levelUp = useGame((s) => s.levelUp);
  const ascend = useGame((s) => s.ascend);
  const [gearSlot, setGearSlot] = useState<number | null>(null);
  if (!owned) return null;

  const def = heroDef(heroId);
  const el = ELEMENTS[def.element];
  const stats = statsForOwned(owned);
  const cap = levelCap(owned.stars);
  const atCap = owned.level >= cap;
  const lvlCost = levelUpCost(owned.level);
  const canLvl = canLevelUp(owned) && dust >= lvlCost;
  const ascShard = ascendShardCost(owned.stars);
  const ascDust = ascendDustCost(owned.stars);
  const ascReady = canAscend(owned) && dust >= ascDust;
  const { strongVs, weakTo } = counters(def.element);

  const doLevel = () => { if (canLvl) { sfx.levelUp(); levelUp(heroId, 1); } else sfx.error(); };
  const doLevel5 = () => { if (canLvl) { sfx.levelUp(); levelUp(heroId, 5); } else sfx.error(); };
  const doAscend = () => { if (ascReady) { sfx.ascend(); ascend(heroId); } else sfx.error(); };

  return (
    <div className="detail-scrim" onClick={onClose}>
      <div className="detail-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={() => { sfx.tap(); onClose(); }}>✕</button>

        <div className="detail-hero">
          <div className="detail-card"><TarotCard hero={def} owned={owned} size="md" /></div>
          <div className="detail-head">
            <h2 className="detail-name title-display">{def.name}</h2>
            <div className="detail-arcana">{def.arcana}</div>
            <div className="row gap-8" style={{ flexWrap: "wrap", marginTop: 6 }}>
              <span className="pill" style={{ color: el.color }}>{el.glyph} {el.suit}</span>
              <span className="pill" style={{ textTransform: "capitalize" }}>{def.role}</span>
              <span className="pill" style={{ color: `var(--r-${def.rarity})` }}>{def.rarity}</span>
            </div>
            <div className="detail-stars">
              {Array.from({ length: MAX_STARS }).map((_, i) => <span key={i} className={i < owned.stars ? "on" : ""}>★</span>)}
            </div>
            <p className="detail-key">🔑 {def.keyOf}</p>
          </div>
        </div>

        <div className="detail-elem-note tiny">
          {strongVs && <span style={{ color: ELEMENTS[strongVs].color }}>Strong vs {ELEMENTS[strongVs].suit}</span>}
          {strongVs && weakTo && " · "}
          {weakTo && <span style={{ color: ELEMENTS[weakTo].color }}>Weak to {ELEMENTS[weakTo].suit}</span>}
        </div>

        <div className="detail-stats">
          <Stat label="HP" v={stats.hpMax} ico="❤" />
          <Stat label="ATK" v={stats.atk} ico="⚔" />
          <Stat label="DEF" v={stats.def} ico="🛡" />
          <Stat label="SPD" v={stats.spd} ico="💨" />
        </div>

        {/* Upgrade panel */}
        <div className="detail-upgrade panel">
          <div className="row between">
            <div>
              <div className="small" style={{ fontWeight: 700 }}>Level {owned.level}<span className="faint"> / {cap}</span></div>
              {atCap ? <div className="tiny" style={{ color: "var(--neon-gold)" }}>Ascend to raise the cap</div> : <div className="tiny faint">Cost: ◈ {fmt(lvlCost)}</div>}
            </div>
            <div className="row gap-8">
              <button className="btn btn-sm btn-cyan" disabled={!canLvl} onClick={doLevel}>+1</button>
              <button className="btn btn-sm btn-cyan" disabled={!canLvl} onClick={doLevel5}>+5</button>
            </div>
          </div>
          <div className="divider" style={{ margin: "12px 0" }} />
          <div className="row between">
            <div>
              <div className="small" style={{ fontWeight: 700 }}>Ascend ★{owned.stars} → ★{owned.stars + 1}</div>
              {owned.stars >= MAX_STARS
                ? <div className="tiny" style={{ color: "var(--neon-gold)" }}>Fully ascended</div>
                : <div className="tiny faint">🔹 {owned.shards}/{ascShard} shards · ◈ {fmt(ascDust)}</div>}
            </div>
            <button className="btn btn-sm btn-gold" disabled={!ascReady || owned.stars >= MAX_STARS} onClick={doAscend}>Ascend ▲</button>
          </div>
          {owned.stars < MAX_STARS && (
            <div className="shard-bar"><div className="shard-fill" style={{ width: `${Math.min(100, (owned.shards / ascShard) * 100)}%` }} /></div>
          )}
        </div>

        {/* Gear */}
        <div className="detail-section-label">GEAR · Numbered Minors</div>
        <div className="gear-slots">
          {[0, 1, 2].map((slot) => {
            const gid = owned.gear[slot];
            const g = gid ? GEAR[gid] : null;
            return (
              <button key={slot} className={`gear-slot ${g ? "filled" : ""}`} onClick={() => { sfx.select(); setGearSlot(slot); }}>
                {g ? (
                  <><span className="gear-ico" style={{ color: `var(--el-${g.element})` }}>{g.icon}</span><span className="gear-nm tiny">{g.name}</span></>
                ) : (
                  <span className="gear-plus">+</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Abilities */}
        <div className="detail-section-label">ABILITIES</div>
        <div className="detail-abilities">
          {def.abilities.map((ab) => (
            <div key={ab.id} className="ability-row">
              <span className="ability-row-ico">{ab.icon}</span>
              <div className="col" style={{ flex: 1 }}>
                <div className="row gap-8">
                  <strong className="small">{ab.name}</strong>
                  <span className="ability-tags">
                    <span className="atag">{ab.delivery}</span>
                    {ab.cooldown ? <span className="atag cd">CD {ab.cooldown}</span> : null}
                  </span>
                </div>
                <div className="tiny muted">{ab.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Passive */}
        {def.passives.map((p) => (
          <div key={p.id} className="passive-row">
            <span className="passive-ico">✧</span>
            <div><strong className="small" style={{ color: "var(--neon-violet)" }}>{p.name}</strong><div className="tiny muted">{p.description}</div></div>
          </div>
        ))}

        <p className="detail-flavor">“{def.flavor}”</p>
      </div>

      {gearSlot !== null && <GearPicker heroId={heroId} slot={gearSlot} onClose={() => setGearSlot(null)} />}
    </div>
  );
}

function Stat({ label, v, ico }: { label: string; v: number; ico: string }) {
  return (
    <div className="stat-box">
      <span className="stat-ico">{ico}</span>
      <span className="stat-val">{fmt(v)}</span>
      <span className="stat-lbl tiny faint">{label}</span>
    </div>
  );
}

function GearPicker({ heroId, slot, onClose }: { heroId: string; slot: number; onClose: () => void }) {
  const inv = useGame((s) => s.save.gearInv);
  const owned = useGame((s) => s.save.roster[heroId]);
  const equip = useGame((s) => s.equipGear);
  const equipped = owned.gear[slot];
  const available = Object.entries(inv).filter(([, n]) => n > 0).map(([id]) => id);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Equip Gear</h2>
        {equipped && <button className="picker-clear" onClick={() => { sfx.select(); equip(heroId, slot, null); onClose(); }}>✕ Unequip {GEAR[equipped]?.name}</button>}
        {available.length === 0 && <p className="tiny faint center" style={{ textAlign: "center", padding: 20 }}>No gear in your vault yet. Clear floors and Trials to earn Numbered Minors.</p>}
        <div className="col gap-8" style={{ marginTop: 8 }}>
          {available.map((id) => {
            const g = GEAR[id];
            return (
              <button key={id} className="gear-pick-row" onClick={() => { sfx.select(); equip(heroId, slot, id); onClose(); }}>
                <span className="gear-ico" style={{ color: `var(--el-${g.element})` }}>{g.icon}</span>
                <div className="col" style={{ flex: 1, textAlign: "left" }}>
                  <strong className="small">{g.name} <span className="faint tiny">×{inv[id]}</span></strong>
                  <span className="tiny" style={{ color: "var(--neon-cyan)" }}>{gearBonusText(g)}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 12 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function gearBonusText(g: typeof GEAR[string]): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(g.bonus)) parts.push(`+${fmt(v as number)} ${k.toUpperCase().replace("MAX", "")}`);
  for (const [k, v] of Object.entries(g.bonusPct ?? {})) parts.push(`+${Math.round((v as number) * 100)}% ${(k as Stat).toUpperCase().replace("MAX", "")}`);
  return parts.join(" · ");
}
