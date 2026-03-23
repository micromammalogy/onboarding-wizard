'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Button } from '@zonos/amino/components/button/Button';
import { Switch } from '@zonos/amino/components/switch/Switch';
import { SettingsIcon } from '@zonos/amino/icons/SettingsIcon';
import { CheckmarkIcon } from '@zonos/amino/icons/CheckmarkIcon';
import { ChevronRightIcon } from '@zonos/amino/icons/ChevronRightIcon';
import { useAllUserTasks } from '@/hooks/useSupabase';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { ITask, ITaskStatus } from '@/types/database';
import styles from './MyWorkPage.module.scss';

// --- Types ---

type IMyWorkTask = ITask & {
  assignee: { id: string; name: string; email: string } | null;
  project: {
    id: string;
    merchant_name: string;
    merchant_id: string;
    template_id: string | null;
    status: string;
  } | null;
};

type IGroupByOption = 'due_date' | 'workflow' | 'workflow_run';

type IColumnKey =
  | 'checkbox'
  | 'name'
  | 'due'
  | 'workflow_run'
  | 'workflow'
  | 'assignees'
  | 'comments';

type IColumnDef = {
  key: IColumnKey;
  label: string;
  hideable: boolean;
};

// --- Constants ---

const ALL_COLUMNS: IColumnDef[] = [
  { key: 'checkbox', label: '', hideable: false },
  { key: 'name', label: 'Name', hideable: false },
  { key: 'due', label: 'Due', hideable: true },
  { key: 'workflow_run', label: 'Workflow Run', hideable: true },
  { key: 'workflow', label: 'Workflow', hideable: true },
  { key: 'assignees', label: 'Assignees', hideable: true },
  { key: 'comments', label: 'Comments', hideable: true },
];

const DEFAULT_VISIBLE: IColumnKey[] = [
  'checkbox',
  'name',
  'due',
  'workflow_run',
  'workflow',
  'assignees',
  'comments',
];

const GROUP_BY_OPTIONS = [
  { value: 'due_date' as const, label: 'Due Date' },
  { value: 'workflow' as const, label: 'Workflow' },
  { value: 'workflow_run' as const, label: 'Workflow Run' },
];

const TASK_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'ob', label: 'OB tasks' },
  { value: 'merchant', label: 'Merchant tasks' },
];

const COMPLETED_STATUSES: ITaskStatus[] = ['complete', 'ob_verified', 'skipped'];

const COLUMN_STORAGE_KEY = 'my-work-column-prefs';

// --- Helpers ---

