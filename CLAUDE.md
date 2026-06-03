# Arcana Climb — agent notes

Tarot collection-RPG PWA. React + TypeScript + Vite + Zustand. Mobile-first, portrait, neon-arcana art. **All art and audio are procedural** (no binary assets).

## Run / verify
- `npm run dev` — dev server on :5173. **Never pipe a long-running server through `head`/`tail`** — closing the pipe sends SIGPIPE and kills it.
- `npm run build` — `tsc -b && vite build`. Keep this green.
- `npx tsc --noEmit` — fast typecheck. `noUnusedLocals` is on, so prune unused imports.
- `npx tsx src/game/sim.ts` — balance sim: auto-battles every floor with its intended counter team; prints win/round counts.

## Architecture (where things live)
- `src/game/types.ts` — the shared type system. Start here.
- `src/game/data/` — pure data: `heroes.ts`, `enemies.ts` (same `HeroDef` shape), `gear.ts`, `floors.ts`, `dailies.ts`, `elements.ts`.
- `src/game/engine/combat.ts` — the deterministic turn engine. `step()` advances one actor; `playerAction()` resolves a player choice; `legalTargets()` enforces the cover rule; rule-bender passives are `PassiveFlag`s handled here.
- `src/game/engine/build.ts` — turns owned heroes / enemy spawns into battle `Combatant`s (applies level, ascension `starMult`, gear).
- `src/game/state/store.ts` — single Zustand store (persisted via `localStorage` key `arcana-climb-save`). Battle runtime is **not** persisted. The BattleScreen drives the engine via `stepBattle`/`playerAct` with timeout pacing.
- `src/ui/` — screens, components, `art/sigil.tsx` (seeded SVG glyphs), `audio/sfx.ts` (Web Audio synth + haptics).

## Invariants worth preserving
- **Combat damage is deterministic** — no RNG in damage (keeps the "honest strength-check" pillar). `rng.ts` is for summons / AI tie-breaks / idle only.
- **The cover rule**: melee → enemy front row only (unless front cleared or attacker has `attacksIgnoreCover`); ranged/magic → any row. This is the whole game; floors are designed around it.
- **No StrictMode** (`main.tsx`) — the battle loop is imperative; double-invocation would double-step turns.
- `TarotCard` renders a `<div role=button>` (not `<button>`) so it can nest inside clickable slots without invalid DOM.
- Floors demand archetypes via threats/comp, never via stat walls. New floors should keep that contract.
