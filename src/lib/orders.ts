import type { Order, OrderStatus } from '../types';

export type SortKey = 'id' | 'customer' | 'category' | 'date' | 'status' | 'amount';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = 'all' | OrderStatus;

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export const PAGE_SIZE = 10;

/** Dates and amounts are most useful newest/largest first, text columns A to Z. */
export function defaultDirection(key: SortKey): SortDirection {
  return key === 'date' || key === 'amount' ? 'desc' : 'asc';
}

export function filterOrders(
  orders: readonly Order[],
  query: string,
  status: StatusFilter,
): Order[] {
  const needle = query.trim().toLowerCase();
  return orders.filter((order) => {
    if (status !== 'all' && order.status !== status) {
      return false;
    }
    return (
      needle === '' ||
      order.customer.toLowerCase().includes(needle) ||
      order.id.toLowerCase().includes(needle)
    );
  });
}

function compare(a: Order, b: Order, key: SortKey): number {
  if (key === 'amount') {
    return a.amount - b.amount;
  }
  return a[key].localeCompare(b[key], 'en', { numeric: true });
}

/** Returns a sorted copy. Ties fall back to the order id so the order is always stable. */
export function sortOrders(orders: readonly Order[], { key, direction }: SortState): Order[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...orders].sort(
    (a, b) => compare(a, b, key) * factor || a.id.localeCompare(b.id, 'en', { numeric: true }),
  );
}
