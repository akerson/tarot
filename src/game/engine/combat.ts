import type {
  Ability,
  BattleEvent,
  BattleState,
  Combatant,
  EffectOp,
  Row,
} from "../types";
import { elementMultiplier } from "../data/elements";
import { makeRng } from "./rng";

// ─────────────────────────────────────────────────────────────────────────────
//  Combat engine — deterministic, row-based, turn-based, async-safe.
//
//  The governing rule: FRONT PROTECTS BACK.
//   • melee abilities may only strike the enemy FRONT row while it lives;
//   • ranged / magic abilities may strike ANY row.
//  The rule-benders bend exactly this, and the floor design weaponizes it.
//
//  Damage carries no randomness — composition and positioning decide outcomes,
//  which keeps every floor an honest "are you strong enough?" check.
// ─────────────────────────────────────────────────────────────────────────────

export const FRONT_SLOTS = [0, 1];
export const BACK_SLOTS = [2, 3];

export function rowOf(slot: number): Row {
  return slot < 2 ? "front" : "back";
}

// ── Stat resolution (base + buffs/debuffs) ────────────────────────────────────

export function effStat(c: Combatant, stat: "atk" | "def" | "spd"): number {
  let mult = 1;
  for (const e of c.effects) {
    if (e.kind === "buff" && e.stat === stat) mult += e.amount ?? 0;
    if (e.kind === "debuff" && e.stat === stat) mult -= e.amount ?? 0;
  }
  // Berserker / Last Stand offensive scaling folds into atk.
  if (stat === "atk") mult *= ferocity(c);
  return Math.max(1, Math.round(c.baseStats[stat] * Math.max(0.2, mult)));
}

/** Offensive multiplier from condition passives (own HP / sole survivor). */
function ferocity(c: Combatant): number {
  let f = 1;
  const hpFrac = c.hp / c.baseStats.hpMax;
  if (hasFlag(c, "scaleWithMissingHp")) f *= 1 + (1 - hpFrac) * 1.2;
  if (hasFlag(c, "lastStand")) f *= 1; // applied separately when sole survivor
  return f;
}

export function hasFlag(c: Combatant, flag: string): boolean {
  return c.passives.some((p) => p.flags?.includes(flag as never));
}

export function mitigation(def: number): number {
  return 250 / (250 + def);
}

// ── Queries ───────────────────────────────────────────────────────────────────

export const alliesOf = (s: BattleState, c: Combatant) =>
  s.combatants.filter((x) => x.side === c.side);
export const enemiesOf = (s: BattleState, c: Combatant) =>
  s.combatants.filter((x) => x.side !== c.side);
export const livingAllies = (s: BattleState, c: Combatant) =>
  alliesOf(s, c).filter((x) => x.alive);
export const livingEnemies = (s: BattleState, c: Combatant) =>
  enemiesOf(s, c).filter((x) => x.alive);
export const byUid = (s: BattleState, uid: string) =>
  s.combatants.find((x) => x.uid === uid);

/** Enemy units a melee attacker may legally strike (cover rule). */
function meleeReachable(s: BattleState, caster: Combatant): Combatant[] {
  const foes = livingEnemies(s, caster);
  if (hasFlag(caster, "attacksIgnoreCover")) return foes; // Phantom
  const front = foes.filter((f) => rowOf(f.slot) === "front");
  return front.length ? front : foes; // if front cleared, back is exposed
}

/** All legal primary targets for an ability cast by `caster`. */
export function legalTargets(s: BattleState, caster: Combatant, ab: Ability): string[] {
  const allies = livingAllies(s, caster);
  const foes = livingEnemies(s, caster);
  switch (ab.target) {
    case "self":
      return [caster.uid];
    case "ally":
    case "lowestHpAlly":
      return allies.map((c) => c.uid);
    case "allAllies":
      return allies.length ? [allies[0].uid] : [];
    case "deadAlly":
      return alliesOf(s, caster).filter((c) => !c.alive).map((c) => c.uid);
    case "allEnemies":
    case "randomEnemy":
      return foes.length ? [foes[0].uid] : [];
    case "enemy":
    case "enemyRow":
    case "lowestHpEnemy":
    case "highestStatEnemy": {
      const pool = ab.delivery === "melee" ? meleeReachable(s, caster) : foes;
      return pool.map((c) => c.uid);
    }
    default:
      return foes.map((c) => c.uid);
  }
}

