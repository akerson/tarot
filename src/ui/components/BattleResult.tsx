import { useEffect } from "react";
import { useGame } from "../../game/state/store";
import { HEROES } from "../../game/data/heroes";
import { GEAR } from "../../game/data/gear";
import { sfx } from "../audio/sfx";
import { fmt } from "./TopBar";
import "./result.css";

export function BattleResult() {
  const battle = useGame((s) => s.battle);
  const ctx = useGame((s) => s.battleCtx);
  const reward = useGame((s) => s.lastReward);
  const exitBattle = useGame((s) => s.exitBattle);
  const begin = useGame((s) => s.beginBattle);
  const setScreen = useGame((s) => s.setScreen);
  const won = battle?.phase === "won";

  useEffect(() => { won ? sfx.victory() : sfx.defeat(); }, [won]);

  if (!battle || !ctx) return null;

  const retry = () => { sfx.climb(); const k = ctx.kind; const idx = ctx.floor.index; useGame.setState({ lastReward: null }); begin(k === "preview" ? "climb" : k, idx > 0 ? idx : undefined); };
  const toClimb = () => { sfx.tap(); exitBattle(); setScreen("climb"); };
  const toRoster = () => { sfx.nav(); exitBattle(); setScreen("roster"); };
  const nextFloor = () => { sfx.climb(); useGame.setState({ lastReward: null }); begin("climb"); };

  const canAdvance = won && ctx.kind === "climb" && reward?.newFloor;

  return (
    <div className="result-scrim">
      <div className={`result-card pop-in ${won ? "win" : "lose"}`}>
        <div className="result-rays" />
        <div className="result-emblem">{won ? "✦" : "☾"}</div>
        <h1 className="result-title title-deco">{won ? "Floor Cleared" : "Repelled"}</h1>
        <p className="result-sub muted">
          {won
            ? ctx.kind === "boss" ? "The boss falls before you." : `${ctx.floor.name} is yours. The climb continues.`
            : "The arcana were not aligned. Reshape your party — the answer is a hero, not a grind."}
        </p>

        {won && reward && (
          <div className="result-rewards">
            {reward.dust ? <Chip ico="◈" cls="cur-dust" txt={`+${fmt(reward.dust)}`} /> : null}
            {reward.aether ? <Chip ico="✦" cls="cur-aether" txt={`+${fmt(reward.aether)}`} /> : null}
            {reward.score != null ? <Chip ico="🏆" cls="" txt={`Score ${fmt(reward.score)}`} /> : null}
            {reward.shards?.map((s, i) => <Chip key={i} ico="🔹" cls="" txt={`${HEROES[s.heroId]?.name?.replace("The ", "") ?? s.heroId} +${s.amount}`} />)}
            {reward.gear?.map((g, i) => <Chip key={i} ico={GEAR[g]?.icon ?? "⚙"} cls="" txt={GEAR[g]?.name ?? g} />)}
            {reward.unlocked?.map((id) => <Chip key={id} ico="🎴" cls="gold" txt={`${HEROES[id]?.name} joins!`} />)}
            {reward.bestScore != null && reward.score === reward.bestScore && <Chip ico="⭐" cls="gold" txt="New Best!" />}
            {!reward.newFloor && ctx.kind === "climb" && <span className="tiny faint">Replay reward (25%)</span>}
          </div>
        )}

        {won && reward?.unlocked?.length ? (
          <div className="result-unlock-note">A new key for the floors above. Equip it from your Party.</div>
        ) : null}

        <div className="result-actions">
          {won ? (
            <>
              {canAdvance ? <button className="btn btn-primary" onClick={nextFloor}>Next Floor ▲</button> : <button className="btn btn-primary" onClick={toClimb}>Continue</button>}
              <button className="btn btn-ghost btn-sm" onClick={toClimb}>The Climb</button>
            </>
          ) : (
            <>
              <button className="btn btn-gold" onClick={toRoster}>Rebuild Party</button>
              <button className="btn btn-ghost btn-sm" onClick={retry}>Retry</button>
              <button className="btn btn-ghost btn-sm" onClick={toClimb}>Retreat</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ ico, cls, txt }: { ico: string; cls: string; txt: string }) {
  return <span className={`result-chip ${cls === "gold" ? "gold" : ""}`}><span className={`ico ${cls}`}>{ico}</span>{txt}</span>;
}
