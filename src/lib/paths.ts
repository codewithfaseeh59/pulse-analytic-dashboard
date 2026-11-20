export interface Point {
  x: number;
  y: number;
}

/** Rounds to 2 decimals so path strings stay short and stable. */
function n(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export function linePath(points: readonly Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${n(p.x)} ${n(p.y)}`).join('');
}

/** The line closed down to `baselineY`, ready to fill with a gradient. */
export function areaPath(points: readonly Point[], baselineY: number): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) {
    return '';
  }
  return `${linePath(points)}L${n(last.x)} ${n(baselineY)}L${n(first.x)} ${n(baselineY)}Z`;
}

/** Angles are in radians, 0 at 12 o'clock, increasing clockwise. */
function polar(cx: number, cy: number, radius: number, angle: number): Point {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

function arc(radius: number, largeArc: 0 | 1, sweep: 0 | 1, to: Point): string {
  return `A${n(radius)} ${n(radius)} 0 ${String(largeArc)} ${String(sweep)} ${n(to.x)} ${n(to.y)}`;
}

/**
 * A donut slice between two angles. An SVG arc cannot draw a full circle (start and end points
 * coincide), so a 360 degree slice is drawn as two rings, outer and inner, wound in opposite
 * directions so the middle stays empty.
 */
export function arcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0) {
    return '';
  }

  const outerStart = polar(cx, cy, outerRadius, startAngle);
  const innerStart = polar(cx, cy, innerRadius, startAngle);

  if (sweep >= Math.PI * 2 - 1e-6) {
    const outerMid = polar(cx, cy, outerRadius, startAngle + Math.PI);
    const innerMid = polar(cx, cy, innerRadius, startAngle + Math.PI);
    return (
      `M${n(outerStart.x)} ${n(outerStart.y)}${arc(outerRadius, 0, 1, outerMid)}` +
      `${arc(outerRadius, 0, 1, outerStart)}Z` +
      `M${n(innerStart.x)} ${n(innerStart.y)}${arc(innerRadius, 0, 0, innerMid)}` +
      `${arc(innerRadius, 0, 0, innerStart)}Z`
    );
  }

  const outerEnd = polar(cx, cy, outerRadius, endAngle);
  const innerEnd = polar(cx, cy, innerRadius, endAngle);
  const largeArc = sweep > Math.PI ? 1 : 0;
  return (
    `M${n(outerStart.x)} ${n(outerStart.y)}${arc(outerRadius, largeArc, 1, outerEnd)}` +
    `L${n(innerEnd.x)} ${n(innerEnd.y)}${arc(innerRadius, largeArc, 0, innerStart)}Z`
  );
}
