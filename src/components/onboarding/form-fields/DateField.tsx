'use client';

import { Input } from '@zonos/amino/components/input/Input';
import type { ITemplateWidget } from '@/types/database';

type IDateFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function DateField({ widget, value, onChange }: IDateFieldProps) {
  return (
    <Input
      label={widget.label ?? ''}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      type="date"
      required={widget.is_required}
    />
  );
}
