# Game Design Handoff — Working Title: *Arcana Climb*

**Format:** Mobile (Android + iOS)
**Genre:** Persistent-progression collection RPG with bite-size tactical combat
**Status:** Concept locked on core pillars; ready for prototyping decisions
**Last updated:** June 2026

---

## 1. Elevator Pitch

A tarot-themed collection RPG built around a single endless vertical climb. Players assemble a party of hero-cards drawn from the tarot deck and clear hand-crafted floors in short, turn-based tactical battles. Progression never reverses — a cleared floor stays cleared, and power only goes up. The central question of every floor is *"are you strong enough?"* — but strength means **roster shape**, not raw stats. Getting stuck is solved by collecting the right hero, not by grinding.

---

## 2. Design Pillars (locked)

These are the non-negotiable constraints every system serves:

1. **Daily ritual, endless format.** Designed for short sessions and a daily goal loop, with content that runs indefinitely.
2. **Attention-safe.** A player can be interrupted mid-session — phone down, look away — with zero risk of losing progress. No twitch, no reflex, no real-time death.
3. **Persistent vertical progression.** Floors climb upward and never reset. This is explicitly **not** a roguelike (no run-based resets) and **not** a clicker (no prestige/idle-DPS loop).
4. **"Are you strong enough?" as the core vector.** Every floor is a strength check. The check is honest and legible — the player can see what they're walking into and build for it.
5. **Collection & upgrade wrap the climb.** Acquiring and improving heroes is the engine that powers continued ascent.

---

## 3. Core Loop

**Per session (1–5 min):**
1. Open app → review idle/daily gains accrued since last session.
2. Attempt the next locked floor (or replay for resources).
3. If stuck: swap party composition, level/gear a counter-hero, or run a daily side mode for the missing piece.
4. Spend earned resources on roster progression.

**Daily layer (the ritual):**
- Idle resource/XP accrual while away.
- Rotating side modes that drop specific gear or hero shards.
- A daily boss or challenge with leaderboard scoring.

**Long arc:**
- The climb itself is the content — hand-crafted floors with personality, not power-scaled mooks.
- Parallel evergreen modes give a stuck player something to do (see AFK Arena's King's Tower / Labyrinth model — multiple parallel climbs).

---

## 4. Combat Model

**Row-based, turn-based, portrait-friendly.**

- **Layout:** Two rows per side — **2 front, 2 back** (4 heroes). Enemy mirrors.
- **The one rule:** *Front protects back.* Front row absorbs melee; back row is safer but vulnerable to piercing/ranged abilities. Onboards in a single tutorial screen.
- **No movement.** Positions are locked before the fight. This is the deliberate simplification away from a grid — a full tactics grid was rejected as too confusing for first-session players.
- **Per turn:** pick a hero → pick one of their 2–3 abilities → pick a target.
- **Battle length:** 4–8 turns. Skippable once a floor is cleared.
- **Async-safe:** nothing ticks in real time. The player can put the phone down between any two actions.

**Why row-based over slotless:** it reads as meaningfully more interesting at a glance (matters for store screenshots and the first 30 seconds) while keeping the governing rule trivial. The complexity budget saved on the grid goes into **ability design** — making *who is on my team* the real decision.

**Portrait UX:** party = one strip across the middle, enemies = one strip above, ability buttons under the thumb at the bottom. No camera pan, no zoom, no fat-finger grid misclicks.

---

## 5. Theme — Tarot / Arcana

Heroes are personifications of the tarot deck. Chosen because:

- **Rule-bending is baked into the source.** The Major Arcana already encode "this card cheats" fantasies (the Magician, the Fool, Death).
- **Built-in structure.** Players mentally index the roster ("I need a Cups healer," "I need a Major").
- **Premium, distinctive visual identity** — reads as a curated, hand-illustrated set on the store page. Solves the art-direction question for free.
- **Clean expansion path** — launch with the Majors, drip the rest as content.

---

## 6. Hero Design Philosophy

**The collection is a set of keys, not a pile of power.**

- Every **standard hero** (Tank / DPS / AoE / Healer / Buffer) cleanly solves a category of floor.
- Every **rule-bender** is the *only* answer to at least one floor — and a trap on a few others.
- A player stuck on Floor 73 should not think "grind more." They should think "I need a Phantom," then pull, craft, or trade for one.

Floors are designed to **demand specific archetypes** without feeling like artificial stat walls. (This curve is the top open design question — see §9.)

---

## 7. Hero Archetypes — The Rule-Benders

The pedestrian roles are the chassis. These are the heroes that make the collection live. Categories with examples:

### Position-benders (break the front/back rule)
- **The Phantom** — back row, but strikes as if front. The wall doesn't protect anyone from her.
- **The Sniper** — targets any enemy regardless of row. Hard counter to back-row hideouts.
- **The Bulwark** — back-row hero who intercepts lethal damage for front-row allies. The wall protects both directions.

### Action-economy benders (break turn order)
- **The Hourglass** — acts before any enemy on round 1.
- **The Echo** — repeats the last ability any ally used this round. Force multiplier with the right team.
- **The Berserker** — gains an extra turn the round after she takes damage. Begs to be hit.

