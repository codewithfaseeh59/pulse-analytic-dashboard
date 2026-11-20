import { formatCurrency, formatNumber, formatPercent } from './format';
import type { Kpi } from './dashboard';

export function formatKpiValue(kpi: Kpi): string {
  switch (kpi.format) {
    case 'currency':
      return formatCurrency(kpi.value, kpi.key === 'aov' ? 2 : 0);
    case 'number':
      return formatNumber(Math.round(kpi.value));
    case 'percent':
      return formatPercent(kpi.value, 2);
  }
}
