import { useGame } from "../../game/state/store";

export function TopBar() {
  const dust = useGame((s) => s.save.dust);
  const aether = useGame((s) => s.save.aether);
  return (
    <div className="topbar">
      <div className="topbar-logo title-deco">ARCANA CLIMB</div>
      <div className="topbar-cur">
        <div className="cur-chip"><span className="ico cur-dust">◈</span>{fmt(dust)}</div>
        <div className="cur-chip"><span className="ico cur-aether">✦</span>{fmt(aether)}</div>
      </div>
    </div>
  );
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 10_000) return (n / 1000).toFixed(1) + "k";
  return Math.round(n).toLocaleString();
}
