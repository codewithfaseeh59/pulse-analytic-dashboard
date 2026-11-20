import { linePath } from '../../lib/paths';
import { linearScale } from '../../lib/scales';

interface SparklineProps {
  values: readonly number[];
  width?: number;
  height?: number;
}

const PADDING = 3;

/** Decorative trend line. The numbers it shows are already in the card text, so it is hidden from assistive tech. */
export function Sparkline({ values, width = 120, height = 36 }: SparklineProps) {
  if (values.length < 2) {
    return null;
  }

  const x = linearScale([0, values.length - 1], [PADDING, width - PADDING]);
  const y = linearScale([Math.min(...values), Math.max(...values)], [height - PADDING, PADDING]);
  const points = values.map((value, index) => ({ x: x(index), y: y(value) }));
  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={linePath(points)}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last && <circle cx={last.x} cy={last.y} r="2.5" fill="var(--chart-1)" />}
    </svg>
  );
}
