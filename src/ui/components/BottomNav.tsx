import { useGame, type Screen } from "../../game/state/store";
import { todayKey } from "../../game/data/dailies";

const TABS: { id: Screen; label: string; ico: string }[] = [
  { id: "climb", label: "CLIMB", ico: "🗼" },
  { id: "roster", label: "PARTY", ico: "🎴" },
  { id: "summon", label: "READING", ico: "🔮" },
  { id: "daily", label: "RITUAL", ico: "🌙" },
  { id: "codex", label: "CODEX", ico: "📖" },
];

export function BottomNav({ onNav }: { onNav: () => void }) {
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const loginDate = useGame((s) => s.save.daily.loginDate);
  const dailyAvailable = loginDate !== todayKey();

  return (
    <div className="bottomnav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-btn ${screen === t.id ? "active" : ""}`}
          onClick={() => { if (screen !== t.id) { setScreen(t.id); onNav(); } }}
        >
          <span className="nav-ico">{t.ico}</span>
          <span>{t.label}</span>
          {t.id === "daily" && dailyAvailable && <span className="nav-dot" />}
        </button>
      ))}
    </div>
  );
}
