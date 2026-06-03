import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BattleEvent,
  BattleState,
  FloorDef,
  FloorReward,
  OwnedHero,
} from "../types";
import { HEROES, STARTER_HEROES, heroDef } from "../data/heroes";
import { FLOORS, floor as getFloor } from "../data/floors";
import { GEAR } from "../data/gear";
import {
  buildDailyBoss,
  buildTrialFloor,
  todayKey,
  activeTrialElement,
} from "../data/dailies";
import {
  buildEnemyParty,
  buildPlayerParty,
  partyPower,
  statsForOwned,
} from "../engine/build";
import { initBattle, playerAction, step, type StepResult } from "../engine/combat";
import { computeIdle, type IdleGains } from "./idle";
import {
  DUP_SHARDS,
  UNLOCK_SHARDS,
  ascendDustCost,
  ascendShardCost,
  canAscend,
  canLevelUp,
  levelUpCost,
  newOwned,
} from "./progression";
import { drawReading, READING_COST, TEN_READING_COST, type PullResult } from "./summon";

// ── Persisted save shape ──────────────────────────────────────────────────────

interface DailySave {
  loginDate: string | null;
  trialDate: string | null;
  bossDate: string | null;
  bossBest: number;
}

export interface Save {
  version: number;
  createdAt: number;
  lastSeen: number;
  highestFloor: number; // highest CLEARED floor (0 = none)
  roster: Record<string, OwnedHero>;
  lockedShards: Record<string, number>; // shards toward unlocking unowned heroes
  team: (string | null)[]; // length 4, slot→heroId
  dust: number;
  aether: number;
  gearInv: Record<string, number>; // gearId → count owned (unequipped)
  daily: DailySave;
  stats: { battlesWon: number; floorsCleared: number; readings: number };
  settings: { sound: boolean; reducedMotion: boolean };
  seenIntro: boolean;
}

// ── Runtime (non-persisted) ───────────────────────────────────────────────────

export type BattleKind = "climb" | "trial" | "boss" | "preview";

interface RuntimeBattle {
  kind: BattleKind;
  floor: FloorDef;
  rewardGranted: boolean;
}

export interface RewardSummary {
  dust?: number;
  aether?: number;
  gear?: string[];
  shards?: { heroId: string; amount: number }[];
  unlocked?: string[];
  newFloor?: boolean;
  score?: number;
  bestScore?: number;
}

export type Screen = "climb" | "roster" | "summon" | "daily" | "codex" | "help";

interface GameState {
  save: Save;
  // runtime
  battleKey: number;
  battle: BattleState | null;
  battleCtx: RuntimeBattle | null;
  selectedAbility: string | null;
  lastReward: RewardSummary | null;
  idleGains: IdleGains | null;
  lastReading: { results: PullResult[]; gains: Record<string, number> } | null;
  screen: Screen;

  // ── actions: meta ───────────────────────────────────────────────────────────
  setScreen: (s: Screen) => void;
  claimIdle: () => void;
  dismissIdle: () => void;
  claimLogin: () => RewardSummary | null;
  toggleSound: () => void;
  markIntroSeen: () => void;
  hardReset: () => void;

  // ── actions: roster ─────────────────────────────────────────────────────────
  setTeamSlot: (slot: number, heroId: string | null) => void;
  autoFillTeam: () => void;
  levelUp: (heroId: string, times?: number) => void;
  ascend: (heroId: string) => void;
  equipGear: (heroId: string, slot: number, gearId: string | null) => void;
  craftHero: (heroId: string) => void;

  // ── actions: summon ─────────────────────────────────────────────────────────
  doReading: (count: number) => void;
  clearReading: () => void;

  // ── actions: battle ─────────────────────────────────────────────────────────
  beginBattle: (kind: BattleKind, floorIndex?: number) => void;
  selectAbility: (id: string | null) => void;
  playerAct: (abilityId: string, targetUid: string) => BattleEvent[];
  stepBattle: () => StepResult;
  endBattle: () => void;
  exitBattle: () => void;

