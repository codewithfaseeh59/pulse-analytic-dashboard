import { addDays, parseIsoDate } from '../lib/dates';
import type { Category, DailyPoint, Dataset, Device, Order, OrderStatus } from '../types';
import { mulberry32, pick, randInt, weightedPick, type Rng, type Weighted } from './random';

export interface GenerateOptions {
  seed: number;
  /** Last day of the series, YYYY-MM-DD. */
  endDate: string;
  /** Length of the series. 180 covers a 90-day range plus the 90 days before it. */
  days?: number;
}

const FIRST_NAMES = [
  'Ava',
  'Liam',
  'Noah',
  'Emma',
  'Mia',
  'Omar',
  'Zara',
  'Ethan',
  'Priya',
  'Lucas',
  'Chloe',
  'Hiro',
  'Sofia',
  'Mateo',
  'Nora',
  'Kofi',
];
const LAST_NAMES = [
  'Smith',
  'Khan',
  'Garcia',
  'Chen',
  'Novak',
  'Okafor',
  'Silva',
  'Tanaka',
  'Weber',
  'Rossi',
  'Haddad',
  'Larsen',
];

const CATEGORY_WEIGHTS: readonly Weighted<Category>[] = [
  { value: 'Software', weight: 34 },
  { value: 'Hardware', weight: 22 },
  { value: 'Services', weight: 20 },
  { value: 'Training', weight: 14 },
  { value: 'Support', weight: 10 },
];

const STATUS_WEIGHTS: readonly Weighted<OrderStatus>[] = [
  { value: 'paid', weight: 80 },
  { value: 'pending', weight: 12 },
  { value: 'refunded', weight: 8 },
];

const AMOUNT_RANGE: Record<Category, readonly [number, number]> = {
  Software: [49, 899],
  Hardware: [120, 1450],
  Services: [200, 2400],
  Training: [80, 640],
  Support: [29, 320],
};

/** Share of daily users per device. Desktop takes the remainder so the split always sums up. */
const MOBILE_SHARE = 0.42;
const TABLET_SHARE = 0.08;

const FIRST_ORDER_NUMBER = 10_000;

function makeOrder(rng: Rng, index: number, date: string): Order {
  const category = weightedPick(rng, CATEGORY_WEIGHTS);
  const [min, max] = AMOUNT_RANGE[category];
  const cents = randInt(rng, 0, 99);
  return {
    id: `ORD-${String(FIRST_ORDER_NUMBER + index)}`,
    customer: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
    category,
    date,
    status: weightedPick(rng, STATUS_WEIGHTS),
    amount: randInt(rng, min, max) + cents / 100,
  };
}

function splitByDevice(rng: Rng, users: number): Record<Device, number> {
  const mobileShare = MOBILE_SHARE + (rng() - 0.5) * 0.06;
  const tabletShare = TABLET_SHARE + (rng() - 0.5) * 0.02;
  const mobile = Math.round(users * mobileShare);
  const tablet = Math.round(users * tabletShare);
  return { Desktop: users - mobile - tablet, Mobile: mobile, Tablet: tablet };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Builds the whole dataset from a seed. Orders are generated first and the daily series is
 * derived from them, so the chart totals always match the orders table.
 */
export function generateData({ seed, endDate, days = 180 }: GenerateOptions): Dataset {
  const rng = mulberry32(seed);
  const startDate = addDays(endDate, -(days - 1));
  const orders: Order[] = [];
  const daily: DailyPoint[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = addDays(startDate, index);
    const weekday = parseIsoDate(date).getUTCDay();
    const weekendDip = weekday === 0 || weekday === 6 ? 0.7 : 1;
    const growth = 1 + (index / days) * 0.35;
    const orderCount = Math.round((10 + rng() * 8) * weekendDip * growth);

    let revenue = 0;
    let countedOrders = 0;
    for (let n = 0; n < orderCount; n += 1) {
      const order = makeOrder(rng, orders.length, date);
      orders.push(order);
      if (order.status !== 'refunded') {
        revenue += order.amount;
        countedOrders += 1;
      }
    }

    const users = Math.round((520 + rng() * 140) * weekendDip * growth);
    daily.push({
      date,
      revenue: round2(revenue),
      users,
      orders: countedOrders,
      devices: splitByDevice(rng, users),
    });
  }

  return { orders, daily };
}
