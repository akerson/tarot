import type { Element } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
//  Elemental counter wheel (Open Question §9.2 resolved)
//
//  A clean 4-cycle so it's learnable in one glance — the suit ring on every
//  card shows it. "Arcana" (the rule-bending Majors) sits outside the wheel:
//  it neither gives nor takes elemental bonuses, which is part of why the
//  Majors feel like they break the rules.
//
//      Wands(🔥) ▸ Swords(🜁) ▸ Pentacles(⛰) ▸ Cups(🜄) ▸ Wands…
//
//  Fire feeds on air → Air erodes earth → Earth dams water → Water drowns fire.
// ─────────────────────────────────────────────────────────────────────────────

const BEATS: Record<Element, Element | null> = {
  wands: "swords",
  swords: "pentacles",
  pentacles: "cups",
  cups: "wands",
  arcana: null,
};

export const STRONG_MULT = 1.3;
export const WEAK_MULT = 0.75;
export const NEUTRAL_MULT = 1.0;

export interface ElementInfo {
  id: Element;
  label: string;
  suit: string;
  glyph: string;
  color: string;
}

export const ELEMENTS: Record<Element, ElementInfo> = {
  wands: { id: "wands", label: "Fire", suit: "Wands", glyph: "🜂", color: "#ff5a3c" },
  cups: { id: "cups", label: "Water", suit: "Cups", glyph: "🜄", color: "#2fa8ff" },
  swords: { id: "swords", label: "Air", suit: "Swords", glyph: "🜁", color: "#c9d6ff" },
  pentacles: { id: "pentacles", label: "Earth", suit: "Pentacles", glyph: "🜃", color: "#3ddc84" },
  arcana: { id: "arcana", label: "Arcana", suit: "Major", glyph: "✦", color: "#c08bff" },
};

/** Damage multiplier applied when `attacker` element hits `defender` element. */
export function elementMultiplier(attacker: Element, defender: Element): number {
  if (attacker === "arcana" || defender === "arcana") return NEUTRAL_MULT;
  if (BEATS[attacker] === defender) return STRONG_MULT;
  if (BEATS[defender] === attacker) return WEAK_MULT;
  return NEUTRAL_MULT;
}

/** "strong" | "weak" | "neutral" — for UI tinting of damage numbers. */
export function elementRelation(
  attacker: Element,
  defender: Element,
): "strong" | "weak" | "neutral" {
  const m = elementMultiplier(attacker, defender);
  if (m > 1) return "strong";
  if (m < 1) return "weak";
  return "neutral";
}

export function counters(el: Element): { strongVs: Element | null; weakTo: Element | null } {
  const strongVs = BEATS[el];
  let weakTo: Element | null = null;
  (Object.keys(BEATS) as Element[]).forEach((k) => {
    if (BEATS[k] === el) weakTo = k;
  });
  return { strongVs, weakTo };
}
