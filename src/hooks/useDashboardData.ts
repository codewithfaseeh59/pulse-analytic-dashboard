import { useMemo } from 'react';
import { dataset } from '../data/dataset';
import { computeDashboard, type DashboardData } from '../lib/dashboard';
import type { Dataset, RangeDays } from '../types';

export function useDashboardData(range: RangeDays, source: Dataset = dataset): DashboardData {
  return useMemo(() => computeDashboard(source, range), [source, range]);
}
