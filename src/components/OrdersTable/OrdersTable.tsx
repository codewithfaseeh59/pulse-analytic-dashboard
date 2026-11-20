import { formatCurrency, formatDate } from '../../lib/format';
import { PAGE_SIZE, type SortKey, type StatusFilter } from '../../lib/orders';
import type { OrdersTableState } from '../../hooks/useOrdersTable';
import { Badge } from '../ui/Badge/Badge';
import { Button } from '../ui/Button/Button';
import { EmptyState } from '../ui/EmptyState/EmptyState';
import styles from './OrdersTable.module.css';

interface Column {
  key: SortKey;
  label: string;
  numeric?: boolean;
}

const COLUMNS: readonly Column[] = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'category', label: 'Category' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', numeric: true },
];

const STATUS_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
];

function SortArrow({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true" focusable="false">
      <path d="M5 1 1.5 5h7z" fill="currentColor" opacity={direction === 'asc' ? 1 : 0.3} />
      <path d="M5 13 1.5 9h7z" fill="currentColor" opacity={direction === 'desc' ? 1 : 0.3} />
    </svg>
  );
}

export function OrdersTable({ table }: { table: OrdersTableState }) {
  const { rows, pageRows, page, pageCount, sort, status, query } = table;
  const first = rows.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const last = page * PAGE_SIZE + pageRows.length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <label htmlFor="orders-search" className="visually-hidden">
            Search orders by customer or order ID
          </label>
          <input
            id="orders-search"
            className={styles.searchInput}
            type="search"
            placeholder="Search customer or order ID"
            value={query}
            onChange={(event) => {
              table.setQuery(event.target.value);
            }}
          />
        </div>
        <div className={styles.chips} role="group" aria-label="Filter by status">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.chip}
              aria-pressed={status === option.value}
              onClick={() => {
                table.setStatus(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Nothing matches your search and filters. Try a different term or clear the filters."
          action={{ label: 'Clear filters', onClick: table.clearFilters }}
        />
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <caption className="visually-hidden">Orders in the selected date range</caption>
            <thead>
              <tr>
                {COLUMNS.map((column) => {
                  const direction = sort.key === column.key ? sort.direction : null;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={column.numeric ? styles.numeric : undefined}
                      aria-sort={
                        direction === null
                          ? 'none'
                          : direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                      }
                    >
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={() => {
                          table.toggleSort(column.key);
                        }}
                      >
                        {column.label}
                        <SortArrow direction={direction} />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((order) => (
                <tr key={order.id}>
                  <th scope="row" className={`${styles.rowHeader} tabular`}>
                    {order.id}
                  </th>
                  <td>{order.customer}</td>
                  <td>{order.category}</td>
                  <td className="tabular">{formatDate(order.date, 'long')}</td>
                  <td>
                    <Badge status={order.status} />
                  </td>
                  <td className={`${styles.numeric} tabular`}>{formatCurrency(order.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.pagination}>
        <p className={`${styles.summary} tabular`} aria-live="polite">
          {rows.length === 0
            ? 'No results'
            : `Showing ${String(first)}–${String(last)} of ${String(rows.length)}`}
        </p>
        <div className={styles.pager}>
          <Button
            disabled={page === 0}
            onClick={() => {
              table.setPage(page - 1);
            }}
          >
            Previous
          </Button>
          <span className={`${styles.pageLabel} tabular`}>
            Page {page + 1} of {pageCount}
          </span>
          <Button
            disabled={page >= pageCount - 1}
            onClick={() => {
              table.setPage(page + 1);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
