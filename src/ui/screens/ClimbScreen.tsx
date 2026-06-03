import { useGame } from "../../game/state/store";
import { FLOORS } from "../../game/data/floors";
import { ELEMENTS } from "../../game/data/elements";
import type { FloorDef, Role } from "../../game/types";
import { anyDef } from "../../game/engine/build";
import { sfx } from "../audio/sfx";
import "./climb.css";

const ROLE_ICON: Record<Role, string> = {
  tank: "🛡", bruiser: "⚔", dps: "🗡", aoe: "☄", healer: "➕", support: "✨", bender: "🔮",
};
const ROLE_LABEL: Record<Role, string> = {
  tank: "Tank", bruiser: "Bruiser", dps: "Burst DPS", aoe: "AoE", healer: "Healer", support: "Support", bender: "Rule-Bender",
};

export function ClimbScreen() {
  const highest = useGame((s) => s.save.highestFloor);
  const team = useGame((s) => s.save.team);
  const power = useGame((s) => s.teamPower());
  const begin = useGame((s) => s.beginBattle);
  const setScreen = useGame((s) => s.setScreen);

  const nextIndex = Math.min(highest + 1, FLOORS.length);
  const next = FLOORS[nextIndex - 1];
  const beatGame = highest >= FLOORS.length;
  const hasTeam = team.some(Boolean);

  return (
    <div className="screen climb-screen">
      <div className="section-head">
        <div>
          <div className="section-title">The Climb</div>
          <div className="section-sub">Floor {highest} cleared · {FLOORS.length} in this realm</div>
        </div>
        <div className="climb-power" onClick={() => { sfx.nav(); setScreen("roster"); }}>
          <span className="tiny faint">PARTY POWER</span>
          <strong className="glow-text" style={{ color: "var(--neon-cyan)" }}>{power.toLocaleString()}</strong>
        </div>
      </div>

      {beatGame ? (
        <div className="panel climb-victory fade-in">
          <div style={{ fontSize: 50 }}>👑</div>
          <h2 className="title-deco">The Devil Falls</h2>
          <p className="muted small">You've cleared every floor of this realm. More arcana, deeper climbs, and the Reversed roster await in the next update. The tower never ends.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => { sfx.nav(); setScreen("daily"); }}>Try the Daily Reckoning →</button>
        </div>
      ) : (
        <FocusFloor floor={next} onAscend={() => { if (!hasTeam) { sfx.error(); setScreen("roster"); return; } sfx.climb(); begin("climb", nextIndex); }} onEditTeam={() => { sfx.nav(); setScreen("roster"); }} hasTeam={hasTeam} />
      )}

      <div className="climb-rail">
        {FLOORS.map((f) => {
          const state = f.index <= highest ? "cleared" : f.index === nextIndex ? "current" : "locked";
          return (
            <button
              key={f.index}
              className={`rail-node ${state} ${f.boss ? "boss" : ""}`}
              disabled={state === "locked"}
              onClick={() => { if (state === "cleared") { sfx.climb(); begin("climb", f.index); } }}
            >
              <span className="rail-idx">{f.index}</span>
              <span className="rail-name">{state === "locked" ? "???" : f.name}</span>
              {f.boss && <span className="rail-boss">BOSS</span>}
              {state === "cleared" && <span className="rail-check">✓</span>}
              {state === "current" && <span className="rail-here">▶</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FocusFloor({ floor, onAscend, onEditTeam, hasTeam }: { floor: FloorDef; onAscend: () => void; onEditTeam: () => void; hasTeam: boolean }) {
  return (
    <div className={`panel focus-floor fade-in ${floor.boss ? "is-boss" : ""}`}>
      <div className="focus-tag">{floor.boss ? "◆ BOSS FLOOR ◆" : `FLOOR ${floor.index}`}</div>
      <h2 className="focus-name title-display">{floor.name}</h2>

      <div className="focus-threats">
        {floor.threats.map((t) => <span key={t} className={`threat-chip ${t.includes("BOSS") || t.includes("FINAL") ? "danger" : ""}`}>{t}</span>)}
      </div>

      {floor.demands.length > 0 && (
        <div className="focus-demands">
          <span className="tiny faint">DEMANDS</span>
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            {[...new Set(floor.demands)].map((d) => (
              <span key={d} className="demand-chip" title={ROLE_LABEL[d]}>{ROLE_ICON[d]} {ROLE_LABEL[d]}</span>
            ))}
          </div>
        </div>
      )}

      <div className="focus-enemies">
        {floor.enemies.map((e, i) => {
          const def = anyDef(e.enemyId ?? e.heroId ?? "") ?? null;
          const el = def ? ELEMENTS[def.element] : null;
          return (
            <div key={i} className={`enemy-pip ${e.slot < 2 ? "front" : "back"}`} title={def?.name}>
              <span className="enemy-el" style={{ color: el?.color }}>{el?.glyph}</span>
              <span className="enemy-nm">{(def?.name ?? "?").split(" ").slice(-1)[0]}</span>
              <span className="enemy-lv">L{e.level}</span>
            </div>
          );
        })}
      </div>

      {floor.rule && <div className="focus-rule">“{floor.rule}”</div>}
      <p className="focus-hint">{floor.hint}</p>

      {!hasTeam && <div className="focus-warn">Set a party first.</div>}
      <div className="focus-actions">
        <button className="btn btn-ghost btn-sm" onClick={onEditTeam}>🎴 Party</button>
        <button className="btn btn-primary focus-go" onClick={onAscend}>Ascend ▲</button>
      </div>
    </div>
  );
}
