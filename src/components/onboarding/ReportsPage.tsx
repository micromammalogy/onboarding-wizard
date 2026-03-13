'use client';

import { useState, useMemo, useCallback } from 'react';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Button } from '@zonos/amino/components/button/Button';
import { SearchIcon } from '@zonos/amino/icons/SearchIcon';
import { ExportIcon } from '@zonos/amino/icons/ExportIcon';
import { useProjects } from '@/hooks/useSupabase';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { IProject, IProjectStatus } from '@/types/database';
import styles from './ReportsPage.module.scss';

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

type IReportView = 'table' | 'analytics';

type ISavedView = {
  id: string;
  name: string;
  filter: IFilterState;
};

type IFilterState = {
  search: string;
  status: string;
  assignee: string;
};

const DEFAULT_FILTERS: IFilterState = { search: '', status: '', assignee: '' };

const SAVED_VIEWS: ISavedView[] = [
  { id: 'active', name: 'Active Workflow Runs', filter: { search: '', status: 'in_progress', assignee: '' } },
  { id: 'assigned-to-me', name: 'Assigned to Me', filter: { search: '', status: '', assignee: 'me' } },
  { id: 'overdue', name: 'Overdue', filter: { search: '', status: '', assignee: '' } },
  { id: 'completed', name: 'Recently Completed', filter: { search: '', status: 'completed', assignee: '' } },
  { id: 'archived', name: 'Archived', filter: { search: '', status: 'canceled', assignee: '' } },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

type ISortConfig = {
  field: string;
  direction: 'asc' | 'desc';
};

type IProjectWithRelations = IProject & {
  ae?: { full_name: string } | null;
  ob_rep?: { full_name: string } | null;
  tasks?: Array<{ status: string; due_date_fixed: string | null }>;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function ReportsPage() {
  const { projects, isLoading, error, mutate } = useProjects();
  const openProject = useOnboardingNavStore(s => s.openProject);
  const [reportView, setReportView] = useState<IReportView>('table');
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [filters, setFilters] = useState<IFilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<ISortConfig>({ field: 'created_at', direction: 'desc' });

  const handleViewSelect = useCallback((view: ISavedView) => {
    setActiveViewId(view.id);
    setFilters(view.filter);
  }, []);

  const handleClearView = useCallback(() => {
    setActiveViewId(null);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const filteredProjects = useMemo(() => {
    let result = [...(projects as IProjectWithRelations[])];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.merchant_name.toLowerCase().includes(q) ||
        p.merchant_id?.toLowerCase().includes(q) ||
        p.platform?.toLowerCase().includes(q),
      );
    }

    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sort.field as keyof IProjectWithRelations];
      const bVal = b[sort.field as keyof IProjectWithRelations];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sort.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [projects, filters, sort]);

  const handleSort = useCallback((field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = ['Merchant', 'Platform', 'Status', 'AE', 'OB Rep', 'Start Date', 'Days Active', 'Merchant ID'];
    const rows = filteredProjects.map(p => [
      p.merchant_name,
      p.platform || '',
      STATUS_LABELS[p.status],
      (p as IProjectWithRelations).ae?.full_name || '',
      (p as IProjectWithRelations).ob_rep?.full_name || '',
      p.start_date || '',
      String(daysSince(p.start_date)),
      p.merchant_id || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredProjects]);

  // Analytics computations
  const analytics = useMemo(() => {
    const all = projects as IProjectWithRelations[];
    const completed = all.filter(p => p.status === 'completed').length;
    const onTrack = all.filter(p => p.status === 'in_progress').length;
    const onHold = all.filter(p => p.status === 'on_hold').length;
    const canceled = all.filter(p => p.status === 'canceled').length;
    const notStarted = all.filter(p => p.status === 'not_started').length;

    const completedProjects = all.filter(p => p.status === 'completed' && p.start_date && p.updated_at);
    const avgDays = completedProjects.length > 0
      ? Math.round(completedProjects.reduce((sum, p) => {
          const start = new Date(p.start_date!).getTime();
          const end = new Date(p.updated_at).getTime();
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / completedProjects.length)
      : 0;

    return { total: all.length, completed, onTrack, onHold, canceled, notStarted, avgDays };
  }, [projects]);

  if (isLoading) return <LoadingState message="Loading reports..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => mutate()} />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <div className={styles.viewTabs}>
          <button
            className={`${styles.viewTab} ${reportView === 'table' ? styles.viewTabActive : ''}`}
            onClick={() => setReportView('table')}
          >
            Table
          </button>
          <button
            className={`${styles.viewTab} ${reportView === 'analytics' ? styles.viewTabActive : ''}`}
            onClick={() => setReportView('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>

      {reportView === 'table' ? (
        <div className={styles.tableView}>
          {/* Saved Views */}
          <div className={styles.savedViews}>
            <button
              className={`${styles.savedViewChip} ${!activeViewId ? styles.savedViewChipActive : ''}`}
              onClick={handleClearView}
            >
              All
            </button>
            {SAVED_VIEWS.map(view => (
              <button
                key={view.id}
                className={`${styles.savedViewChip} ${activeViewId === view.id ? styles.savedViewChipActive : ''}`}
                onClick={() => handleViewSelect(view)}
              >
                {view.name}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <Input
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name, ID, or platform..."
                prefix={<SearchIcon size={16} />}
                size="sm"
              />
            </div>
            <Select
              value={STATUS_OPTIONS.find(o => o.value === filters.status) ?? STATUS_OPTIONS[0]}
              options={STATUS_OPTIONS}
              onChange={opt => setFilters(prev => ({ ...prev, status: opt?.value ?? '' }))}
              size="sm"
            />
            <div className={styles.filterActions}>
              <span className={styles.resultCount}>{filteredProjects.length} results</span>
              <Button size="sm" variant="subtle" icon={<ExportIcon size={14} />} onClick={handleExportCSV}>
                Export
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('merchant_name')} className={styles.sortable}>
                    Name {sort.field === 'merchant_name' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('platform')} className={styles.sortable}>
                    Platform {sort.field === 'platform' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('status')} className={styles.sortable}>
                    Status {sort.field === 'status' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>AE</th>
                  <th>OB Rep</th>
                  <th onClick={() => handleSort('start_date')} className={styles.sortable}>
                    Started {sort.field === 'start_date' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Days</th>
                  <th onClick={() => handleSort('merchant_id')} className={styles.sortable}>
                    ID {sort.field === 'merchant_id' && (sort.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => (
                  <tr
                    key={project.id}
                    className={styles.row}
                    onClick={() => openProject(project.id)}
                  >
                    <td className={styles.nameCell}>{project.merchant_name}</td>
                    <td>{project.platform || '—'}</td>
                    <td>
                      <Badge color={STATUS_COLORS[project.status]} size="small">
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </td>
                    <td>{project.ae?.full_name || '—'}</td>
                    <td>{project.ob_rep?.full_name || '—'}</td>
                    <td>{formatDate(project.start_date)}</td>
                    <td>{project.start_date ? daysSince(project.start_date) : '—'}</td>
                    <td className={styles.idCell}>{project.merchant_id || '—'}</td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      No projects match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={styles.analyticsView}>
          {/* KPI Summary Cards */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiValue}>{analytics.total}</div>
              <div className={styles.kpiLabel}>Total Projects</div>
            </div>
            <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
              <div className={styles.kpiValue}>{analytics.completed}</div>
              <div className={styles.kpiLabel}>Completed</div>
            </div>
            <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
              <div className={styles.kpiValue}>{analytics.onTrack}</div>
              <div className={styles.kpiLabel}>In Progress</div>
            </div>
            <div className={`${styles.kpiCard} ${styles.kpiOrange}`}>
              <div className={styles.kpiValue}>{analytics.onHold}</div>
              <div className={styles.kpiLabel}>On Hold</div>
            </div>
            <div className={`${styles.kpiCard} ${styles.kpiRed}`}>
              <div className={styles.kpiValue}>{analytics.canceled}</div>
              <div className={styles.kpiLabel}>Canceled</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiValue}>{analytics.avgDays}<span className={styles.kpiUnit}>d</span></div>
              <div className={styles.kpiLabel}>Avg. Completion</div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Status Distribution</h3>
            <div className={styles.statusBars}>
              {[
                { label: 'In Progress', count: analytics.onTrack, color: 'var(--amino-blue-500)' },
                { label: 'Not Started', count: analytics.notStarted, color: 'var(--amino-gray-400)' },
                { label: 'On Hold', count: analytics.onHold, color: 'var(--amino-orange-500)' },
                { label: 'Completed', count: analytics.completed, color: 'var(--amino-green-500)' },
                { label: 'Canceled', count: analytics.canceled, color: 'var(--amino-red-500)' },
              ].filter(s => s.count > 0).map(s => (
                <div key={s.label} className={styles.statusBarRow}>
                  <span className={styles.statusBarLabel}>{s.label}</span>
                  <div className={styles.statusBarTrack}>
                    <div
                      className={styles.statusBarFill}
                      style={{
                        width: `${analytics.total > 0 ? (s.count / analytics.total) * 100 : 0}%`,
                        background: s.color,
                      }}
                    />
                  </div>
                  <span className={styles.statusBarCount}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Distribution */}
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Projects by Platform</h3>
            <div className={styles.statusBars}>
              {Object.entries(
                (projects as IProjectWithRelations[]).reduce<Record<string, number>>((acc, p) => {
                  const platform = p.platform || 'Unknown';
                  acc[platform] = (acc[platform] || 0) + 1;
                  return acc;
                }, {}),
              )
                .sort(([, a], [, b]) => b - a)
                .map(([platform, count]) => (
                  <div key={platform} className={styles.statusBarRow}>
                    <span className={styles.statusBarLabel}>{platform}</span>
                    <div className={styles.statusBarTrack}>
                      <div
                        className={styles.statusBarFill}
                        style={{
                          width: `${analytics.total > 0 ? (count / analytics.total) * 100 : 0}%`,
                          background: 'var(--amino-blue-400)',
                        }}
                      />
                    </div>
                    <span className={styles.statusBarCount}>{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
