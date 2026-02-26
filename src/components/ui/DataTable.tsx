'use client';

import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import styles from '../pages/DashboardPage.module.scss';

type IDataTableProps<T> = {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyMessage?: string;
};

export function DataTable<T>({
  headers,
  data,
  renderRow,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = 'No data found',
}: IDataTableProps<T>) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  return (
    <>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {headers.map(h => (
              <th key={h} className={styles.tableHeadCell}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, i) => renderRow(item, i))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className={styles.tableCell}
                style={{ textAlign: 'center', padding: 32, color: 'var(--amino-gray-500)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
