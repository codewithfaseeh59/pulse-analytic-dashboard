import { useMemo, useState } from 'react';
import {
  defaultDirection,
  filterOrders,
  PAGE_SIZE,
  sortOrders,
  type SortKey,
  type SortState,
  type StatusFilter,
} from '../lib/orders';
import type { Order } from '../types';
import { useDebouncedValue } from './useDebouncedValue';

const SEARCH_DEBOUNCE_MS = 250;

/**
 * All state of the orders table. It lives in a hook (not inside the table component) so the
 * header's CSV button can export exactly the rows the table is currently showing.
 */
export function useOrdersTable(orders: readonly Order[]) {
  const [query, setQueryState] = useState('');
  const [status, setStatusState] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortState>({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const rows = useMemo(
    () => sortOrders(filterOrders(orders, debouncedQuery, status), sort),
    [orders, debouncedQuery, status, sort],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  // The date range can shrink the list under the current page, so clamp instead of resetting in an effect.
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const setQuery = (value: string) => {
    setQueryState(value);
    setPage(0);
  };

  const setStatus = (value: StatusFilter) => {
    setStatusState(value);
    setPage(0);
  };

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: defaultDirection(key) },
    );
    setPage(0);
  };

  const clearFilters = () => {
    setQueryState('');
    setStatusState('all');
    setPage(0);
  };

  return {
    query,
    setQuery,
    status,
    setStatus,
    sort,
    toggleSort,
    page: currentPage,
    setPage,
    pageCount,
    pageRows,
    /** Every row matching the search and status filter, sorted. This is what gets exported. */
    rows,
    clearFilters,
  };
}

export type OrdersTableState = ReturnType<typeof useOrdersTable>;
