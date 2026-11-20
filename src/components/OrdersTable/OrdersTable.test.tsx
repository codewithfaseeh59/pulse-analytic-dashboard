// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useOrdersTable } from '../../hooks/useOrdersTable';
import type { Order } from '../../types';
import { OrdersTable } from './OrdersTable';

afterEach(cleanup);

const NAMES = ['Ava Smith', 'Liam Chen', 'Zara Khan', 'Omar Silva', 'Mia Rossi'];

function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `ORD-${String(10_000 + index)}`,
    customer: NAMES[index % NAMES.length] ?? 'Unknown',
    category: 'Software',
    date: `2026-06-${String(1 + (index % 28)).padStart(2, '0')}`,
    status: index % 3 === 0 ? 'refunded' : 'paid',
    amount: 100 + index * 10,
  }));
}

function Harness({ orders }: { orders: Order[] }) {
  const table = useOrdersTable(orders);
  return <OrdersTable table={table} />;
}

function bodyRows(): HTMLElement[] {
  const [, body] = screen.getAllByRole('rowgroup');
  if (!body) {
    throw new Error('Table body not found');
  }
  return within(body).getAllByRole('row');
}

describe('OrdersTable', () => {
  it('sorts by a column and reports it with aria-sort', async () => {
    const user = userEvent.setup();
    render(<Harness orders={makeOrders(5)} />);

    const amountHeader = screen.getByRole('columnheader', { name: /amount/i });
    expect(amountHeader.getAttribute('aria-sort')).toBe('none');

    await user.click(within(amountHeader).getByRole('button'));
    expect(amountHeader.getAttribute('aria-sort')).toBe('descending');
    expect(within(bodyRows()[0] as HTMLElement).getByText('$140.00')).toBeTruthy();

    await user.click(within(amountHeader).getByRole('button'));
    expect(amountHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(within(bodyRows()[0] as HTMLElement).getByText('$100.00')).toBeTruthy();
  });

  it('filters rows by customer name after the debounce', async () => {
    const user = userEvent.setup();
    render(<Harness orders={makeOrders(10)} />);
    expect(bodyRows()).toHaveLength(10);

    await user.type(screen.getByRole('searchbox'), 'zara');

    await waitFor(() => {
      expect(bodyRows()).toHaveLength(2);
    });
    for (const row of bodyRows()) {
      expect(within(row).getByText('Zara Khan')).toBeTruthy();
    }
  });

  it('shows an empty state and can clear the filters', async () => {
    const user = userEvent.setup();
    render(<Harness orders={makeOrders(5)} />);

    await user.type(screen.getByRole('searchbox'), 'nobody');
    await screen.findByText('No orders found');
    expect(screen.queryByRole('table')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => {
      expect(bodyRows()).toHaveLength(5);
    });
  });

  it('filters by status chip', async () => {
    const user = userEvent.setup();
    render(<Harness orders={makeOrders(6)} />);

    await user.click(screen.getByRole('button', { name: 'Refunded' }));
    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Refunded' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('paginates ten rows at a time', async () => {
    const user = userEvent.setup();
    render(<Harness orders={makeOrders(25)} />);

    expect(screen.getByText('Showing 1–10 of 25')).toBeTruthy();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous' }).disabled).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 21–25 of 25')).toBeTruthy();
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next' }).disabled).toBe(true);
  });
});
