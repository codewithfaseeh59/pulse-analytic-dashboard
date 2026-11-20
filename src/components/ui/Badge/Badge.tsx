import type { OrderStatus } from '../../../types';
import styles from './Badge.module.css';

const LABELS: Record<OrderStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
};

/** Each status has its own icon shape as well as a color, so it never relies on color alone. */
const ICONS: Record<OrderStatus, string> = {
  paid: 'M3 7.5 5.5 10 11 4',
  pending: 'M7 3.5V7l2.5 1.5',
  refunded: 'M4 5.5h5a2.5 2.5 0 0 1 0 5H6M4 5.5 6 3.5M4 5.5 6 7.5',
};

export function Badge({ status }: { status: OrderStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
        <path
          d={ICONS[status]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {LABELS[status]}
    </span>
  );
}
