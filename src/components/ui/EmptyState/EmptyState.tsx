import { Button } from '../Button/Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <circle cx="18" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="m26 26 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
