'use client';

import { useState } from 'react';
import { Select } from '@zonos/amino/components/select/Select';
import { Input } from '@zonos/amino/components/input/Input';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { useProjects } from '@/hooks/useSupabase';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import type { IProject, IProjectStatus } from '@/types/database';
import styles from './ProjectListPage.module.scss';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

type BadgeColor = 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'purple' | 'red';

const STATUS_COLORS: Record<IProjectStatus, BadgeColor> = {
  not_started: 'gray',
  in_progress: 'blue',
  on_hold: 'orange',
  completed: 'green',
  canceled: 'red',
};

const STATUS_LABELS: Record<IProjectStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  on_hold: 'On hold',
  completed: 'Completed',
  canceled: 'Canceled',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysInOnboarding(startDate: string | null): number | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProjectListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof IProject>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const { projects, isLoading, error, mutate } = useProjects({
    status: statusFilter || undefined,
  });

  const { openProject } = useOnboardingNavStore();

  const filtered = projects.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.merchant_name.toLowerCase().includes(q) ||
      p.merchant_id.toLowerCase().includes(q) ||
      p.platform?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (field: keyof IProject) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (isLoading) return <LoadingState message="Loading projects..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => mutate()} />;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Onboarding Projects</h1>
        <p className={styles.subtitle}>
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by merchant name, ID, or platform..."
            size="sm"
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            value={STATUS_OPTIONS.find(o => o.value === statusFilter) || STATUS_OPTIONS[0]}
            options={STATUS_OPTIONS}
            onChange={opt => setStatusFilter(opt?.value ?? '')}
            size="sm"
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} onClick={() => handleSort('merchant_name')}>
                Merchant {sortField === 'merchant_name' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className={styles.th} onClick={() => handleSort('platform')}>
                Platform {sortField === 'platform' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className={styles.th}>AE</th>
              <th className={styles.th}>OB Rep</th>
              <th className={styles.th} onClick={() => handleSort('start_date')}>
                Start {sortField === 'start_date' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className={styles.th}>Days</th>
              <th className={styles.th} onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className={styles.th}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  {search || statusFilter
                    ? 'No projects match your filters'
                    : 'No onboarding projects yet'}
                </td>
              </tr>
            ) : (
              sorted.map(project => {
                const days = getDaysInOnboarding(project.start_date);
                return (
                  <tr
                    key={project.id}
                    className={styles.row}
                    onClick={() => openProject(project.id)}
                  >
                    <td className={styles.td}>
                      <div className={styles.merchantCell}>
                        <span className={styles.merchantName}>
                          {project.merchant_name}
                        </span>
                        <span className={styles.merchantId}>
                          #{project.merchant_id}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      {project.platform || '—'}
                    </td>
                    <td className={styles.td}>
                      {project.ae?.name || '—'}
                    </td>
                    <td className={styles.td}>
                      {project.ob_rep?.name || '—'}
                    </td>
                    <td className={styles.td}>
                      {formatDate(project.start_date)}
                    </td>
                    <td className={styles.td}>
                      {days != null ? `${days}d` : '—'}
                    </td>
                    <td className={styles.td}>
                      <Badge color={STATUS_COLORS[project.status]}>
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </td>
                    <td className={styles.td}>
                      <ProgressBar projectId={project.id} compact />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