/** Expand a chosen primary target into the full target set (area, rows, etc.). */
function resolveTargets(
  s: BattleState,
  caster: Combatant,
  ab: Ability,
  primaryUid: string,
): Combatant[] {
  const primary = byUid(s, primaryUid);
  const foes = livingEnemies(s, caster);
  const allies = livingAllies(s, caster);
  switch (ab.target) {
    case "self":
      return [caster];
    case "allEnemies":
      return foes;
    case "allAllies":
      return allies;
    case "enemyRow": {
      if (!primary) return [];
      const r = rowOf(primary.slot);
      return foes.filter((f) => rowOf(f.slot) === r);
    }
    case "lowestHpAlly":
      return [allies.slice().sort((a, b) => a.hp - b.hp)[0]].filter(Boolean);
    case "lowestHpEnemy":
      return [foes.slice().sort((a, b) => a.hp - b.hp)[0]].filter(Boolean);
    case "highestStatEnemy":
      return [
        foes.slice().sort((a, b) => effStat(b, "atk") - effStat(a, "atk"))[0],
      ].filter(Boolean);
    default:
      return primary ? [primary] : [];
  }
}

// ── Battle setup ──────────────────────────────────────────────────────────────

export function initBattle(
  playerUnits: Combatant[],
  enemyUnits: Combatant[],
  floorIndex: number,
  seed: number,
): BattleState {
  const combatants = [...playerUnits, ...enemyUnits];
  const state: BattleState = {
    floorIndex,
    round: 0,
    phase: "intro",
    combatants,
    order: [],
    turnPtr: 0,
    activeUid: null,
    lastAllyAbility: null,
    seed,
    log: [],
  };
  startRound(state);
  state.phase = "awaitInput";
  return state;
}

function startRound(s: BattleState) {
  s.round += 1;
  // Grant Berserker extra turns earned by taking damage last round.
  for (const c of s.combatants) {
    if (c.alive && hasFlag(c, "rageOnHit") && c.tookDamageThisRound) {
      c.pendingExtraTurns += 1;
    }
    c.tookDamageThisRound = false;
  }
  s.order = buildOrder(s);
  s.turnPtr = 0;
  s.log.push({ t: "round", round: s.round });
}

function buildOrder(s: BattleState): string[] {
  const living = s.combatants.filter((c) => c.alive);
  const score = (c: Combatant) => {
    let v = effStat(c, "spd");
    if (s.round === 1 && hasFlag(c, "firstStrike")) v += 100000; // Hourglass
    if (c.side === "player") v += 0.5; // stable player-first tiebreak
    v -= c.slot * 0.01;
    return v;
  };
  const base = living.sort((a, b) => score(b) - score(a)).map((c) => c.uid);
  // Append any already-pending extra turns (rage carried into this round).
  const extras: string[] = [];
  for (const c of living) {
    for (let i = 0; i < c.pendingExtraTurns; i++) extras.push(c.uid);
    c.pendingExtraTurns = 0;
  }
  return [...base, ...extras];
}

function endRound(s: BattleState) {
  // Damage-over-time ticks, then duration decay.
  for (const c of s.combatants) {
    if (!c.alive) continue;
    let dot = 0;
    for (const e of c.effects) {
      if (e.kind === "dot") dot += e.power ?? 0;
    }
    if (dot > 0) {
      applyDamage(s, c, Math.round(dot), { kind: "dot" }, undefined);
    }
  }
  for (const c of s.combatants) {
    c.effects = c.effects
      .map((e) => ({ ...e, duration: e.duration - 1 }))
      .filter((e) => e.duration > 0 || e.kind === "shield"); // shields persist until spent
    // expire spent/zeroed shields
    c.effects = c.effects.filter((e) => !(e.kind === "shield" && (e.value ?? 0) <= 0));
    c.shield = c.effects
      .filter((e) => e.kind === "shield")
      .reduce((a, e) => a + (e.value ?? 0), 0);
    // tick ability cooldowns
    for (const k of Object.keys(c.cooldowns)) {
      if (c.cooldowns[k] > 0) c.cooldowns[k] -= 1;
    }
  }
}

