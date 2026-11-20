import type { Kpi } from '../../lib/dashboard';
import { formatDelta } from '../../lib/format';
import { formatKpiValue } from '../../lib/kpi';
import type { RangeDays } from '../../types';
import { Sparkline } from './Sparkline';
import styles from './KpiCard.module.css';

interface KpiCardProps {
  kpi: Kpi;
  range: RangeDays;
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path
        d={up ? 'M6 10V2M2.5 5.5 6 2l3.5 3.5' : 'M6 2v8M2.5 6.5 6 10l3.5-3.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({ kpi, range }: KpiCardProps) {
  const up = kpi.change >= 0;

  return (
    <article className={styles.card}>
      <h2 className={styles.label}>{kpi.label}</h2>
      <p className={`${styles.value} tabular`}>{formatKpiValue(kpi)}</p>
      <div className={styles.footer}>
        <p className={styles.change}>
          <span className={`${styles.delta} ${up ? styles.up : styles.down} tabular`}>
            <Arrow up={up} />
            {formatDelta(kpi.change)}
          </span>
          <span className={styles.compare}>vs previous {range} days</span>
        </p>
        <Sparkline values={kpi.series} />
      </div>
    </article>
  );
}
