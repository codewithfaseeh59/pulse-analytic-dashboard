import { describe, expect, it } from 'vitest';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDelta,
  formatNumber,
  formatPercent,
} from './format';

describe('formatCurrency', () => {
  it('shows cents by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('can drop the cents', () => {
    expect(formatCurrency(1234.4, 0)).toBe('$1,234');
  });
});

describe('formatCompactCurrency', () => {
  it.each([
    [0, '$0'],
    [999, '$999'],
    [12400, '$12.4k'],
    [12000, '$12k'],
    [1_200_000, '$1.2M'],
    [-12400, '-$12.4k'],
  ])('formats %d as %s', (value, expected) => {
    expect(formatCompactCurrency(value)).toBe(expected);
  });
});

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatPercent and formatDelta', () => {
  it('turns a ratio into a percentage', () => {
    expect(formatPercent(0.1234)).toBe('12.3%');
  });

  it('adds a plus sign only for positive changes', () => {
    expect(formatDelta(0.052)).toBe('+5.2%');
    expect(formatDelta(-0.041)).toBe('-4.1%');
    expect(formatDelta(0)).toBe('0.0%');
  });
});

describe('formatDate', () => {
  it('formats in UTC regardless of the local timezone', () => {
    expect(formatDate('2026-03-08')).toBe('Mar 8');
    expect(formatDate('2026-03-08', 'long')).toBe('Mar 8, 2026');
  });
});