function loadColumnPrefs(): IColumnKey[] {
  try {
    const stored = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_VISIBLE;
}

function saveColumnPrefs(keys: IColumnKey[]) {
  try {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

function getEffectiveDueDate(task: ITask): Date | null {
  if (task.due_date_fixed) {
    return new Date(task.due_date_fixed);
  }
  return null;
}

function formatDueDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function startOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(23, 59, 59, 999);
  return result;
}

type IDueDateGroup = 'overdue' | 'today' | 'this_week' | 'next_week' | 'later' | 'no_due_date';

const GROUP_LABELS: Record<IDueDateGroup, string> = {
  overdue: 'Overdue',
  today: 'Today',
  this_week: 'This Week',
  next_week: 'Next Week',
  later: 'Later',
  no_due_date: 'No Due Date',
};

const GROUP_ORDER: IDueDateGroup[] = [
  'overdue',
  'today',
  'this_week',
  'next_week',
  'later',
  'no_due_date',
];

function getDueDateGroup(task: ITask): IDueDateGroup {
  const due = getEffectiveDueDate(task);
  if (!due) return 'no_due_date';

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (due < todayStart) return 'overdue';
  if (due <= todayEnd) return 'today';

  // End of this week (Sunday)
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  if (due <= endOfDay(weekEnd)) return 'this_week';

  // End of next week
  const nextWeekEnd = new Date(weekEnd);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
  if (due <= endOfDay(nextWeekEnd)) return 'next_week';

  return 'later';
}

function getDueDateClass(task: ITask): string | undefined {
  const group = getDueDateGroup(task);
  if (group === 'overdue') return styles.dueOverdue;
  if (group === 'today') return styles.dueToday;
  return undefined;
}

function isTaskCompleted(task: ITask): boolean {
  return COMPLETED_STATUSES.includes(task.status);
}

// --- Component ---

export function MyWorkPage() {
  const [search, setSearch] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('');
  const [groupBy, setGroupBy] = useState<IGroupByOption>('due_date');
  const [showCompleted, setShowCompleted] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<IColumnKey[]>(DEFAULT_VISIBLE);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const pickerRef = useRef<HTMLDivElement>(null);

  const { openProject, selectTask } = useOnboardingNavStore();

  // Load saved column prefs on mount
  useEffect(() => {
    setVisibleColumns(loadColumnPrefs());
  }, []);

  const { tasks, isLoading, error, mutate, updateTask } = useAllUserTasks();

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

  const toggleColumn = useCallback((key: IColumnKey) => {
    setVisibleColumns(prev => {
      const next = prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
      if (next.length === 0) return prev;
      saveColumnPrefs(next);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  const handleToggleComplete = useCallback(
    async (task: IMyWorkTask, e: React.MouseEvent) => {
      e.stopPropagation();
      const newStatus: ITaskStatus = isTaskCompleted(task) ? 'pending' : 'complete';
      try {
        await updateTask(task.id, {
          status: newStatus,
          completed_at: newStatus === 'complete' ? new Date().toISOString() : null,
        });
      } catch {
        // Silently fail — SWR will show stale data
      }
    },
    [updateTask],
  );

  const activeColumns = useMemo(
    () => ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)),
    [visibleColumns],
  );

  // Filter tasks
  const filtered = useMemo(() => {
    let result = [...(tasks as unknown as IMyWorkTask[])];

    // Hide completed unless toggled on
    if (!showCompleted) {
      result = result.filter(t => !isTaskCompleted(t));
    }

    // Task type filter
    if (taskTypeFilter) {
      result = result.filter(t => t.assignee_type === taskTypeFilter);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.section?.toLowerCase().includes(q) ||
          t.project?.merchant_name.toLowerCase().includes(q),
      );
    }

    return result;
  }, [tasks, showCompleted, taskTypeFilter, search]);

  // Group tasks
  const grouped = useMemo(() => {
    if (groupBy === 'due_date') {
      const groups: Record<IDueDateGroup, IMyWorkTask[]> = {
        overdue: [],
        today: [],
        this_week: [],
        next_week: [],
        later: [],
        no_due_date: [],
      };
      filtered.forEach(task => {
        const group = getDueDateGroup(task);
        groups[group].push(task);
      });
      return GROUP_ORDER.filter(key => groups[key].length > 0).map(key => ({
        key,
        label: GROUP_LABELS[key],
        tasks: groups[key],
      }));
    }

    if (groupBy === 'workflow_run') {
      const map = new Map<string, { label: string; tasks: IMyWorkTask[] }>();
      filtered.forEach(task => {
        const projectId = task.project?.id || 'unknown';
        const label = task.project
          ? `${task.project.merchant_name} (#${task.project.merchant_id})`
          : 'Unknown project';
        if (!map.has(projectId)) {
          map.set(projectId, { label, tasks: [] });
        }
        map.get(projectId)?.tasks.push(task);
      });
      return Array.from(map.entries()).map(([key, val]) => ({
        key,
        label: val.label,
        tasks: val.tasks,
      }));
    }

    // Group by workflow (template)
    const map = new Map<string, { label: string; tasks: IMyWorkTask[] }>();
    filtered.forEach(task => {
      const templateId = task.project?.template_id || 'no-template';
      const label = templateId === 'no-template' ? 'No template' : `Template ${templateId.slice(0, 8)}`;
      if (!map.has(templateId)) {
        map.set(templateId, { label, tasks: [] });
      }
      map.get(templateId)?.tasks.push(task);
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      key,
      label: val.label,
      tasks: val.tasks,
    }));
  }, [filtered, groupBy]);

  const totalTasks = filtered.length;

  const handleRowClick = useCallback(
    (task: IMyWorkTask) => {
      if (task.project?.id) {
        openProject(task.project.id);
        selectTask(task.id);
      }
    },
    [openProject, selectTask],
  );

  // --- Render ---

  if (isLoading) return <LoadingState message="Loading your tasks..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => mutate()} />;

  const renderCell = (task: IMyWorkTask, col: IColumnDef) => {
    switch (col.key) {
      case 'checkbox':
        return (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isTaskCompleted(task)}
              onClick={e => handleToggleComplete(task, e)}
              readOnly
            />
          </div>
        );
      case 'name':
        return (
          <div className={styles.taskNameCell}>
            <span className={styles.taskTitle}>
              {task.title}
              {task.is_stop_gate && (
                <Badge color="red" className={styles.stopGateBadge}>
                  Stop gate
                </Badge>
              )}
            </span>
            {task.section && (
              <span className={styles.taskSection}>{task.section}</span>
            )}
          </div>
        );
      case 'due': {
        const due = getEffectiveDueDate(task);
        const cls = getDueDateClass(task);
        return <span className={cls}>{formatDueDate(due)}</span>;
      }
      case 'workflow_run':
        return task.project ? (
          <div className={styles.merchantCell}>
            <span className={styles.merchantName}>
              {task.project.merchant_name}
            </span>
            <span className={styles.merchantId}>
              #{task.project.merchant_id}
            </span>
          </div>
        ) : (
          '—'
        );
      case 'workflow':
        return task.project?.template_id
          ? `Template ${task.project.template_id.slice(0, 8)}`
          : '—';
      case 'assignees':
        return task.assignee ? (
          <div className={styles.assigneeCell}>
            <div className={styles.assigneeAvatar}>
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span>{task.assignee.name}</span>
          </div>
        ) : (
          '—'
        );
      case 'comments':
        return (
          <span className={styles.commentCount}>0</span>
        );
      default:
        return '—';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            size="sm"
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            value={
              TASK_TYPE_OPTIONS.find(o => o.value === taskTypeFilter) ||
              TASK_TYPE_OPTIONS[0]
            }
            options={TASK_TYPE_OPTIONS}
            onChange={opt => setTaskTypeFilter(opt?.value ?? '')}
            size="sm"
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            value={GROUP_BY_OPTIONS.find(o => o.value === groupBy) || GROUP_BY_OPTIONS[0]}
            options={GROUP_BY_OPTIONS}
            onChange={opt => {
              if (opt) {
                setGroupBy(opt.value);
                setCollapsedGroups(new Set());
              }
            }}
            size="sm"
          />
        </div>
        <div className={styles.toggleWrapper}>
          <Switch
            checked={showCompleted}
            onChange={setShowCompleted}
          />
          <span>Completed</span>
        </div>

        <div className={styles.filterSpacer} />

        <button
          className={styles.addTaskButton}
          type="button"
          onClick={() => {/* TODO: add standalone task */}}
        >
          + Task
        </button>

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
              {ALL_COLUMNS.filter(c => c.hideable).map(col => (
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

      {totalTasks === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <CheckmarkIcon size={48} />
          </div>
          <h2 className={styles.emptyTitle}>
            {search || taskTypeFilter
              ? 'No tasks match your filters'
              : 'You are all caught up'}
          </h2>
          <p className={styles.emptyDescription}>
            {search || taskTypeFilter
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'When tasks are assigned to you across onboarding projects, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {activeColumns.map(col => (
                  <th
                    key={col.key}
                    className={`${styles.th} ${col.key === 'checkbox' ? styles.thCheckbox : ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.map(group => {
                const isCollapsed = collapsedGroups.has(group.key);
                return (
                  <GroupSection
                    key={group.key}
                    groupKey={group.key}
                    label={group.label}
                    tasks={group.tasks}
                    isCollapsed={isCollapsed}
                    onToggle={toggleGroup}
                    activeColumns={activeColumns}
                    colSpan={activeColumns.length}
                    renderCell={renderCell}
                    onRowClick={handleRowClick}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Group Section sub-component ---

type IGroupSectionProps = {
  groupKey: string;
  label: string;
  tasks: IMyWorkTask[];
  isCollapsed: boolean;
  onToggle: (key: string) => void;
  activeColumns: IColumnDef[];
  colSpan: number;
  renderCell: (task: IMyWorkTask, col: IColumnDef) => React.ReactNode;
  onRowClick: (task: IMyWorkTask) => void;
};

function GroupSection({
  groupKey,
  label,
  tasks,
  isCollapsed,
  onToggle,
  activeColumns,
  colSpan,
  renderCell,
  onRowClick,
}: IGroupSectionProps) {
  return (
    <>
      <tr className={styles.groupRow} onClick={() => onToggle(groupKey)}>
        <td colSpan={colSpan}>
          <span
            className={`${styles.groupChevron} ${!isCollapsed ? styles.groupChevronExpanded : ''}`}
          >
            <ChevronRightIcon size={12} />
          </span>
          {label}
          <span className={styles.groupCount}>({tasks.length})</span>
        </td>
      </tr>
      {!isCollapsed &&
        tasks.map(task => (
          <tr
            key={task.id}
            className={`${styles.row} ${isTaskCompleted(task) ? styles.completedRow : ''}`}
            onClick={() => onRowClick(task)}
          >
            {activeColumns.map(col => (
              <td key={col.key} className={styles.td}>
                {renderCell(task, col)}
              </td>
            ))}
          </tr>
        ))}
    </>
  );
}
