import { useGame } from "../../game/state/store";
import { READING_COST, TEN_READING_COST } from "../../game/state/summon";
import { sfx } from "../audio/sfx";
import "./summon.css";

export function SummonScreen() {
  const aether = useGame((s) => s.save.aether);
  const doReading = useGame((s) => s.doReading);
  const readings = useGame((s) => s.save.stats.readings);

  const pull = (n: number, cost: number) => {
    if (aether < cost) { sfx.error(); return; }
    sfx.summon();
    doReading(n);
  };

  return (
    <div className="screen summon-screen">
      <div className="section-head">
        <div>
          <div className="section-title">The Reading</div>
          <div className="section-sub">{readings} cards drawn from the deck</div>
        </div>
      </div>

      <div className="summon-orb">
        <div className="orb-glow" />
        <div className="orb-ring r1" />
        <div className="orb-ring r2" />
        <div className="orb-core">🔮</div>
        <div className="orb-cards">
          {["✦", "☾", "★", "✧", "⚝"].map((g, i) => <span key={i} className={`orb-card oc${i}`}>{g}</span>)}
        </div>
      </div>

      <p className="summon-blurb">
        The diviner draws from the full deck. Every card is a hero; duplicates fold into <span style={{ color: "var(--neon-cyan)" }}>shards</span> for ascension. No card is ever locked behind a wall.
      </p>

      <div className="summon-buttons">
        <button className="reading-btn single" disabled={aether < READING_COST} onClick={() => pull(1, READING_COST)}>
          <span className="rb-title">Single Reading</span>
          <span className="rb-cost"><span className="ico cur-aether">✦</span> {READING_COST}</span>
        </button>
        <button className="reading-btn ten" disabled={aether < TEN_READING_COST} onClick={() => pull(10, TEN_READING_COST)}>
          <span className="rb-flag">GUARANTEED LEGENDARY+</span>
          <span className="rb-title">Ten Readings</span>
          <span className="rb-cost"><span className="ico cur-aether">✦</span> {TEN_READING_COST} <span className="rb-save">save 10%</span></span>
        </button>
      </div>

      <div className="rates panel">
        <div className="rates-title">Draw Rates</div>
        <Rate color="var(--r-epic)" label="Epic Arcana" pct="70%" />
        <Rate color="var(--r-legendary)" label="Legendary Arcana" pct="25%" />
        <Rate color="var(--r-mythic)" label="Mythic Chase Card" pct="5%" />
        <p className="tiny faint" style={{ marginTop: 8 }}>Aether is earned freely from floors, the daily login, Trials, and the Daily Reckoning.</p>
      </div>
    </div>
  );
}

function Rate({ color, label, pct }: { color: string; label: string; pct: string }) {
  return (
    <div className="rate-row">
      <span className="rate-gem" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="rate-label">{label}</span>
      <span className="rate-pct" style={{ color }}>{pct}</span>
    </div>
  );
}
