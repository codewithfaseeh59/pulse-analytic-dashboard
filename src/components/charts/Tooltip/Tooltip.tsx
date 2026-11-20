import type { ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  /** Anchor position in pixels, relative to the chart container. */
  x: number;
  y: number;
  /** Container width, used to flip the tooltip to the left near the right edge. */
  containerWidth: number;
  children: ReactNode;
}

/** Purely visual: screen reader users get the same information from the chart's slider or table. */
export function Tooltip({ x, y, containerWidth, children }: TooltipProps) {
  const flip = x > containerWidth / 2;

  return (
    <div
      className={`${styles.tooltip} ${flip ? styles.left : styles.right}`}
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
