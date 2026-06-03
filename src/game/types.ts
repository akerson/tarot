// ─────────────────────────────────────────────────────────────────────────────
//  Arcana Climb — Core type system
//  Everything the engine, data, and UI agree on lives here.
// ─────────────────────────────────────────────────────────────────────────────

/** The four tarot suits + a neutral "Arcana" element for the rule-bending Majors. */
export type Element = "wands" | "cups" | "swords" | "pentacles" | "arcana";

/** Front row = slots 0,1. Back row = slots 2,3. */
export type Row = "front" | "back";

export type Rarity = "rare" | "epic" | "legendary" | "mythic";

/** Broad role buckets — used for floor "strength check" tagging and roster filters. */
export type Role =
  | "tank"
  | "bruiser"
  | "dps"
  | "aoe"
  | "healer"
  | "support"
  | "bender";

/** How an ability is delivered — this is the heart of the front/back rule. */
export type Delivery = "melee" | "ranged" | "magic";

export type Stat = "atk" | "def" | "spd" | "hpMax";

export interface BaseStats {
  hpMax: number;
  atk: number;
  def: number;
  spd: number;
}

// ── Effects ──────────────────────────────────────────────────────────────────

export type DotType = "burn" | "bleed" | "poison";

/** A single resolved operation an ability performs on each of its targets. */
export type EffectOp =
  | { kind: "damage"; power: number; element?: Element; ignoreCover?: boolean }
  | { kind: "heal"; power: number }
  | { kind: "shield"; power: number; duration: number }
  | { kind: "buff"; stat: Stat; amount: number; duration: number }
  | { kind: "debuff"; stat: Stat; amount: number; duration: number }
  | { kind: "dot"; dotType: DotType; power: number; duration: number }
  | { kind: "taunt"; duration: number }
  | { kind: "cleanse" }
  | { kind: "dispel" }
  | { kind: "stun"; duration: number }
  | { kind: "mark"; duration: number }
  | { kind: "revive"; hpFraction: number; statPenalty: number }
  | { kind: "extraTurn" }
  | { kind: "invuln"; duration: number }
  | { kind: "invertDamage"; duration: number } // Hanged Man: incoming dmg → healing
  | { kind: "guard"; duration: number }; // Bulwark: intercept lethal for allies

/** How an ability selects its primary target before area expansion. */
export type TargetMode =
  | "enemy" // one enemy (legality depends on delivery + cover)
  | "ally" // one ally
  | "self"
  | "allEnemies"
  | "allAllies"
  | "enemyRow" // primary enemy + its rowmate
  | "lowestHpEnemy"
  | "lowestHpAlly"
  | "highestStatEnemy"
  | "deadAlly" // for revives
  | "randomEnemy";

export interface Ability {
  id: string;
  name: string;
  icon: string; // short glyph/emoji for the button
  description: string;
  delivery: Delivery;
  target: TargetMode;
  /** Cooldown in rounds. 0 / undefined = usable every turn. */
  cooldown?: number;
  /** Starts on cooldown for the first N rounds (for big openers set 0). */
  effects: EffectOp[];
  /** Tags surfaced in tooltips and used by AI heuristics. */
  tags?: string[];
}

/** Passive flags baked into a hero — the rule-benders live here. */
export interface Passive {
  id: string;
  name: string;
  description: string;
  /** Engine hooks the passive opts into. */
  flags?: PassiveFlag[];
}

export type PassiveFlag =
  | "firstStrike" // act before any enemy on round 1 (Hourglass)
  | "attacksIgnoreCover" // own melee can hit any row (Phantom)
  | "sniperBackline" // +bonus damage vs back row (Sniper / Hermit)
  | "echoLastAlly" // repeats last ally ability (Magician)
  | "rageOnHit" // extra turn next round after taking damage (Berserker)
  | "scaleWithMissingHp" // damage scales as own HP drops
  | "martyrScaling" // damage scales with total ally HP missing
  | "lastStand" // huge stats when sole survivor
  | "lanternImmune" // 1 HP, immune to normal damage
  | "guardian"; // intercepts lethal for front allies (Bulwark)

// ── Hero definitions (static) vs. owned instances (in save) ───────────────────

