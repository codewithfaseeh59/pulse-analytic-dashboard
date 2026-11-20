import { useId, useState } from 'react';
import { formatNumber, formatPercent } from '../../../lib/format';
import { arcPath } from '../../../lib/paths';
import styles from './DonutChart.module.css';

export interface DonutDatum {
  label: string;
  value: number;
}

interface DonutChartProps {
  data: readonly DonutDatum[];
  /** What the donut shows, for example "Traffic by device". */
  label: string;
  /** Unit shown under the total in the middle, for example "visits". */
  unit: string;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 92;
const INNER_RADIUS = 60;
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'] as const;
const PATTERNS = ['solid', 'stripes', 'dots'] as const;

function patternFor(index: number): (typeof PATTERNS)[number] {
  return PATTERNS[index % PATTERNS.length] ?? 'solid';
}

function colorFor(index: number): string {
  return COLORS[index % COLORS.length] ?? 'var(--chart-1)';
}

export function DonutChart({ data, label, unit }: DonutChartProps) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const patternPrefix = `donut-${useId().replace(/:/g, '')}`;

  const fillFor = (index: number): string => {
    const pattern = patternFor(index);
    return pattern === 'solid'
      ? colorFor(index)
      : `url(#${patternPrefix}-${pattern}-${String(index)})`;
  };

  const grandTotal = data.reduce((sum, datum) => sum + datum.value, 0);
  const visible = data.filter((datum) => !hidden.has(datum.label));
  const visibleTotal = visible.reduce((sum, datum) => sum + datum.value, 0);

  const slices = data
    .map((datum, index) => ({ datum, index }))
    .filter(({ datum }) => !hidden.has(datum.label) && visibleTotal > 0)
    .map((slice, position, all) => {
      const before = all.slice(0, position).reduce((sum, { datum }) => sum + datum.value, 0);
      const start = (before / visibleTotal) * Math.PI * 2;
      const end = ((before + slice.datum.value) / visibleTotal) * Math.PI * 2;
      return {
        ...slice,
        path: arcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, start, end),
      };
    });

  const share = (value: number) => formatPercent(grandTotal === 0 ? 0 : value / grandTotal);
  const summary = `${label}: ${data
    .map((datum) => `${datum.label} ${formatNumber(datum.value)} ${unit} (${share(datum.value)})`)
    .join(', ')}.`;

  const toggle = (name: string) => {
    const isLastVisible = visible.length === 1 && !hidden.has(name);
    if (isLastVisible) {
      return;
    }
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className={styles.container}>
      <svg
        className={styles.donut}
        viewBox={`0 0 ${String(SIZE)} ${String(SIZE)}`}
        role="img"
        aria-label={summary}
      >
        <defs>
          {data.map((_, index) => {
            const pattern = patternFor(index);
            const id = `${patternPrefix}-${pattern}-${String(index)}`;
            if (pattern === 'stripes') {
              return (
                <pattern
                  key={id}
                  id={id}
                  width="7"
                  height="7"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="7" height="7" fill={colorFor(index)} />
                  <rect width="3" height="7" fill="var(--color-surface)" opacity="0.55" />
                </pattern>
              );
            }
            if (pattern === 'dots') {
              return (
                <pattern key={id} id={id} width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill={colorFor(index)} />
                  <circle cx="4" cy="4" r="1.8" fill="var(--color-surface)" opacity="0.7" />
                </pattern>
              );
            }
            return null;
          })}
        </defs>
        {slices.map(({ datum, index, path }) => (
          <path
            key={datum.label}
            d={path}
            fill={fillFor(index)}
            fillRule="evenodd"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
        ))}
        <text x={CENTER} y={CENTER - 2} textAnchor="middle" className={styles.total}>
          {formatNumber(visibleTotal)}
        </text>
        <text x={CENTER} y={CENTER + 18} textAnchor="middle" className={styles.unit}>
          {unit}
        </text>
      </svg>
      <ul className={styles.legend}>
        {data.map((datum, index) => {
          const isHidden = hidden.has(datum.label);
          return (
            <li key={datum.label}>
              <button
                type="button"
                className={styles.legendItem}
                aria-pressed={!isHidden}
                aria-disabled={visible.length === 1 && !isHidden}
                onClick={() => {
                  toggle(datum.label);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect
                    width="18"
                    height="18"
                    rx="4"
                    fill={isHidden ? 'none' : fillFor(index)}
                    stroke={colorFor(index)}
                    strokeWidth="2"
                  />
                </svg>
                <span className={isHidden ? styles.off : undefined}>{datum.label}</span>
                <span className={`${styles.legendValue} tabular`}>
                  {formatNumber(datum.value)} · {share(datum.value)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="visually-hidden">
        <table>
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Device</th>
              <th scope="col">Visits</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((datum) => (
              <tr key={datum.label}>
                <th scope="row">{datum.label}</th>
                <td>{formatNumber(datum.value)}</td>
                <td>{share(datum.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
