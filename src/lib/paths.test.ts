import { describe, expect, it } from 'vitest';
import { arcPath, areaPath, linePath } from './paths';

describe('linePath', () => {
  it('joins points with M then L commands', () => {
    expect(
      linePath([
        { x: 0, y: 0 },
        { x: 10, y: 5.456 },
      ]),
    ).toBe('M0 0L10 5.46');
  });

  it('returns an empty string for no points', () => {
    expect(linePath([])).toBe('');
  });
});

describe('areaPath', () => {
  it('closes the line down to the baseline', () => {
    expect(
      areaPath(
        [
          { x: 0, y: 10 },
          { x: 10, y: 5 },
        ],
        20,
      ),
    ).toBe('M0 10L10 5L10 20L0 20Z');
  });

  it('returns an empty string for no points', () => {
    expect(areaPath([], 20)).toBe('');
  });
});

describe('arcPath', () => {
  it('draws a quarter ring clockwise from 12 o clock', () => {
    expect(arcPath(50, 50, 40, 20, 0, Math.PI / 2)).toBe(
      'M50 10A40 40 0 0 1 90 50L70 50A20 20 0 0 0 50 30Z',
    );
  });

  it('uses the large-arc flag past 180 degrees', () => {
    expect(arcPath(50, 50, 40, 20, 0, Math.PI * 1.5)).toContain('A40 40 0 1 1');
  });

  it('draws a full circle as two rings so it is not invisible', () => {
    expect(arcPath(50, 50, 40, 20, 0, Math.PI * 2)).toBe(
      'M50 10A40 40 0 0 1 50 90A40 40 0 0 1 50 10Z' + 'M50 30A20 20 0 0 0 50 70A20 20 0 0 0 50 30Z',
    );
  });

  it('returns an empty string for an empty slice', () => {
    expect(arcPath(50, 50, 40, 20, 1, 1)).toBe('');
  });
});