export interface HeroDef {
  id: string;
  name: string;
  title: string; // flavour subtitle
  arcana: string; // e.g. "XVI · The Tower"
  element: Element;
  role: Role;
  rarity: Rarity;
  /** Where this hero wants to stand. Players can override within row rules. */
  preferredRow: Row;
  base: BaseStats;
  /** Per-level stat growth (added per level above 1). */
  growth: BaseStats;
  abilities: Ability[];
  passives: Passive[];
  /** One-line "why you collect this" hook shown in the codex. */
  keyOf: string;
  flavor: string;
  /** Visual seed for the procedural neon card art. */
  artSeed: number;
  palette: [string, string]; // two neon hues
}

/** A hero the player owns, with progression state. */
export interface OwnedHero {
  id: string; // matches HeroDef.id
  level: number;
  /** Ascension stars 0..6 — raises level cap and unlocks ability ranks. */
  stars: number;
  /** Shards toward the next star. */
  shards: number;
  /** Equipped gear card ids by slot (3 slots). */
  gear: (string | null)[];
}

// ── Gear (Numbered Minors) ────────────────────────────────────────────────────

export interface GearDef {
  id: string;
  name: string;
  arcana: string;
  element: Element;
  rarity: Rarity;
  icon: string;
  /** Flat + percent stat bonuses. */
  bonus: Partial<Record<Stat, number>>; // flat
  bonusPct?: Partial<Record<Stat, number>>; // fraction
  /** Optional passive granted while equipped. */
  passive?: Passive;
  flavor: string;
}

// ── Floors (the climb) ────────────────────────────────────────────────────────

export interface EnemySpawn {
  heroId?: string; // reuse a hero kit
  enemyId?: string; // or a bespoke enemy
  slot: number; // 0..3
  level: number;
  /** Stat multipliers for hand-tuning a floor's threat. */
  scale?: Partial<Record<Stat, number>>;
  name?: string; // override display name
}

export interface FloorDef {
  index: number; // 1-based floor number
  name: string;
  /** Honest, legible threat tags — the "strength check" made visible. */
  threats: string[];
  /** The archetype(s) this floor is designed to demand. */
  demands: Role[];
  hint: string; // surfaced if the player fails twice
  enemies: EnemySpawn[];
  /** Rewards on first clear. */
  reward: FloorReward;
  /** A boss floor renders bigger and may have a special rule. */
  boss?: boolean;
  /** Optional special battlefield rule text. */
  rule?: string;
}

export interface FloorReward {
  dust: number;
  aether?: number;
  heroShards?: { heroId: string; amount: number }[];
  unlockHero?: string; // grant a full hero on first clear
  gear?: string[];
}

// ── Battle runtime ────────────────────────────────────────────────────────────

export interface ActiveEffect {
  kind: EffectOp["kind"];
  duration: number;
  // payload varies by kind
  stat?: Stat;
  amount?: number;
  power?: number;
  dotType?: DotType;
  sourceUid?: string;
  value?: number; // current shield value
}

export interface Combatant {
  uid: string;
  defId: string; // hero or enemy def id
  name: string;
  arcana: string;
  side: "player" | "enemy";
  slot: number;
  element: Element;
  role: Role;
  rarity: Rarity;
  palette: [string, string];
  artSeed: number;

  baseStats: BaseStats; // post level/gear, pre-buff
  hp: number;
  shield: number;
  effects: ActiveEffect[];
  abilities: Ability[];
  passives: Passive[];
  cooldowns: Record<string, number>;

  alive: boolean;
  isMinion: boolean;
  // transient round flags
  tookDamageThisRound: boolean;
  pendingExtraTurns: number;
  marked: boolean;
}

export type BattlePhase = "intro" | "awaitInput" | "resolving" | "won" | "lost";

export interface BattleState {
  floorIndex: number;
  round: number;
  phase: BattlePhase;
  combatants: Combatant[];
  /** Turn order queue of uids for the current round. */
  order: string[];
  /** Index into `order` of the actor currently acting / awaiting input. */
  turnPtr: number;
  activeUid: string | null;
  lastAllyAbility: { abilityId: string; casterUid: string } | null;
  seed: number;
  log: BattleEvent[];
}

export type BattleEvent =
  | { t: "info"; text: string }
  | { t: "turn"; uid: string }
  | { t: "ability"; casterUid: string; abilityId: string; targets: string[] }
  | { t: "damage"; uid: string; amount: number; element?: Element; crit?: boolean; kind?: string }
  | { t: "heal"; uid: string; amount: number }
  | { t: "shield"; uid: string; amount: number }
  | { t: "status"; uid: string; text: string; good?: boolean }
  | { t: "death"; uid: string }
  | { t: "revive"; uid: string }
  | { t: "round"; round: number }
  | { t: "end"; won: boolean };
