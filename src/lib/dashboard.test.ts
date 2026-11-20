import { describe, expect, it } from 'vitest';
import { generateData } from '../data/generate';
import { computeDashboard } from './dashboard';

const source = generateData({ seed: 7, endDate: '2026-06-30' });

function kpiOf(range: 7 | 30 | 90, key: string) {
  const kpi = computeDashboard(source, range).kpis.find((k) => k.key === key);
  if (!kpi) {
    throw new Error(`Missing KPI ${key}`);
  }
  return kpi;
}

describe('computeDashboard', () => {
  it.each([7, 30, 90] as const)('keeps only the last %d days', (range) => {
    const { daily, orders } = computeDashboard(source, range);
    expect(daily).toHaveLength(range);
    expect(daily.at(-1)?.date).toBe('2026-06-30');
    expect(orders.every((o) => o.date >= (daily[0]?.date ?? ''))).toBe(true);
  });

  it('sums revenue for the range and compares with the period before it', () => {
    const revenue = kpiOf(7, 'revenue');
    const days = source.daily;
    const current = days.slice(-7).reduce((total, d) => total + d.revenue, 0);
    const previous = days.slice(-14, -7).reduce((total, d) => total + d.revenue, 0);
    expect(revenue.value).toBeCloseTo(current, 2);
    expect(revenue.previous).toBeCloseTo(previous, 2);
    expect(revenue.change).toBeCloseTo((current - previous) / previous, 6);
    expect(revenue.series).toHaveLength(7);
  });

  it('computes conversion as orders per user and AOV as revenue per order', () => {
    const days = source.daily.slice(-30);
    const orders = days.reduce((total, d) => total + d.orders, 0);
    const users = days.reduce((total, d) => total + d.users, 0);
    const revenue = days.reduce((total, d) => total + d.revenue, 0);
    expect(kpiOf(30, 'conversion').value).toBeCloseTo(orders / users, 8);
    expect(kpiOf(30, 'aov').value).toBeCloseTo(revenue / orders, 6);
  });

  it('has a previous period even for the 90 day range', () => {
    expect(kpiOf(90, 'revenue').previous).toBeGreaterThan(0);
  });

  it('sorts category sales from high to low and matches the revenue total', () => {
    const { categories, kpis } = computeDashboard(source, 30);
    const totals = categories.map((c) => c.total);
    expect(totals).toEqual([...totals].sort((a, b) => b - a));
    const revenue = kpis.find((k) => k.key === 'revenue')?.value ?? 0;
    expect(totals.reduce((a, b) => a + b, 0)).toBeCloseTo(revenue, 1);
  });

  it('adds up device traffic to the total visits', () => {
    const { devices, daily } = computeDashboard(source, 30);
    const visits = daily.reduce((total, d) => total + d.users, 0);
    expect(devices.reduce((total, d) => total + d.total, 0)).toBe(visits);
  });
});
