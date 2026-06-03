import type { OwnedHero, Rarity } from "../types";
import { levelCap } from "../engine/build";

// ─────────────────────────────────────────────────────────────────────────────
//  Upgrade economy (handoff §9.6).
//   • Level  — spend Arcane Dust. Capped by ascension.
//   • Ascend — spend hero Shards (+ dust). Raises cap +10 and stats +8%/star.
//   • Gear   — equip Numbered Minors (handled in store).
//  Heroes are KEYS, not power: leveling closes small gaps, but the floor that
//  wants a Sniper still wants a Sniper. Progression never gates by grind-wall.
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_STARS = 6;

/** Dust to take a hero from `level` to `level+1`. */
export function levelUpCost(level: number): number {
  return Math.round(40 * Math.pow(level, 1.25));
}

/** Total dust to go from current level to a target level. */
export function levelUpCostRange(from: number, to: number): number {
  let sum = 0;
  for (let l = from; l < to; l++) sum += levelUpCost(l);
  return sum;
}

export function canLevelUp(owned: OwnedHero): boolean {
  return owned.level < levelCap(owned.stars);
}

/** Shards needed to go from `stars` to `stars+1`. */
export function ascendShardCost(stars: number): number {
  return 30 + stars * 30; // 30,60,90,120,150,180
}

export function ascendDustCost(stars: number): number {
  return 400 * (stars + 1);
}

export function canAscend(owned: OwnedHero): boolean {
  return owned.stars < MAX_STARS && owned.shards >= ascendShardCost(owned.stars);
}

/** Shards a duplicate pull converts into, by rarity. */
export const DUP_SHARDS: Record<Rarity, number> = {
  rare: 10,
  epic: 15,
  legendary: 25,
  mythic: 40,
};

/** Shards required to first unlock a locked hero via crafting. */
export const UNLOCK_SHARDS: Record<Rarity, number> = {
  rare: 40,
  epic: 60,
  legendary: 90,
  mythic: 150,
};

export function newOwned(id: string, level = 1): OwnedHero {
  return { id, level, stars: 0, shards: 0, gear: [null, null, null] };
}
