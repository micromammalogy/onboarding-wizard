'use client';

import type { ITemplateWidget } from '@/types/database';
import { useFieldValues } from '@/hooks/useFieldValues';
import { TextField } from './TextField';
import { TextareaField } from './TextareaField';
import { SelectField } from './SelectField';
import { MultiSelectField } from './MultiSelectField';
import { MultiChoiceField } from './MultiChoiceField';
import { DateField } from './DateField';
import { FileField } from './FileField';
import { SendEmailField } from './SendEmailField';
import { TextContentWidget } from './TextContentWidget';
import { ImageWidget } from './ImageWidget';
import { VideoWidget } from './VideoWidget';
import { EmbedWidget } from './EmbedWidget';
import { ConditionalWrapper } from '../ConditionalWrapper';

type IFormFieldRendererProps = {
  widget: ITemplateWidget;
  taskId: string;
};

const CONTENT_TYPES = new Set(['text_content', 'image', 'video', 'embed', 'cross_link']);

export function FormFieldRenderer({ widget, taskId }: IFormFieldRendererProps) {
  const getValue = useFieldValues(s => s.getValue);
  const setValue = useFieldValues(s => s.setValue);

  // Content widgets (no key, no form value)
  if (CONTENT_TYPES.has(widget.widget_type)) {
    let content: React.ReactNode;
    switch (widget.widget_type) {
      case 'text_content':
        content = <TextContentWidget widget={widget} />;
        break;
      case 'image':
        content = <ImageWidget widget={widget} />;
        break;
      case 'video':
        content = <VideoWidget widget={widget} />;
        break;
      case 'embed':
      case 'cross_link':
        content = <EmbedWidget widget={widget} />;
        break;
      default:
        return null;
    }

    return (
      <ConditionalWrapper id={widget.ps_group_id ?? widget.id}>
        {content}
      </ConditionalWrapper>
    );
  }

  // Form field widgets (require a key)
  if (!widget.key) return null;

  const value = getValue(widget.key);
  const onChange = (val: string | null) => setValue(taskId, widget.key!, val);

  const fieldProps = { widget, value, onChange };

  let field: React.ReactNode;

  switch (widget.widget_type) {
    case 'text':
    case 'email':
    case 'url':
      field = <TextField {...fieldProps} />;
      break;
    case 'textarea':
    case 'richtext':
      field = <TextareaField {...fieldProps} />;
      break;
    case 'select':
      field = <SelectField {...fieldProps} />;
      break;
    case 'multi_select':
      field = <MultiSelectField {...fieldProps} />;
      break;
    case 'multi_choice':
      field = <MultiChoiceField {...fieldProps} />;
      break;
    case 'date':
      field = <DateField {...fieldProps} />;
      break;
    case 'file':
      field = <FileField {...fieldProps} />;
      break;
    case 'send_rich_email':
      field = <SendEmailField {...fieldProps} />;
      break;
    case 'hidden':
      return null;
    default:
      field = <TextField {...fieldProps} />;
  }

  return (
    <ConditionalWrapper id={widget.ps_group_id ?? widget.id}>
      {field}
    </ConditionalWrapper>
  );
}
