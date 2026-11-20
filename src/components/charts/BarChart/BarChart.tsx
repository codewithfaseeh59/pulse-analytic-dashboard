import { useState } from 'react';
import { useResizeObserver } from '../../../hooks/useResizeObserver';
import { formatCompactCurrency, formatCurrency, formatPercent } from '../../../lib/format';
import { bandScale, linearScale, niceTicks } from '../../../lib/scales';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './BarChart.module.css';

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  /** Already sorted in the order the bars should appear. */
  data: readonly BarDatum[];
  /** What the bars measure, used in labels, for example "Sales by category". */
  label: string;
}

const HEIGHT = 260;
const MARGIN = { top: 22, right: 8, bottom: 30, left: 52 };
/** Minimum width per bar, in px, for category names to fit side by side. */
const LABEL_MIN_WIDTH = 76;

export function BarChart({ data, label }: BarChartProps) {
  const { ref, size } = useResizeObserver<HTMLDivElement>();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const width = size.width;
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  // When the bars are too narrow for horizontal labels they are rotated, which needs more room below.
  const rotateLabels = data.length > 0 && innerWidth / data.length < LABEL_MIN_WIDTH;
  const marginBottom = rotateLabels ? MARGIN.bottom + 24 : MARGIN.bottom;
  const innerHeight = HEIGHT - MARGIN.top - marginBottom;

  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const ticks = niceTicks(0, Math.max(0, ...data.map((datum) => datum.value)), 5);
  const y = linearScale([ticks[0] ?? 0, ticks.at(-1) ?? 1], [innerHeight, 0]);
  const bands = bandScale(
    data.map((datum) => datum.label),
    [0, innerWidth],
    0.3,
  );

  const summary = `${label}: ${data
    .map((datum) => `${datum.label} ${formatCurrency(datum.value, 0)}`)
    .join(', ')}.`;

  const active = data.find((datum) => datum.label === activeLabel);
  const activeX = active ? bands.position(active.label) : undefined;

  return (
    <div className={styles.container} ref={ref} style={{ height: HEIGHT }}>
      {width > 0 && (
        <>
          <svg width={width} height={HEIGHT} role="img" aria-label={summary}>
            <g transform={`translate(${String(MARGIN.left)} ${String(MARGIN.top)})`}>
              {ticks.map((tick) => (
                <g key={tick} transform={`translate(0 ${String(y(tick))})`}>
                  <line x2={innerWidth} stroke="var(--color-grid)" />
                  <text x={-8} dy="0.32em" textAnchor="end" className={styles.tick}>
                    {formatCompactCurrency(tick)}
                  </text>
                </g>
              ))}
              {data.map((datum) => {
                const x = bands.position(datum.label) ?? 0;
                const barHeight = innerHeight - y(datum.value);
                const dimmed = activeLabel !== null && activeLabel !== datum.label;
                return (
                  <g
                    key={datum.label}
                    className={dimmed ? styles.dimmed : undefined}
                    onPointerEnter={() => {
                      setActiveLabel(datum.label);
                    }}
                    onPointerLeave={() => {
                      setActiveLabel(null);
                    }}
                  >
                    <rect
                      className={styles.bar}
                      x={x}
                      y={y(datum.value)}
                      width={bands.bandwidth}
                      height={barHeight}
                      rx="4"
                      fill="var(--chart-1)"
                    />
                    <text
                      x={x + bands.bandwidth / 2}
                      y={y(datum.value) - 6}
                      textAnchor="middle"
                      className={styles.valueLabel}
                    >
                      {formatCompactCurrency(datum.value)}
                    </text>
                    <text
                      x={x + bands.bandwidth / 2}
                      y={innerHeight + (rotateLabels ? 14 : 20)}
                      textAnchor={rotateLabels ? 'end' : 'middle'}
                      transform={
                        rotateLabels
                          ? `rotate(-35 ${String(x + bands.bandwidth / 2)} ${String(innerHeight + 14)})`
                          : undefined
                      }
                      className={styles.tick}
                    >
                      {datum.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
          {active && activeX !== undefined && (
            <Tooltip
              x={MARGIN.left + activeX + bands.bandwidth / 2}
              y={MARGIN.top + y(active.value) + 8}
              containerWidth={width}
            >
              <div className={styles.tooltipLabel}>{active.label}</div>
              <div className={`${styles.tooltipValue} tabular`}>
                {formatCurrency(active.value, 0)}
              </div>
              <div className={`${styles.tooltipLabel} tabular`}>
                {formatPercent(total === 0 ? 0 : active.value / total)} of sales
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
              <th scope="col">Category</th>
              <th scope="col">Sales</th>
            </tr>
          </thead>
          <tbody>
            {data.map((datum) => (
              <tr key={datum.label}>
                <th scope="row">{datum.label}</th>
                <td>{formatCurrency(datum.value, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
