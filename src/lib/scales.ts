export type Extent = readonly [number, number];

export interface LinearScale {
  (value: number): number;
  /** Maps a range value (for example a mouse x) back to the domain. */
  invert: (value: number) => number;
}

/**
 * Maps a numeric domain onto a pixel range. A flat domain (min === max) maps everything to the
 * middle of the range instead of dividing by zero.
 */
export function linearScale(domain: Extent, range: Extent): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainSpan = d1 - d0;
  const rangeSpan = r1 - r0;

  const scale = (value: number) =>
    domainSpan === 0 ? (r0 + r1) / 2 : r0 + ((value - d0) / domainSpan) * rangeSpan;
  const invert = (value: number) =>
    rangeSpan === 0 ? (d0 + d1) / 2 : d0 + ((value - r0) / rangeSpan) * domainSpan;

  return Object.assign(scale, { invert });
}

export interface BandScale {
  /** Width of one band. */
  bandwidth: number;
  /** Left edge of the band for a key, or undefined if the key is unknown. */
  position: (key: string) => number | undefined;
}

/** Evenly spaced bands for categorical data, with `padding` as a fraction of one step. */
export function bandScale(keys: readonly string[], range: Extent, padding = 0.2): BandScale {
  const [r0, r1] = range;
  const step = (r1 - r0) / Math.max(1, keys.length - padding + padding * 2);
  const bandwidth = step * (1 - padding);
  const offset = r0 + step * padding;
  const positions = new Map(keys.map((key, index) => [key, offset + step * index]));

  return { bandwidth, position: (key) => positions.get(key) };
}

function niceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  let nice: number;
  if (round) {
    nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  } else {
    nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  }
  return nice * 10 ** exponent;
}

/**
 * Round-number axis ticks that cover [min, max], roughly `count` of them
 * (for example 0..97 gives 0, 20, 40, 60, 80, 100).
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  let low = min;
  let high = max;
  if (low === high) {
    const spread = Math.abs(low) || 1;
    low = low === 0 ? 0 : low - spread / 2;
    high = high + spread / 2;
  }

  const step = niceNumber(niceNumber(high - low, false) / Math.max(1, count - 1), true);
  const first = Math.floor(low / step);
  const last = Math.ceil(high / step);
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));

  const ticks: number[] = [];
  for (let i = first; i <= last; i += 1) {
    ticks.push(Number((i * step).toFixed(decimals)));
  }
  return ticks;
}
