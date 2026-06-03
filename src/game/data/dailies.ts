import type { Element, FloorDef } from "../types";
import { ELEMENTS } from "./elements";

// ─────────────────────────────────────────────────────────────────────────────
//  The daily ritual layer (handoff §3, §9.3): rotating side modes that drop
//  specific gear, plus a daily boss with a personal-best score. Parallel content
//  so a stuck climber always has something productive to do.
// ─────────────────────────────────────────────────────────────────────────────

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dayIndex(d = new Date()): number {
  return Math.floor(d.getTime() / 86_400_000);
}

const TRIAL_ELEMENTS: Element[] = ["wands", "cups", "swords", "pentacles"];

const TRIAL_GEAR: Record<Element, string[]> = {
  wands: ["ace_wands", "eight_wands", "sun_wands"],
  cups: ["ace_cups", "three_cups", "queen_cups"],
  swords: ["ace_swords", "knight_swords", "ten_swords"],
  pentacles: ["ace_pentacles", "ten_pentacles", "king_pentacles"],
  arcana: ["ace_swords"],
};

const TRIAL_ENEMY: Record<Element, string> = {
  wands: "ember_brute",
  cups: "husk_seer",
  swords: "umbral_stalker",
  pentacles: "ironbound_ward",
  arcana: "void_caster",
};

export function activeTrialElement(d = new Date()): Element {
  return TRIAL_ELEMENTS[dayIndex(d) % TRIAL_ELEMENTS.length];
}

/** Today's elemental Trial — a quick battle dropping that suit's gear. */
export function buildTrialFloor(highestFloor: number, d = new Date()): FloorDef {
  const el = activeTrialElement(d);
  const lvl = Math.max(6, Math.round(highestFloor * 1.4) + 4);
  const enemyId = TRIAL_ENEMY[el];
  const gearPool = TRIAL_GEAR[el];
  const reward = gearPool[dayIndex(d) % gearPool.length];
  const info = ELEMENTS[el];
  return {
    index: -1,
    name: `Trial of ${info.suit}`,
    threats: [`All ${info.label}`, "Daily"],
    demands: [],
    hint: `A daily proving ground of ${info.label}. Clear it for ${info.suit} gear.`,
    rule: `Every foe is ${info.suit} (${info.label}).`,
    enemies: [
      { enemyId, slot: 0, level: lvl },
      { enemyId, slot: 1, level: lvl },
      { enemyId, slot: 2, level: lvl, scale: { atk: 1.1 } },
    ],
    reward: { dust: 240 + highestFloor * 18, gear: [reward] },
  };
}

/** The daily boss — scales with the player's climb; scored by speed. */
export function buildDailyBoss(highestFloor: number, d = new Date()): FloorDef {
  const lvl = Math.max(10, Math.round(highestFloor * 1.7) + 8);
  const di = dayIndex(d);
  const bosses = ["the_eclipse", "warden_thorns", "the_devil"];
  const bossId = bosses[di % bosses.length];
  return {
    index: -2,
    name: "Daily Reckoning",
    threats: ["BOSS", "Scored", "Daily"],
    demands: [],
    hint: "Fell the daily boss as fast as you can. Fewer rounds = higher score.",
    boss: true,
    rule: "Scored by rounds survived and damage dealt. Beat your personal best.",
    enemies: [
      { enemyId: bossId, slot: 0, level: lvl, scale: { hpMax: 1.2 } },
      { enemyId: "zealot", slot: 2, level: lvl - 4 },
      { enemyId: "zealot", slot: 3, level: lvl - 4 },
    ],
    reward: { dust: 600 + highestFloor * 30, aether: 30 },
  };
}
