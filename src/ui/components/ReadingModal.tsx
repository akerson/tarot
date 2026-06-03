import { useEffect, useState } from "react";
import { useGame } from "../../game/state/store";
import { HEROES } from "../../game/data/heroes";
import { TarotCard } from "./TarotCard";
import { sfx } from "../audio/sfx";
import "./reading.css";

export function ReadingModal() {
  const reading = useGame((s) => s.lastReading);
  const clear = useGame((s) => s.clearReading);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => { setRevealed(0); }, [reading]);

  if (!reading) return null;
  const { results, gains } = reading;
  const all = revealed >= results.length;

  const revealNext = () => {
    if (all) { sfx.tap(); clear(); return; }
    const r = results[revealed];
    sfx.reveal(r.rarity as "epic" | "legendary" | "mythic");
    setRevealed((n) => n + 1);
  };
  const revealAll = () => { sfx.summon(); setRevealed(results.length); };

  return (
    <div className="reading-scrim">
      <div className="reading-rays" />
      <h2 className="reading-head title-deco">The Reading</h2>

      <div className={`reading-grid count-${results.length}`}>
        {results.map((r, i) => {
          const shown = i < revealed;
          const isNew = (gains[r.heroId] ?? 0) > 0 && firstIndexOf(results, r.heroId) === i;
          return (
            <div key={i} className={`reading-slot ${shown ? "flipped" : ""} rar-${r.rarity}`}>
              <div className="reading-inner">
                <div className="reading-back">✦</div>
                <div className="reading-front">
                  {shown && <TarotCard hero={HEROES[r.heroId]} size={results.length > 1 ? "sm" : "md"} badge={isNew ? "NEW" : undefined} />}
                  {shown && !isNew && <div className="reading-shards">+{Math.abs(gains[r.heroId] ?? 0) / occurrences(results, r.heroId)} shards</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="reading-actions">
        {!all && results.length > 1 && <button className="btn btn-ghost" onClick={revealAll}>Reveal All</button>}
        <button className="btn btn-primary" onClick={revealNext}>{all ? "Done" : "Reveal"}</button>
      </div>
    </div>
  );
}

function firstIndexOf(arr: { heroId: string }[], id: string) { return arr.findIndex((r) => r.heroId === id); }
function occurrences(arr: { heroId: string }[], id: string) { return Math.max(1, arr.filter((r) => r.heroId === id).length); }
