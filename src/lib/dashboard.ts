import { CATEGORIES, DEVICES } from '../types';
import type { Category, DailyPoint, Dataset, Device, Order, RangeDays } from '../types';

export type KpiKey = 'revenue' | 'users' | 'conversion' | 'aov';
export type KpiFormat = 'currency' | 'number' | 'percent';

export interface Kpi {
  key: KpiKey;
  label: string;
  format: KpiFormat;
  value: number;
  previous: number;
  /** Change versus the previous period as a ratio: 0.05 means +5%. */
  change: number;
  /** One value per day in the selected range, for the sparkline. */
  series: number[];
}

export interface CategoryTotal {
  category: Category;
  total: number;
}

export interface DeviceTotal {
  device: Device;
  total: number;
}

export interface DashboardData {
  /** Daily points inside the selected range. */
  daily: DailyPoint[];
  /** Orders inside the selected range. */
  orders: Order[];
  kpis: Kpi[];
  /** Non-refunded sales per category, highest first. */
  categories: CategoryTotal[];
  devices: DeviceTotal[];
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function divide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function changeRatio(current: number, previous: number): number {
  return previous === 0 ? 0 : (current - previous) / previous;
}

interface PeriodSummary {
  revenue: number;
  /** Average daily active users. Summing days would count the same visitor many times. */
  users: number;
  /** Orders divided by users. */
  conversion: number;
  /** Revenue per order. */
  aov: number;
}

function summarize(points: readonly DailyPoint[]): PeriodSummary {
  const revenue = sum(points.map((p) => p.revenue));
  const orders = sum(points.map((p) => p.orders));
  const users = sum(points.map((p) => p.users));
  return {
    revenue,
    users: divide(users, points.length),
    conversion: divide(orders, users),
    aov: divide(revenue, orders),
  };
}

function buildKpi(
  key: KpiKey,
  label: string,
  format: KpiFormat,
  current: PeriodSummary,
  previous: PeriodSummary,
  series: number[],
): Kpi {
  return {
    key,
    label,
    format,
    value: current[key],
    previous: previous[key],
    change: changeRatio(current[key], previous[key]),
    series,
  };
}

/** Pure calculation behind the dashboard so it can be tested without React. */
export function computeDashboard(source: Dataset, range: RangeDays): DashboardData {
  const daily = source.daily.slice(-range);
  const previousDaily = source.daily.slice(-range * 2, -range);
  const current = summarize(daily);
  const previous = summarize(previousDaily);

  const firstDate = daily[0]?.date;
  const lastDate = daily.at(-1)?.date;
  const orders =
    firstDate === undefined || lastDate === undefined
      ? []
      : source.orders.filter((order) => order.date >= firstDate && order.date <= lastDate);

  const categories = CATEGORIES.map((category) => ({
    category,
    total: sum(
      orders
        .filter((order) => order.category === category && order.status !== 'refunded')
        .map((order) => order.amount),
    ),
  })).sort((a, b) => b.total - a.total);

  const devices = DEVICES.map((device) => ({
    device,
    total: sum(daily.map((point) => point.devices[device])),
  }));

  return {
    daily,
    orders,
    categories,
    devices,
    kpis: [
      buildKpi(
        'revenue',
        'Revenue',
        'currency',
        current,
        previous,
        daily.map((p) => p.revenue),
      ),
      buildKpi(
        'users',
        'Active users',
        'number',
        current,
        previous,
        daily.map((p) => p.users),
      ),
      buildKpi(
        'conversion',
        'Conversion rate',
        'percent',
        current,
        previous,
        daily.map((p) => divide(p.orders, p.users)),
      ),
      buildKpi(
        'aov',
        'Average order value',
        'currency',
        current,
        previous,
        daily.map((p) => divide(p.revenue, p.orders)),
      ),
    ],
  };
}
