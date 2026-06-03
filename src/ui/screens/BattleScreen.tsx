import { useEffect, useRef, useState, useCallback } from "react";
import { useGame } from "../../game/state/store";
import type { Ability, BattleEvent, Combatant } from "../../game/types";
import { legalTargets, byUid, enemyChoose, effStat } from "../../game/engine/combat";
import { ELEMENTS } from "../../game/data/elements";
import { Sigil } from "../art/sigil";
import { sfx } from "../audio/sfx";
import { BattleResult } from "../components/BattleResult";
import "./battle.css";

interface Floater { id: number; uid: string; text: string; kind: string; }
let floaterId = 0;

export function BattleScreen() {
  const battle = useGame((s) => s.battle);
  const ctx = useGame((s) => s.battleCtx);
  const stepBattle = useGame((s) => s.stepBattle);
  const playerAct = useGame((s) => s.playerAct);

  const [selAbility, setSelAbility] = useState<Ability | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [flash, setFlash] = useState<Record<string, string>>({});
  const [auto, setAuto] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const pumpRef = useRef<() => void>(() => {});

  const addFloater = useCallback((uid: string, text: string, kind: string) => {
    const id = floaterId++;
    setFloaters((f) => [...f, { id, uid, text, kind }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 950);
  }, []);

  const doFlash = useCallback((uid: string, kind: string) => {
    setFlash((m) => ({ ...m, [uid]: kind }));
    setTimeout(() => setFlash((m) => { const n = { ...m }; delete n[uid]; return n; }), 320);
  }, []);

  const animate = useCallback((events: BattleEvent[]) => {
    for (const e of events) {
      switch (e.t) {
        case "damage":
          addFloater(e.uid, `-${e.amount}`, e.crit ? "dmg-crit" : "dmg");
          doFlash(e.uid, "hit");
          e.crit ? sfx.crit() : sfx.hit();
          break;
        case "heal": if (e.amount > 0) { addFloater(e.uid, `+${e.amount}`, "heal"); doFlash(e.uid, "heal"); sfx.heal(); } break;
        case "shield": addFloater(e.uid, `⛨${e.amount}`, "shield"); sfx.shield(); break;
        case "status": addFloater(e.uid, e.text, e.good ? "buff" : "debuff"); if (e.good) sfx.buff(); else sfx.debuff(); break;
        case "death": doFlash(e.uid, "death"); sfx.death(); break;
        case "ability": sfx.ability(); break;
        case "revive": addFloater(e.uid, "RISE", "heal"); break;
      }
    }
  }, [addFloater, doFlash]);

  const pace = (events: BattleEvent[]) => {
    const has = (t: string) => events.some((e) => e.t === t);
    if (has("ability") || has("damage")) return 720;
    if (has("round")) return 500;
    return 240;
  };

  // Main turn pump — advances enemy/automatic steps, stops to await player input.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const pump = () => {
      if (cancelled) return;
      const r = stepBattle();
      if (cancelled) return;
      animate(r.events);
      if (r.done) { setAwaiting(false); return; }
      if (r.await) { setAwaiting(true); setSelAbility(null); return; }
      timer = setTimeout(pump, pace(r.events));
    };
    pumpRef.current = pump;
    pump();
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-play: when AUTO is on and it's the player's turn, pick a sensible
  // action (same heuristic as the enemy AI) and resume the pump.
  const doAutoTurn = useCallback(() => {
    const b = useGame.getState().battle;
    if (!b || !b.activeUid) return;
    const actor = byUid(b, b.activeUid);
    if (!actor || actor.side !== "player") return;
    const choice = enemyChoose(b, actor);
    if (choice) animate(playerAct(choice.ability.id, choice.targetUid));
    setAwaiting(false);
    setTimeout(() => pumpRef.current(), 480);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, playerAct]);

  useEffect(() => {
    if (auto && awaiting) {
      const t = setTimeout(doAutoTurn, 420);
      return () => clearTimeout(t);
    }
  }, [auto, awaiting, doAutoTurn]);

  if (!battle || !ctx) return null;
  const active = battle.activeUid ? byUid(battle, battle.activeUid) : null;
  const isPlayerTurn = awaiting && active?.side === "player";

  const onSelectAbility = (ab: Ability) => {
    if (!isPlayerTurn || !active) return;
    if ((active.cooldowns[ab.id] ?? 0) > 0) { sfx.error(); return; }
    sfx.select();
    const targets = legalTargets(battle, active, ab);
    if (targets.length === 0) { sfx.error(); return; }
    // auto-resolve when there's no meaningful target choice
    if (targets.length === 1 || ["self", "allEnemies", "allAllies", "lowestHpAlly", "lowestHpEnemy", "randomEnemy", "highestStatEnemy"].includes(ab.target)) {
      resolve(ab, targets[0]);
    } else {
      setSelAbility(ab);
    }
  };

  const resolve = (ab: Ability, targetUid: string) => {
    setSelAbility(null);
    setAwaiting(false);
    const ev = playerAct(ab.id, targetUid);
    animate(ev);
    setTimeout(() => pumpRef.current(), pace(ev));
  };

  const onTapUnit = (c: Combatant) => {
    if (selAbility && isPlayerTurn) {
      const legal = legalTargets(battle, active!, selAbility);
      if (legal.includes(c.uid)) resolve(selAbility, c.uid);
      else sfx.error();
    }
  };

  const legalSet = selAbility && active ? new Set(legalTargets(battle, active, selAbility)) : new Set<string>();

  const slot = (side: "player" | "enemy", s: number) =>
    battle.combatants.find((c) => c.side === side && c.slot === s);

  const renderRow = (side: "player" | "enemy", slots: number[], rowName: string) => (
    <div className={`bf-row ${rowName}`}>
      {slots.map((s) => {
        const c = slot(side, s);
        return (
          <div className="bf-cell" key={`${side}-${s}`}>
            {c ? (
              <BattleUnit
                c={c}
                active={battle.activeUid === c.uid}
                targetable={legalSet.has(c.uid)}
                flash={flash[c.uid]}
                floaters={floaters.filter((f) => f.uid === c.uid)}
                onTap={() => onTapUnit(c)}
              />
            ) : <div className="bf-empty" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="battle">
      <div className="bf-top">
        <div className="bf-floor">{ctx.floor.name}</div>
        <div className="bf-round">ROUND {battle.round}</div>
        <button className={`bf-auto ${auto ? "on" : ""}`} onClick={() => { sfx.tap(); setAuto((a) => !a); }}>AUTO {auto ? "ON" : "OFF"}</button>
      </div>

      <TurnOrder battle={battle} />

      <div className="bf-field">
        <div className="bf-side enemy">
          {renderRow("enemy", [2, 3], "back")}
          {renderRow("enemy", [0, 1], "front")}
        </div>
        <div className="bf-veil"><span>FRONT PROTECTS BACK</span></div>
        <div className="bf-side player">
          {renderRow("player", [0, 1], "front")}
          {renderRow("player", [2, 3], "back")}
        </div>
      </div>

      <div className="bf-dock">
        {isPlayerTurn && active ? (
          <div className="ability-bar fade-in">
            <div className="ability-actor">
              <span className="aa-name">{active.name}</span>
              <span className="aa-hint">{selAbility ? "Choose a target" : "Choose an action"}</span>
            </div>
            <div className="ability-btns">
              {active.abilities.map((ab) => {
                const cd = active.cooldowns[ab.id] ?? 0;
                return (
                  <button
                    key={ab.id}
                    className={`ability-btn ${selAbility?.id === ab.id ? "sel" : ""} ${cd > 0 ? "cd" : ""}`}
                    onClick={() => onSelectAbility(ab)}
                  >
                    <span className="ab-ico">{ab.icon}</span>
                    <span className="ab-name">{ab.name}</span>
                    {cd > 0 && <span className="ab-cd">{cd}</span>}
                    <span className="ab-tip">{ab.description}</span>
                  </button>
                );
              })}
            </div>
            {selAbility && <button className="btn btn-ghost btn-sm ability-cancel" onClick={() => { sfx.tap(); setSelAbility(null); }}>Cancel</button>}
          </div>
        ) : (
          <div className="bf-status">{awaiting ? "" : "The arcana move…"}</div>
        )}
      </div>

      {(battle.phase === "won" || battle.phase === "lost") && <BattleResult />}
    </div>
  );
}

// ── Unit token ────────────────────────────────────────────────────────────────

function BattleUnit({ c, active, targetable, flash, floaters, onTap }: {
  c: Combatant; active: boolean; targetable: boolean; flash?: string; floaters: Floater[]; onTap: () => void;
}) {
  const el = ELEMENTS[c.element];
  const hpPct = Math.max(0, (c.hp / c.baseStats.hpMax) * 100);
  const [c1] = c.palette;
  const statuses = summarizeEffects(c);

  return (
    <button
      className={`unit ${c.side} ${active ? "active" : ""} ${targetable ? "targetable" : ""} ${!c.alive ? "dead" : ""} ${flash ? "flash-" + flash : ""}`}
      style={{ ["--c1" as string]: c1 }}
      onClick={onTap}
      disabled={!targetable && !active}
    >
      <div className="unit-floaters">
        {floaters.map((f) => <span key={f.id} className={`floater ${f.kind}`}>{f.text}</span>)}
      </div>
      <div className="unit-portrait">
        <Sigil seed={c.artSeed} color={c1} color2={c.palette[1]} size={56} opacity={0.85} />
        <span className="unit-numeral">{c.arcana.split("·")[0].trim().slice(0, 4)}</span>
        {!c.alive && <span className="unit-skull">☠</span>}
        {c.shield > 0 && c.alive && <span className="unit-shield-badge">⛨</span>}
      </div>
      <div className="unit-elem" style={{ color: el.color }}>{el.glyph}</div>
      <div className="unit-name">{c.name.replace(/^The /, "")}</div>
      <div className="unit-hp">
        <div className="unit-hp-fill" style={{ width: `${hpPct}%` }} />
        {c.shield > 0 && <div className="unit-shield-fill" style={{ width: `${Math.min(100, (c.shield / c.baseStats.hpMax) * 100)}%` }} />}
      </div>
      <div className="unit-hp-txt">{Math.max(0, Math.ceil(c.hp))}</div>
      {statuses.length > 0 && (
        <div className="unit-status">
          {statuses.map((s, i) => <span key={i} className={`st ${s.good ? "good" : "bad"}`} title={s.label}>{s.ico}</span>)}
        </div>
      )}
      {active && <div className="unit-active-ring" />}
      {targetable && <div className="unit-target-ring">◎</div>}
    </button>
  );
}

function summarizeEffects(c: Combatant): { ico: string; good: boolean; label: string }[] {
  const out: { ico: string; good: boolean; label: string }[] = [];
  const seen = new Set<string>();
  for (const e of c.effects) {
    let ico = "", good = true, label: string = e.kind;
    switch (e.kind) {
      case "buff": ico = "▲"; good = true; label = `+${e.stat}`; break;
      case "debuff": ico = "▼"; good = false; label = `-${e.stat}`; break;
      case "dot": ico = e.dotType === "burn" ? "🔥" : e.dotType === "bleed" ? "🩸" : "☠"; good = false; label = e.dotType ?? "dot"; break;
      case "stun": ico = "💫"; good = false; break;
      case "taunt": ico = "🛡"; good = true; break;
      case "invuln": ico = "✦"; good = true; break;
      case "invertDamage": ico = "🔄"; good = true; break;
      case "guard": ico = "⛨"; good = true; break;
      case "mark": ico = "◉"; good = false; break;
      default: continue;
    }
    if (seen.has(ico)) continue;
    seen.add(ico);
    out.push({ ico, good, label });
  }
  return out.slice(0, 5);
}

// ── Turn order strip ──────────────────────────────────────────────────────────

function TurnOrder({ battle }: { battle: import("../../game/types").BattleState }) {
  const upcoming = battle.order.slice(battle.turnPtr, battle.turnPtr + 7)
    .map((uid) => byUid(battle, uid))
    .filter((c): c is Combatant => !!c && c.alive);
  return (
    <div className="turn-order">
      <span className="to-label">NEXT</span>
      {upcoming.map((c, i) => (
        <span key={i} className={`to-pip ${c.side} ${i === 0 ? "now" : ""}`} style={{ ["--c1" as string]: c.palette[0] }} title={`${c.name} · SPD ${effStat(c, "spd")}`}>
          {c.arcana.split("·")[0].trim().slice(0, 3)}
        </span>
      ))}
    </div>
  );
}
