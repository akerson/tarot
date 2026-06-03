import { useState } from "react";
import { useGame } from "../../game/state/store";
import { HEROES, heroDef } from "../../game/data/heroes";
import { UNLOCK_SHARDS } from "../../game/state/progression";
import { TarotCard } from "../components/TarotCard";
import { HeroDetail } from "../components/HeroDetail";
import { sfx } from "../audio/sfx";
import "./codex.css";

export function CodexScreen() {
  const roster = useGame((s) => s.save.roster);
  const lockedShards = useGame((s) => s.save.lockedShards);
  const craftHero = useGame((s) => s.craftHero);
  const [detail, setDetail] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);

  const all = Object.values(HEROES);
  const ownedCount = Object.keys(roster).length;

  const groups: { label: string; ids: string[]; note: string }[] = [
    { label: "Major Arcana", note: "The 22 launch pillars · obtained through the climb & Readings", ids: all.filter((h) => h.rarity === "epic").map((h) => h.id) },
    { label: "Legendary Arcana", note: "Rule-benders that make the collection live", ids: all.filter((h) => h.rarity === "legendary").map((h) => h.id) },
    { label: "Mythic Chase", note: "System-breakers — trophies outside the historical deck", ids: all.filter((h) => h.rarity === "mythic").map((h) => h.id) },
  ];

  return (
    <div className="screen codex-screen">
      <div className="section-head">
        <div>
          <div className="section-title">The Codex</div>
          <div className="section-sub">{ownedCount} / {all.length} arcana discovered</div>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.label} className="codex-group">
          <div className="codex-group-head">
            <h3 className="codex-group-title title-display">{g.label}</h3>
            <span className="tiny faint">{g.note}</span>
          </div>
          <div className="codex-grid">
            {g.ids.map((id) => {
              const owned = !!roster[id];
              return (
                <TarotCard
                  key={id}
                  hero={heroDef(id)}
                  owned={roster[id]}
                  size="sm"
                  locked={!owned}
                  onClick={() => { sfx.select(); owned ? setDetail(id) : setTeaser(id); }}
                />
              );
            })}
          </div>
        </div>
      ))}

      <div className="codex-future panel">
        <div className="codex-future-title">The Deck Goes Deeper</div>
        <div className="codex-future-rows">
          <FutureRow label="Reversed Arcana" count="22" note="Shadow mirrors of every Major" />
          <FutureRow label="Court Cards" count="16" note="Suit-themed mid-tier heroes" />
          <FutureRow label="Numbered Minors" count="40" note="The gear layer (partly here)" />
          <FutureRow label="Apocrypha" count="∞" note="Seasonal chase cards" />
          <FutureRow label="Sister Decks" count="—" note="Lenormand · Runes · I Ching" />
        </div>
        <p className="tiny faint" style={{ textAlign: "center", marginTop: 10 }}>~100+ collectibles at launch · infinite expansion runway</p>
      </div>

      {detail && <HeroDetail heroId={detail} onClose={() => setDetail(null)} />}
      {teaser && (
        <TeaserModal heroId={teaser} shards={lockedShards[teaser] ?? 0} onCraft={() => { sfx.ascend(); craftHero(teaser); setTeaser(null); }} onClose={() => setTeaser(null)} />
      )}
    </div>
  );
}

function FutureRow({ label, count, note }: { label: string; count: string; note: string }) {
  return (
    <div className="future-row">
      <span className="future-count">{count}</span>
      <div className="col"><strong className="small">{label}</strong><span className="tiny faint">{note}</span></div>
      <span className="future-soon">SOON</span>
    </div>
  );
}

function TeaserModal({ heroId, shards, onCraft, onClose }: { heroId: string; shards: number; onCraft: () => void; onClose: () => void }) {
  const def = heroDef(heroId);
  const need = UNLOCK_SHARDS[def.rarity];
  const canCraft = shards >= need;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 130, margin: "0 auto 12px" }}><TarotCard hero={def} size="md" locked={!canCraft} /></div>
        <h2 className="modal-title">{def.name}</h2>
        <p className="small muted" style={{ marginBottom: 12 }}>{def.keyOf}</p>
        <div className="teaser-shards">
          <div className="shard-bar"><div className="shard-fill" style={{ width: `${Math.min(100, (shards / need) * 100)}%` }} /></div>
          <span className="tiny">🔹 {shards} / {need} shards</span>
        </div>
        {canCraft ? (
          <button className="btn btn-gold" style={{ width: "100%", marginTop: 14 }} onClick={onCraft}>Summon {def.name}</button>
        ) : (
          <p className="tiny faint" style={{ marginTop: 14 }}>Earn shards from specific floors, the Reading, and Trials — then summon this arcana for free.</p>
        )}
        <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
