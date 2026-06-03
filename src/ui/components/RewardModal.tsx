import { useGame } from "../../game/state/store";
import { HEROES } from "../../game/data/heroes";
import { GEAR } from "../../game/data/gear";
import { sfx } from "../audio/sfx";
import { fmt } from "./TopBar";

export function RewardModal() {
  const reward = useGame((s) => s.lastReward);
  const battle = useGame((s) => s.battle);
  const set = useGame.setState;
  // Only show reward modal when not inside a battle (battle shows its own result).
  if (!reward || battle) return null;

  const close = () => { sfx.tap(); set({ lastReward: null }); };

  return (
    <div className="modal-scrim" onClick={close}>
      <div className="modal" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 40 }}>✨</div>
        <h2 className="modal-title">Spoils</h2>
        <div className="col gap-8" style={{ margin: "14px 0" }}>
          {reward.dust ? <RewardRow ico="◈" cls="cur-dust" label="Arcane Dust" amt={`+${fmt(reward.dust)}`} /> : null}
          {reward.aether ? <RewardRow ico="✦" cls="cur-aether" label="Aether" amt={`+${fmt(reward.aether)}`} /> : null}
          {reward.score != null ? <RewardRow ico="🏆" cls="" label="Score" amt={fmt(reward.score)} /> : null}
          {reward.unlocked?.map((id) => (
            <RewardRow key={id} ico="🎴" cls="" label={`${HEROES[id]?.name} joins you!`} amt="NEW" highlight />
          ))}
          {reward.shards?.map((s, i) => (
            <RewardRow key={i} ico="🔹" cls="" label={`${HEROES[s.heroId]?.name ?? s.heroId} shards`} amt={`+${s.amount}`} />
          ))}
          {reward.gear?.map((g, i) => (
            <RewardRow key={i} ico={GEAR[g]?.icon ?? "⚙"} cls="" label={GEAR[g]?.name ?? g} amt="GEAR" />
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={close}>Claim</button>
      </div>
    </div>
  );
}

function RewardRow({ ico, cls, label, amt, highlight }: { ico: string; cls: string; label: string; amt: string; highlight?: boolean }) {
  return (
    <div className="panel row between" style={{ padding: "10px 14px", borderColor: highlight ? "var(--neon-gold)" : undefined }}>
      <span className="row gap-8"><span className={`ico ${cls}`} style={{ fontSize: 18 }}>{ico}</span>{label}</span>
      <strong style={{ color: highlight ? "var(--neon-gold)" : "var(--ink)" }}>{amt}</strong>
    </div>
  );
}
