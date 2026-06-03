# 🔮 Arcana Climb

A tarot-themed **collection RPG** built around a single endless vertical climb. Assemble a party of hero-cards drawn from the tarot deck and clear hand-crafted floors in short, turn-based tactical battles. Progression never reverses — a cleared floor stays cleared, and power only ever goes up.

> **Mobile-first PWA** · React + TypeScript + Vite · Neon-Arcana art direction · 100% procedural art & audio (zero image/sound assets shipped).

Built from [the design handoff](arcana-climb-design-handoff.md).

---

## ✨ What's in the build

A **deep vertical slice** — the whole game loop, end to end, heavily polished:

- **Row-based, deterministic combat.** Two rows per side (2 front, 2 back). The one rule — *front protects back*: melee can only strike the enemy front row, ranged/magic reach anyone. No randomness in damage, so every floor is an honest "are you strong enough?" check.
- **14 fully-realized heroes**, each with a 3-ability kit + passive — including the **rule-benders** that make the collection live:
  - **The Hermit** (Sniper) — reaches any row, punishes the back line.
  - **The Moon** (Phantom) — stands safe in back, yet her melee ignores the wall.
  - **The Magician** (Echo) — recasts your last ally's ability.
  - **Death** (Necromancer) — raises a fallen ally as a minion.
  - **The Hanged Man** — turns an ally's incoming damage into healing.
  - **Strength** (Berserker) — extra turns when wounded, scales as HP falls.
  - **The Fool** (Mythic chase) — 1 HP, immune to all normal damage.
- **15 hand-crafted floors** that *demand specific archetypes* without being stat walls. Each floor shows its threats up front and is solved by collecting the right **key**, not by grinding. (Back-row hideout → Sniper/Phantom; double-healer → burst; party-wide nuke → shields/Hanged Man; etc.)
- **Elemental counter wheel** (Wands▸Swords▸Pentacles▸Cups▸Wands); the Arcana element sits outside it.
- **Collection & upgrade** — level (Arcane Dust), ascend (★ via shards), and equip gear (the Numbered Minor Arcana).
- **The Reading** — Aether summon with a card-flip reveal, duplicate→shard conversion, and a Legendary+ pity. No hard paywall: every hero is reachable for free.
- **Daily ritual layer** — idle "welcome back" accrual, daily login, a rotating elemental Trial, and a scored Daily Reckoning boss.
- **The Codex** — full collection with locked silhouettes and the expansion runway (Reversed, Court, Minors, Apocrypha, Sister decks).
- **Procedural everything** — each card's mystical sigil is generated from a seed; every sound effect is synthesized live with the Web Audio API.
- **Installable PWA**, portrait, safe-area aware, attention-safe (nothing ticks in real time).

---

## 🚀 Run it

```bash
npm install
npm run dev        # http://localhost:5173 — open on a phone or use device toolbar
```

Build & preview production:

```bash
npm run build
npm run preview
```

Balance simulation (auto-battles every floor with its intended counter team):

```bash
npx tsx src/game/sim.ts
```

---

## 🗂 Architecture

```
src/
  game/
    types.ts            # shared type system
    data/               # heroes, enemies, gear, floors, dailies, elements (pure data)
    engine/
      combat.ts         # deterministic row-based turn engine (the core)
      build.ts          # owned-hero / enemy → battle Combatant factory
      rng.ts            # seeded PRNG (summons & AI only — never combat damage)
    state/
      store.ts          # Zustand store: roster, currencies, climb, battle orchestration
      progression.ts    # level / ascend / shard economy
      summon.ts         # "The Reading" draw logic
      idle.ts           # offline accrual
    sim.ts              # balance harness
  ui/
    App.tsx, screens/   # Climb, Battle, Roster, Summon, Daily, Codex
    components/         # TarotCard, modals, HeroDetail, nav…
    art/sigil.tsx       # procedural neon sigil generator
    audio/sfx.ts        # Web Audio synth SFX
    theme.css           # neon-arcana design system
```

**Design pillars honored:** daily ritual / endless format · attention-safe (fully async, no twitch) · persistent vertical progression (no run resets, no idle-DPS) · honest strength-check · collection-as-keys.

---

## 🧭 What's deliberately *not* here (per the design guardrails)

Not a roguelike (no run resets) · not a clicker (no idle-DPS/prestige) · not a grid tactics game (rows only, no movement) · not a reflex game (fully async).

Next up on the roadmap: the 22 Reversed Arcana, Court Cards, the full Numbered-Minor gear set, Apocrypha events, and monetization that preserves the no-pressure feel.
