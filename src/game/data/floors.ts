import type { FloorDef } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
//  THE CLIMB (handoff §3, §6, §9.1 — the make-or-break curve).
//
//  Every floor is an honest "are you strong enough?" check, where strength means
//  ROSTER SHAPE, not raw stats. Each floor's `threats` are shown to the player
//  BEFORE the fight (legible check), and `demands` names the archetype the floor
//  is built to require. Getting stuck is solved by collecting the right key —
//  never by grinding.
// ─────────────────────────────────────────────────────────────────────────────

export const FLOORS: FloorDef[] = [
  {
    index: 1,
    name: "The Threshold",
    threats: ["Tutorial"],
    demands: ["bruiser", "dps"],
    hint: "Tap a hero, tap an ability, tap a target. Front row first.",
    enemies: [
      { enemyId: "husk_grunt", slot: 0, level: 3 },
      { enemyId: "husk_grunt", slot: 1, level: 3 },
    ],
    reward: { dust: 120, heroShards: [{ heroId: "tower", amount: 20 }] },
  },
  {
    index: 2,
    name: "The Watch",
    threats: ["Back-row archer"],
    demands: ["dps"],
    hint: "The archer hides in back. Melee can't reach it until the front falls — or bring someone who can.",
    enemies: [
      { enemyId: "husk_grunt", slot: 0, level: 4 },
      { enemyId: "husk_grunt", slot: 1, level: 4 },
      { enemyId: "husk_archer", slot: 2, level: 4 },
    ],
    reward: { dust: 160, heroShards: [{ heroId: "hermit", amount: 15 }] },
  },
  {
    index: 3,
    name: "Emberswarm",
    threats: ["Swarm", "Fast"],
    demands: ["aoe"],
    hint: "Four little fires. One big AoE answers them all — The Sun was made for this.",
    enemies: [
      { enemyId: "cinder_imp", slot: 0, level: 5 },
      { enemyId: "cinder_imp", slot: 1, level: 5 },
      { enemyId: "cinder_imp", slot: 2, level: 5 },
      { enemyId: "cinder_imp", slot: 3, level: 5 },
    ],
    reward: { dust: 200, aether: 10, gear: ["ace_swords"] },
  },
  {
    index: 4,
    name: "The Hideout",
    threats: ["Back-row damage", "Heavy front armor"],
    demands: ["bender"],
    hint: "All their hurt is in the back, behind a wall your melee can't break in time. You need to reach the back row: a Sniper (The Hermit) or a Phantom (The Moon).",
    enemies: [
      { enemyId: "ironbound_ward", slot: 0, level: 7 },
      { enemyId: "husk_grunt", slot: 1, level: 7 },
      { enemyId: "husk_archer", slot: 2, level: 8, scale: { atk: 1.25 } },
      { enemyId: "husk_archer", slot: 3, level: 8, scale: { atk: 1.25 } },
    ],
    reward: { dust: 280, heroShards: [{ heroId: "moon", amount: 25 }] },
  },
  {
    index: 5,
    name: "Warden of Thorns",
    threats: ["BOSS", "Bleed", "Stun"],
    demands: ["healer", "support"],
    hint: "The bleed never stops and the cage takes a hero out of the fight. Outlast it — a healer (The Star) keeps you standing.",
    boss: true,
    rule: "The Warden regrows. Sustained pressure and steady healing win the war of attrition.",
    enemies: [
      { enemyId: "warden_thorns", slot: 0, level: 9 },
      { enemyId: "cinder_imp", slot: 2, level: 9 },
      { enemyId: "cinder_imp", slot: 3, level: 9 },
    ],
    reward: { dust: 500, aether: 40, unlockHero: "hierophant" },
  },
  {
    index: 6,
    name: "Cinder Choir",
    threats: ["Enemy buffs", "Fire"],
    demands: ["support", "dps"],
    hint: "The Zealot in back keeps pumping their attack. Kill the buffer fast, strip the buff (Magician), or shield through it.",
    enemies: [
      { enemyId: "ember_brute", slot: 0, level: 10 },
      { enemyId: "cinder_imp", slot: 1, level: 10 },
      { enemyId: "zealot", slot: 2, level: 11 },
      { enemyId: "flame_archer", slot: 3, level: 10 },
    ],
    reward: { dust: 340, heroShards: [{ heroId: "magician", amount: 20 }] },
  },
  {
    index: 7,
    name: "The Confessor",
    threats: ["Double healer", "Sustain"],
    demands: ["dps"],
    hint: "Two Seers out-heal slow damage forever. You need burst — delete a healer in one turn (The Tower) before they mend.",
    enemies: [
      { enemyId: "gloom_knight", slot: 0, level: 12 },
      { enemyId: "gloom_knight", slot: 1, level: 12 },
      { enemyId: "husk_seer", slot: 2, level: 12 },
      { enemyId: "husk_seer", slot: 3, level: 12 },
    ],
    reward: { dust: 400, aether: 15, gear: ["eight_wands"] },
  },
  {
    index: 8,
    name: "Tide & Flame",
    threats: ["All Fire", "Elemental check"],
    demands: ["healer"],
    hint: "Everything here is Fire. Water (Cups) heroes resist it and counter-hit — and leave your Air heroes on the bench.",
    rule: "Every enemy is Wands (Fire). Cups beat Wands; Wands beat Swords. Build around the wheel.",
    enemies: [
      { enemyId: "ember_brute", slot: 0, level: 14 },
      { enemyId: "ember_brute", slot: 1, level: 14 },
      { enemyId: "zealot", slot: 2, level: 14 },
      { enemyId: "flame_archer", slot: 3, level: 14, scale: { atk: 1.15 } },
    ],
    reward: { dust: 460, heroShards: [{ heroId: "empress", amount: 20 }] },
  },
  {
    index: 9,
    name: "Glasswing",
    threats: ["Glass cannons", "High speed"],
    demands: ["bruiser", "dps"],
    hint: "They hit like trucks and die like glass — but they're fast. Win the race: strike first and hardest (The Chariot races them down).",
    enemies: [
      { enemyId: "umbral_stalker", slot: 2, level: 16 },
      { enemyId: "flame_archer", slot: 3, level: 16, scale: { atk: 1.2 } },
      { enemyId: "cinder_imp", slot: 0, level: 16, scale: { atk: 1.4 } },
      { enemyId: "cinder_imp", slot: 1, level: 16, scale: { atk: 1.4 } },
    ],
    reward: { dust: 520, aether: 20, gear: ["knight_swords"] },
  },
  {
    index: 10,
    name: "The Eclipse",
    threats: ["BOSS", "Party-wide burst", "Dispel"],
    demands: ["support", "bender"],
    hint: "Black Corona hits everyone, and Devour strips your shields. Pre-empt the burst with team shields (Hierophant) or turn the blow into healing (The Hanged Man).",
    boss: true,
    rule: "The Eclipse punishes the unshielded — and shields alone, if it Devours them. Layer your defenses.",
    enemies: [
      { enemyId: "the_eclipse", slot: 2, level: 18 },
      { enemyId: "gloom_knight", slot: 0, level: 18 },
      { enemyId: "gloom_knight", slot: 1, level: 18 },
    ],
    reward: { dust: 800, aether: 60, unlockHero: "hanged_man" },
  },
  {
    index: 11,
    name: "The Phalanx",
    threats: ["Heavy armor", "Taunt", "Enemy buffs"],
    demands: ["bender", "support"],
    hint: "Two armored wards stall you while the back line buffs and burns. Sunder their armor (Hermit/Emperor) and strip the buffs (Magician).",
    enemies: [
      { enemyId: "ironbound_ward", slot: 0, level: 20 },
      { enemyId: "ironbound_ward", slot: 1, level: 20 },
      { enemyId: "zealot", slot: 2, level: 21 },
      { enemyId: "void_caster", slot: 3, level: 21 },
    ],
    reward: { dust: 640, aether: 20, gear: ["ten_pentacles"] },
  },
  {
    index: 12,
    name: "The Killing Glass",
    threats: ["Targets your back line", "Pierce"],
    demands: ["support", "tank"],
    hint: "Their stalkers reach past your front and execute your healer. Shield your back line, kill the stalkers first, or interpose a guardian.",
    enemies: [
      { enemyId: "umbral_stalker", slot: 2, level: 22 },
      { enemyId: "umbral_stalker", slot: 3, level: 22 },
      { enemyId: "gloom_knight", slot: 0, level: 22 },
      { enemyId: "ironbound_ward", slot: 1, level: 22 },
    ],
    reward: { dust: 700, aether: 25, gear: ["queen_cups"] },
  },
  {
    index: 13,
    name: "The Long Dark",
    threats: ["Attrition", "Self-heal"],
    demands: ["healer", "bender"],
    hint: "A grind with no quick kill. Out-sustain it (Empress), or turn the long fight in your favor — Strength grows as she's hit; Death raises your fallen.",
    rule: "A war of endurance. Heroes that scale with a long fight thrive here.",
    enemies: [
      { enemyId: "bone_brute", slot: 0, level: 24 },
      { enemyId: "bone_brute", slot: 1, level: 24 },
      { enemyId: "husk_seer", slot: 2, level: 24, scale: { hpMax: 1.3 } },
      { enemyId: "void_caster", slot: 3, level: 24 },
    ],
    reward: { dust: 820, aether: 25, heroShards: [{ heroId: "strength", amount: 30 }] },
  },
  {
    index: 14,
    name: "Mirrorfall",
    threats: ["Full enemy comp", "All threats"],
    demands: ["tank", "dps", "healer", "support"],
    hint: "A complete enemy party — wall, blade, mender, and mage. No single trick wins. Bring a balanced team and play it well.",
    enemies: [
      { enemyId: "ironbound_ward", slot: 0, level: 26 },
      { enemyId: "gloom_knight", slot: 1, level: 26 },
      { enemyId: "husk_seer", slot: 2, level: 26 },
      { enemyId: "void_caster", slot: 3, level: 26 },
    ],
    reward: { dust: 900, aether: 30, gear: ["ten_swords"] },
  },
  {
    index: 15,
    name: "The Devil",
    threats: ["FINAL BOSS", "Burn", "ATK drain", "Adds"],
    demands: ["tank", "dps", "healer", "support", "bender"],
    hint: "Everything you've learned, at once. Chains drain your attack, Inferno burns the party, and two zealots feed the fire. Shield, cleanse, sunder, and burst — together.",
    boss: true,
    rule: "The chains were never locked. Break every assumption you've leaned on to get here.",
    enemies: [
      { enemyId: "the_devil", slot: 0, level: 30 },
      { enemyId: "zealot", slot: 2, level: 28 },
      { enemyId: "zealot", slot: 3, level: 28 },
    ],
    reward: { dust: 2000, aether: 120, unlockHero: "death" },
  },
];

export function floor(index: number): FloorDef | undefined {
  return FLOORS[index - 1];
}

export const MAX_FLOOR = FLOORS.length;
