import { describe, expect, it } from 'vitest';
import type { Order } from '../types';
import { toCsv } from './csv';

const order: Order = {
  id: 'ORD-10001',
  customer: 'Ava Smith',
  category: 'Software',
  date: '2026-06-02',
  status: 'paid',
  amount: 300,
};

describe('toCsv', () => {
  it('writes a header and one line per order with two decimal amounts', () => {
    expect(toCsv([order])).toBe(
      'Order ID,Customer,Category,Date,Status,Amount (USD)\r\n' +
        'ORD-10001,Ava Smith,Software,2026-06-02,paid,300.00',
    );
  });

  it('quotes fields containing commas or quotes', () => {
    const csv = toCsv([{ ...order, customer: 'Smith, "Ava"' }]);
    expect(csv).toContain('"Smith, ""Ava"""');
  });

  it('neutralises spreadsheet formulas', () => {
    expect(toCsv([{ ...order, customer: '=SUM(A1)' }])).toContain("'=SUM(A1)");
  });

  it('returns only the header for no orders', () => {
    expect(toCsv([])).toBe('Order ID,Customer,Category,Date,Status,Amount (USD)');
  });
});