// ── Action resolution ─────────────────────────────────────────────────────────

export interface StepResult {
  events: BattleEvent[];
  await: boolean; // true = waiting for the player to choose for activeUid
  done: boolean; // true = battle ended
}

/** Resolve one player-chosen action, then hand back to the stepper. */
export function playerAction(
  s: BattleState,
  abilityId: string,
  primaryTargetUid: string,
): BattleEvent[] {
  const caster = s.activeUid ? byUid(s, s.activeUid) : null;
  if (!caster) return [];
  const ab = caster.abilities.find((a) => a.id === abilityId);
  if (!ab) return [];
  const events = resolveAbility(s, caster, ab, primaryTargetUid);
  s.turnPtr += 1;
  checkEnd(s);
  return events;
}

/** Advance the battle by a single actor. The store calls this in a loop,
 *  pacing enemy/animation steps with timeouts. */
export function step(s: BattleState): StepResult {
  if (s.phase === "won" || s.phase === "lost") return { events: [], await: false, done: true };

  if (s.turnPtr >= s.order.length) {
    endRound(s);
    if (checkEnd(s)) return { events: [], await: false, done: true };
    startRound(s);
    return { events: [{ t: "round", round: s.round }], await: false, done: false };
  }

  const uid = s.order[s.turnPtr];
  const c = byUid(s, uid);
  if (!c || !c.alive) {
    s.turnPtr += 1;
    return { events: [], await: false, done: false };
  }

  // Stun: lose the turn.
  const stun = c.effects.find((e) => e.kind === "stun");
  if (stun) {
    s.turnPtr += 1;
    return {
      events: [{ t: "status", uid: c.uid, text: "Stunned" }],
      await: false,
      done: false,
    };
  }

  s.activeUid = uid;

  if (c.side === "player") {
    s.phase = "awaitInput";
    return { events: [{ t: "turn", uid }], await: true, done: false };
  }

  // Enemy AI acts immediately.
  s.phase = "resolving";
  const choice = enemyChoose(s, c);
  const events: BattleEvent[] = [{ t: "turn", uid }];
  if (choice) {
    events.push(...resolveAbility(s, c, choice.ability, choice.targetUid));
  }
  s.turnPtr += 1;
  const done = checkEnd(s);
  return { events, await: false, done };
}

function checkEnd(s: BattleState): boolean {
  const playersAlive = s.combatants.some((c) => c.side === "player" && c.alive);
  const enemiesAlive = s.combatants.some((c) => c.side === "enemy" && c.alive);
  if (!enemiesAlive) {
    s.phase = "won";
    s.log.push({ t: "end", won: true });
    return true;
  }
  if (!playersAlive) {
    s.phase = "lost";
    s.log.push({ t: "end", won: false });
    return true;
  }
  return false;
}

// ── The actual ability resolver ───────────────────────────────────────────────

