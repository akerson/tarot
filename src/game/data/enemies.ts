import type { HeroDef } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
//  Enemies share the HeroDef shape so the combat builder treats them uniformly.
//  Floors mostly compose these archetypes; bosses get bespoke, characterful kits.
// ─────────────────────────────────────────────────────────────────────────────

const VOID: [string, string] = ["#8a6bff", "#3a2a6b"];
const ASH: [string, string] = ["#ff6a4c", "#7a2a1a"];
const BONE: [string, string] = ["#d9e6c9", "#5a6b4a"];
const DEEP: [string, string] = ["#2f7bff", "#10204a"];

function enemy(d: Partial<HeroDef> & Pick<HeroDef, "id" | "name" | "element" | "role" | "base" | "abilities">): HeroDef {
  return {
    title: "",
    arcana: "Husk",
    rarity: "common" as never,
    preferredRow: "front",
    growth: { hpMax: 80, atk: 6, def: 3, spd: 1 },
    passives: [],
    keyOf: "",
    flavor: "",
    artSeed: 99,
    palette: VOID,
    ...d,
  } as HeroDef;
}

export const ENEMIES: Record<string, HeroDef> = {
  husk_grunt: enemy({
    id: "husk_grunt", name: "Husk Grunt", element: "pentacles", role: "tank", palette: BONE,
    base: { hpMax: 2600, atk: 190, def: 150, spd: 80 },
    abilities: [
      { id: "e_smash", name: "Smash", icon: "🔨", delivery: "melee", target: "enemy", description: "A clumsy heavy blow.", effects: [{ kind: "damage", power: 1.0 }] },
    ],
  }),
  husk_archer: enemy({
    id: "husk_archer", name: "Husk Archer", element: "swords", role: "dps", palette: BONE, preferredRow: "back",
    base: { hpMax: 1500, atk: 250, def: 70, spd: 115 },
    abilities: [
      { id: "e_shot", name: "Shot", icon: "🏹", delivery: "ranged", target: "enemy", description: "Picks off any target.", effects: [{ kind: "damage", power: 1.05 }] },
    ],
  }),
  husk_seer: enemy({
    id: "husk_seer", name: "Husk Seer", element: "cups", role: "healer", palette: DEEP, preferredRow: "back",
    base: { hpMax: 1900, atk: 200, def: 80, spd: 100 },
    abilities: [
      { id: "e_mend", name: "Mend", icon: "💧", delivery: "magic", target: "lowestHpAlly", description: "Heals its weakest ally.", effects: [{ kind: "heal", power: 1.8 }] },
      { id: "e_hex", name: "Hex", icon: "☋", delivery: "magic", target: "enemy", description: "A draining hex.", effects: [{ kind: "damage", power: 0.7, element: "cups" }] },
    ],
  }),
  cinder_imp: enemy({
    id: "cinder_imp", name: "Cinder Imp", element: "wands", role: "dps", palette: ASH,
    base: { hpMax: 900, atk: 200, def: 50, spd: 125 },
    abilities: [
      { id: "e_claw", name: "Ember Claw", icon: "🔥", delivery: "melee", target: "enemy", description: "A quick burning swipe.", effects: [{ kind: "damage", power: 1.0, element: "wands" }] },
    ],
  }),
  bone_brute: enemy({
    id: "bone_brute", name: "Bone Brute", element: "pentacles", role: "bruiser", palette: BONE,
    base: { hpMax: 4200, atk: 300, def: 140, spd: 85 },
    abilities: [
      { id: "e_cleave", name: "Cleave", icon: "🪓", delivery: "melee", target: "enemyRow", description: "Cleaves a whole front row.", effects: [{ kind: "damage", power: 1.0 }] },
      { id: "e_stomp", name: "Stomp", icon: "👣", delivery: "melee", target: "enemy", cooldown: 2, description: "A staggering stomp (stun 1).", effects: [{ kind: "damage", power: 1.3 }, { kind: "stun", duration: 1 }] },
    ],
  }),
  gloom_knight: enemy({
    id: "gloom_knight", name: "Gloom Knight", element: "swords", role: "bruiser", palette: VOID,
    base: { hpMax: 3200, atk: 285, def: 130, spd: 118 },
    abilities: [
      { id: "e_lunge", name: "Lunge", icon: "🗡", delivery: "melee", target: "enemy", description: "A precise lunge.", effects: [{ kind: "damage", power: 1.15 }] },
    ],
  }),
  void_caster: enemy({
    id: "void_caster", name: "Void Caster", element: "arcana", role: "aoe", palette: VOID, preferredRow: "back",
    base: { hpMax: 1700, atk: 260, def: 75, spd: 108 },
    abilities: [
      { id: "e_nova", name: "Void Nova", icon: "🌀", delivery: "magic", target: "allEnemies", cooldown: 2, description: "Damages the whole party.", effects: [{ kind: "damage", power: 0.7 }] },
      { id: "e_bolt", name: "Void Bolt", icon: "✦", delivery: "magic", target: "enemy", description: "A bolt at any target.", effects: [{ kind: "damage", power: 1.0 }] },
    ],
  }),
  ironbound_ward: enemy({
    id: "ironbound_ward", name: "Ironbound Ward", element: "pentacles", role: "tank", palette: BONE,
    base: { hpMax: 5200, atk: 170, def: 230, spd: 70 },
    abilities: [
      { id: "e_guard", name: "Bulwark", icon: "🛡", delivery: "magic", target: "self", cooldown: 3, description: "Shields and taunts.", effects: [{ kind: "shield", power: 2.0, duration: 3 }, { kind: "taunt", duration: 2 }] },
      { id: "e_bash", name: "Shield Bash", icon: "🔰", delivery: "melee", target: "enemy", description: "A blunt bash.", effects: [{ kind: "damage", power: 0.8 }] },
    ],
  }),
  zealot: enemy({
    id: "zealot", name: "Ashen Zealot", element: "wands", role: "support", palette: ASH, preferredRow: "back",
    base: { hpMax: 1800, atk: 230, def: 80, spd: 104 },
    abilities: [
      { id: "e_fervor", name: "Fervor", icon: "🔆", delivery: "magic", target: "allAllies", cooldown: 2, description: "Buffs allies' ATK by 30%.", effects: [{ kind: "buff", stat: "atk", amount: 0.3, duration: 2 }] },
      { id: "e_scorch", name: "Scorch", icon: "🔥", delivery: "magic", target: "enemy", description: "A scorching bolt.", effects: [{ kind: "damage", power: 0.9, element: "wands" }] },
    ],
  }),

  ember_brute: enemy({
    id: "ember_brute", name: "Ember Brute", element: "wands", role: "bruiser", palette: ASH,
    base: { hpMax: 3400, atk: 300, def: 120, spd: 92 },
    abilities: [
      { id: "e_emcleave", name: "Ember Cleave", icon: "🔥", delivery: "melee", target: "enemyRow", description: "Burns a front row.", effects: [{ kind: "damage", power: 0.95, element: "wands" }, { kind: "dot", dotType: "burn", power: 0.2, duration: 2 }] },
    ],
  }),
  flame_archer: enemy({
    id: "flame_archer", name: "Flame Archer", element: "wands", role: "dps", palette: ASH, preferredRow: "back",
    base: { hpMax: 1500, atk: 270, def: 70, spd: 116 },
    abilities: [
      { id: "e_fireshot", name: "Fire Shot", icon: "🏹", delivery: "ranged", target: "enemy", description: "A burning arrow at any target.", effects: [{ kind: "damage", power: 1.05, element: "wands" }] },
    ],
  }),
  umbral_stalker: enemy({
    id: "umbral_stalker", name: "Umbral Stalker", element: "swords", role: "dps", palette: VOID, preferredRow: "back",
    base: { hpMax: 1700, atk: 320, def: 70, spd: 124 },
    abilities: [
      { id: "e_assassinate", name: "Assassinate", icon: "🔻", delivery: "ranged", target: "lowestHpEnemy", description: "Strikes your weakest hero in any row.", effects: [{ kind: "damage", power: 1.5 }] },
    ],
  }),

  // ── BOSSES ──────────────────────────────────────────────────────────────────
  warden_thorns: enemy({
    id: "warden_thorns", name: "Warden of Thorns", title: "Keeper of the Fifth Gate", arcana: "Gatekeeper",
    element: "pentacles", role: "tank", rarity: "epic" as never, palette: BONE, artSeed: 55,
    base: { hpMax: 7600, atk: 280, def: 200, spd: 90 },
    flavor: "The garden grew over the door. Now the door is the garden.",
    abilities: [
      { id: "b_rake", name: "Bramble Rake", icon: "🌿", delivery: "melee", target: "enemyRow", description: "Rakes a front row and bleeds them.", effects: [{ kind: "damage", power: 0.95 }, { kind: "dot", dotType: "bleed", power: 0.25, duration: 2 }] },
      { id: "b_thorncage", name: "Thorn Cage", icon: "🪤", delivery: "magic", target: "enemy", cooldown: 2, description: "Cages and stuns one hero (stun 1).", effects: [{ kind: "damage", power: 1.1 }, { kind: "stun", duration: 1 }] },
      { id: "b_regrow", name: "Regrowth", icon: "🌱", delivery: "magic", target: "self", cooldown: 3, description: "Heals itself.", effects: [{ kind: "heal", power: 1.6 }] },
    ],
  }),
  the_eclipse: enemy({
    id: "the_eclipse", name: "The Eclipse", title: "Where Sun and Moon Collide", arcana: "Gatekeeper",
    element: "arcana", role: "aoe", rarity: "legendary" as never, palette: VOID, artSeed: 66, preferredRow: "back",
    base: { hpMax: 6400, atk: 360, def: 120, spd: 122 },
    flavor: "Two lights, devouring one another, casting one terrible shadow.",
    abilities: [
      { id: "b_corona", name: "Black Corona", icon: "🌑", delivery: "magic", target: "allEnemies", cooldown: 2, description: "A ring of dark fire over the whole party.", effects: [{ kind: "damage", power: 0.85 }] },
      { id: "b_pierce", name: "Umbral Lance", icon: "🔻", delivery: "ranged", target: "lowestHpEnemy", description: "Pierces the weakest hero, any row.", effects: [{ kind: "damage", power: 1.6 }] },
      { id: "b_devour", name: "Devour Light", icon: "🕳", delivery: "magic", target: "allEnemies", cooldown: 3, description: "Strips the party's buffs and shields.", effects: [{ kind: "dispel" }, { kind: "damage", power: 0.5 }] },
    ],
  }),
  the_devil: enemy({
    id: "the_devil", name: "The Devil", title: "XV · The Chained One", arcana: "XV · The Devil",
    element: "wands", role: "bender", rarity: "mythic" as never, palette: ASH, artSeed: 15,
    base: { hpMax: 9200, atk: 400, def: 160, spd: 112 },
    flavor: "The chains were never locked. That is the cruelest part.",
    growth: { hpMax: 120, atk: 8, def: 4, spd: 1 },
    abilities: [
      { id: "d_lash", name: "Chain Lash", icon: "⛓", delivery: "melee", target: "enemyRow", description: "Lashes a whole row.", effects: [{ kind: "damage", power: 1.0, element: "wands" }] },
      { id: "d_temptation", name: "Temptation", icon: "🜏", delivery: "magic", target: "enemy", cooldown: 2, description: "Turns a hero's strength against them (−35% ATK, 2 rounds) and burns.", effects: [{ kind: "debuff", stat: "atk", amount: 0.35, duration: 2 }, { kind: "dot", dotType: "burn", power: 0.4, duration: 2 }] },
      { id: "d_inferno", name: "Inferno of the Bound", icon: "🔥", delivery: "magic", target: "allEnemies", cooldown: 3, description: "Hellfire across the entire party.", effects: [{ kind: "damage", power: 1.0, element: "wands" }, { kind: "dot", dotType: "burn", power: 0.25, duration: 2 }] },
    ],
  }),
};

export const ENEMY_IDS = Object.keys(ENEMIES);

export function enemyDef(id: string): HeroDef | undefined {
  return ENEMIES[id];
}
