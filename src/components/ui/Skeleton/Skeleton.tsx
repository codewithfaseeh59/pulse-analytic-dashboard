import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height: string;
}

/** Decorative placeholder block. The page announces loading once through a status message. */
export function Skeleton({ width = '100%', height }: SkeletonProps) {
  return <div className={styles.skeleton} style={{ width, height }} aria-hidden="true" />;
}
