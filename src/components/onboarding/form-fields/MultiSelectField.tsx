'use client';

import { useMemo, useCallback } from 'react';
import type { ITemplateWidget } from '@/types/database';
import styles from './MultiSelectField.module.scss';

type IMultiSelectFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

/**
 * MultiSelect renders as a sub-task checklist — each option is a checkbox item.
 * Value is stored as comma-separated string of selected option values.
 */
export function MultiSelectField({ widget, value, onChange }: IMultiSelectFieldProps) {
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
      {widget.label && <label className={styles.label}>{widget.label}</label>}
      <div className={styles.optionList}>
        {options.map(opt => (
          <label key={opt.value} className={styles.option}>
            <input
              type="checkbox"
              checked={selectedValues.has(opt.value)}
              onChange={() => toggleOption(opt.value)}
              className={styles.checkbox}
            />
            <span className={styles.optionLabel}>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
