import { useMemo } from 'react';
import type { OrdersTableState } from '../../hooks/useOrdersTable';
import type { DashboardData } from '../../lib/dashboard';
import type { RangeDays } from '../../types';
import { AreaChart } from '../charts/AreaChart/AreaChart';
import { BarChart } from '../charts/BarChart/BarChart';
import { DonutChart } from '../charts/DonutChart/DonutChart';
import { KpiCard } from '../KpiCard/KpiCard';
import { OrdersTable } from '../OrdersTable/OrdersTable';
import { Card } from '../ui/Card/Card';
import { Skeleton } from '../ui/Skeleton/Skeleton';
import styles from './Dashboard.module.css';

interface DashboardProps {
  range: RangeDays;
  data: DashboardData;
  table: OrdersTableState;
  isLoading: boolean;
}

function DashboardSkeleton() {
  return (
    <>
      <p role="status" className="visually-hidden">
        Loading dashboard data
      </p>
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className={`${styles.kpi} ${styles.placeholder}`}>
          <Skeleton width="45%" height="16px" />
          <Skeleton width="70%" height="32px" />
          <Skeleton height="36px" />
        </div>
      ))}
      <div className={`${styles.revenue} ${styles.placeholder}`}>
        <Skeleton width="30%" height="20px" />
        <Skeleton height="300px" />
      </div>
      <div className={`${styles.category} ${styles.placeholder}`}>
        <Skeleton width="40%" height="20px" />
        <Skeleton height="260px" />
      </div>
      <div className={`${styles.device} ${styles.placeholder}`}>
        <Skeleton width="40%" height="20px" />
        <Skeleton height="200px" />
      </div>
      <div className={`${styles.orders} ${styles.placeholder}`}>
        <Skeleton width="20%" height="20px" />
        <Skeleton height="36px" />
        <Skeleton height="320px" />
      </div>
    </>
  );
}

export function Dashboard({ range, data, table, isLoading }: DashboardProps) {
  const revenueSeries = useMemo(
    () => data.daily.map((point) => ({ date: point.date, value: point.revenue })),
    [data.daily],
  );
  const categoryData = data.categories.map((item) => ({ label: item.category, value: item.total }));
  const deviceData = data.devices.map((item) => ({ label: item.device, value: item.total }));
  const description = `Last ${String(range)} days`;

  return (
    <div className={styles.grid} aria-busy={isLoading}>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {data.kpis.map((kpi) => (
            <div key={kpi.key} className={styles.kpi}>
              <KpiCard kpi={kpi} range={range} />
            </div>
          ))}
          <Card title="Revenue" description={description} className={styles.revenue}>
            <AreaChart data={revenueSeries} label="Revenue" />
          </Card>
          <Card title="Sales by category" description={description} className={styles.category}>
            <BarChart data={categoryData} label="Sales by category" />
          </Card>
          <Card title="Traffic by device" description={description} className={styles.device}>
            <DonutChart data={deviceData} label="Traffic by device" unit="visits" />
          </Card>
          <Card title="Orders" description={description} className={styles.orders}>
            <OrdersTable table={table} />
          </Card>
        </>
      )}
    </div>
  );
}
