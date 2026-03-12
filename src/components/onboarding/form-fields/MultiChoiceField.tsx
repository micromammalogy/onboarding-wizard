'use client';

import { useMemo, useCallback } from 'react';
import type { ITemplateWidget } from '@/types/database';
import styles from './MultiChoiceField.module.scss';

type IMultiChoiceFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

/**
 * MultiChoice renders as clickable tag/chip multi-selector.
 * Value is stored as comma-separated string of selected option values.
 */
export function MultiChoiceField({ widget, value, onChange }: IMultiChoiceFieldProps) {
  const options = useMemo(() => {
    if (!Array.isArray(widget.options)) return [];
    return widget.options.map((opt: unknown) => {
      if (typeof opt === 'string') return { value: opt, label: opt };
      const o = opt as { value?: string; label?: string; name?: string };
      return {
        value: o.value ?? o.name ?? '',
        label: o.label ?? o.name ?? o.value ?? '',
      };
    });
  }, [widget.options]);

  const selectedValues = useMemo(() => {
    if (!value) return new Set<string>();
    return new Set(value.split(',').map(v => v.trim()));
  }, [value]);

  const toggleOption = useCallback(
    (optValue: string) => {
      const newSelected = new Set(selectedValues);
      if (newSelected.has(optValue)) {
        newSelected.delete(optValue);
      } else {
        newSelected.add(optValue);
      }
      const result = Array.from(newSelected).join(', ');
      onChange(result || null);
    },
    [selectedValues, onChange],
  );

  return (
    <div className={styles.container}>
      {widget.label && (
        <label className={styles.label}>
          {widget.label}{widget.is_required && <span style={{ color: 'var(--amino-red-600)' }}> *</span>}
        </label>
      )}
      <div className={styles.chipList}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.chip} ${selectedValues.has(opt.value) ? styles.chipSelected : ''}`}
            onClick={() => toggleOption(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
