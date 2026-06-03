import { useState } from "react";
import { useGame } from "../../game/state/store";
import { sfx } from "../audio/sfx";
import "./intro.css";

const PAGES = [
  {
    glyph: "🃏",
    title: "Arcana Climb",
    body: "A single endless tower. You assemble a party of tarot heroes and climb, one hand-crafted floor at a time. Cleared floors stay cleared — power only ever goes up.",
  },
  {
    glyph: "🛡️",
    title: "The One Rule",
    body: "Two rows per side: 2 front, 2 back. FRONT PROTECTS BACK. Melee strikes can only reach the enemy front row — ranged and magic reach anyone. That's the whole rule.",
  },
  {
    glyph: "🔑",
    title: "Collect Keys, Not Power",
    body: "Stuck on a floor? You don't grind — you collect the hero that breaks it. A Sniper to reach the back line. A Phantom to ignore the wall. The right card is the answer.",
  },
];

export function IntroOverlay() {
  const markSeen = useGame((s) => s.markIntroSeen);
  const [page, setPage] = useState(0);
  const p = PAGES[page];
  const last = page === PAGES.length - 1;

  return (
    <div className="intro-scrim">
      <div className="intro-card pop-in" key={page}>
        <div className="intro-glyph">{p.glyph}</div>
        <h1 className="intro-title title-deco">{p.title}</h1>
        <p className="intro-body">{p.body}</p>
        <div className="intro-dots">
          {PAGES.map((_, i) => <span key={i} className={i === page ? "on" : ""} />)}
        </div>
        <button
          className="btn btn-primary intro-btn"
          onClick={() => { sfx.select(); last ? markSeen() : setPage(page + 1); }}
        >
          {last ? "Begin the Climb" : "Next"}
        </button>
        {!last && <button className="intro-skip" onClick={() => { sfx.tap(); markSeen(); }}>Skip</button>}
      </div>
    </div>
  );
}
