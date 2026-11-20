import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useResizeObserver } from '../../../hooks/useResizeObserver';
import { formatCompactCurrency, formatCurrency, formatDate } from '../../../lib/format';
import { areaPath, linePath } from '../../../lib/paths';
import { linearScale, niceTicks } from '../../../lib/scales';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './AreaChart.module.css';

export interface AreaPoint {
  /** ISO date, YYYY-MM-DD */
  date: string;
  value: number;
}

interface AreaChartProps {
  data: readonly AreaPoint[];
  /** Short name of what is plotted, used in labels, for example "Revenue". */
  label: string;
}

const MARGIN = { top: 12, right: 16, bottom: 28, left: 52 };
const MIN_LABEL_SPACING = 72;

export function AreaChart({ data, label }: AreaChartProps) {
  const { ref, size } = useResizeObserver<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = `area-${useId().replace(/:/g, '')}`;

  const width = size.width;
  const height = width < 480 ? 240 : 300;
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const lastIndex = data.length - 1;

  const values = data.map((point) => point.value);
  const ticks = niceTicks(0, Math.max(0, ...values), 5);
  const top = ticks.at(-1) ?? 1;
  const x = linearScale([0, Math.max(1, lastIndex)], [0, innerWidth]);
  const y = linearScale([ticks[0] ?? 0, top], [innerHeight, 0]);
  const points = data.map((point, index) => ({ x: x(index), y: y(point.value) }));

  const labelEvery = Math.max(
    1,
    Math.ceil(MIN_LABEL_SPACING / Math.max(1, innerWidth / Math.max(1, lastIndex))),
  );
  const active = activeIndex === null ? null : (data[activeIndex] ?? null);
  const activePoint = activeIndex === null ? null : (points[activeIndex] ?? null);

  const total = values.reduce((sum, value) => sum + value, 0);
  const first = data[0];
  const last = data.at(-1);
  const summary =
    first && last
      ? `${label} by day, ${formatDate(first.date, 'long')} to ${formatDate(last.date, 'long')}. Total ${formatCurrency(total, 0)}.`
      : `${label} by day, no data.`;

  const clamp = (index: number) => Math.min(lastIndex, Math.max(0, index));

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActiveIndex(clamp(Math.round(x.invert(event.clientX - rect.left))));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = activeIndex ?? lastIndex;
    const next: Record<string, number> = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: lastIndex,
    };
    const target = next[event.key];
    if (target !== undefined) {
      event.preventDefault();
      setActiveIndex(clamp(target));
    } else if (event.key === 'Escape') {
      setActiveIndex(null);
    }
  };

  const valueText = active
    ? `${formatDate(active.date, 'long')}: ${formatCurrency(active.value, 0)}`
    : summary;

  return (
    <div className={styles.container} ref={ref} style={{ height }}>
      {width > 0 && (
        <>
          <svg width={width} height={height} role="img" aria-label={summary}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <g transform={`translate(${String(MARGIN.left)} ${String(MARGIN.top)})`}>
              {ticks.map((tick) => (
                <g key={tick} transform={`translate(0 ${String(y(tick))})`}>
                  <line x2={innerWidth} stroke="var(--color-grid)" />
                  <text x={-8} dy="0.32em" textAnchor="end" className={styles.tick}>
                    {formatCompactCurrency(tick)}
                  </text>
                </g>
              ))}
              {data.map((point, index) =>
                (lastIndex - index) % labelEvery === 0 ? (
                  <text
                    key={point.date}
                    x={x(index)}
                    y={innerHeight + 18}
                    textAnchor={index === 0 ? 'start' : index === lastIndex ? 'end' : 'middle'}
                    className={styles.tick}
                  >
                    {formatDate(point.date)}
                  </text>
                ) : null,
              )}
              <path d={areaPath(points, innerHeight)} fill={`url(#${gradientId})`} />
              <path
                d={linePath(points)}
                fill="none"
                stroke="var(--chart-1)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {activePoint && (
                <>
                  <line
                    x1={activePoint.x}
                    x2={activePoint.x}
                    y1={0}
                    y2={innerHeight}
                    stroke="var(--color-text-muted)"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="5"
                    fill="var(--color-surface)"
                    stroke="var(--chart-1)"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </g>
          </svg>
          <div
            className={styles.overlay}
            style={{ left: MARGIN.left, top: MARGIN.top, width: innerWidth, height: innerHeight }}
            role="slider"
            tabIndex={0}
            aria-label={`${label} by day. Use the left and right arrow keys to inspect a day.`}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, lastIndex)}
            aria-valuenow={activeIndex ?? Math.max(0, lastIndex)}
            aria-valuetext={valueText}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerMove}
            onPointerLeave={() => {
              setActiveIndex(null);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setActiveIndex((current) => current ?? lastIndex);
            }}
            onBlur={() => {
              setActiveIndex(null);
            }}
          />
          {active && activePoint && (
            <Tooltip
              x={MARGIN.left + activePoint.x}
              y={MARGIN.top + activePoint.y}
              containerWidth={width}
            >
              <div className={styles.tooltipDate}>{formatDate(active.date, 'long')}</div>
              <div className={`${styles.tooltipValue} tabular`}>
                {formatCurrency(active.value, 0)}
              </div>
            </Tooltip>
          )}
        </>
      )}
      <div className="visually-hidden">
        <table>
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">{label}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.date}>
                <th scope="row">{formatDate(point.date, 'long')}</th>
                <td>{formatCurrency(point.value, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
