import { useGame } from "../../game/state/store";
import { sfx } from "../audio/sfx";
import { fmt } from "./TopBar";

export function IdleModal() {
  const idle = useGame((s) => s.idleGains);
  const claim = useGame((s) => s.claimIdle);
  if (!idle || (idle.dust <= 0 && idle.aether <= 0)) return null;
  const hrs = idle.hours;
  const label = hrs >= 1 ? `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m` : `${Math.round(hrs * 60)}m`;

  return (
    <div className="modal-scrim">
      <div className="modal" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44, filter: "drop-shadow(0 0 16px var(--neon-cyan))" }}>🌙</div>
        <h2 className="modal-title">The Deck Kept Watch</h2>
        <p className="muted small" style={{ marginBottom: 16 }}>
          While you were away for {label}, your climb drew resources from the floors below.
        </p>
        <div className="row center gap-12" style={{ marginBottom: 18 }}>
          <div className="cur-chip" style={{ fontSize: 16, padding: "10px 16px" }}>
            <span className="ico cur-dust">◈</span> +{fmt(idle.dust)}
          </div>
          <div className="cur-chip" style={{ fontSize: 16, padding: "10px 16px" }}>
            <span className="ico cur-aether">✦</span> +{fmt(idle.aether)}
          </div>
        </div>
        <button className="btn btn-cyan" style={{ width: "100%" }} onClick={() => { sfx.reward(); claim(); }}>
          Collect
        </button>
      </div>
    </div>
  );
}
