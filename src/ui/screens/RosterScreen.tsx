import { useState } from "react";
import { useGame } from "../../game/state/store";
import { HEROES } from "../../game/data/heroes";
import { heroDef } from "../../game/data/heroes";
import type { Role } from "../../game/types";
import { TarotCard } from "../components/TarotCard";
import { HeroDetail } from "../components/HeroDetail";
import { sfx } from "../audio/sfx";
import "./roster.css";

const SLOT_LABELS = ["Front ◀", "Front ▶", "Back ◀", "Back ▶"];

export function RosterScreen() {
  const team = useGame((s) => s.save.team);
  const roster = useGame((s) => s.save.roster);
  const setTeamSlot = useGame((s) => s.setTeamSlot);
  const autoFill = useGame((s) => s.autoFillTeam);
  const power = useGame((s) => s.teamPower());

  const [detail, setDetail] = useState<string | null>(null);
  const [pickSlot, setPickSlot] = useState<number | null>(null);

  const ownedIds = Object.keys(roster);

  return (
    <div className="screen roster-screen">
      <div className="section-head">
        <div>
          <div className="section-title">Your Party</div>
          <div className="section-sub">{ownedIds.length} arcana collected</div>
        </div>
        <div className="climb-power">
          <span className="tiny faint">POWER</span>
          <strong className="glow-text" style={{ color: "var(--neon-cyan)" }}>{power.toLocaleString()}</strong>
        </div>
      </div>

      <div className="team-board panel">
        <div className="team-board-label"><span>ENEMY ▲</span><span className="faint tiny">front protects back</span></div>
        <div className="team-grid">
          {[0, 1, 2, 3].map((slot) => {
            const id = team[slot];
            return (
              <button key={slot} className={`team-slot ${slot < 2 ? "front" : "back"} ${id ? "filled" : ""}`} onClick={() => { sfx.select(); setPickSlot(slot); }}>
                {id ? (
                  <TarotCard hero={heroDef(id)} owned={roster[id]} size="sm" />
                ) : (
                  <div className="slot-empty"><span className="slot-plus">+</span><span className="tiny faint">{SLOT_LABELS[slot]}</span></div>
                )}
              </button>
            );
          })}
        </div>
        <button className="btn btn-ghost btn-sm team-auto" onClick={() => { sfx.select(); autoFill(); }}>⟳ Auto-Arrange</button>
      </div>

      <div className="collection">
        <div className="row between" style={{ margin: "4px 2px 10px" }}>
          <h3 className="small" style={{ letterSpacing: 1, color: "var(--ink-dim)" }}>COLLECTION</h3>
        </div>
        <div className="collection-grid">
          {ownedIds
            .sort((a, b) => rarityRank(b) - rarityRank(a))
            .map((id) => (
              <TarotCard
                key={id}
                hero={heroDef(id)}
                owned={roster[id]}
                size="sm"
                badge={team.includes(id) ? "TEAM" : undefined}
                onClick={() => { sfx.select(); setDetail(id); }}
              />
            ))}
        </div>
      </div>

      {pickSlot !== null && (
        <SlotPicker
          slot={pickSlot}
          onClose={() => setPickSlot(null)}
          onPick={(id) => { setTeamSlot(pickSlot, id); setPickSlot(null); sfx.select(); }}
        />
      )}
      {detail && <HeroDetail heroId={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function SlotPicker({ slot, onClose, onPick }: { slot: number; onClose: () => void; onPick: (id: string | null) => void }) {
  const roster = useGame((s) => s.save.roster);
  const team = useGame((s) => s.save.team);
  const ids = Object.keys(roster);
  const rec: Role[] = slot < 2 ? ["tank", "bruiser", "dps"] : ["healer", "support", "aoe", "bender"];
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{SLOT_LABELS[slot]}</h2>
        <p className="tiny faint center" style={{ textAlign: "center", marginBottom: 12 }}>
          {slot < 2 ? "Front row absorbs melee — put your sturdy heroes here." : "Back row is safe from melee — ideal for casters & healers."}
        </p>
        <div className="picker-grid">
          {team[slot] && <button className="picker-clear" onClick={() => onPick(null)}>✕ Empty Slot</button>}
          {ids.map((id) => {
            const d = heroDef(id);
            const fits = rec.includes(d.role);
            return (
              <div key={id} className="picker-item" onClick={() => onPick(id)}>
                <TarotCard hero={d} owned={roster[id]} size="xs" dim={team[slot] === id} />
                {fits && <span className="picker-fit">✓ fits</span>}
              </div>
            );
          })}
        </div>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 12 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function rarityRank(id: string): number {
  const r = HEROES[id]?.rarity;
  return r === "mythic" ? 4 : r === "legendary" ? 3 : r === "epic" ? 2 : 1;
}