function resolveAbility(
  s: BattleState,
  caster: Combatant,
  ability: Ability,
  primaryUid: string,
): BattleEvent[] {
  let ab = ability;
  const events: BattleEvent[] = [];

  // Echo (Magician): become the last ally ability used this round.
  if (hasFlag(caster, "echoLastAlly") && ability.tags?.includes("echo")) {
    const last = s.lastAllyAbility;
    const lastCaster = last ? byUid(s, last.casterUid) : null;
    const lastAb = lastCaster?.abilities.find((a) => a.id === last?.abilityId);
    if (lastAb && lastAb.id !== ability.id) {
      events.push({ t: "status", uid: caster.uid, text: `Echo · ${lastAb.name}`, good: true });
      ab = { ...lastAb, name: `Echo: ${lastAb.name}` };
      // re-pick a sensible target for the echoed ability
      const legal = legalTargets(s, caster, ab);
      primaryUid = legal.includes(primaryUid) ? primaryUid : legal[0] ?? primaryUid;
    } else {
      events.push({ t: "status", uid: caster.uid, text: "Echo fizzles", good: false });
    }
  }

  const targets = resolveTargets(s, caster, ab, primaryUid);
  events.push({
    t: "ability",
    casterUid: caster.uid,
    abilityId: ability.id,
    targets: targets.map((t) => t.uid),
  });

  // put on cooldown
  if (ab.cooldown) caster.cooldowns[ability.id] = ab.cooldown;

  for (const op of ab.effects) {
    for (const tgt of targets) {
      if (!tgt) continue;
      events.push(...applyOp(s, caster, tgt, op, ab));
    }
  }

  // Record for Echo (only ally-cast, non-echo abilities).
  if (caster.side === "player" && !ability.tags?.includes("echo")) {
    s.lastAllyAbility = { abilityId: ability.id, casterUid: caster.uid };
  }

  // clean up the dead
  for (const c of s.combatants) {
    if (c.alive && c.hp <= 0) {
      c.alive = false;
      c.hp = 0;
      events.push({ t: "death", uid: c.uid });
    }
  }
  return events;
}

function applyOp(
  s: BattleState,
  caster: Combatant,
  target: Combatant,
  op: EffectOp,
  ab: Ability,
): BattleEvent[] {
  const ev: BattleEvent[] = [];
  switch (op.kind) {
    case "damage": {
      const dmg = computeDamage(s, caster, target, op, ab);
      ev.push(...applyDamage(s, target, dmg.amount, { kind: ab.delivery, element: dmg.element }, caster, dmg.strong));
      break;
    }
    case "heal": {
      if (!target.alive) break;
      const amount = Math.round(effStat(caster, "atk") * op.power);
      const before = target.hp;
      target.hp = Math.min(target.baseStats.hpMax, target.hp + amount);
      ev.push({ t: "heal", uid: target.uid, amount: target.hp - before });
      break;
    }
    case "shield": {
      const amount = Math.round(effStat(caster, "atk") * op.power);
      target.effects.push({ kind: "shield", duration: op.duration, value: amount });
      target.shield += amount;
      ev.push({ t: "shield", uid: target.uid, amount });
      break;
    }
    case "buff": {
      target.effects.push({ kind: "buff", stat: op.stat, amount: op.amount, duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: `+${Math.round(op.amount * 100)}% ${op.stat.toUpperCase()}`, good: true });
      break;
    }
    case "debuff": {
      target.effects.push({ kind: "debuff", stat: op.stat, amount: op.amount, duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: `−${Math.round(op.amount * 100)}% ${op.stat.toUpperCase()}`, good: false });
      break;
    }
    case "dot": {
      target.effects.push({ kind: "dot", dotType: op.dotType, power: effStat(caster, "atk") * op.power, duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: op.dotType, good: false });
      break;
    }
    case "stun": {
      target.effects.push({ kind: "stun", duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: "Stun", good: false });
      break;
    }
    case "taunt": {
      target.effects.push({ kind: "taunt", duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: "Taunt", good: true });
      break;
    }
    case "mark": {
      target.marked = true;
      target.effects.push({ kind: "mark", duration: op.duration, sourceUid: caster.uid });
      ev.push({ t: "status", uid: target.uid, text: "Marked", good: false });
      break;
    }
    case "cleanse": {
      target.effects = target.effects.filter(
        (e) => !["debuff", "dot", "stun"].includes(e.kind),
      );
      ev.push({ t: "status", uid: target.uid, text: "Cleansed", good: true });
      break;
    }
    case "dispel": {
      target.effects = target.effects.filter((e) => !["buff", "shield"].includes(e.kind));
      target.shield = 0;
      ev.push({ t: "status", uid: target.uid, text: "Dispelled", good: false });
      break;
    }
    case "invuln": {
      target.effects.push({ kind: "invuln", duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: "Invulnerable", good: true });
      break;
    }
    case "invertDamage": {
      target.effects.push({ kind: "invertDamage", duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: "Inverted", good: true });
      break;
    }
    case "guard": {
      target.effects.push({ kind: "guard", duration: op.duration });
      ev.push({ t: "status", uid: target.uid, text: "Guarded", good: true });
      break;
    }
    case "extraTurn": {
      // grant the caster another action this round
      s.order.push(caster.uid);
      ev.push({ t: "status", uid: caster.uid, text: "Extra Turn", good: true });
      break;
    }
    case "revive": {
      if (target.alive) break;
      target.alive = true;
      target.isMinion = true;
      target.hp = Math.round(target.baseStats.hpMax * op.hpFraction);
      // shrink stats — a "weakened minion"
      target.baseStats = {
        hpMax: Math.round(target.baseStats.hpMax * op.hpFraction),
        atk: Math.round(target.baseStats.atk * (1 - op.statPenalty)),
        def: Math.round(target.baseStats.def * (1 - op.statPenalty)),
        spd: target.baseStats.spd,
      };
      target.effects = [];
      target.shield = 0;
      ev.push({ t: "revive", uid: target.uid });
      break;
    }
  }
  return ev;
}

