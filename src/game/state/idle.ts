// ─────────────────────────────────────────────────────────────────────────────
//  Idle / daily accrual (handoff §3 daily ritual, §9.3).
//  Deliberately NOT a clicker: idle gains are a modest "welcome back" stipend
//  scaled to how high you've climbed, capped at 12h so there's no FOMO and no
//  idle-DPS loop. The climb is the content; this just tops up the tank.
// ─────────────────────────────────────────────────────────────────────────────

export const IDLE_CAP_HOURS = 12;

export interface IdleGains {
  hours: number;
  dust: number;
  aether: number;
}

export function dustPerHour(highestFloor: number): number {
  return 40 + highestFloor * 22;
}

export function aetherPerHour(highestFloor: number): number {
  return 1.5 + highestFloor * 0.4;
}

export function computeIdle(lastSeen: number, now: number, highestFloor: number): IdleGains {
  const elapsedMs = Math.max(0, now - lastSeen);
  const hours = Math.min(IDLE_CAP_HOURS, elapsedMs / 3_600_000);
  return {
    hours,
    dust: Math.floor(dustPerHour(highestFloor) * hours),
    aether: Math.floor(aetherPerHour(highestFloor) * hours),
  };
}
