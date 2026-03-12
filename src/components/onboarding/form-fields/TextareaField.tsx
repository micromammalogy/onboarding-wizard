'use client';

import { Input } from '@zonos/amino/components/input/Input';
import type { ITemplateWidget } from '@/types/database';

type ITextareaFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function TextareaField({ widget, value, onChange }: ITextareaFieldProps) {
  return (
    <Input
      label={widget.label ?? ''}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      placeholder={widget.placeholder ?? undefined}
      required={widget.is_required}
    />
  );
}
