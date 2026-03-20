'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { RemoveIcon } from '@zonos/amino/icons/RemoveIcon';
import type { ITemplateWidget } from '@/types/database';
import styles from './SubtaskWidget.module.scss';

type ISubtaskItem = {
  id: string;
  text: string;
  completed: boolean;
};

type ISubtaskWidgetProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

function generateId(): string {
  return `st_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseSubtasks(value: string | null): ISubtaskItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is ISubtaskItem =>
          typeof item === 'object' &&
          item !== null &&
          'id' in item &&
          'text' in item &&
          'completed' in item,
      );
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function serializeSubtasks(items: ISubtaskItem[]): string | null {
  if (items.length === 0) return null;
  return JSON.stringify(items);
}

export function SubtaskWidget({ widget, value, onChange }: ISubtaskWidgetProps) {
  const [subtasks, setSubtasks] = useState<ISubtaskItem[]>(() =>
    parseSubtasks(value),
  );
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Sync local state when value prop changes externally
  useEffect(() => {
    const parsed = parseSubtasks(value);
    if (JSON.stringify(parsed) !== JSON.stringify(subtasks)) {
      setSubtasks(parsed);
    }
    // Only react to external value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Focus newly created subtask
  useEffect(() => {
    if (focusIndex !== null && subtasks[focusIndex]) {
      const input = inputRefs.current.get(subtasks[focusIndex].id);
      if (input) {
        input.focus();
        setFocusIndex(null);
      }
    }
  }, [focusIndex, subtasks]);

  const updateAndEmit = useCallback(
    (next: ISubtaskItem[]) => {
      setSubtasks(next);
      onChange(serializeSubtasks(next));
    },
    [onChange],
  );

  const handleToggle = useCallback(
    (id: string) => {
      const next = subtasks.map(st =>
        st.id === id ? { ...st, completed: !st.completed } : st,
      );
      updateAndEmit(next);
    },
    [subtasks, updateAndEmit],
  );

  const handleTextChange = useCallback(
    (id: string, text: string) => {
      const next = subtasks.map(st =>
        st.id === id ? { ...st, text } : st,
      );
      updateAndEmit(next);
    },
    [subtasks, updateAndEmit],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = subtasks.filter(st => st.id !== id);
      updateAndEmit(next);
    },
    [subtasks, updateAndEmit],
  );

  const addSubtask = useCallback(() => {
    const newItem: ISubtaskItem = {
      id: generateId(),
      text: '',
      completed: false,
    };
    const next = [...subtasks, newItem];
    setFocusIndex(next.length - 1);
    updateAndEmit(next);
  }, [subtasks, updateAndEmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const newItem: ISubtaskItem = {
          id: generateId(),
          text: '',
          completed: false,
        };
        const next = [...subtasks];
        next.splice(index + 1, 0, newItem);
        setFocusIndex(index + 1);
        updateAndEmit(next);
      }
      if (
        e.key === 'Backspace' &&
        subtasks[index].text === '' &&
        subtasks.length > 1
      ) {
        e.preventDefault();
        const next = subtasks.filter((_, i) => i !== index);
        const prevIndex = Math.max(0, index - 1);
        setFocusIndex(prevIndex);
        updateAndEmit(next);
      }
    },
    [subtasks, updateAndEmit],
  );

  const setInputRef = useCallback(
    (id: string, el: HTMLInputElement | null) => {
      if (el) {
        inputRefs.current.set(id, el);
      } else {
        inputRefs.current.delete(id);
      }
    },
    [],
  );

  return (
    <div className={styles.container}>
      {widget.label && (
        <label className={styles.label}>{widget.label}</label>
      )}

      <div className={styles.list}>
        {subtasks.map((subtask, index) => (
          <div
            key={subtask.id}
            className={styles.subtaskRow}
          >
            <button
              type="button"
              className={`${styles.checkbox} ${subtask.completed ? styles.checked : ''}`}
              onClick={() => handleToggle(subtask.id)}
              aria-label={subtask.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {subtask.completed && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <input
              ref={el => setInputRef(subtask.id, el)}
              className={`${styles.textInput} ${subtask.completed ? styles.completed : ''}`}
              value={subtask.text}
              onChange={e => handleTextChange(subtask.id, e.target.value)}
              onKeyDown={e => handleKeyDown(e, index)}
              placeholder="Type here or press enter to add another subtask"
            />

            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => handleDelete(subtask.id)}
              aria-label="Delete subtask"
            >
              <RemoveIcon size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={addSubtask}
      >
        <PlusIcon size={14} />
        Add subtask
      </button>
    </div>
  );
}
