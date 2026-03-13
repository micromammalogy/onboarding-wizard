'use client';

import { Badge } from '@zonos/amino/components/badge/Badge';
import type { ITemplateWidget } from '@/types/database';
import { useFieldValues } from '@/hooks/useFieldValues';
import styles from './SendEmailField.module.scss';

type ISendEmailFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

/** Replace {{Variable_Name}} with field values from the project */
function interpolateVariables(
  text: string,
  getValue: (key: string) => string | null,
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_match, varName: string) => {
    const key = varName.trim().replace(/\s+/g, '_');
    return getValue(key) ?? `{{${varName}}}`;
  });
}

export function SendEmailField({ widget }: ISendEmailFieldProps) {
  const getValue = useFieldValues(s => s.getValue);
  const metadata = widget.metadata as {
    subject?: string;
    body?: string;
  };

  const subject = metadata.subject
    ? interpolateVariables(metadata.subject, getValue)
    : null;
  const body = metadata.body
    ? interpolateVariables(metadata.body, getValue)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Badge color="purple" size="small">Email</Badge>
        <span className={styles.label}>{widget.label ?? 'Send Email'}</span>
      </div>
      {subject && (
        <div className={styles.subject}>
          <span className={styles.subjectLabel}>Subject:</span>
          <span className={styles.subjectValue}>{subject}</span>
        </div>
      )}
      {body && (
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}
    </div>
  );
}
