import { describe, expect, it } from 'vitest';
import type { Order } from '../types';
import { defaultDirection, filterOrders, sortOrders } from './orders';

const orders: Order[] = [
  {
    id: 'ORD-10001',
    customer: 'Ava Smith',
    category: 'Software',
    date: '2026-06-02',
    status: 'paid',
    amount: 300,
  },
  {
    id: 'ORD-10002',
    customer: 'Liam Chen',
    category: 'Hardware',
    date: '2026-06-01',
    status: 'pending',
    amount: 120.5,
  },
  {
    id: 'ORD-10003',
    customer: 'Zara Khan',
    category: 'Support',
    date: '2026-06-03',
    status: 'refunded',
    amount: 75,
  },
  {
    id: 'ORD-10004',
    customer: 'ava jones',
    category: 'Training',
    date: '2026-06-03',
    status: 'paid',
    amount: 75,
  },
];

describe('filterOrders', () => {
  it('matches customer names case-insensitively', () => {
    expect(filterOrders(orders, 'AVA', 'all').map((o) => o.id)).toEqual(['ORD-10001', 'ORD-10004']);
  });

  it('matches order ids', () => {
    expect(filterOrders(orders, '10002', 'all').map((o) => o.id)).toEqual(['ORD-10002']);
  });

  it('filters by status and combines with the search', () => {
    expect(filterOrders(orders, '', 'paid')).toHaveLength(2);
    expect(filterOrders(orders, 'ava', 'refunded')).toHaveLength(0);
  });

  it('ignores surrounding spaces in the query', () => {
    expect(filterOrders(orders, '  zara ', 'all')).toHaveLength(1);
  });
});

describe('sortOrders', () => {
  it('sorts text columns ascending and descending', () => {
    const asc = sortOrders(orders, { key: 'customer', direction: 'asc' }).map((o) => o.customer);
    expect(asc).toEqual(['ava jones', 'Ava Smith', 'Liam Chen', 'Zara Khan']);
    const desc = sortOrders(orders, { key: 'customer', direction: 'desc' }).map((o) => o.customer);
    expect(desc).toEqual(['Zara Khan', 'Liam Chen', 'Ava Smith', 'ava jones']);
  });

  it('sorts amounts numerically, not as text', () => {
    const asc = sortOrders(orders, { key: 'amount', direction: 'asc' }).map((o) => o.amount);
    expect(asc).toEqual([75, 75, 120.5, 300]);
  });

  it('breaks ties by order id', () => {
    const sorted = sortOrders(orders, { key: 'amount', direction: 'asc' }).map((o) => o.id);
    expect(sorted.slice(0, 2)).toEqual(['ORD-10003', 'ORD-10004']);
  });

  it('does not change the input array', () => {
    const copy = [...orders];
    sortOrders(orders, { key: 'amount', direction: 'desc' });
    expect(orders).toEqual(copy);
  });
});

describe('defaultDirection', () => {
  it('starts dates and amounts descending and text ascending', () => {
    expect(defaultDirection('date')).toBe('desc');
    expect(defaultDirection('amount')).toBe('desc');
    expect(defaultDirection('customer')).toBe('asc');
  });
});