### Condition heroes (want the team in trouble)
- **The Martyr** — damage scales with total HP missing across allies.
- **The Last Stand** — +200% stats when she's the only ally alive. A win condition disguised as a unit.
- **The Necromancer** — resurrects fallen allies as weakened minions for the rest of the fight.

### Synergy-required (useless alone, brutal in the right team)
- **The Conduit** — almost no direct damage, but doubles every ally's damage against her marked target.
- **The Twin** — counts as two heroes for ability triggers; her paired Twin (a separate collectible) shares HP and turns when both are fielded.

### System-breakers (violate fundamental assumptions)
- **The Lantern** — 1 HP, immune to all normal damage. MVP or instantly dead.
- **The Mirror** — copies the highest-stat enemy at battle start. You fight your opponent's own win condition.
- **The Pacifist** — deals no damage; when she dies, every enemy drops to 1 HP.

---

## 8. Roster Structure & Expansion Tiers

### Tier 1 — The 22 Major Arcana (launch pillars)
The most iconic kits. Obtainable through the main climb.

### Tier 2 — The 22 Reversed Arcana (shadow roster)
Mechanical mirrors of the Majors, unlocked through deeper/"darker" climb content. Each Reversed is what its upright twin becomes when something goes wrong. Not skins — paired mechanics. Running upright + reversed of the same card together is its own deck choice.

Example Reversed kits:
- **The Sun** deals radiant AoE and buffs allies → **Reversed Sun** deals damage by burning out ally buffs (weaponizes light by consuming it).
- **The Hanged Man** inverts incoming damage to healing → **Reversed Hanged Man** inverts incoming healing to damage. Same axis, opposite vector.
- **Justice** punishes targets by harm dealt → **Reversed Justice** converts ally damage taken into ally damage dealt (vengeance, not balance).
- **The Wheel** applies a random buff to your party → **Reversed Wheel** applies a random curse to the enemy.

### Tier 3 — Minor Arcana (the 56 others)
Four suits — Wands (Fire), Cups (Water), Swords (Air), Pentacles (Earth) — Ace–10 plus four court cards each.
- **Court Cards as mid-tier heroes (16).** Knight of Swords, Queen of Cups, etc. Suit-themed, lower ceiling than Majors, easier to acquire/ascend. Drive elemental sub-rosters.
- **Numbered Minors as gear/ability cards (40).** Ace of Wands = fire weapon; Three of Cups = rally buff. Sidesteps "what does the 6 of Pentacles do as a hero" and creates a deep on-theme equipment layer.

### Tier 4 — Apocrypha (invented chase cards)
Custom Arcana not in any historical deck — event-exclusive / seasonal, framed as "discovered" or "summoned":
- **The Reader** — the diviner herself; manipulates draw rules.
- **Card Zero** — a blank that becomes whatever the team needs.
- **The Spread** — alters the battlefield layout itself.
- **The Querent** — represents the player; inherits team properties.
- **The Veil** — hides information from the enemy AI.

Players know these sit outside the historical 78, which is what makes them feel like trophies.

### Tier 5 — Sister-deck expansions (future content)
Other divination systems anchor major updates with their own mechanical identities: Lenormand (36 simpler cards — Rider, Ship, Anchor, Coffin, Snake), runes, oghams, I Ching hexagrams.

### Launch roster math
| Group | Count | Suggested rarity |
|---|---|---|
| Major Arcana | 22 | Epic |
| Reversed Arcana | 22 | Legendary |
| Court Cards | 16 | Rare |
| Numbered Minors | 40 | Common (gear/abilities) |
| Apocrypha | N (live-service) | Mythic / chase |
| Sister decks | future | expansion |

~100+ collectibles at launch, thematically grounded rarity ladder, infinite expansion runway.

---

## 9. Open Questions / Next Steps

1. **The strength-check curve.** How floors demand specific archetypes without feeling like artificial walls. (Highest priority — this is the make-or-break of the whole design.)
2. **Suit-vs-suit elemental counter system.** Define the rock-paper-scissors between Wands/Cups/Swords/Pentacles and how it interacts with the rule-benders.
3. **Daily / idle layer detail.** Exact accrual rates, side-mode rotation, daily boss structure.
4. **Apocrypha event mechanics.** How chase cards are introduced, earned, and balanced against the base 78.
5. **Monetization** — must preserve the "no-pressure" feel. (Not yet discussed.)
6. **Upgrade systems** — leveling, ascension, gear (Numbered Minors), and how depth is gated.
7. **Reference points for structure:** AFK Arena, Hero Wars, Raid: Shadow Legends, Disney Heroes, Darkest Dungeon (row positioning). The bones are proven; the differentiation is ability depth + tarot identity.

---

## 10. What This Game Is NOT (guardrails)

- Not a roguelike — no run resets, progress is permanent.
- Not a clicker — no idle-DPS or prestige loop.
- Not a grid tactics game — positioning is rows only, no movement.
- Not a reflex/twitch game — fully async, interruption-safe.
- Not a "collect more power" game — collect *keys* that unlock specific floors.
