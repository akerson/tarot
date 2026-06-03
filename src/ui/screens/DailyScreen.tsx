import { useGame } from "../../game/state/store";
import { activeTrialElement, todayKey, buildTrialFloor, buildDailyBoss } from "../../game/data/dailies";
import { ELEMENTS } from "../../game/data/elements";
import { GEAR } from "../../game/data/gear";
import { sfx } from "../audio/sfx";
import { fmt } from "../components/TopBar";
import "./daily.css";

export function DailyScreen() {
  const daily = useGame((s) => s.save.daily);
  const highest = useGame((s) => s.save.highestFloor);
  const claimLogin = useGame((s) => s.claimLogin);
  const begin = useGame((s) => s.beginBattle);
  const hasTeam = useGame((s) => s.save.team.some(Boolean));

  const today = todayKey();
  const loginAvailable = daily.loginDate !== today;
  const trialDone = daily.trialDate === today;
  const bossDone = daily.bossDate === today;

  const el = activeTrialElement();
  const elInfo = ELEMENTS[el];
  const trial = buildTrialFloor(highest);
  const boss = buildDailyBoss(highest);
  const trialGear = trial.reward.gear?.[0];

  const start = (kind: "trial" | "boss") => {
    if (!hasTeam) { sfx.error(); return; }
    sfx.climb();
    begin(kind);
  };

  return (
    <div className="screen daily-screen">
      <div className="section-head">
        <div>
          <div className="section-title">Daily Ritual</div>
          <div className="section-sub">Resets at midnight · parallel paths for the stuck climber</div>
        </div>
      </div>

      <button className={`daily-card login ${loginAvailable ? "" : "done"}`} disabled={!loginAvailable} onClick={() => { if (loginAvailable) { sfx.reward(); claimLogin(); } }}>
        <span className="dc-ico">🌙</span>
        <div className="dc-body">
          <strong>The Diviner's Gift</strong>
          <span className="tiny muted">Daily login · ◈ {fmt(200 + highest * 20)} + ✦ 20</span>
        </div>
        <span className={`dc-status ${loginAvailable ? "ready" : ""}`}>{loginAvailable ? "CLAIM" : "✓"}</span>
      </button>

      <div className={`daily-card trial ${trialDone ? "done" : ""}`} style={{ ["--accent" as string]: elInfo.color }}>
        <span className="dc-ico" style={{ color: elInfo.color }}>{elInfo.glyph}</span>
        <div className="dc-body">
          <strong>Trial of {elInfo.suit}</strong>
          <span className="tiny muted">All {elInfo.label} foes · drops {trialGear ? GEAR[trialGear]?.name : "gear"}</span>
        </div>
        <button className="btn btn-sm btn-cyan" disabled={trialDone} onClick={() => start("trial")}>{trialDone ? "✓ Done" : "Enter"}</button>
      </div>

      <div className="daily-card boss">
        <span className="dc-ico">☠</span>
        <div className="dc-body">
          <strong>Daily Reckoning</strong>
          <span className="tiny muted">Scored boss · best {fmt(daily.bossBest)} {bossDone ? "· cleared today" : ""}</span>
        </div>
        <button className="btn btn-sm btn-gold" onClick={() => start("boss")}>{bossDone ? "Replay" : "Fight"}</button>
      </div>

      <div className="daily-boss-preview panel">
        <div className="tiny faint" style={{ letterSpacing: 1, marginBottom: 8 }}>TODAY'S RECKONING</div>
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          {boss.threats.map((t) => <span key={t} className="threat-chip">{t}</span>)}
        </div>
        <p className="tiny muted" style={{ marginTop: 8 }}>{boss.rule}</p>
      </div>

      {!hasTeam && <p className="focus-warn">Set a party in the Party tab to enter daily modes.</p>}
    </div>
  );
}