  // ── selectors ───────────────────────────────────────────────────────────────
  teamPower: () => number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function freshSave(): Save {
  const roster: Record<string, OwnedHero> = {};
  for (const id of STARTER_HEROES) roster[id] = newOwned(id, 6);
  const team: (string | null)[] = [null, null, null, null];
  // sensible starting placement: bruisers/tanks front, casters back
  const placement: Record<string, number> = { emperor: 0, chariot: 1, sun: 2, star: 3 };
  for (const [id, slot] of Object.entries(placement)) if (roster[id]) team[slot] = id;
  return {
    version: 1,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    highestFloor: 0,
    roster,
    lockedShards: {},
    team,
    dust: 400,
    aether: 120,
    gearInv: { ace_wands: 1, ace_cups: 1 },
    daily: { loginDate: null, trialDate: null, bossDate: null, bossBest: 0 },
    stats: { battlesWon: 0, floorsCleared: 0, readings: 0 },
    settings: { sound: true, reducedMotion: false },
    seenIntro: false,
  };
}

function teamParty(save: Save): { owned: OwnedHero; slot: number }[] {
  const out: { owned: OwnedHero; slot: number }[] = [];
  save.team.forEach((id, slot) => {
    if (id && save.roster[id]) out.push({ owned: save.roster[id], slot });
  });
  return out;
}

function cloneBattle(b: BattleState): BattleState {
  return { ...b, combatants: b.combatants, order: b.order, log: b.log };
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      save: freshSave(),
      battleKey: 0,
      battle: null,
      battleCtx: null,
      selectedAbility: null,
      lastReward: null,
      idleGains: null,
      lastReading: null,
      screen: "climb",

      setScreen: (s) => set({ screen: s }),

      claimIdle: () => {
        const g = get().idleGains;
        if (!g) return;
        set((st) => ({
          save: { ...st.save, dust: st.save.dust + g.dust, aether: st.save.aether + g.aether, lastSeen: Date.now() },
          idleGains: null,
        }));
      },
      dismissIdle: () => set((st) => ({ idleGains: null, save: { ...st.save, lastSeen: Date.now() } })),

      claimLogin: () => {
        const today = todayKey();
        if (get().save.daily.loginDate === today) return null;
        const floorN = get().save.highestFloor;
        const reward: RewardSummary = { dust: 200 + floorN * 20, aether: 20 };
        set((st) => ({
          save: {
            ...st.save,
            dust: st.save.dust + (reward.dust ?? 0),
            aether: st.save.aether + (reward.aether ?? 0),
            daily: { ...st.save.daily, loginDate: today },
          },
        }));
        return reward;
      },

      toggleSound: () => set((st) => ({ save: { ...st.save, settings: { ...st.save.settings, sound: !st.save.settings.sound } } })),
      markIntroSeen: () => set((st) => ({ save: { ...st.save, seenIntro: true } })),
      hardReset: () => set({ save: freshSave(), battle: null, battleCtx: null, lastReward: null, idleGains: null, screen: "climb" }),

      // ── roster ──────────────────────────────────────────────────────────────
      setTeamSlot: (slot, heroId) =>
        set((st) => {
          const team = [...st.save.team];
          // if hero already placed elsewhere, swap it out
          if (heroId) {
            const existing = team.indexOf(heroId);
            if (existing >= 0) team[existing] = team[slot];
          }
          team[slot] = heroId;
          return { save: { ...st.save, team } };
        }),

      autoFillTeam: () =>
        set((st) => {
          const owned = Object.keys(st.save.roster);
          const front = owned.filter((id) => heroDef(id).preferredRow === "front");
          const back = owned.filter((id) => heroDef(id).preferredRow === "back");
          const team: (string | null)[] = [
            front[0] ?? back[0] ?? null,
            front[1] ?? back[2] ?? null,
            back[0] && back[0] !== (front[1] ?? back[2]) ? back[0] : back[1] ?? null,
            back[1] ?? back[2] ?? front[2] ?? null,
          ];
          // de-dup
          const seen = new Set<string>();
          const clean = team.map((id) => {
            if (id && !seen.has(id)) { seen.add(id); return id; }
            return null;
          });
          return { save: { ...st.save, team: clean } };
        }),

      levelUp: (heroId, times = 1) =>
        set((st) => {
          const hero = st.save.roster[heroId];
          if (!hero) return {};
          let { level } = hero;
          let dust = st.save.dust;
          let leveled = { ...hero };
          for (let i = 0; i < times; i++) {
            if (!canLevelUp({ ...leveled, level })) break;
            const cost = levelUpCost(level);
            if (dust < cost) break;
            dust -= cost;
            level += 1;
          }
          leveled = { ...leveled, level };
          return { save: { ...st.save, dust, roster: { ...st.save.roster, [heroId]: leveled } } };
        }),

      ascend: (heroId) =>
        set((st) => {
          const hero = st.save.roster[heroId];
          if (!hero || !canAscend(hero)) return {};
          const dustCost = ascendDustCost(hero.stars);
          if (st.save.dust < dustCost) return {};
          const shardCost = ascendShardCost(hero.stars);
          const updated: OwnedHero = { ...hero, stars: hero.stars + 1, shards: hero.shards - shardCost };
          return { save: { ...st.save, dust: st.save.dust - dustCost, roster: { ...st.save.roster, [heroId]: updated } } };
        }),

      equipGear: (heroId, slot, gearId) =>
        set((st) => {
          const hero = st.save.roster[heroId];
          if (!hero) return {};
          const gear = [...hero.gear];
          const inv = { ...st.save.gearInv };
          const prev = gear[slot];
          if (prev) inv[prev] = (inv[prev] ?? 0) + 1; // return old to inventory
          if (gearId) {
            if ((inv[gearId] ?? 0) <= 0) return {};
            inv[gearId] -= 1;
          }
          gear[slot] = gearId;
          return { save: { ...st.save, gearInv: inv, roster: { ...st.save.roster, [heroId]: { ...hero, gear } } } };
        }),

      craftHero: (heroId) =>
        set((st) => {
          if (st.save.roster[heroId]) return {};
          const def = HEROES[heroId];
          const have = st.save.lockedShards[heroId] ?? 0;
          const need = UNLOCK_SHARDS[def.rarity];
          if (have < need) return {};
          const locked = { ...st.save.lockedShards };
          delete locked[heroId];
          return { save: { ...st.save, lockedShards: locked, roster: { ...st.save.roster, [heroId]: newOwned(heroId, 1) } } };
        }),

      // ── summon ────────────────────────────────────────────────────────────────
      doReading: (count) => {
        const st = get();
        const cost = count >= 10 ? TEN_READING_COST : READING_COST * count;
        if (st.save.aether < cost) return;
        const seed = (Date.now() ^ (st.save.stats.readings * 2654435761)) >>> 0;
        const results = drawReading(count, seed);
        const roster = { ...st.save.roster };
        const locked = { ...st.save.lockedShards };
        const gains: Record<string, number> = {};
        for (const r of results) {
          if (roster[r.heroId]) {
            // Duplicate → shards toward that hero's ascension.
            const add = DUP_SHARDS[r.rarity];
            roster[r.heroId] = { ...roster[r.heroId], shards: roster[r.heroId].shards + add };
            gains[r.heroId] = (gains[r.heroId] ?? 0) - add; // negative = dup shards
          } else {
            // New hero → unlock immediately, clearing any partial locked shards.
            if (locked[r.heroId]) delete locked[r.heroId];
            roster[r.heroId] = newOwned(r.heroId, 1);
            gains[r.heroId] = (gains[r.heroId] ?? 0) + 1; // positive = new unlock
          }
        }
        set({
          save: { ...st.save, aether: st.save.aether - cost, roster, lockedShards: locked, stats: { ...st.save.stats, readings: st.save.stats.readings + count } },
          lastReading: { results, gains },
        });
      },
      clearReading: () => set({ lastReading: null }),

      // ── battle ──────────────────────────────────────────────────────────────
      beginBattle: (kind, floorIndex) => {
        const st = get();
        let floorDef: FloorDef | undefined;
        if (kind === "climb" || kind === "preview") floorDef = getFloor(floorIndex ?? st.save.highestFloor + 1);
        else if (kind === "trial") floorDef = buildTrialFloor(st.save.highestFloor);
        else if (kind === "boss") floorDef = buildDailyBoss(st.save.highestFloor);
        if (!floorDef) return;

        const party = buildPlayerParty(teamParty(st.save));
        if (!party.length) return;
        const enemies = buildEnemyParty(floorDef.enemies);
        const seed = (Date.now() ^ (floorDef.index * 99991)) >>> 0;
        const battle = initBattle(party, enemies, floorDef.index, seed);
        set({ battleKey: get().battleKey + 1, battle, battleCtx: { kind, floor: floorDef, rewardGranted: false }, selectedAbility: null, lastReward: null });
      },

      selectAbility: (id) => set({ selectedAbility: id }),

      playerAct: (abilityId, targetUid) => {
        const b = get().battle;
        if (!b) return [];
        const events = playerAction(b, abilityId, targetUid);
        set({ battle: cloneBattle(b), selectedAbility: null });
        return events;
      },

      stepBattle: () => {
        const b = get().battle;
        if (!b) return { events: [], await: false, done: true };
        const r = step(b);
        set({ battle: cloneBattle(b) });
        if (r.done) get().endBattle();
        return r;
      },

      endBattle: () => {
        const st = get();
        const b = st.battle;
        const ctx = st.battleCtx;
        if (!b || !ctx || ctx.rewardGranted) return;
        const won = b.phase === "won";
        if (!won) {
          set({ battleCtx: { ...ctx, rewardGranted: true } });
          return;
        }

        const summary: RewardSummary = {};
        const save = { ...st.save };
        save.stats = { ...save.stats, battlesWon: save.stats.battlesWon + 1 };

        if (ctx.kind === "climb") {
          const isFirstClear = ctx.floor.index === save.highestFloor + 1;
          if (isFirstClear) {
            save.highestFloor = ctx.floor.index;
            save.stats.floorsCleared += 1;
            grantReward(save, ctx.floor.reward, summary);
            summary.newFloor = true;
          } else {
            const dust = Math.round((ctx.floor.reward.dust ?? 0) * 0.25);
            save.dust += dust;
            summary.dust = dust;
          }
        } else if (ctx.kind === "trial") {
          grantReward(save, ctx.floor.reward, summary);
          save.daily = { ...save.daily, trialDate: todayKey() };
        } else if (ctx.kind === "boss") {
          const score = Math.max(0, 10000 - b.round * 800 + survivorsBonus(b));
          summary.score = score;
          summary.bestScore = Math.max(save.daily.bossBest, score);
          grantReward(save, ctx.floor.reward, summary);
          save.daily = { ...save.daily, bossDate: todayKey(), bossBest: Math.max(save.daily.bossBest, score) };
        }

        set({ save, lastReward: summary, battleCtx: { ...ctx, rewardGranted: true } });
      },

      exitBattle: () => set((st) => ({ battle: null, battleCtx: null, selectedAbility: null, lastReward: null, save: { ...st.save, lastSeen: Date.now() } })),

      teamPower: () => {
        const st = get();
        const stats = teamParty(st.save).map(({ owned }) => statsForOwned(owned));
        return partyPower(stats);
      },
    }),
    {
      name: "arcana-climb-save",
      version: 1,
      partialize: (st) => ({ save: st.save }) as unknown as GameState,
      onRehydrateStorage: () => (st) => {
        if (!st) return;
        // compute idle gains since last visit
        const g = computeIdle(st.save.lastSeen, Date.now(), st.save.highestFloor);
        if (g.dust > 0 || g.aether > 0) st.idleGains = g;
      },
    },
  ),
);

