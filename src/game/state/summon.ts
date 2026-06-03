import type { Rarity } from "../types";
import { HEROES } from "../data/heroes";
import { makeRng } from "../engine/rng";

// ─────────────────────────────────────────────────────────────────────────────
//  "The Reading" — the summon (handoff §8 Apocrypha framing, §9.5 no-pressure).
//
//  Spent in Aether, never a hard paywall: duplicates convert to shards, and a
//  ten-Reading guarantees a Legendary+. Combined with floor unlocks and shard
//  crafting, every hero is reachable without spending — collection solves
//  "stuck," money only saves time.
// ─────────────────────────────────────────────────────────────────────────────

export const READING_COST = 60; // aether per single
export const TEN_READING_COST = 540; // 10% off

const TIER_WEIGHT: Record<Rarity, number> = {
  rare: 0,
  epic: 70,
  legendary: 25,
  mythic: 5,
};

const POOL: Record<Rarity, string[]> = {
  rare: [],
  epic: [],
  legendary: [],
  mythic: [],
};
for (const h of Object.values(HEROES)) POOL[h.rarity].push(h.id);

export interface PullResult {
  heroId: string;
  rarity: Rarity;
}

function rollTier(roll: number): Rarity {
  const total = TIER_WEIGHT.epic + TIER_WEIGHT.legendary + TIER_WEIGHT.mythic;
  let r = roll * total;
  if ((r -= TIER_WEIGHT.mythic) < 0) return "mythic";
  if ((r -= TIER_WEIGHT.legendary) < 0) return "legendary";
  return "epic";
}

/** Draw `count` cards. Seed makes a given Reading reproducible for the animation. */
export function drawReading(count: number, seed: number): PullResult[] {
  const rng = makeRng(seed);
  const results: PullResult[] = [];
  let gotLegendaryPlus = false;
  for (let i = 0; i < count; i++) {
    let tier = rollTier(rng.next());
    // Ten-Reading pity: last card is Legendary+ if none yet.
    if (count >= 10 && i === count - 1 && !gotLegendaryPlus) {
      tier = rng.next() < 0.15 ? "mythic" : "legendary";
    }
    if (tier === "legendary" || tier === "mythic") gotLegendaryPlus = true;
    const pool = POOL[tier].length ? POOL[tier] : POOL.epic;
    results.push({ heroId: rng.pick(pool), rarity: tier });
  }
  return results;
}
