import { useId, type ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ title, description, className, children }: CardProps) {
  const titleId = useId();

  return (
    <section
      className={className ? `${styles.card} ${className}` : styles.card}
      aria-labelledby={titleId}
    >
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      {children}
    </section>
  );
}