// ── reward + scoring helpers ──────────────────────────────────────────────────

function grantReward(save: Save, reward: FloorReward, summary: RewardSummary) {
  if (reward.dust) { save.dust += reward.dust; summary.dust = (summary.dust ?? 0) + reward.dust; }
  if (reward.aether) { save.aether += reward.aether; summary.aether = (summary.aether ?? 0) + reward.aether; }
  if (reward.gear) {
    summary.gear = [...(summary.gear ?? [])];
    for (const g of reward.gear) {
      if (!GEAR[g]) continue;
      save.gearInv = { ...save.gearInv, [g]: (save.gearInv[g] ?? 0) + 1 };
      summary.gear.push(g);
    }
  }
  if (reward.heroShards) {
    summary.shards = [...(summary.shards ?? [])];
    for (const { heroId, amount } of reward.heroShards) {
      if (save.roster[heroId]) {
        save.roster = { ...save.roster, [heroId]: { ...save.roster[heroId], shards: save.roster[heroId].shards + amount } };
      } else {
        save.lockedShards = { ...save.lockedShards, [heroId]: (save.lockedShards[heroId] ?? 0) + amount };
      }
      summary.shards.push({ heroId, amount });
    }
  }
  if (reward.unlockHero && !save.roster[reward.unlockHero]) {
    save.roster = { ...save.roster, [reward.unlockHero]: newOwned(reward.unlockHero, Math.max(1, save.highestFloor - 2)) };
    summary.unlocked = [...(summary.unlocked ?? []), reward.unlockHero];
  }
}

function survivorsBonus(b: BattleState): number {
  return b.combatants.filter((c) => c.side === "player" && c.alive).length * 500;
}

// re-exports for UI convenience
export { FLOORS, HEROES, GEAR, activeTrialElement };