interface DamageCalc {
  amount: number;
  element: import("../types").Element;
  strong: boolean;
}

function computeDamage(
  s: BattleState,
  caster: Combatant,
  target: Combatant,
  op: Extract<EffectOp, { kind: "damage" }>,
  _ab: Ability,
): DamageCalc {
  const element = op.element ?? caster.element;
  const atk = effStat(caster, "atk");
  let power = op.power;

  // Martyr: scale with total ally HP missing (fraction).
  if (hasFlag(caster, "martyrScaling")) {
    const allies = alliesOf(s, caster);
    const missing = allies.reduce((a, c) => a + (c.baseStats.hpMax - c.hp), 0);
    const total = allies.reduce((a, c) => a + c.baseStats.hpMax, 0);
    power *= 1 + (missing / Math.max(1, total)) * 2;
  }
  // Last Stand: sole survivor → enormous output.
  if (hasFlag(caster, "lastStand") && livingAllies(s, caster).length === 1) {
    power *= 3;
  }

  const elemMult = elementMultiplier(element, target.element);
  let posMult = 1;
  if (hasFlag(caster, "sniperBackline") && rowOf(target.slot) === "back") posMult = 1.3;

  const raw = power * atk * elemMult * posMult * mitigation(effStat(target, "def"));
  return { amount: Math.max(1, Math.round(raw)), element, strong: elemMult > 1 };
}

interface DamageOpts {
  kind: string;
  element?: import("../types").Element;
}

export function applyDamage(
  s: BattleState,
  target: Combatant,
  amount: number,
  opts: DamageOpts,
  source: Combatant | undefined,
  strong = false,
): BattleEvent[] {
  const ev: BattleEvent[] = [];
  if (!target.alive) return ev;

  // Lantern: immune to all normal damage (DoT counts as normal here).
  if (hasFlag(target, "lanternImmune")) {
    ev.push({ t: "status", uid: target.uid, text: "Immune", good: true });
    return ev;
  }
  if (target.effects.some((e) => e.kind === "invuln")) {
    ev.push({ t: "status", uid: target.uid, text: "Immune", good: true });
    return ev;
  }
  // Hanged Man: incoming damage becomes healing.
  if (target.effects.some((e) => e.kind === "invertDamage")) {
    const before = target.hp;
    target.hp = Math.min(target.baseStats.hpMax, target.hp + amount);
    ev.push({ t: "heal", uid: target.uid, amount: target.hp - before });
    return ev;
  }

  // Bulwark: a guardian ally soaks a would-be-lethal hit for a front rowmate.
  if (rowOf(target.slot) === "front" && target.hp - amount <= 0) {
    const guardian = livingAllies(s, target).find(
      (a) => a.uid !== target.uid && a.effects.some((e) => e.kind === "guard"),
    );
    if (guardian) {
      ev.push({ t: "status", uid: target.uid, text: "Guarded", good: true });
      return applyDamage(s, guardian, Math.round(amount * 0.6), opts, source, strong);
    }
  }

  let remaining = amount;
  // shields absorb first
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, remaining);
    target.shield -= absorbed;
    remaining -= absorbed;
    // draw down shield effect values
    let toDraw = absorbed;
    for (const e of target.effects) {
      if (e.kind === "shield" && toDraw > 0) {
        const d = Math.min(e.value ?? 0, toDraw);
        e.value = (e.value ?? 0) - d;
        toDraw -= d;
      }
    }
    target.effects = target.effects.filter((e) => !(e.kind === "shield" && (e.value ?? 0) <= 0));
  }

  target.hp = Math.max(0, target.hp - remaining);
  target.tookDamageThisRound = true;
  ev.push({
    t: "damage",
    uid: target.uid,
    amount,
    element: opts.element,
    crit: strong,
    kind: opts.kind,
  });
  if (target.hp <= 0) {
    target.alive = false;
    ev.push({ t: "death", uid: target.uid });
  }
  return ev;
}

