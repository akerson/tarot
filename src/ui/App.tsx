import { useEffect } from "react";
import { useGame } from "../game/state/store";
import { setSfxEnabled, primeAudio, sfx } from "./audio/sfx";
import { TopBar } from "./components/TopBar";
import { BottomNav } from "./components/BottomNav";
import { ClimbScreen } from "./screens/ClimbScreen";
import { RosterScreen } from "./screens/RosterScreen";
import { SummonScreen } from "./screens/SummonScreen";
import { DailyScreen } from "./screens/DailyScreen";
import { CodexScreen } from "./screens/CodexScreen";
import { HelpScreen } from "./screens/HelpScreen";
import { BattleScreen } from "./screens/BattleScreen";
import { IdleModal } from "./components/IdleModal";
import { RewardModal } from "./components/RewardModal";
import { ReadingModal } from "./components/ReadingModal";
import { IntroOverlay } from "./components/IntroOverlay";
import "./app.css";

export function App() {
  const screen = useGame((s) => s.screen);
  const battle = useGame((s) => s.battle);
  const sound = useGame((s) => s.save.settings.sound);
  const seenIntro = useGame((s) => s.save.seenIntro);

  useEffect(() => { setSfxEnabled(sound); }, [sound]);
  useEffect(() => {
    const prime = () => { primeAudio(); window.removeEventListener("pointerdown", prime); };
    window.addEventListener("pointerdown", prime);
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  return (
    <>
      <div className="app-bg" />
      <div className="app-shell">
        {!battle && (
          <>
            <TopBar />
            <div className="screen-wrap" key={screen}>
              {screen === "climb" && <ClimbScreen />}
              {screen === "roster" && <RosterScreen />}
              {screen === "summon" && <SummonScreen />}
              {screen === "daily" && <DailyScreen />}
              {screen === "codex" && <CodexScreen />}
              {screen === "help" && <HelpScreen />}
            </div>
            <BottomNav onNav={() => sfx.nav()} />
          </>
        )}
        {battle && <BattleScreen />}
      </div>

      {!seenIntro && <IntroOverlay />}
      <IdleModal />
      <RewardModal />
      <ReadingModal />
    </>
  );
}
