import type { GearDef } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
//  Gear = the Numbered Minor Arcana (handoff §8, Tier 3).
//  "Sidesteps 'what does the 6 of Pentacles do as a hero' and creates a deep
//   on-theme equipment layer." Aces are weapons (ATK), defensive cards give
//   DEF/HP, court-ish numbers give utility. Each hero has 3 gear slots.
// ─────────────────────────────────────────────────────────────────────────────

export const GEAR: Record<string, GearDef> = {
  ace_wands: {
    id: "ace_wands", name: "Ace of Wands", arcana: "Ace · Wands", element: "wands", rarity: "rare",
    icon: "🜂", bonus: { atk: 60 }, bonusPct: { atk: 0.08 },
    flavor: "A single living branch, alight at the tip.",
  },
  ace_cups: {
    id: "ace_cups", name: "Ace of Cups", arcana: "Ace · Cups", element: "cups", rarity: "rare",
    icon: "🜄", bonus: { hpMax: 600 }, bonusPct: { hpMax: 0.06 },
    flavor: "An overflowing chalice; it never empties.",
  },
  ace_swords: {
    id: "ace_swords", name: "Ace of Swords", arcana: "Ace · Swords", element: "swords", rarity: "rare",
    icon: "🜁", bonus: { atk: 45, spd: 14 },
    flavor: "Truth with an edge.",
  },
  ace_pentacles: {
    id: "ace_pentacles", name: "Ace of Pentacles", arcana: "Ace · Pentacles", element: "pentacles", rarity: "rare",
    icon: "🜃", bonus: { def: 50, hpMax: 350 },
    flavor: "A coin that buys time, not things.",
  },
  three_cups: {
    id: "three_cups", name: "Three of Cups", arcana: "III · Cups", element: "cups", rarity: "rare",
    icon: "🍷", bonus: { hpMax: 400 }, bonusPct: { def: 0.08 },
    flavor: "A toast among friends — the rally.",
  },
  eight_wands: {
    id: "eight_wands", name: "Eight of Wands", arcana: "VIII · Wands", element: "wands", rarity: "epic",
    icon: "💨", bonus: { spd: 22, atk: 30 },
    flavor: "Eight branches loosed; swift arrival.",
  },
  ten_pentacles: {
    id: "ten_pentacles", name: "Ten of Pentacles", arcana: "X · Pentacles", element: "pentacles", rarity: "epic",
    icon: "🏛", bonus: { hpMax: 900, def: 40 }, bonusPct: { hpMax: 0.08 },
    flavor: "Legacy, stone, and a name that endures.",
  },
  knight_swords: {
    id: "knight_swords", name: "Knight of Swords", arcana: "Knight · Swords", element: "swords", rarity: "epic",
    icon: "🐎", bonus: { atk: 70, spd: 18 }, bonusPct: { atk: 0.06 },
    flavor: "All charge, no caution.",
  },
  queen_cups: {
    id: "queen_cups", name: "Queen of Cups", arcana: "Queen · Cups", element: "cups", rarity: "epic",
    icon: "👑", bonus: { hpMax: 500, atk: 40 }, bonusPct: { hpMax: 0.06 },
    flavor: "She feels the tide before it turns.",
  },
  ten_swords: {
    id: "ten_swords", name: "Ten of Swords", arcana: "X · Swords", element: "swords", rarity: "legendary",
    icon: "⚔", bonus: { atk: 120 }, bonusPct: { atk: 0.12 },
    flavor: "Rock bottom is its own kind of clarity.",
  },
  king_pentacles: {
    id: "king_pentacles", name: "King of Pentacles", arcana: "King · Pentacles", element: "pentacles", rarity: "legendary",
    icon: "🪙", bonus: { def: 90, hpMax: 700 }, bonusPct: { def: 0.12 },
    flavor: "Wealth as a fortress.",
  },
  sun_wands: {
    id: "sun_wands", name: "Nine of Wands", arcana: "IX · Wands", element: "wands", rarity: "legendary",
    icon: "🔥", bonus: { atk: 90, hpMax: 400 }, bonusPct: { atk: 0.1 },
    flavor: "Wounded, wary, and still standing guard.",
  },
};

export const GEAR_IDS = Object.keys(GEAR);

export function gearDef(id: string): GearDef | undefined {
  return GEAR[id];
}
