import { useState } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DateRangeSelector } from './components/Header/DateRangeSelector';
import { Header } from './components/Header/Header';
import { ThemeToggle } from './components/Header/ThemeToggle';
import { Button } from './components/ui/Button/Button';
import { DATA_END_DATE } from './data/dataset';
import { useDashboardData } from './hooks/useDashboardData';
import { useOrdersTable } from './hooks/useOrdersTable';
import { useSimulatedLoading } from './hooks/useSimulatedLoading';
import { useTheme } from './hooks/useTheme';
import { downloadCsv, toCsv } from './lib/csv';
import type { RangeDays } from './types';
import styles from './App.module.css';

const LOADING_DELAY_MS = 600;

export default function App() {
  const [range, setRange] = useState<RangeDays>(30);
  const data = useDashboardData(range);
  const table = useOrdersTable(data.orders);
  const { theme, toggleTheme } = useTheme();
  const isLoading = useSimulatedLoading(range, LOADING_DELAY_MS);

  const exportOrders = () => {
    downloadCsv(`pulse-orders-${DATA_END_DATE}-${String(range)}d.csv`, toCsv(table.rows));
  };

  return (
    <>
      <Header>
        <DateRangeSelector value={range} onChange={setRange} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <Button
          variant="primary"
          disabled={isLoading || table.rows.length === 0}
          onClick={exportOrders}
        >
          Export CSV
        </Button>
      </Header>
      <main className={styles.main}>
        <h1 className="visually-hidden">Dashboard</h1>
        <Dashboard range={range} data={data} table={table} isLoading={isLoading} />
      </main>
    </>
  );
}
