'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BellIcon } from '@zonos/amino/icons/BellIcon';
import { UserIcon } from '@zonos/amino/icons/UserIcon';
import { CheckCircleIcon } from '@zonos/amino/icons/CheckCircleIcon';
import { ClockIcon } from '@zonos/amino/icons/ClockIcon';
import { WarningIcon } from '@zonos/amino/icons/WarningIcon';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import styles from './NotificationCenter.module.scss';

// --- Types ---

export type INotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'merchant_complete';

export interface INotification {
  id: string;
  type: INotificationType;
  title: string;
  description: string;
  projectId: string | null;
  taskId: string | null;
  isRead: boolean;
  createdAt: string;
}

// --- Mock data ---

const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: 'n1',
    type: 'task_assigned',
    title: 'You were assigned to "Configure Tax IDs"',
    description: 'Acme Corp onboarding project',
    projectId: null,
    taskId: null,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    type: 'merchant_complete',
    title: 'Merchant completed "Upload Business Docs"',
    description: 'Ready for verification — Widget Inc',
    projectId: null,
    taskId: null,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    type: 'task_overdue',
    title: '"Set Up Fulfillment Locations" is overdue',
    description: 'Global Goods — due 2 days ago',
    projectId: null,
    taskId: null,
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n4',
    type: 'task_completed',
    title: 'Sarah completed "Configure Shipping Rules"',
    description: 'Acme Corp onboarding project',
    projectId: null,
    taskId: null,
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// --- Helpers ---

function formatRelativeTime(dateStr: string): string {
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
  });
}

function getNotificationIcon(type: INotificationType) {
  switch (type) {
    case 'task_assigned':
      return (
        <div className={`${styles.notificationIcon} ${styles.iconAssigned}`}>
          <UserIcon size={16} />
        </div>
      );
    case 'task_completed':
      return (
        <div className={`${styles.notificationIcon} ${styles.iconCompleted}`}>
          <CheckCircleIcon size={16} />
        </div>
      );
    case 'task_overdue':
      return (
        <div className={`${styles.notificationIcon} ${styles.iconOverdue}`}>
          <ClockIcon size={16} />
        </div>
      );
    case 'merchant_complete':
      return (
        <div className={`${styles.notificationIcon} ${styles.iconMerchant}`}>
          <WarningIcon size={16} />
        </div>
      );
  }
}

// --- Component ---

export function NotificationCenter() {
  const [notifications, setNotifications] =
    useState<INotification[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { openProject, selectTask } = useOnboardingNavStore();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const handleNotificationClick = useCallback(
    (notification: INotification) => {
      // Mark as read
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
      setIsOpen(false);

      // Navigate to project/task if IDs are set
      if (notification.projectId) {
        openProject(notification.projectId);
        if (notification.taskId) {
          selectTask(notification.taskId);
        }
      }
    },
    [openProject, selectTask],
  );

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        className={`${styles.bellButton} ${isOpen ? styles.bellButtonActive : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Notifications"
        type="button"
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                className={styles.markAllButton}
                onClick={handleMarkAllRead}
                type="button"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <BellIcon size={24} />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.isRead
                      ? styles.notificationItemUnread
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationTitle}>
                      {notification.title}
                    </div>
                    <div className={styles.notificationDescription}>
                      {notification.description}
                    </div>
                  </div>
                  <div className={styles.notificationMeta}>
                    <span className={styles.notificationTime}>
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                    {!notification.isRead && (
                      <span className={styles.unreadDot} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
