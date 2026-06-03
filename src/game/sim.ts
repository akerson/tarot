// Balance simulation — run with:  npx tsx src/game/sim.ts
// Auto-resolves each floor with a chosen team and reports win + rounds, so the
// "are you strong enough?" curve can be tuned before it ever hits the UI.

import { FLOORS } from "./data/floors.ts";
import { buildEnemyParty, buildPlayerParty } from "./engine/build.ts";
import { initBattle, autoResolve } from "./engine/combat.ts";
import { newOwned } from "./state/progression.ts";
import type { OwnedHero } from "./types.ts";

function team(ids: string[], level: number): { owned: OwnedHero; slot: number }[] {
  return ids.map((id, i) => ({ owned: { ...newOwned(id, level), stars: 1 }, slot: i }));
}

// Hand-picked "intended counter" team per floor (the key the floor demands).
const COUNTERS: Record<number, string[]> = {
  1: ["emperor", "chariot", "sun", "star"],
  2: ["emperor", "tower", "sun", "star"],
  3: ["emperor", "chariot", "sun", "star"],
  4: ["emperor", "hermit", "moon", "star"],
  5: ["emperor", "chariot", "star", "hierophant"],
  6: ["emperor", "tower", "magician", "star"],
  7: ["emperor", "tower", "tower", "star"],
  8: ["emperor", "moon", "star", "empress"],
  9: ["chariot", "tower", "sun", "star"],
  10: ["emperor", "hierophant", "hanged_man", "star"],
  11: ["emperor", "hermit", "magician", "star"],
  12: ["emperor", "hierophant", "tower", "star"],
  13: ["strength", "death", "empress", "star"],
  14: ["emperor", "chariot", "star", "sun"],
  15: ["emperor", "tower", "hierophant", "star"],
};

// A "generic" non-counter team to check that gimmick floors actually demand keys.
const GENERIC = ["emperor", "chariot", "tower", "sun"];

function run(ids: string[], level: number, floorIdx: number): { won: boolean; rounds: number } {
  const f = FLOORS[floorIdx - 1];
  const party = buildPlayerParty(team(ids, level));
  const enemies = buildEnemyParty(f.enemies);
  const b = initBattle(party, enemies, f.index, 12345 + floorIdx);
  const won = autoResolve(b);
  return { won, rounds: b.round };
}

console.log("floor | name              | counter (lvl)        | generic");
console.log("------|-------------------|----------------------|--------");
for (const f of FLOORS) {
  const lvl = Math.max(6, Math.round((f.enemies.reduce((a, e) => a + e.level, 0) / f.enemies.length)));
  const c = run(COUNTERS[f.index] ?? GENERIC, lvl, f.index);
  const g = run(GENERIC, lvl, f.index);
  const name = f.name.padEnd(17).slice(0, 17);
  const cstr = `${c.won ? "WIN " : "LOSS"} r${c.rounds}`.padEnd(8);
  const gstr = `${g.won ? "WIN " : "LOSS"} r${g.rounds}`;
  console.log(`  ${String(f.index).padStart(2)}  | ${name} | ${cstr} @lvl${lvl}      | ${gstr}`);
}
