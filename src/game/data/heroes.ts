import type { HeroDef } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
//  The roster — Tier 1 Major Arcana + a chase Mythic.
//
//  Design law (handoff §6): "The collection is a set of keys, not a pile of
//  power." Every standard hero cleanly solves a category of floor; every
//  rule-bender is the ONLY clean answer to at least one floor. The floor design
//  (floors.ts) is built to demand these specific kits.
//
//  Stat calibration targets 5–8 round fights at 4v4. Damage is deterministic.
// ─────────────────────────────────────────────────────────────────────────────

const FIRE: [string, string] = ["#ff7a3c", "#ffd23c"];
const WATER: [string, string] = ["#2fa8ff", "#7be0ff"];
const AIR: [string, string] = ["#c9d6ff", "#9b8cff"];
const EARTH: [string, string] = ["#3ddc84", "#b7ff6b"];
const ARCANA: [string, string] = ["#c08bff", "#ff6bd6"];

export const HEROES: Record<string, HeroDef> = {
  // ── 1. THE EMPEROR — the wall ───────────────────────────────────────────────
  emperor: {
    id: "emperor",
    name: "The Emperor",
    title: "Throne of Stone",
    arcana: "IV · The Emperor",
    element: "pentacles",
    role: "tank",
    rarity: "epic",
    preferredRow: "front",
    base: { hpMax: 4600, atk: 205, def: 235, spd: 92 },
    growth: { hpMax: 360, atk: 11, def: 16, spd: 1 },
    keyOf: "Front-line wall. The answer to floors that hit hard and single-target.",
    flavor: "He does not move because the world moves around him.",
    artSeed: 4,
    palette: EARTH,
    passives: [
      { id: "immovable", name: "Immovable Throne", description: "Begins each battle with a stone bulwark and draws the enemy's eye." },
    ],
    abilities: [
      {
        id: "sovereign_strike", name: "Sovereign Strike", icon: "⚔", delivery: "melee", target: "enemy",
        description: "Strike a front foe and sunder their armor (−20% DEF, 2 rounds).",
        effects: [{ kind: "damage", power: 0.95 }, { kind: "debuff", stat: "def", amount: 0.2, duration: 2 }],
        tags: ["attack"],
      },
      {
        id: "aegis_edict", name: "Aegis Edict", icon: "🛡", delivery: "magic", target: "self", cooldown: 3,
        description: "Raise a great shield and taunt all enemies to strike you (2 rounds).",
        effects: [{ kind: "shield", power: 2.6, duration: 3 }, { kind: "taunt", duration: 2 }],
        tags: ["defense"],
      },
      {
        id: "tectonic_verdict", name: "Tectonic Verdict", icon: "🌋", delivery: "magic", target: "allEnemies", cooldown: 4,
        description: "Shatter the ground beneath every enemy.",
        effects: [{ kind: "damage", power: 0.7, element: "pentacles" }],
        tags: ["aoe", "ultimate"],
      },
    ],
  },

  // ── 2. THE CHARIOT — fast bruiser ────────────────────────────────────────────
  chariot: {
    id: "chariot",
    name: "The Chariot",
    title: "Will in Motion",
    arcana: "VII · The Chariot",
    element: "swords",
    role: "bruiser",
    rarity: "epic",
    preferredRow: "front",
    base: { hpMax: 3100, atk: 322, def: 150, spd: 142 },
    growth: { hpMax: 240, atk: 18, def: 9, spd: 2 },
    keyOf: "Fast front-line damage. Wins races against glass-cannon floors.",
    flavor: "Two sphinxes pull in opposite directions; she wills them as one.",
    artSeed: 7,
    palette: AIR,
    passives: [
      { id: "momentum", name: "Momentum", description: "Acts early and hits in flurries." },
    ],
    abilities: [
      {
        id: "onslaught", name: "Onslaught", icon: "⚔", delivery: "melee", target: "enemy",
        description: "A driving strike against a front foe.",
        effects: [{ kind: "damage", power: 1.1 }],
        tags: ["attack"],
      },
      {
        id: "twin_blades", name: "Twin Blades", icon: "🗡", delivery: "melee", target: "enemy", cooldown: 1,
        description: "Two rapid cuts to the same foe.",
        effects: [{ kind: "damage", power: 0.65 }, { kind: "damage", power: 0.65 }],
        tags: ["attack"],
      },
      {
        id: "final_charge", name: "Final Charge", icon: "💨", delivery: "melee", target: "enemy", cooldown: 3,
        description: "A devastating charge; she surges with speed (+30% SPD, 2 rounds).",
        effects: [{ kind: "damage", power: 2.2 }, { kind: "buff", stat: "spd", amount: 0.3, duration: 2 }],
        tags: ["attack", "ultimate"],
      },
    ],
  },

  // ── 3. THE TOWER — burst nuke ────────────────────────────────────────────────
  tower: {
    id: "tower",
    name: "The Tower",
    title: "Sudden Ruin",
    arcana: "XVI · The Tower",
    element: "wands",
    role: "dps",
    rarity: "epic",
    preferredRow: "front",
    base: { hpMax: 2600, atk: 384, def: 96, spd: 118 },
    growth: { hpMax: 200, atk: 23, def: 5, spd: 2 },
    keyOf: "Single-target deletion. The answer to enemy healers and priority threats.",
    flavor: "The lightning does not negotiate.",
    artSeed: 16,
    palette: FIRE,
    passives: [
      { id: "catastrophe", name: "Catastrophe", description: "Strikes harder than anything its size has a right to." },
    ],
    abilities: [
      {
        id: "cinderlash", name: "Cinderlash", icon: "🔥", delivery: "melee", target: "enemy",
        description: "Burning strike; ignites the target (burn, 2 rounds).",
        effects: [{ kind: "damage", power: 1.0 }, { kind: "dot", dotType: "burn", power: 0.25, duration: 2 }],
        tags: ["attack"],
      },
      {
        id: "collapse", name: "Collapse", icon: "⚡", delivery: "melee", target: "enemy", cooldown: 2,
        description: "A column of fire crashes down on one foe.",
        effects: [{ kind: "damage", power: 1.8 }],
        tags: ["attack"],
      },
      {
        id: "ruin", name: "Ruin", icon: "☄", delivery: "melee", target: "enemy", cooldown: 4,
        description: "Annihilate a single foe and stun them (1 round).",
        effects: [{ kind: "damage", power: 2.7 }, { kind: "stun", duration: 1 }],
        tags: ["attack", "ultimate"],
      },
    ],
  },

  // ── 4. THE STAR — healer ─────────────────────────────────────────────────────
  star: {
    id: "star",
    name: "The Star",
    title: "Hope Rekindled",
    arcana: "XVII · The Star",
    element: "cups",
    role: "healer",
    rarity: "epic",
    preferredRow: "back",
    base: { hpMax: 2300, atk: 272, def: 96, spd: 112 },
    growth: { hpMax: 180, atk: 13, def: 6, spd: 2 },
    keyOf: "Single-target healing + cleanse. The answer to attrition and poison floors.",
    flavor: "She pours water back into the river, and into the land.",
    artSeed: 17,
    palette: WATER,
    passives: [
      { id: "guiding_light", name: "Guiding Light", description: "Her mending also washes away afflictions." },
    ],
    abilities: [
      {
        id: "glimmer", name: "Glimmer", icon: "✦", delivery: "magic", target: "enemy",
        description: "A lance of starlight at any foe.",
        effects: [{ kind: "damage", power: 0.8, element: "cups" }],
        tags: ["attack"],
      },
      {
        id: "astral_mercy", name: "Astral Mercy", icon: "💧", delivery: "magic", target: "lowestHpAlly",
        description: "Greatly heal the most wounded ally and cleanse them.",
        effects: [{ kind: "heal", power: 2.4 }, { kind: "cleanse" }],
        tags: ["heal"],
      },
      {
        id: "constellation", name: "Constellation", icon: "🌌", delivery: "magic", target: "allAllies", cooldown: 3,
        description: "Heal the whole party and gird them (+20% DEF, 2 rounds).",
        effects: [{ kind: "heal", power: 1.4 }, { kind: "buff", stat: "def", amount: 0.2, duration: 2 }],
        tags: ["heal", "ultimate"],
      },
    ],
  },

  // ── 5. THE SUN — AoE + buff ──────────────────────────────────────────────────
  sun: {
    id: "sun",
    name: "The Sun",
    title: "Unclouded Joy",
    arcana: "XIX · The Sun",
    element: "wands",
    role: "aoe",
    rarity: "epic",
    preferredRow: "back",
    base: { hpMax: 2500, atk: 332, def: 100, spd: 108 },
    growth: { hpMax: 190, atk: 19, def: 6, spd: 2 },
    keyOf: "Hits every enemy at once + buffs allies. The answer to swarm floors.",
    flavor: "Nothing hides at noon.",
    artSeed: 19,
    palette: FIRE,
    passives: [
      { id: "daybreak", name: "Daybreak", description: "Light that warms friends and scorches foes alike." },
    ],
    abilities: [
      {
        id: "sunbeam", name: "Sunbeam", icon: "☀", delivery: "magic", target: "enemy",
        description: "A focused beam of fire at any foe.",
        effects: [{ kind: "damage", power: 1.0, element: "wands" }],
        tags: ["attack"],
      },
      {
        id: "solar_flare", name: "Solar Flare", icon: "🔆", delivery: "magic", target: "allEnemies", cooldown: 2,
        description: "Scorch every enemy and leave them burning (2 rounds).",
        effects: [{ kind: "damage", power: 0.95, element: "wands" }, { kind: "dot", dotType: "burn", power: 0.2, duration: 2 }],
        tags: ["aoe"],
      },
      {
        id: "radiance", name: "Radiance", icon: "🌟", delivery: "magic", target: "allAllies", cooldown: 3,
        description: "Bathe allies in light (+35% ATK, 3 rounds).",
        effects: [{ kind: "buff", stat: "atk", amount: 0.35, duration: 3 }],
        tags: ["buff", "ultimate"],
      },
    ],
  },

  // ── 6. THE HIEROPHANT — support / protector ──────────────────────────────────
  hierophant: {
    id: "hierophant",
    name: "The Hierophant",
    title: "Sacred Tradition",
    arcana: "V · The Hierophant",
    element: "pentacles",
    role: "support",
    rarity: "epic",
    preferredRow: "back",
    base: { hpMax: 3000, atk: 242, def: 142, spd: 96 },
    growth: { hpMax: 230, atk: 12, def: 11, spd: 1 },
    keyOf: "Team shields + DEF aura. The answer to telegraphed burst-nuke bosses.",
    flavor: "He blesses the shield before the blade is ever drawn.",
    artSeed: 5,
    palette: EARTH,
    passives: [
      { id: "consecration", name: "Consecration", description: "His wards hold where others break." },
    ],
    abilities: [
      {
        id: "doctrine", name: "Doctrine", icon: "📿", delivery: "magic", target: "enemy",
        description: "A rebuking word at any foe.",
        effects: [{ kind: "damage", power: 0.85, element: "pentacles" }],
        tags: ["attack"],
      },
      {
        id: "sanctuary", name: "Sanctuary", icon: "🛡", delivery: "magic", target: "allAllies", cooldown: 3,
        description: "Shield the entire party against the next blows (3 rounds).",
        effects: [{ kind: "shield", power: 1.3, duration: 3 }],
        tags: ["defense"],
      },
      {
        id: "benediction", name: "Benediction", icon: "✨", delivery: "magic", target: "allAllies", cooldown: 4,
        description: "Bless allies (+30% DEF, 3 rounds) and cleanse them.",
        effects: [{ kind: "buff", stat: "def", amount: 0.3, duration: 3 }, { kind: "cleanse" }],
        tags: ["buff", "ultimate"],
      },
    ],
  },

  // ── 7. THE HERMIT — the Sniper rule-bender ───────────────────────────────────
  hermit: {
    id: "hermit",
    name: "The Hermit",
    title: "Lantern in the Dark",
    arcana: "IX · The Hermit",
    element: "swords",
    role: "bender",
    rarity: "epic",
    preferredRow: "back",
    base: { hpMax: 2200, atk: 360, def: 86, spd: 120 },
    growth: { hpMax: 170, atk: 22, def: 5, spd: 2 },
    keyOf: "Reaches ANY row and punishes the back line. The answer to back-row hideouts.",
    flavor: "His lantern picks one face out of the whole crowd — yours.",
    artSeed: 9,
    palette: AIR,
    passives: [
      { id: "lanterns_eye", name: "Lantern's Eye", description: "Strikes any row, ignoring the front wall, and deals +30% to the back row.", flags: ["sniperBackline"] },
    ],
    abilities: [
      {
        id: "mark_shot", name: "Mark Shot", icon: "🎯", delivery: "ranged", target: "enemy",
        description: "Pick off any enemy, front or back.",
        effects: [{ kind: "damage", power: 1.1 }],
        tags: ["attack"],
      },
      {
        id: "piercing_vigil", name: "Piercing Vigil", icon: "🏹", delivery: "ranged", target: "enemy", cooldown: 2,
        description: "A piercing shot that also weakens armor (−15% DEF, 2 rounds).",
        effects: [{ kind: "damage", power: 1.7 }, { kind: "debuff", stat: "def", amount: 0.15, duration: 2 }],
        tags: ["attack"],
      },
      {
        id: "final_light", name: "Final Light", icon: "💥", delivery: "ranged", target: "lowestHpEnemy", cooldown: 3,
        description: "Execute the weakest enemy anywhere on the field.",
        effects: [{ kind: "damage", power: 2.4 }],
        tags: ["attack", "ultimate"],
      },
    ],
  },

  // ── 8. THE MOON — the Phantom rule-bender ────────────────────────────────────
  moon: {
    id: "moon",
    name: "The Moon",
    title: "Walker of Illusions",
    arcana: "XVIII · The Moon",
    element: "cups",
    role: "bender",
    rarity: "epic",
    preferredRow: "back",
    base: { hpMax: 2700, atk: 330, def: 110, spd: 116 },
    growth: { hpMax: 200, atk: 19, def: 7, spd: 2 },
    keyOf: "Stands safe in back, yet her melee ignores the front wall. The answer when you must hit the back line but keep her protected.",
    flavor: "She is here and not here; the wall protects no one from her.",
    artSeed: 18,
    palette: WATER,
    passives: [
      { id: "phantasmal", name: "Phantasmal", description: "Her melee strikes any enemy row as though she stood in front.", flags: ["attacksIgnoreCover"] },
    ],
    abilities: [
      {
        id: "veilstrike", name: "Veilstrike", icon: "🌙", delivery: "melee", target: "enemy",
        description: "A spectral blow that reaches any row.",
        effects: [{ kind: "damage", power: 1.15, element: "cups" }],
        tags: ["attack"],
      },
      {
        id: "tidal_phantom", name: "Tidal Phantom", icon: "🌊", delivery: "melee", target: "enemy", cooldown: 2,
        description: "A crashing illusion that drowns one foe.",
        effects: [{ kind: "damage", power: 1.7, element: "cups" }],
        tags: ["attack"],
      },
      {
        id: "lunar_dread", name: "Lunar Dread", icon: "🐺", delivery: "melee", target: "enemy", cooldown: 3,
        description: "Madness grips a foe: damage, −25% ATK and bleeding (2 rounds).",
        effects: [{ kind: "damage", power: 1.0, element: "cups" }, { kind: "debuff", stat: "atk", amount: 0.25, duration: 2 }, { kind: "dot", dotType: "bleed", power: 0.3, duration: 2 }],
        tags: ["attack", "ultimate"],
      },
    ],
  },

  // ── 9. THE MAGICIAN — the Echo rule-bender ───────────────────────────────────
  magician: {
    id: "magician",
    name: "The Magician",
    title: "As Above, So Below",
    arcana: "I · The Magician",
    element: "arcana",
    role: "bender",
    rarity: "legendary",
    preferredRow: "back",
    base: { hpMax: 2400, atk: 300, def: 100, spd: 126 },
    growth: { hpMax: 185, atk: 17, def: 6, spd: 2 },
    keyOf: "Repeats your last ally's ability. A force multiplier that doubles your best turn.",
    flavor: "One hand points to the heavens, the other to the earth, and the trick is the same.",
    artSeed: 1,
    palette: ARCANA,
    passives: [
      { id: "channeler", name: "As Above, So Below", description: "His Echo recasts the most recent ally ability this round.", flags: ["echoLastAlly"] },
    ],
    abilities: [
      {
        id: "arcane_bolt", name: "Arcane Bolt", icon: "✦", delivery: "magic", target: "enemy",
        description: "A bolt of raw arcana at any foe.",
        effects: [{ kind: "damage", power: 0.9 }],
        tags: ["attack"],
      },
      {
        id: "echo", name: "Echo", icon: "♾", delivery: "magic", target: "enemy", cooldown: 1,
        description: "Recast the last ability an ally used this round. (Fizzles to a small bolt if none.)",
        effects: [{ kind: "damage", power: 0.6 }],
        tags: ["echo"],
      },
      {
        id: "prestidigitation", name: "Prestidigitation", icon: "🎩", delivery: "magic", target: "allEnemies", cooldown: 3,
        description: "Strip every enemy's buffs and shields, then sear them.",
        effects: [{ kind: "dispel" }, { kind: "damage", power: 0.8 }],
        tags: ["aoe", "ultimate"],
      },
    ],
  },

  // ── 10. DEATH — the Necromancer rule-bender ──────────────────────────────────
  death: {
    id: "death",
    name: "Death",
    title: "The Great Transition",
    arcana: "XIII · Death",
    element: "arcana",
    role: "bender",
    rarity: "legendary",
    preferredRow: "back",
    base: { hpMax: 3200, atk: 300, def: 122, spd: 100 },
    growth: { hpMax: 250, atk: 16, def: 9, spd: 1 },
    keyOf: "Raises a fallen ally as a minion. Turns attrition fights in your favor.",
    flavor: "Not an end. A turning of the card.",
    artSeed: 13,
    palette: ARCANA,
    passives: [
      { id: "eternal_return", name: "Eternal Return", description: "What falls in her presence rarely stays down." },
    ],
    abilities: [
      {
        id: "scythe", name: "Scythe", icon: "🌑", delivery: "melee", target: "enemy",
        description: "Reap a front foe.",
        effects: [{ kind: "damage", power: 1.1 }],
        tags: ["attack"],
      },
      {
        id: "raise_dead", name: "Raise Dead", icon: "💀", delivery: "magic", target: "deadAlly", cooldown: 3,
        description: "Return a fallen ally to the fight as a weakened minion (50% HP, −30% stats).",
        effects: [{ kind: "revive", hpFraction: 0.5, statPenalty: 0.3 }],
        tags: ["revive"],
      },
      {
        id: "memento_mori", name: "Memento Mori", icon: "⚰", delivery: "magic", target: "allEnemies", cooldown: 4,
        description: "A wave of mortality saps every enemy (damage, −20% ATK, 2 rounds).",
        effects: [{ kind: "damage", power: 0.9 }, { kind: "debuff", stat: "atk", amount: 0.2, duration: 2 }],
        tags: ["aoe", "ultimate"],
      },
    ],
  },

  // ── 11. THE HANGED MAN — damage inverter ─────────────────────────────────────
  hanged_man: {
    id: "hanged_man",
    name: "The Hanged Man",
    title: "Surrendered Sight",
    arcana: "XII · The Hanged Man",
    element: "cups",
    role: "bender",
    rarity: "legendary",
    preferredRow: "back",
    base: { hpMax: 3000, atk: 270, def: 122, spd: 88 },
    growth: { hpMax: 235, atk: 13, def: 9, spd: 1 },
    keyOf: "Turns an ally's incoming damage into healing. The answer to unavoidable big hits.",
    flavor: "Hung upside down, he finally sees which way is up.",
    artSeed: 12,
    palette: WATER,
    passives: [
      { id: "suspended", name: "Suspended", description: "He has made peace with pain, and bends it to mercy." },
    ],
    abilities: [
      {
        id: "still_water", name: "Still Water", icon: "☋", delivery: "magic", target: "enemy",
        description: "A quiet, certain strike at any foe.",
        effects: [{ kind: "damage", power: 0.85, element: "cups" }],
        tags: ["attack"],
      },
      {
        id: "inversion", name: "Inversion", icon: "🔄", delivery: "magic", target: "ally", cooldown: 3,
        description: "For 2 rounds, all damage an ally takes becomes healing instead.",
        effects: [{ kind: "invertDamage", duration: 2 }],
        tags: ["defense"],
      },
      {
        id: "martyrs_tide", name: "Martyr's Tide", icon: "🜄", delivery: "magic", target: "allAllies", cooldown: 4,
        description: "Heal all allies; for 1 round, damage to you becomes healing.",
        effects: [{ kind: "heal", power: 1.0 }],
        tags: ["heal", "ultimate"],
      },
    ],
  },

  // ── 12. STRENGTH — the Berserker rule-bender ─────────────────────────────────
  strength: {
    id: "strength",
    name: "Strength",
    title: "The Quiet Force",
    arcana: "VIII · Strength",
    element: "wands",
    role: "bender",
    rarity: "epic",
    preferredRow: "front",
    base: { hpMax: 3300, atk: 332, def: 142, spd: 110 },
    growth: { hpMax: 250, atk: 19, def: 9, spd: 2 },
    keyOf: "Begs to be hit: extra turns when wounded, more damage as HP falls. The answer to grinding attrition gauntlets.",
    flavor: "She does not force the lion's jaws apart. She simply outlasts its rage.",
    artSeed: 8,
    palette: FIRE,
    passives: [
      { id: "inner_beast", name: "Inner Beast", description: "Gains an extra turn the round after she takes damage; her strikes grow as her HP falls.", flags: ["rageOnHit", "scaleWithMissingHp"] },
    ],
    abilities: [
      {
        id: "maul", name: "Maul", icon: "🦁", delivery: "melee", target: "enemy",
        description: "A heavy blow to a front foe.",
        effects: [{ kind: "damage", power: 1.05 }],
        tags: ["attack"],
      },
      {
        id: "bloodroar", name: "Bloodroar", icon: "🩸", delivery: "melee", target: "enemy", cooldown: 2,
        description: "Roar and rend; she swells with fury (+20% ATK, 2 rounds).",
        effects: [{ kind: "damage", power: 1.5 }, { kind: "buff", stat: "atk", amount: 0.2, duration: 2 }],
        tags: ["attack"],
      },
      {
        id: "unchained", name: "Unchained", icon: "💢", delivery: "melee", target: "enemy", cooldown: 4,
        description: "Unleash everything and immediately act again.",
        effects: [{ kind: "damage", power: 2.0 }, { kind: "extraTurn" }],
        tags: ["attack", "ultimate"],
      },
    ],
  },

  // ── 13. THE EMPRESS — regen healer (second sustain option) ───────────────────
  empress: {
    id: "empress",
    name: "The Empress",
    title: "The Flowering World",
    arcana: "III · The Empress",
    element: "cups",
    role: "healer",
    rarity: "epic",
    preferredRow: "back",
    base: { hpMax: 2800, atk: 262, def: 112, spd: 100 },
    growth: { hpMax: 215, atk: 13, def: 7, spd: 1 },
    keyOf: "Whole-party sustain + a huge emergency mend. The answer to sustained AoE pressure.",
    flavor: "Where she walks, the barren places remember how to grow.",
    artSeed: 3,
    palette: EARTH,
    passives: [
      { id: "abundance", name: "Abundance", description: "Her care spreads to all who stand with her." },
    ],
    abilities: [
      {
        id: "verdant_touch", name: "Verdant Touch", icon: "🌿", delivery: "magic", target: "enemy",
        description: "Thorned vines lash any foe.",
        effects: [{ kind: "damage", power: 0.8, element: "cups" }],
        tags: ["attack"],
      },
      {
        id: "bloom", name: "Bloom", icon: "🌺", delivery: "magic", target: "allAllies", cooldown: 3,
        description: "Heal all allies and quicken their strength (+15% ATK, 2 rounds).",
        effects: [{ kind: "heal", power: 0.9 }, { kind: "buff", stat: "atk", amount: 0.15, duration: 2 }],
        tags: ["heal"],
      },
      {
        id: "renewal", name: "Renewal", icon: "🌱", delivery: "magic", target: "lowestHpAlly", cooldown: 4,
        description: "Massively heal one ally, cleanse them, and shield them.",
        effects: [{ kind: "heal", power: 3.0 }, { kind: "cleanse" }, { kind: "shield", power: 1.5, duration: 2 }],
        tags: ["heal", "ultimate"],
      },
    ],
  },

  // ── 14. THE FOOL — Mythic chase, system-breaker ──────────────────────────────
  fool: {
    id: "fool",
    name: "The Fool",
    title: "Zero — The Infinite Step",
    arcana: "0 · The Fool",
    element: "arcana",
    role: "bender",
    rarity: "mythic",
    preferredRow: "front",
    base: { hpMax: 1, atk: 372, def: 0, spd: 132 },
    growth: { hpMax: 0, atk: 24, def: 0, spd: 2 },
    keyOf: "1 HP, immune to all normal damage. MVP or instantly dead — and almost nothing in the climb deals 'true' damage.",
    flavor: "He steps off the cliff and simply… keeps walking.",
    artSeed: 0,
    palette: ARCANA,
    passives: [
      { id: "cliffs_edge", name: "The Cliff's Edge", description: "1 HP. Immune to all normal damage — only rare 'true' damage can fell him.", flags: ["lanternImmune"] },
    ],
    abilities: [
      {
        id: "folly", name: "Folly", icon: "🃏", delivery: "melee", target: "enemy",
        description: "A careless, perfect strike at a front foe.",
        effects: [{ kind: "damage", power: 1.2 }],
        tags: ["attack"],
      },
      {
        id: "leap_of_faith", name: "Leap of Faith", icon: "🐕", delivery: "ranged", target: "enemy", cooldown: 2,
        description: "He leaps anywhere and strikes any row.",
        effects: [{ kind: "damage", power: 1.9 }],
        tags: ["attack"],
      },
      {
        id: "everything", name: "Everything & Nothing", icon: "🌈", delivery: "magic", target: "allEnemies", cooldown: 4,
        description: "The whole journey, all at once, upon every foe.",
        effects: [{ kind: "damage", power: 1.1 }],
        tags: ["aoe", "ultimate"],
      },
    ],
  },
};

export const HERO_IDS = Object.keys(HEROES);

export const STARTER_HEROES = ["emperor", "chariot", "star", "sun"];

export function heroDef(id: string): HeroDef {
  const h = HEROES[id];
  if (!h) throw new Error(`Unknown hero: ${id}`);
  return h;
}
