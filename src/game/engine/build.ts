import type {
  BaseStats,
  Combatant,
  EnemySpawn,
  HeroDef,
  OwnedHero,
} from "../types";
import { HEROES } from "../data/heroes";
import { ENEMIES } from "../data/enemies";
import { GEAR } from "../data/gear";

// Unified def lookup across heroes + enemies.
export function anyDef(id: string): HeroDef | undefined {
  return HEROES[id] ?? ENEMIES[id];
}

export const LEVEL_CAP_PER_STAR = 10;
export const BASE_LEVEL_CAP = 20;

export function levelCap(stars: number): number {
  return BASE_LEVEL_CAP + stars * LEVEL_CAP_PER_STAR;
}

/** Ascension multiplier — each star is +8% to every stat. */
export function starMult(stars: number): number {
  return 1 + stars * 0.08;
}

/** Final battle stats for an owned hero (level + ascension + gear). */
export function statsForOwned(owned: OwnedHero): BaseStats {
  const def = HEROES[owned.id];
  const lvl = owned.level;
  const sm = starMult(owned.stars);
  const flat: Partial<Record<keyof BaseStats, number>> = {};
  const pct: Partial<Record<keyof BaseStats, number>> = {};
  for (const g of owned.gear) {
    if (!g) continue;
    const gd = GEAR[g];
    if (!gd) continue;
    for (const [k, v] of Object.entries(gd.bonus)) flat[k as keyof BaseStats] = (flat[k as keyof BaseStats] ?? 0) + (v as number);
    for (const [k, v] of Object.entries(gd.bonusPct ?? {})) pct[k as keyof BaseStats] = (pct[k as keyof BaseStats] ?? 0) + (v as number);
  }
  const calc = (key: keyof BaseStats): number => {
    const base = def.base[key] + def.growth[key] * (lvl - 1);
    const ascended = base * sm;
    const withFlat = ascended + (flat[key] ?? 0);
    return Math.round(withFlat * (1 + (pct[key] ?? 0)));
  };
  // The Fool's 1 HP is sacred — never scale it.
  const hpMax = def.base.hpMax <= 1 ? 1 : calc("hpMax");
  return { hpMax, atk: calc("atk"), def: calc("def"), spd: calc("spd") };
}

/** Battle stats for an enemy spawn (level scaling + per-floor tuning). */
export function statsForEnemy(spawn: EnemySpawn): { def: HeroDef; stats: BaseStats } {
  const id = spawn.heroId ?? spawn.enemyId!;
  const def = anyDef(id)!;
  const lvl = spawn.level;
  const calc = (key: keyof BaseStats): number => {
    const base = def.base[key] + def.growth[key] * (lvl - 1);
    return Math.round(base * (spawn.scale?.[key] ?? 1));
  };
  const hpMax = def.base.hpMax <= 1 ? 1 : calc("hpMax");
  return { def, stats: { hpMax, atk: calc("atk"), def: calc("def"), spd: calc("spd") } };
}

let uidCounter = 0;
const nextUid = (p: string) => `${p}${uidCounter++}`;

function makeCombatant(
  def: HeroDef,
  stats: BaseStats,
  side: "player" | "enemy",
  slot: number,
  nameOverride?: string,
): Combatant {
  return {
    uid: nextUid(side[0]),
    defId: def.id,
    name: nameOverride ?? def.name,
    arcana: def.arcana,
    side,
    slot,
    element: def.element,
    role: def.role,
    rarity: def.rarity,
    palette: def.palette,
    artSeed: def.artSeed,
    baseStats: stats,
    hp: stats.hpMax,
    shield: 0,
    effects: [],
    abilities: def.abilities,
    passives: def.passives,
    cooldowns: {},
    alive: true,
    isMinion: false,
    tookDamageThisRound: false,
    pendingExtraTurns: 0,
    marked: false,
  };
}

/** Build the player's battle line from an ordered list of owned heroes + slots. */
export function buildPlayerParty(party: { owned: OwnedHero; slot: number }[]): Combatant[] {
  uidCounter = 0;
  return party.map(({ owned, slot }) => {
    const def = HEROES[owned.id];
    return makeCombatant(def, statsForOwned(owned), "player", slot);
  });
}

export function buildEnemyParty(spawns: EnemySpawn[]): Combatant[] {
  return spawns.map((spawn) => {
    const { def, stats } = statsForEnemy(spawn);
    return makeCombatant(def, stats, "enemy", spawn.slot, spawn.name);
  });
}

/** A coarse "power" number for a party — surfaced in UI as the strength gauge. */
export function partyPower(stats: BaseStats[]): number {
  return Math.round(
    stats.reduce((sum, s) => sum + s.hpMax * 0.5 + s.atk * 6 + s.def * 4 + s.spd * 3, 0) / 10,
  );
}
