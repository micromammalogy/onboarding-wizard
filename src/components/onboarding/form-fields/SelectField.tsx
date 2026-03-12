'use client';

import { useMemo } from 'react';
import { Select } from '@zonos/amino/components/select/Select';
import type { ITemplateWidget } from '@/types/database';

type ISelectFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

type IOption = { value: string; label: string };

export function SelectField({ widget, value, onChange }: ISelectFieldProps) {
  const options: IOption[] = useMemo(() => {
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

  const selected = options.find(o => o.value === value) ?? null;

  return (
    <Select
      label={`${widget.label ?? ''}${widget.is_required ? ' *' : ''}`}
      value={selected}
      options={options}
      onChange={opt => onChange(opt?.value ?? null)}
    />
  );
}
