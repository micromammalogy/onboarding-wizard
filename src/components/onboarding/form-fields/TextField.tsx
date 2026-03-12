'use client';

import { Input } from '@zonos/amino/components/input/Input';
import type { ITemplateWidget } from '@/types/database';

type ITextFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function TextField({ widget, value, onChange }: ITextFieldProps) {
  return (
    <Input
      label={widget.label ?? ''}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      placeholder={widget.placeholder ?? undefined}
      type={widget.widget_type === 'email' ? 'email' : widget.widget_type === 'url' ? 'url' : 'text'}
      required={widget.is_required}
    />
  );
}
