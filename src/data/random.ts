export type Rng = () => number;

/** Mulberry32: a tiny seeded PRNG. The same seed always yields the same sequence in [0, 1). */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Integer in [min, max], both inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) {
    throw new Error('pick() needs a non-empty array');
  }
  return item;
}

export interface Weighted<T> {
  value: T;
  weight: number;
}

export function weightedPick<T>(rng: Rng, items: readonly Weighted<T>[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = rng() * total;
  for (const item of items) {
    threshold -= item.weight;
    if (threshold < 0) {
      return item.value;
    }
  }
  const last = items[items.length - 1];
  if (last === undefined) {
    throw new Error('weightedPick() needs a non-empty array');
  }
  return last.value;
}
