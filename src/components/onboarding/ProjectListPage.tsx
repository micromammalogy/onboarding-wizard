'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Select } from '@zonos/amino/components/select/Select';
import { Input } from '@zonos/amino/components/input/Input';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Button } from '@zonos/amino/components/button/Button';
import { SettingsIcon } from '@zonos/amino/icons/SettingsIcon';
import { useProjects } from '@/hooks/useSupabase';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { OverdueCount } from '@/components/onboarding/OverdueCount';
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

// Default columns that are always available
type IDefaultColumnKey =
  | 'merchant'
  | 'platform'
  | 'ae'
  | 'ob_rep'
  | 'start'
  | 'days'
  | 'status'
  | 'progress'
  | 'overdue';

type IColumnDef = {
  key: IDefaultColumnKey;
  label: string;
  sortField?: keyof IProject;
};

const DEFAULT_COLUMNS: IColumnDef[] = [
  { key: 'merchant', label: 'Merchant', sortField: 'merchant_name' },
  { key: 'platform', label: 'Platform', sortField: 'platform' },
  { key: 'ae', label: 'AE' },
  { key: 'ob_rep', label: 'OB Rep' },
  { key: 'start', label: 'Start', sortField: 'start_date' },
  { key: 'days', label: 'Days' },
  { key: 'status', label: 'Status', sortField: 'status' },
  { key: 'progress', label: 'Progress' },
  { key: 'overdue', label: 'Overdue' },
];

const DEFAULT_VISIBLE_KEYS: IDefaultColumnKey[] = [
  'merchant', 'platform', 'ae', 'ob_rep', 'start', 'days', 'status', 'progress', 'overdue',
];

const STORAGE_KEY = 'onboarding-column-prefs';

function loadColumnPrefs(): IDefaultColumnKey[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_VISIBLE_KEYS;
}

function saveColumnPrefs(keys: IDefaultColumnKey[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

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
  const [visibleColumns, setVisibleColumns] = useState<IDefaultColumnKey[]>(DEFAULT_VISIBLE_KEYS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Load saved prefs on mount
  useEffect(() => {
    setVisibleColumns(loadColumnPrefs());
  }, []);

  const { projects, isLoading, error, mutate } = useProjects({
    status: statusFilter || undefined,
  });

  const { openProject } = useOnboardingNavStore();

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerOpen]);

  const toggleColumn = useCallback((key: IDefaultColumnKey) => {
    setVisibleColumns(prev => {
      const next = prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
      // Don't allow removing all columns
      if (next.length === 0) return prev;
      saveColumnPrefs(next);
      return next;
    });
  }, []);

  const activeColumns = useMemo(
    () => DEFAULT_COLUMNS.filter(c => visibleColumns.includes(c.key)),
    [visibleColumns],
  );

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

  const renderCell = (project: (typeof projects)[number], col: IColumnDef) => {
    switch (col.key) {
      case 'merchant':
        return (
          <div className={styles.merchantCell}>
            <span className={styles.merchantName}>{project.merchant_name}</span>
            <span className={styles.merchantId}>#{project.merchant_id}</span>
          </div>
        );
      case 'platform':
        return project.platform || '—';
      case 'ae':
        return project.ae?.name || '—';
      case 'ob_rep':
        return project.ob_rep?.name || '—';
      case 'start':
        return formatDate(project.start_date);
      case 'days': {
        const days = getDaysInOnboarding(project.start_date);
        return days != null ? `${days}d` : '—';
      }
      case 'status':
        return (
          <Badge color={STATUS_COLORS[project.status]}>
            {STATUS_LABELS[project.status]}
          </Badge>
        );
      case 'progress':
        return <ProgressBar projectId={project.id} compact />;
      case 'overdue':
        return <OverdueCount projectId={project.id} />;
      default:
        return '—';
    }
  };

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
        <div className={styles.columnPickerWrapper} ref={pickerRef}>
          <Button
            size="sm"
            variant="subtle"
            icon={<SettingsIcon size={14} />}
            onClick={() => setPickerOpen(!pickerOpen)}
          >
            Columns
          </Button>
          {pickerOpen && (
            <div className={styles.columnPicker}>
              <div className={styles.pickerTitle}>Show columns</div>
              {DEFAULT_COLUMNS.map(col => (
                <label key={col.key} className={styles.pickerItem}>
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {activeColumns.map(col => (
                <th
                  key={col.key}
                  className={styles.th}
                  onClick={col.sortField ? () => handleSort(col.sortField!) : undefined}
                  style={col.sortField ? undefined : { cursor: 'default' }}
                >
                  {col.label}
                  {col.sortField && sortField === col.sortField && (sortAsc ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length} className={styles.emptyCell}>
                  {search || statusFilter
                    ? 'No projects match your filters'
                    : 'No onboarding projects yet'}
                </td>
              </tr>
            ) : (
              sorted.map(project => (
                <tr
                  key={project.id}
                  className={styles.row}
                  onClick={() => openProject(project.id)}
                >
                  {activeColumns.map(col => (
                    <td key={col.key} className={styles.td}>
                      {renderCell(project, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
