'use client';

import { ChevronLeftIcon } from '@zonos/amino/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@zonos/amino/icons/ChevronRightIcon';
import styles from '../pages/DashboardPage.module.scss';

type IPaginationProps = {
  /** Current offset start (1-based) */
  start: number;
  /** Current offset end */
  end: number;
  /** Total items */
  total: number;
  /** Called with cursor or offset to go to next page */
  onNext?: () => void;
  /** Called to go to previous page */
  onPrev?: () => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

export const Pagination = ({
  start,
  end,
  total,
  onNext,
  onPrev,
  hasNextPage = false,
  hasPrevPage = false,
}: IPaginationProps) => (
  <div className={styles.pagination}>
    <div
      className={styles.paginationArrow}
      onClick={hasPrevPage ? onPrev : undefined}
      style={{ opacity: hasPrevPage ? 1 : 0.3, cursor: hasPrevPage ? 'pointer' : 'default' }}
    >
      <ChevronLeftIcon size={16} />
    </div>
    <span>
      {start} - {end}{total > 0 ? ` of ${total.toLocaleString()}` : ''}
    </span>
    <div
      className={styles.paginationArrow}
      onClick={hasNextPage ? onNext : undefined}
      style={{ opacity: hasNextPage ? 1 : 0.3, cursor: hasNextPage ? 'pointer' : 'default' }}
    >
      <ChevronRightIcon size={16} />
    </div>
  </div>
);