// ── Enemy AI ──────────────────────────────────────────────────────────────────

interface EnemyChoice {
  ability: Ability;
  targetUid: string;
}

/** Heuristic AI: heal hurt allies, else use the highest-value offensive ability
 *  on the best legal target. Deterministic-ish with a light seeded tiebreak. */
export function enemyChoose(s: BattleState, c: Combatant): EnemyChoice | null {
  const rng = makeRng(s.seed + s.round * 31 + c.slot * 7 + c.hp);
  const usable = c.abilities.filter((a) => (c.cooldowns[a.id] ?? 0) <= 0);
  if (!usable.length) return null;

  // Prefer healing if a meaningful ally is hurt.
  const healAb = usable.find((a) => a.effects.some((e) => e.kind === "heal"));
  if (healAb) {
    const hurt = livingAllies(s, c)
      .filter((a) => a.hp < a.baseStats.hpMax * 0.6)
      .sort((a, b) => a.hp / a.baseStats.hpMax - b.hp / b.baseStats.hpMax)[0];
    if (hurt) return { ability: healAb, targetUid: hurt.uid };
  }

  // Otherwise pick the strongest offensive ability available.
  const offensive = usable
    .filter((a) => a.effects.some((e) => e.kind === "damage"))
    .sort((a, b) => abilityPower(b) - abilityPower(a));
  const ab = offensive[0] ?? usable[0];

  const legal = legalTargets(s, c, ab);
  if (!legal.length) {
    // fall back to a non-damage ability that has legal targets
    for (const alt of usable) {
      const lt = legalTargets(s, c, alt);
      if (lt.length) return { ability: alt, targetUid: lt[0] };
    }
    return null;
  }

  // Taunt overrides target choice: a taunting foe demands to be hit.
  const taunters = legal
    .map((uid) => byUid(s, uid)!)
    .filter((c) => c && c.effects.some((e) => e.kind === "taunt"));
  if (taunters.length && ab.effects.some((e) => e.kind === "damage")) {
    return { ability: ab, targetUid: taunters[0].uid };
  }

  // Focus the lowest effective-HP legal target (kill squishies first).
  const targets = legal
    .map((uid) => byUid(s, uid)!)
    .filter(Boolean)
    .sort((a, b) => a.hp + a.shield - (b.hp + b.shield));
  const pick = rng.chance(0.85) ? targets[0] : rng.pick(targets);
  return { ability: ab, targetUid: pick.uid };
}

function abilityPower(a: Ability): number {
  return a.effects
    .filter((e): e is Extract<EffectOp, { kind: "damage" }> => e.kind === "damage")
    .reduce((sum, e) => sum + e.power, 0);
}

// ── Auto-resolve (for "skip" on cleared floors + balance simulation) ──────────

export function autoResolve(s: BattleState, maxRounds = 40): boolean {
  let guard = 0;
  while (s.phase !== "won" && s.phase !== "lost" && guard++ < maxRounds * 12) {
    const r = step(s);
    if (r.await && s.activeUid) {
      const caster = byUid(s, s.activeUid)!;
      // enemyChoose is side-relative, so it picks a sensible action for the
      // player party too — used for auto-battle on already-cleared floors.
      const choice = enemyChoose(s, caster);
      if (choice) playerAction(s, choice.ability.id, choice.targetUid);
      else s.turnPtr += 1;
    }
    if (r.done) break;
  }
  return s.phase === "won";
}
