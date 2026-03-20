'use client';

import { useState, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { ArrowLeftIcon } from '@zonos/amino/icons/ArrowLeftIcon';
import { ChevronDownIcon } from '@zonos/amino/icons/ChevronDownIcon';
import styles from './FocusBar.module.scss';

type IFocusBarTab = 'tasks' | 'rules' | 'due-dates' | 'triggers';

type IFocusBarProps = {
  templateName: string;
  activeTab: IFocusBarTab;
  onTabChange: (tab: IFocusBarTab) => void;
  onBack: () => void;
  onNameChange: (name: string) => void;
  stats: {
    taskCount: number;
    ruleCount: number;
    widgetCount: number;
  };
};

const TAB_CONFIG: { key: IFocusBarTab; label: string }[] = [
  { key: 'tasks', label: 'Edit' },
  { key: 'rules', label: 'Logic' },
  { key: 'triggers', label: 'Automations' },
  { key: 'due-dates', label: 'View' },
];

export function FocusBar({
  templateName,
  activeTab,
  onTabChange,
  onBack,
  onNameChange,
  stats,
}: IFocusBarProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(templateName);
  const [published, setPublished] = useState(false);

  const handleNameSave = useCallback(() => {
    if (nameValue.trim()) {
      onNameChange(nameValue.trim());
    }
    setEditingName(false);
  }, [nameValue, onNameChange]);

  const handlePublish = useCallback(() => {
    setPublished(true);
    setTimeout(() => setPublished(false), 2000);
  }, []);

  return (
    <div className={styles.focusBar}>
      {/* Left section */}
      <div className={styles.left}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeftIcon size={16} />
        </button>
        <div className={styles.nameSection}>
          {editingName ? (
            <div className={styles.nameEdit}>
              <Input
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                autoFocus
                size="sm"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') {
                    setEditingName(false);
                    setNameValue(templateName);
                  }
                }}
                onBlur={handleNameSave}
              />
            </div>
          ) : (
            <button
              className={styles.templateName}
              onClick={() => {
                setEditingName(true);
                setNameValue(templateName);
              }}
            >
              {templateName}
            </button>
          )}
          <span className={styles.breadcrumb}>
            Templates <span className={styles.breadcrumbSep}>&rsaquo;</span> {templateName}
          </span>
        </div>
      </div>

      {/* Center section — mode pills */}
      <div className={styles.center}>
        <div className={styles.pillGroup}>
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              className={`${styles.pill} ${activeTab === tab.key ? styles.pillActive : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right section */}
      <div className={styles.right}>
        <span className={styles.saveStatus}>
          {published ? 'Published!' : 'Draft saved'}
        </span>
        <div className={styles.statBadges}>
          <span className={styles.statBadge}>{stats.taskCount} tasks</span>
          <span className={styles.statBadge}>{stats.ruleCount} rules</span>
          <span className={styles.statBadge}>{stats.widgetCount} widgets</span>
        </div>
        <div className={styles.publishGroup}>
          <button className={styles.publishButton} onClick={handlePublish}>
            Publish
          </button>
          <button className={styles.publishChevron} onClick={handlePublish}>
            <ChevronDownIcon size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
