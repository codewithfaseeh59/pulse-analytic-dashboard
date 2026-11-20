import type { ReactNode } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  children?: ReactNode;
}

function LogoMark() {
  return (
    <svg
      className={styles.logo}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="28" height="28" rx="7" fill="var(--color-accent)" />
      <path
        d="M4 15h5l3-7 4 12 3-8 1.5 3H24"
        fill="none"
        stroke="var(--color-accent-contrast)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({ children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <LogoMark />
        <span className={styles.name}>Pulse Analytics</span>
      </div>
      <div className={styles.controls}>{children}</div>
    </header>
  );
}
