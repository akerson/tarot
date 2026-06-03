import { useState } from "react";
import { useGame } from "../../game/state/store";
import { ELEMENTS, STRONG_MULT, WEAK_MULT } from "../../game/data/elements";
import { sfx } from "../audio/sfx";
import "./help.css";

type SectionId = "combat" | "elements" | "roles" | "climb" | "gear" | "reading" | "daily" | "currencies";

const SECTIONS: { id: SectionId; icon: string; title: string }[] = [
  { id: "combat",     icon: "⚔",  title: "Combat Basics" },
  { id: "elements",   icon: "🜂",  title: "The Elemental Wheel" },
  { id: "roles",      icon: "🎴",  title: "Hero Roles" },
  { id: "climb",      icon: "🗼",  title: "The Climb" },
  { id: "gear",       icon: "✦",   title: "Gear (Minor Arcana)" },
  { id: "reading",    icon: "🔮",  title: "The Reading" },
  { id: "daily",      icon: "🌙",  title: "Daily Ritual" },
  { id: "currencies", icon: "◈",   title: "Currencies" },
];

export function HelpScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const [open, setOpen] = useState<Set<SectionId>>(new Set(["combat", "elements"]));

  const toggle = (id: SectionId) => {
    sfx.select();
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="screen help-screen">
      <div className="section-head">
        <div>
          <div className="section-title">Arcana Guide</div>
          <div className="section-sub">How every system works</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { sfx.nav(); setScreen("climb"); }}>← Back</button>
      </div>

      {SECTIONS.map(({ id, icon, title }) => (
        <div key={id} className={`help-section panel ${open.has(id) ? "open" : ""}`}>
          <button className="help-header" onClick={() => toggle(id)}>
            <span className="help-icon">{icon}</span>
            <span className="help-title">{title}</span>
            <span className="help-caret">{open.has(id) ? "▲" : "▼"}</span>
          </button>
          {open.has(id) && (
            <div className="help-body">
              <SectionBody id={id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionBody({ id }: { id: SectionId }) {
  switch (id) {
    case "combat":     return <CombatSection />;
    case "elements":   return <ElementsSection />;
    case "roles":      return <RolesSection />;
    case "climb":      return <ClimbSection />;
    case "gear":       return <GearSection />;
    case "reading":    return <ReadingSection />;
    case "daily":      return <DailySection />;
    case "currencies": return <CurrenciesSection />;
  }
}

// ── Section content ───────────────────────────────────────────────────────────

function CombatSection() {
  return (
    <div className="help-content">
      <p className="help-p">
        Combat is a <strong>deterministic strength check</strong> — no dice rolls. Outcome is decided entirely by team composition, positioning, and ability choices.
      </p>

      <div className="help-rule">
        <div className="help-rule-head">The Cover Rule</div>
        <div className="help-diagram cover-diagram">
          <div className="cover-row">
            <div className="cover-slot front">🛡 Front</div>
            <div className="cover-slot front">🛡 Front</div>
          </div>
          <div className="cover-row">
            <div className="cover-slot back">🗡 Back</div>
            <div className="cover-slot back">🗡 Back</div>
          </div>
          <div className="cover-label">↑ Melee must clear front row to reach back</div>
        </div>
        <ul className="help-list">
          <li><strong>Melee</strong> attacks can only hit the front row while it has survivors.</li>
          <li><strong>Ranged &amp; Magic</strong> bypass cover — they can target any row freely.</li>
          <li>Once the entire front row falls, the back row becomes exposed to melee.</li>
          <li>Some heroes (rule-benders) have passives that ignore the cover rule entirely.</li>
        </ul>
      </div>

      <div className="help-rule">
        <div className="help-rule-head">Turn Order</div>
        <p className="help-p">Faster heroes act first. <strong>SPD</strong> stat determines who goes next — ties are broken by slot position. On your turn, pick an ability and a target. Enemy turns resolve automatically.</p>
      </div>

      <div className="help-rule">
        <div className="help-rule-head">Damage Formula</div>
        <p className="help-p small muted" style={{ fontFamily: "monospace", background: "rgba(0,0,0,.3)", padding: "8px 10px", borderRadius: 8 }}>
          damage = power × element_mult × (250 / (250 + defender_DEF))
        </p>
        <p className="help-p">DEF has a soft cap — doubling it doesn't halve damage. Stacking ATK and element advantage is usually better than pure DEF stacking.</p>
      </div>
    </div>
  );
}

const WHEEL_ORDER: Array<keyof typeof ELEMENTS> = ["wands", "swords", "pentacles", "cups"];

function ElementsSection() {
  const strongMult = `+${Math.round((STRONG_MULT - 1) * 100)}%`;
  const weakMult  = `−${Math.round((1 - WEAK_MULT)  * 100)}%`;

  return (
    <div className="help-content">
      <p className="help-p">Elements form a 4-step counter cycle. Match your heroes against enemy weaknesses for a significant damage boost.</p>

      <div className="elem-wheel">
        {WHEEL_ORDER.map((el, i) => {
          const info = ELEMENTS[el];
          const next = ELEMENTS[WHEEL_ORDER[(i + 1) % 4]];
          return (
            <div key={el} className="elem-step">
              <span className="elem-pill" style={{ color: info.color, borderColor: info.color }}>
                {info.glyph} {info.suit}
              </span>
              <span className="elem-arrow" style={{ color: info.color }}>beats →</span>
              <span className="elem-pill" style={{ color: next.color, borderColor: next.color }}>
                {next.glyph} {next.suit}
              </span>
            </div>
          );
        })}
      </div>

      <div className="help-chips">
        <div className="help-chip" style={{ background: "rgba(78,255,130,.12)", borderColor: "var(--neon-green)" }}>
          <span className="chip-label">Strong</span>
          <span className="chip-value" style={{ color: "var(--neon-green)" }}>{strongMult} damage</span>
        </div>
        <div className="help-chip" style={{ background: "rgba(255,93,108,.12)", borderColor: "var(--neon-red)" }}>
          <span className="chip-label">Weak</span>
          <span className="chip-value" style={{ color: "var(--neon-red)" }}>{weakMult} damage</span>
        </div>
      </div>

      <div className="help-rule">
        <div className="help-rule-head" style={{ color: ELEMENTS.arcana.color }}>✦ Arcana (Major Arcana heroes)</div>
        <p className="help-p">Major Arcana heroes sit <em>outside</em> the wheel. They deal and receive neutral damage against every element. This is intentional — it's part of why they feel like rule-breakers.</p>
      </div>
    </div>
  );
}

const ROLES: { icon: string; name: string; desc: string }[] = [
  { icon: "🛡", name: "Tank",        desc: "High HP and DEF. Sits front row, soaks melee damage, often has taunt abilities to protect allies." },
  { icon: "⚔", name: "Bruiser",     desc: "Front-row melee fighter with strong ATK and HP. Deals and takes punishment. Cleaves through armored enemies." },
  { icon: "🗡", name: "Burst DPS",   desc: "Back row single-target nuke. High ATK, lower HP — keep protected behind a tank. Best for focus-firing threats." },
  { icon: "☄", name: "AoE",         desc: "Hits multiple enemies at once, often the whole row or full party. Essential on floors with swarms." },
  { icon: "➕", name: "Healer",      desc: "Restores HP and cleanses debuffs. Back row. One healer can change the math on attrition floors." },
  { icon: "✨", name: "Support",     desc: "Buffs allies' stats, applies shields, or echoes abilities. Back row. Multiplies the power of everyone else." },
  { icon: "🔮", name: "Rule-Bender", desc: "Passive abilities that break normal rules — melee that ignores cover, attacks that scale with missing HP, resurrections. Each Legendary and Mythic is a rule-bender." },
];

function RolesSection() {
  return (
    <div className="help-content">
      <p className="help-p">Each hero fills one role. Floors demand certain role archetypes — read the threat tags before entering.</p>
      <div className="role-list">
        {ROLES.map((r) => (
          <div key={r.name} className="role-row">
            <span className="role-ico">{r.icon}</span>
            <div className="role-body">
              <strong className="role-name">{r.name}</strong>
              <span className="role-desc tiny muted">{r.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClimbSection() {
  return (
    <div className="help-content">
      <p className="help-p">15 floors, each designed as a <strong>roster shape check</strong> — not a raw stat wall. If a floor is blocking you, the answer is almost always a missing role or wrong element, not just grinding more levels.</p>

      <div className="help-rule">
        <div className="help-rule-head">Reading a Floor</div>
        <ul className="help-list">
          <li><strong>Threats</strong> shown before battle — these tag what enemy types you'll face (e.g. "Armored Front" means front-row tanks that need a bender or AoE to crack).</li>
          <li><strong>Hints</strong> point you at the archetype solution — take them literally.</li>
          <li>Floor element = the color/glyph on the floor card. Bring heroes that counter it.</li>
        </ul>
      </div>

      <div className="help-rule">
        <div className="help-rule-head">Boss Floors (5, 10, 15)</div>
        <p className="help-p">Floors 5, 10, and 15 are bosses with unique mechanics. They demand a complete team — solo or two-hero runs will stall. Each drops a guaranteed Legendary shard.</p>
      </div>

      <div className="help-rule">
        <div className="help-rule-head">Replaying Floors</div>
        <p className="help-p">Cleared floors can be replayed for Dust and Gear. The climb railnode turns gold when cleared. Replays don't re-unlock progression rewards.</p>
      </div>
    </div>
  );
}

function GearSection() {
  return (
    <div className="help-content">
      <p className="help-p">Each hero has <strong>3 gear slots</strong>. Gear comes from the Minor Arcana — numbered cards and court cards. Drop from floors, trials, and boss fights.</p>

      <div className="help-table">
        <div className="htrow head">
          <span>Card</span>
          <span>Slot type</span>
          <span>Primary bonus</span>
        </div>
        <div className="htrow">
          <span className="htcell-em">Aces (I)</span>
          <span>Weapon</span>
          <span>+ATK, +SPD</span>
        </div>
        <div className="htrow">
          <span className="htcell-em">II–IV</span>
          <span>Utility</span>
          <span>+HP, +DEF</span>
        </div>
        <div className="htrow">
          <span className="htcell-em">V–VII</span>
          <span>Utility</span>
          <span>+ATK, +SPD</span>
        </div>
        <div className="htrow">
          <span className="htcell-em">VIII–X</span>
          <span>Utility</span>
          <span>+HP, +DEF scaling</span>
        </div>
        <div className="htrow">
          <span className="htcell-em">Court Cards</span>
          <span>Relic</span>
          <span>% scaling bonuses</span>
        </div>
      </div>

      <p className="help-p" style={{ marginTop: 10 }}>Gear is equippable from the Party screen — tap a hero, then tap an empty gear slot. Higher-numbered cards from the same suit generally outscale lower ones.</p>
    </div>
  );
}

function ReadingSection() {
  return (
    <div className="help-content">
      <p className="help-p">Spend <strong>✦ Aether</strong> to draw new heroes from the Reading. Heroes you already own convert into <strong>Shards</strong>, which unlock locked heroes from the Codex.</p>

      <div className="help-table">
        <div className="htrow head">
          <span>Draw</span>
          <span>Cost</span>
          <span>Pity</span>
        </div>
        <div className="htrow">
          <span>Single pull</span>
          <span>✦ 100</span>
          <span>—</span>
        </div>
        <div className="htrow">
          <span>Ten-pull</span>
          <span>✦ 900</span>
          <span>1 Legendary guaranteed</span>
        </div>
      </div>

      <div className="help-chips" style={{ marginTop: 12 }}>
        <div className="help-chip" style={{ background: "rgba(176,107,255,.12)", borderColor: "var(--neon-violet)" }}>
          <span className="chip-label">Epic</span>
          <span className="chip-value" style={{ color: "var(--neon-violet)" }}>70%</span>
        </div>
        <div className="help-chip" style={{ background: "rgba(255,212,94,.12)", borderColor: "var(--neon-gold)" }}>
          <span className="chip-label">Legendary</span>
          <span className="chip-value" style={{ color: "var(--neon-gold)" }}>25%</span>
        </div>
        <div className="help-chip" style={{ background: "rgba(255,94,196,.12)", borderColor: "var(--neon-magenta)" }}>
          <span className="chip-label">Mythic</span>
          <span className="chip-value" style={{ color: "var(--neon-magenta)" }}>5%</span>
        </div>
      </div>

      <p className="help-p" style={{ marginTop: 12 }}>Accumulate shards from duplicates or floor drops. Enough shards let you craft a locked hero for free from the Codex — no pulls needed.</p>
    </div>
  );
}

function DailySection() {
  return (
    <div className="help-content">
      <p className="help-p">Three daily activities reset at midnight. Complete all three for the best daily yield.</p>

      <div className="role-list">
        <div className="role-row">
          <span className="role-ico">🌙</span>
          <div className="role-body">
            <strong className="role-name">Diviner's Gift</strong>
            <span className="role-desc tiny muted">Free login bonus: ◈ Dust + ✦ Aether. Amount scales with your highest cleared floor.</span>
          </div>
        </div>
        <div className="role-row">
          <span className="role-ico">🜂</span>
          <div className="role-body">
            <strong className="role-name">Elemental Trial</strong>
            <span className="role-desc tiny muted">Same-element enemies every fight. Rotates through all 4 elements across the week. Drops gear relevant to that element's suits.</span>
          </div>
        </div>
        <div className="role-row">
          <span className="role-ico">👁</span>
          <div className="role-body">
            <strong className="role-name">Daily Reckoning</strong>
            <span className="role-desc tiny muted">Scored boss fight — survive as long as possible. Only the first clear of the day counts for the daily reward. Replay for practice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrenciesSection() {
  return (
    <div className="help-content">
      <div className="role-list">
        <div className="role-row">
          <span className="role-ico" style={{ color: "var(--neon-cyan)", fontSize: 22 }}>◈</span>
          <div className="role-body">
            <strong className="role-name">Dust</strong>
            <span className="role-desc tiny muted">Earned from floor clears, daily login, and replays. Used to level up and ascend heroes in the Party screen.</span>
          </div>
        </div>
        <div className="role-row">
          <span className="role-ico" style={{ color: "var(--neon-magenta)", fontSize: 22 }}>✦</span>
          <div className="role-body">
            <strong className="role-name">Aether</strong>
            <span className="role-desc tiny muted">Earned from first floor clears, daily login, and trials. Spent on Readings (single pull: 100, ten-pull: 900).</span>
          </div>
        </div>
        <div className="role-row">
          <span className="role-ico">🔹</span>
          <div className="role-body">
            <strong className="role-name">Hero Shards</strong>
            <span className="role-desc tiny muted">Duplicate heroes convert to shards. Earn enough shards for a hero and craft them free from the Codex — no Aether cost.</span>
          </div>
        </div>
      </div>

      <div className="help-rule" style={{ marginTop: 12 }}>
        <div className="help-rule-head">Idle Gains</div>
        <p className="help-p">While the game is closed, Dust trickles in passively based on your highest cleared floor. Claim it when you return via the idle popup.</p>
      </div>
    </div>
  );
}
