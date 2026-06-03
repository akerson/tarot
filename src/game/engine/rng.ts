// Small, fast, seedable PRNG (mulberry32). Used for summons, AI tie-breaks,
// and idle variance — NOT for combat damage, which is deterministic so the
// "are you strong enough?" check stays honest and legible.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  next(): number;
  int(maxExclusive: number): number;
  pick<T>(arr: T[]): T;
  chance(p: number): boolean;
}

export function makeRng(seed: number): Rng {
  const r = mulberry32(seed);
  return {
    next: r,
    int: (max) => Math.floor(r() * max),
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
  };
}
