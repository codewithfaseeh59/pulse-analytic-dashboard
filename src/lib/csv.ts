import type { Order } from '../types';

const HEADER = ['Order ID', 'Customer', 'Category', 'Date', 'Status', 'Amount (USD)'];

/** Quotes a field when needed and neutralises spreadsheet formulas (a leading = + - @). */
function escapeField(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(orders: readonly Order[]): string {
  const rows = orders.map((order) =>
    [
      order.id,
      order.customer,
      order.category,
      order.date,
      order.status,
      order.amount.toFixed(2),
    ].map(escapeField),
  );
  return [HEADER, ...rows].map((row) => row.join(',')).join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
