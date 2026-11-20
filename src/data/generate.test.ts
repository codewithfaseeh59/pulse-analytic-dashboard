import { describe, expect, it } from 'vitest';
import { addDays } from '../lib/dates';
import { generateData } from './generate';

const options = { seed: 42, endDate: '2026-06-30' };

describe('generateData', () => {
  it('returns identical data for the same seed', () => {
    expect(generateData(options)).toEqual(generateData(options));
  });

  it('returns different data for a different seed', () => {
    expect(generateData({ ...options, seed: 43 })).not.toEqual(generateData(options));
  });

  it('produces 180 consecutive days ending on endDate', () => {
    const { daily } = generateData(options);
    expect(daily).toHaveLength(180);
    expect(daily[0]?.date).toBe('2026-01-02');
    expect(daily.at(-1)?.date).toBe('2026-06-30');
    daily.forEach((point, index) => {
      if (index > 0) {
        expect(point.date).toBe(addDays(daily[index - 1]?.date ?? '', 1));
      }
    });
  });

  it('derives daily revenue and order counts from non-refunded orders', () => {
    const { orders, daily } = generateData(options);
    for (const point of daily) {
      const kept = orders.filter((o) => o.date === point.date && o.status !== 'refunded');
      const total = kept.reduce((sum, o) => sum + o.amount, 0);
      expect(point.orders).toBe(kept.length);
      expect(point.revenue).toBeCloseTo(total, 2);
    }
  });

  it('splits users across devices without losing anyone', () => {
    const { daily } = generateData(options);
    for (const point of daily) {
      const { Desktop, Mobile, Tablet } = point.devices;
      expect(Desktop + Mobile + Tablet).toBe(point.users);
      expect(Desktop).toBeGreaterThan(0);
    }
  });

  it('gives every order a unique id', () => {
    const { orders } = generateData(options);
    expect(new Set(orders.map((o) => o.id)).size).toBe(orders.length);
  });
});
