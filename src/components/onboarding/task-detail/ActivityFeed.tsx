'use client';

import { useMemo } from 'react';
import styles from './ActivityFeed.module.scss';

// --- Types ---

export type IActivityAction =
  | 'field_change'
  | 'task_completed'
  | 'task_reopened'
  | 'comment_added'
  | 'assignment_changed'
  | 'status_changed'
  | 'created';

export interface IActivityEntry {
  id: string;
  taskId: string;
  action: IActivityAction;
  actorName: string;
  actorInitial: string;
  avatarColor: string;
  description: string;
  timestamp: string;
}

type IActivityFeedProps = {
  taskId: string;
};

// --- Helpers ---

const AVATAR_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#059669',
  '#D97706',
  '#DC2626',
  '#0891B2',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatActivityTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// --- Mock data ---

function getMockActivity(taskId: string): IActivityEntry[] {
  return [
    {
      id: `act-1-${taskId}`,
      taskId,
      action: 'created',
      actorName: 'System',
      actorInitial: 'S',
      avatarColor: '#9CA3AF',
      description: 'Task created from template',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `act-2-${taskId}`,
      taskId,
      action: 'assignment_changed',
      actorName: 'System',
      actorInitial: 'S',
      avatarColor: '#9CA3AF',
      description: 'Assigned task to jane@zonos.com',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `act-3-${taskId}`,
      taskId,
      action: 'field_change',
      actorName: 'Jane Kim',
      actorInitial: 'J',
      avatarColor: getAvatarColor('Jane Kim'),
      description: 'Updated Expected Go Live Date to Mar 15, 2026',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `act-4-${taskId}`,
      taskId,
      action: 'comment_added',
      actorName: 'Shawn Roah',
      actorInitial: 'S',
      avatarColor: getAvatarColor('Shawn Roah'),
      description: 'Added a comment',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `act-5-${taskId}`,
      taskId,
      action: 'status_changed',
      actorName: 'Jane Kim',
      actorInitial: 'J',
      avatarColor: getAvatarColor('Jane Kim'),
      description: 'Changed status to In progress',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// --- Component ---

export function ActivityFeed({ taskId }: IActivityFeedProps) {
  const entries = useMemo(() => getMockActivity(taskId), [taskId]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Activity</span>
        {entries.length > 0 && (
          <span className={styles.entryCount}>({entries.length})</span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className={styles.emptyState}>No activity yet</div>
      ) : (
        <div className={styles.timeline}>
          {entries.map(entry => (
            <div key={entry.id} className={styles.entry}>
              <div
                className={styles.avatar}
                style={{ background: entry.avatarColor }}
              >
                {entry.actorInitial}
              </div>
              <div className={styles.entryContent}>
                <span className={styles.actorName}>{entry.actorName}</span>
                <span className={styles.actionText}>{entry.description}</span>
                <span className={styles.timestamp}>
                  {formatActivityTime(entry.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
