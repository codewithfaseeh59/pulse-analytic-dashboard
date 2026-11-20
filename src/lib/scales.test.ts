import { describe, expect, it } from 'vitest';
import { bandScale, linearScale, niceTicks } from './scales';

describe('linearScale', () => {
  it('maps the domain onto the range', () => {
    const scale = linearScale([0, 100], [0, 500]);
    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(250);
    expect(scale(100)).toBe(500);
  });

  it('supports an inverted range such as SVG y axes', () => {
    const scale = linearScale([0, 10], [200, 0]);
    expect(scale(0)).toBe(200);
    expect(scale(10)).toBe(0);
  });

  it('inverts back to the domain', () => {
    const scale = linearScale([0, 100], [0, 500]);
    expect(scale.invert(125)).toBe(25);
  });

  it('maps a flat domain to the middle of the range', () => {
    expect(linearScale([5, 5], [0, 100])(5)).toBe(50);
  });
});

describe('bandScale', () => {
  it('places evenly sized bands inside the range', () => {
    const scale = bandScale(['a', 'b'], [0, 100], 0);
    expect(scale.bandwidth).toBe(50);
    expect(scale.position('a')).toBe(0);
    expect(scale.position('b')).toBe(50);
  });

  it('leaves gaps when padded and returns undefined for unknown keys', () => {
    const scale = bandScale(['a', 'b'], [0, 100], 0.5);
    expect(scale.bandwidth).toBeLessThan(50);
    expect(scale.position('missing')).toBeUndefined();
  });
});

describe('niceTicks', () => {
  it('returns round numbers covering the data', () => {
    expect(niceTicks(0, 97)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('handles decimals without floating point noise', () => {
    expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it('handles negative values', () => {
    const ticks = niceTicks(-30, 70);
    expect(ticks[0]).toBeLessThanOrEqual(-30);
    expect(ticks.at(-1)).toBeGreaterThanOrEqual(70);
    expect(ticks).toContain(0);
  });

  it('handles a flat series', () => {
    expect(niceTicks(0, 0)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5]);
    const flat = niceTicks(100, 100);
    expect(flat[0]).toBeLessThan(100);
    expect(flat.at(-1)).toBeGreaterThan(100);
  });
});
